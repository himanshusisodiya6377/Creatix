import { generateImageWithClipdrop } from '../configs/clipdrop.js';

interface ThumbnailOptions {
  prompt: string;
  width?: number;
  height?: number;
}

interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
}

// Generate professional image prompt locally (no API calls)
function generateImagePromptLocally(userPrompt: string): string {
  // Clean up the prompt first - remove excessive whitespace and newlines
  let cleanPrompt = userPrompt.replace(/\s+/g, " ").trim();
  
  const lowerPrompt = cleanPrompt.toLowerCase();
  
  // Extract key elements from user prompt
  const styleKeywords = {
    modern: lowerPrompt.includes("modern") || lowerPrompt.includes("contemporary"),
    minimalist: lowerPrompt.includes("minimal") || lowerPrompt.includes("clean"),
    professional: lowerPrompt.includes("professional") || lowerPrompt.includes("corporate"),
    vibrant: lowerPrompt.includes("vibrant") || lowerPrompt.includes("colorful"),
    cinematic: lowerPrompt.includes("cinematic") || lowerPrompt.includes("movie"),
    luxury: lowerPrompt.includes("luxury") || lowerPrompt.includes("premium"),
  };

  // Build the enhanced prompt - keep it concise
  let enhancedPrompt = cleanPrompt;

  // Add quality descriptors based on style detected
  if (styleKeywords.cinematic || styleKeywords.professional) {
    enhancedPrompt += ", cinematic lighting, professional photography, ultra HD, sharp focus, studio lighting";
  } else if (styleKeywords.vibrant) {
    enhancedPrompt += ", vibrant colors, bold contrast, dynamic lighting, high saturation";
  } else {
    enhancedPrompt += ", professional quality, detailed, well-lit, dynamic composition";
  }

  // Add final quality boost
  enhancedPrompt += ", 8K resolution, award-winning, no watermark";

  console.log("✨ Enhanced prompt (local):", enhancedPrompt.substring(0, 150) + "...");
  return enhancedPrompt;
}

// Generate image using Clipdrop API
async function generateImageWithClipdropAPI(prompt: string, width = 1024, height = 1024): Promise<Buffer> {
  try {
    console.log("🚀 Calling Clipdrop API...");
    
    // Shorten prompt if too long
    const maxLength = 500;
    const shortenedPrompt = prompt.length > maxLength ? prompt.substring(0, maxLength) : prompt;
    
    console.log("⏳ Generating image with Clipdrop...");
    const imageBuffer = await generateImageWithClipdrop({
      prompt: shortenedPrompt,
      width,
      height,
    });

    console.log("✅ Image generated successfully");
    return imageBuffer;
  } catch (error: any) {
    console.error("❌ Clipdrop API failed:", error.message);
    if (error.response?.data) {
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

export async function generateThumbnailSVG(
  options: ThumbnailOptions
): Promise<Buffer> {
  const { prompt, width = 1024, height = 1024 } = options;

  try {
    console.log("🎨 Starting AI thumbnail generation for prompt:", prompt);

    // Step 1: Generate enhanced prompt locally (no API calls)
    console.log("📝 Enhancing prompt locally...");
    const enhancedPrompt = generateImagePromptLocally(prompt);

    // Step 2: Generate the actual image using Clipdrop
    console.log("🖼️  Generating image with Clipdrop...");
    const imageBuffer = await generateImageWithClipdropAPI(enhancedPrompt, width, height);

    console.log("✅ Image generated successfully");
    console.log("✅ Image buffer created, size:", imageBuffer.length);

    return imageBuffer;
  } catch (error) {
    console.error("❌ Thumbnail generation failed:", error);
    throw error;
  }
}
