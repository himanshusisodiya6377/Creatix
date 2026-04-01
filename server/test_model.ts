import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

async function listModels() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string
  });

  try {
    console.log("Listing available models...");
    const models = await (ai as any).models.list();
    for (const m of models) {
        console.log(m.name);
    }
  } catch (e: any) {
    console.error("Listing failed:", e);
  }
}

listModels();
