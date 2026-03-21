import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { GenerateContentConfig, HarmBlockThreshold, HarmCategory } from '@google/genai';
import ai from '../configs/ai.js';
import path from 'node:path';
import fs from 'fs';
import {v2 as cloudinary} from 'cloudinary';

const stylePrompts = {
  'Bold & Graphic': 'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
  'Tech/Futuristic': 'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
  'Minimalist': 'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
  'Photorealistic': 'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
  'Illustrated': 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
}

const colorSchemeDescriptions = {
  vibrant: 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
  sunset: 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
  forest: 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
  neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
  purple: 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
  monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
  ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
  pastel: 'soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic',
}

// Background function to generate and upload the thumbnail
const generateThumbnailAsync = async (thumbnailId: string, userId: string, title: string, user_prompt: string, style: string, aspect_ratio: string, color_scheme: string) => {
  try {
    const model = 'gemini-3-pro-image-preview';

    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: aspect_ratio || '16:9',
        imageSize: '1K'
      },
      safetySettings: [{
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.OFF
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.OFF
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.OFF
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.OFF
      },]
    }

    let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}"`;

    if(color_scheme){
      prompt += ` Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`;
    }

    if(user_prompt){
      prompt += ` Additional details: ${user_prompt}.`;
    }

    prompt += ` The thumbnail should be ${aspect_ratio}, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;

    // Generate the image using the ai model
    const response: any = await ai.models.generateContent({
      model,
      contents: [prompt],
      config: generationConfig
    })

    // Check if the response is valid
    if(!response?.candidates?.[0]?.content?.parts){
      throw new Error('Unexpected response from Gemini API')
    }

    const parts = response.candidates[0].content.parts;

    let finalBuffer: Buffer | null = null;

    for(const part of parts){
      if(part.inlineData){
        finalBuffer = Buffer.from(part.inlineData.data, 'base64')
      }
    }

    if(!finalBuffer){
      throw new Error('No image data received from Gemini API')
    }

    const filename = `final-output-${Date.now()}.png`;
    const filePath = path.join('images', filename);

    // Create the images directory if it doesn't exist
    fs.mkdirSync('images', {recursive: true})

    // Write the final image to the file
    fs.writeFileSync(filePath, finalBuffer);

    const uploadResult = await cloudinary.uploader.upload(filePath, {resource_type:'image'})

    // Update the thumbnail with the image URL
    await prisma.thumbnail.update({
      where: { id: thumbnailId },
      data: {
        image_url: uploadResult.url,
        isGenerating: false
      }
    });

    // Remove image file from disk
    fs.unlinkSync(filePath)
    console.log(`✅ Thumbnail ${thumbnailId} generated successfully`)
  } catch (error) {
    console.error(`❌ Error generating thumbnail ${thumbnailId}:`, error);
    // Mark the thumbnail as failed
    await prisma.thumbnail.update({
      where: { id: thumbnailId },
      data: {
        isGenerating: false,
        image_url: 'ERROR'
      }
    });
  }
}

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - no userId" });
    }
    
    const { title, prompt: user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;
    
    // Create thumbnail record immediately
    const thumbnail = await prisma.thumbnail.create({
      data: {
        userId: userId,
        title,
        prompt_used: user_prompt,
        user_prompt,
        style,
        aspect_ratio,
        color_scheme,
        text_overlay,
        isGenerating: true
      }
    })

    // Start generation in the background (don't await)
    generateThumbnailAsync(thumbnail.id, userId, title, user_prompt, style, aspect_ratio, color_scheme)
      .catch(error => console.error('Background generation error:', error));

    // Respond immediately with the thumbnail ID
    res.json({message: 'Thumbnail generation started', thumbnail})
  } catch (error) {
    console.log(error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    res.status(500).json({ message: errorMessage });
  }
}

export const deleteThumbnail = async (req: Request, res: Response)=>{
  try {
    const {id} = req.params as { id: string };
    const userId = req.userId as string;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - no userId" });
    }

    await prisma.thumbnail.deleteMany({
      where: { id: id, userId: userId }
    });

    res.json({ message: 'Thumbnail deleted successfully' });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}