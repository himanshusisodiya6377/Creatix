import axios from 'axios';

// PicsArt API configuration
const PICSART_API_KEY = process.env.PICSART_API_KEY;
const PICSART_API_URL = 'https://genai-api.picsart.io/v1/text2image';
const PICSART_RESULT_URL = 'https://genai-api.picsart.io/v1/text2image/result';

interface PicsArtGenerationParams {
  prompt: string;
  width?: number;
  height?: number;
}

interface PicsArtAsyncResult {
  transaction_id?: string;
  id?: string;
  images?: Array<{ url: string }>;
  image_urls?: string[];
  status?: string;
}

export async function generateImageWithPicsArt(params: PicsArtGenerationParams): Promise<Buffer> {
  try {
    if (!PICSART_API_KEY) {
      throw new Error('PICSART_API_KEY not set in environment variables');
    }

    const { prompt, width = 1024, height = 1024 } = params;

    console.log('🚀 Calling PicsArt Text2Image API...');

    // Step 1: Submit the text-to-image generation request
    const response = await axios.post(
      PICSART_API_URL,
      {
        prompt: prompt,
        width: Math.min(width, 1024),
        height: Math.min(height, 1024),
        count: 1,
      },
      {
        headers: {
          'X-Picsart-API-Key': PICSART_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('✅ Image generation request submitted');
    console.log('📦 Response status:', response.status);
    console.log('📦 Response data:', JSON.stringify(response.data, null, 2));

    const transactionId = response.data?.inference_id || response.data?.transaction_id || response.data?.id;
    
    if (!transactionId) {
      console.error('Response:', JSON.stringify(response.data, null, 2));
      throw new Error('No inference ID received from PicsArt API');
    }

    console.log(`⏳ Waiting for image generation (Inference ID: ${transactionId})...`);

    // Step 2: Poll for the result
    let result: PicsArtAsyncResult | null = null;
    const maxAttempts = 60; // 2 minutes with 2 second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds instead of 5

      try {
        // Try multiple endpoint formats
        let resultResponse;
        try {
          // First try: /v1/text2image/{id}
          resultResponse = await axios.get(
            `${PICSART_API_URL}/${transactionId}`,
            {
              headers: {
                'X-Picsart-API-Key': PICSART_API_KEY,
              },
              timeout: 10000,
            }
          );
        } catch (e1: any) {
          // Second try: /v1/text2image/result/{id}
          if (e1.response?.status === 404) {
            resultResponse = await axios.get(
              `${PICSART_RESULT_URL}/${transactionId}`,
              {
                headers: {
                  'X-Picsart-API-Key': PICSART_API_KEY,
                },
                timeout: 10000,
              }
            );
          } else {
            throw e1;
          }
        }

        result = resultResponse.data;
        attempts++;

        console.log(`  ✓ Poll attempt ${attempts}/${maxAttempts} (${attempts * 2}s elapsed)`);
        console.log(`    Status: ${result?.status || 'unknown'}`);

        // Check if the result is ready
        if (result?.images && result.images.length > 0) {
          console.log('✅ Image generation completed!');
          break;
        }

        if (result?.image_urls && result.image_urls.length > 0) {
          console.log('✅ Image generation completed!');
          // Convert image_urls to images format
          result.images = result.image_urls.map(url => ({ url }));
          break;
        }

        if (result?.status === 'failed' || result?.status === 'error') {
          throw new Error(`Image generation failed with status: ${result.status}`);
        }
      } catch (error: any) {
        if (error.response?.status === 404 || error.response?.status === 429) {
          // Still processing or rate limited, continue polling
          continue;
        }
        throw error;
      }
    }

    if (!result?.images || result.images.length === 0) {
      throw new Error(`Image generation timeout after ${attempts * 2}s`);
    }

    const imageUrl = result.images[0].url;
    console.log('📥 Downloading image from URL...');

    // Step 3: Download the image
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    const imageBuffer = Buffer.from(imageResponse.data);
    console.log('✅ Image downloaded successfully');
    console.log('✅ Image buffer created, size:', imageBuffer.length);

    return imageBuffer;
  } catch (error: any) {
    console.error('❌ PicsArt API failed:', error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Failed to generate image with PicsArt: ${error.message}`);
  }
}

export default {
  generateImage: generateImageWithPicsArt,
};
