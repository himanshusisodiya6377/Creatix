import axios from 'axios'

// Replicate API configuration - Using Stable Diffusion XL (proven working model)
const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
const REPLICATE_MODEL = "stability-ai/sdxl"; // Public model endpoint

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

// Generate image using Replicate API (Flux Pro - latest model)
async function generateImageWithReplicate(prompt: string): Promise<string> {
  try {
    const token = process.env.REPLICATE_API_KEY;
    if (!token) {
      throw new Error("REPLICATE_API_KEY not set in environment variables");
    }

    console.log("🚀 Calling Replicate API with SDXL...");
    
    // Shorten prompt if too long
    const maxLength = 500;
    const shortenedPrompt = prompt.length > maxLength ? prompt.substring(0, maxLength) : prompt;
    
    // Create prediction
    console.log("⏳ Creating image generation job...");
    const createResponse = await axios.post(
      `${REPLICATE_API_URL}`,
      {
        model: REPLICATE_MODEL,
        input: {
          prompt: shortenedPrompt,
          num_outputs: 1,
          num_inference_steps: 30,
        },
      },
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const predictionId = createResponse.data.id;
    console.log("✅ Job created (ID:", predictionId + ")");

    // Poll for completion
    let prediction = createResponse.data;
    const maxAttempts = 180; // 3 minutes
    let attempts = 0;

    console.log("⏳ Waiting for image generation (takes 20-40 seconds)...");
    
    while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const checkResponse = await axios.get(`${REPLICATE_API_URL}/${predictionId}`, {
          headers: {
            Authorization: `Token ${token}`,
          },
          timeout: 10000,
        });
        
        prediction = checkResponse.data;
        attempts++;
        
        if (attempts % 10 === 0) {
          console.log(`  ...still generating (${attempts * 2}s elapsed)...`);
        }
      } catch (checkError: any) {
        if (checkError.response?.status === 429) {
          console.log("  ...rate limited, waiting longer...");
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          throw checkError;
        }
      }
    }

    if (prediction.status === "failed") {
      throw new Error(`Generation failed: ${prediction.error || "Unknown error"}`);
    }

    if (prediction.status !== "succeeded") {
      throw new Error(`Generation timeout after ${attempts * 2}s`);
    }

    const imageUrl = prediction.output?.[0];
    if (!imageUrl) {
      throw new Error("No image URL in response");
    }

    console.log("✅ Image generated:", imageUrl.substring(0, 50) + "...");

    // Download the image
    console.log("⏳ Downloading image...");
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    if (!imageResponse.data) {
      throw new Error("No image data received");
    }

    console.log("✅ Image downloaded, size:", imageResponse.data.length);

    // Convert to base64
    const base64Image = Buffer.from(imageResponse.data).toString("base64");
    const dataUrl = `data:image/png;base64,${base64Image}`;
    
    return dataUrl;
  } catch (error: any) {
    console.error("❌ Replicate API failed:", error.message);
    if (error.response?.data) {
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

export async function generateThumbnailSVG(
  options: ThumbnailOptions
): Promise<Buffer> {
  const { prompt } = options;

  try {
    console.log("🎨 Starting AI thumbnail generation for prompt:", prompt);

    // Step 1: Generate enhanced prompt locally (no API calls)
    console.log("📝 Enhancing prompt locally...");
    const enhancedPrompt = generateImagePromptLocally(prompt);

    // Step 2: Generate the actual image using Replicate
    console.log("🖼️  Generating image with Replicate API...");
    const imageDataUrl = await generateImageWithReplicate(enhancedPrompt);

    console.log("✅ Image generated successfully");

    // Convert data URL to buffer
    const base64String = imageDataUrl.split(",")[1];
    if (!base64String) {
      throw new Error("Invalid image data format");
    }

    const imageBuffer = Buffer.from(base64String, "base64");
    console.log("✅ Image buffer created, size:", imageBuffer.length);

    return imageBuffer;
  } catch (error) {
    console.error("❌ Thumbnail generation failed:", error);
    throw error;
  }
}
