import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';
// Clipdrop API configuration
const CLIPDROP_API_KEY = process.env.CLIPDROP_API_KEY;
const CLIPDROP_API_URL = 'https://clipdrop-api.co/text-to-image/v1';
export async function generateImageWithClipdrop(params) {
    try {
        if (!CLIPDROP_API_KEY) {
            throw new Error('CLIPDROP_API_KEY not set in environment variables');
        }
        const { prompt, width = 1024, height = 1024 } = params;
        console.log('Calling Clipdrop Text-to-Image API...');
        console.log(`Requested dimensions: ${width}x${height}`);
        // Create form data for Clipdrop API
        const formData = new FormData();
        formData.append('prompt', prompt);
        const response = await axios.post(CLIPDROP_API_URL, formData, {
            headers: {
                'x-api-key': CLIPDROP_API_KEY,
                ...formData.getHeaders(),
            },
            responseType: 'arraybuffer',
            timeout: 120000, // 2 minutes timeout
        });
        console.log('Image generated successfully from Clipdrop');
        console.log('Response status:', response.status);
        const remainingCredits = response.headers['x-remaining-credits'];
        const creditsConsumed = response.headers['x-credits-consumed'];
        if (remainingCredits)
            console.log(`Remaining credits: ${remainingCredits}`);
        if (creditsConsumed)
            console.log(`Credits consumed: ${creditsConsumed}`);
        let imageBuffer = Buffer.from(response.data);
        // Resize image to match requested aspect ratio
        if (width !== 1024 || height !== 1024) {
            console.log(`Resizing image from 1024x1024 to ${width}x${height}...`);
            try {
                imageBuffer = await sharp(imageBuffer)
                    .resize(width, height, {
                    fit: 'fill', // Fill the entire dimensions
                    position: 'center',
                })
                    .png()
                    .toBuffer();
                console.log(`Image resized to ${width}x${height}`);
            }
            catch (resizeError) {
                console.warn('Could not resize image, returning original size');
                // If resize fails, return original buffer
            }
        }
        console.log('Image buffer created, size:', imageBuffer.length);
        return imageBuffer;
    }
    catch (error) {
        console.error('Clipdrop API failed:', error.message);
        if (error.response?.data) {
            try {
                // Try to parse error response
                const errorData = error.response.data.toString('utf-8');
                console.error('Response data:', errorData);
            }
            catch (e) {
                console.error('Response status:', error.response.status);
            }
        }
        throw new Error(`Failed to generate image with Clipdrop: ${error.message}`);
    }
}
export default {
    generateImage: generateImageWithClipdrop,
};
