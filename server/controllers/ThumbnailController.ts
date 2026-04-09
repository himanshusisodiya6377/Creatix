import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { generateImageWithClipdrop } from '../configs/clipdrop.js';
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
    console.log(`\nBuilding prompt for thumbnail:`);
    console.log(`  Style: ${style}`);
    console.log(`  Color Scheme: ${color_scheme}`);
    console.log(`  Aspect Ratio: ${aspect_ratio}`);
    console.log(`  Title: ${title}`);

    let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} thumbnail for: "${title}"`;

    if(color_scheme){
      prompt += ` Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`;
    }

    if(user_prompt){
      prompt += ` Additional details: ${user_prompt}.`;
    }

    // Add clear text rendering instruction with emphasis on accuracy
    prompt += ` CRITICAL: Display the exact text "${title}" prominently on the thumbnail in large, bold, highly readable letters.`;
    prompt += ` TEXT MUST BE SPELLED CORRECTLY AND MATCH EXACTLY: "${title}". The text should have high contrast with the background for maximum readability.`;
    prompt += ` The thumbnail should be ${aspect_ratio}, visually stunning, and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;
    
    console.log(`\nFinal Prompt:\n${prompt}\n`);

    // Define exact dimensions for each aspect ratio to avoid stretching
    const dimensionMap: Record<string, { width: number; height: number }> = {
      '16:9': { width: 1024, height: 576 },
      '1:1': { width: 1024, height: 1024 },
      '9:16': { width: 576, height: 1024 },
      '4:3': { width: 1024, height: 768 },
      '3:4': { width: 768, height: 1024 },
    };

    const dimensions = dimensionMap[aspect_ratio] || dimensionMap['16:9'];
    const { width, height } = dimensions;

    console.log(`Generating thumbnail with Clipdrop...`);
    console.log(`  Dimensions: ${width}x${height} (Aspect Ratio: ${aspect_ratio})`);
    
    // Generate the image using Clipdrop
    const imageBuffer = await generateImageWithClipdrop({
      prompt,
      width,
      height,
    });

    if(!imageBuffer){
      throw new Error('No image data received from Clipdrop');
    }

    const filename = `final-output-${Date.now()}.png`;
    const filePath = path.join('images', filename);

    // Create the images directory if it doesn't exist
    fs.mkdirSync('images', {recursive: true})

    // Write the final image to the file
    fs.writeFileSync(filePath, imageBuffer);

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
    console.log(`Thumbnail ${thumbnailId} generated successfully`)
  } catch (error) {
    console.error(`Error generating thumbnail ${thumbnailId}:`, error);
    // Delete the thumbnail record if generation failed (only save successful ones)
    await prisma.thumbnail.deleteMany({
      where: { id: thumbnailId }
    });
    console.log(`Deleted failed thumbnail ${thumbnailId}`);
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