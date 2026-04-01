import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

async function listModels() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string
  });

  try {
    console.log("Listing models via models.list()...");
    const response = await ai.models.list();
    
    // The response is a Pager, we need to iterate
    for await (const model of response) {
      console.log(`- ${model.name} (DisplayName: ${model.displayName})`);
    }
  } catch (e: any) {
    console.error("Listing failed:", e.message || e);
  }
}

listModels();
