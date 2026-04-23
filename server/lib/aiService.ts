import ai from '../configs/ai.js';
import groq from '../configs/groq.js';

interface Message {
  role: 'user' | 'assistant';
  parts: { text: string }[];
}

interface AIServiceOptions {
  model?: string;
  contents: Message[];
  maxRetries?: number;
  signal?: AbortSignal;
}

const sleep = (ms: number, signal?: AbortSignal) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new Error('Aborted'));
    });
  });
};

export const generateContent = async (options: AIServiceOptions): Promise<string> => {
  const { contents, maxRetries = 3, model: selectedModel, signal } = options;

  // Step 1: Try Direct Groq API / Specific Models
  // Handle specific Moonshot or other IDs through Groq provider
  const isGeminiModel = selectedModel?.toLowerCase().includes('gemini');
  
  if (process.env.GROQ_API_KEY && !isGeminiModel) {
    try {
      const modelToUse = selectedModel || 'llama-3.3-70b-versatile';
      if (signal?.aborted) throw new Error('Aborted');
      console.log(`💎 Attempting Generation with Groq - Model: ${modelToUse}...`);
      
      const messages = contents.map(c => ({
        role: (c.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: c.parts[0].text
      }));

      const response = await groq.chat.completions.create({
        model: modelToUse, 
        messages: messages,
      }, { signal });

      const text = response.choices[0].message.content;
      if (text) {
        console.log(` Generation successful using Groq (${modelToUse})`);
        return text;
      }
    } catch (error: any) {
      console.warn('  Groq API failed. Falling back to Gemini...', error.message);
    }
  }

  // Step 2: Gemini Direct SDK (Primary if Gemini selected, or Fallback for Groq)
  const geminiModels = selectedModel && isGeminiModel 
    ? [selectedModel] 
    : ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  for (const model of geminiModels) {
    let lastError = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (signal?.aborted) throw new Error('Aborted');
      try {
        console.log(` Attempting Gemini model: ${model} (Attempt ${attempt + 1}/${maxRetries})`);
        const response = await ai.models.generateContent({
          model,
          contents
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(` Generation successful using Gemini (${model})`);
          return text;
        }
      } catch (error: any) {
        lastError = error;
        const status = error?.status || error?.response?.status;
        const message = error?.message || '';

        if (status === 503 || status === 429 || message.includes('503') || message.includes('429')) {
          console.warn(`  Gemini Model ${model} is busy. Backing off...`);
          const waitTime = Math.pow(2, attempt) * 1000;
          await sleep(waitTime, signal);
          continue;
        } else {
          console.error(` Gemini Model ${model} failed:`, message);
          break; 
        }
      }
    }
  }

  console.error('CRITICAL: This AI service reached the end of the chain without a result.');
  throw new Error('All AI providers are currently unavailable. Please check your API keys or try again later.');
};

export default { generateContent };
