import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { generateImageWithClipdrop } from '../configs/clipdrop.js';
import path from 'node:path';
import fs from 'fs';
import {v2 as cloudinary} from 'cloudinary';


// DYNAMIC THUMBNAIL PROMPT SYSTEM


interface ThumbnailAnalysis {
  mainSubject: string;
  emotionalTone: string;
  contextualScenario: string;
  targetAudience: string;
  visualElements: string[];
  ctrFactors: string[];
}

interface ThumbnailConcept {
  titleIdea: string;
  visualSceneDescription: string;
  subjectDetails: string;
  backgroundColors: string;
  textOverlay: string;
  style: string;
  fullPrompt: string;
}

// Deep analysis of user input to extract key elements
function analyzeUserInput(title: string, userPrompt: string): ThumbnailAnalysis {
  const combinedText = `${title} ${userPrompt}`.toLowerCase();

  // Emotion detection
  const emotionMap: Record<string, string[]> = {
    excitement: ['excited', 'wow', 'amazing', 'shocking', 'explosive', 'mind-blowing', 'insane', 'epic', 'crazy', 'unbelievable'],
    curiosity: ['mystery', 'secret', 'hidden', 'reveal', 'discover', 'unknown', 'question', 'what if', 'uncovered'],
    fear: ['scary', 'horror', 'dark', 'danger', 'eerie', 'terrifying', 'threat', 'panic'],
    joy: ['happy', 'fun', 'laugh', 'celebration', 'cheerful', 'smile', 'party', 'entertaining'],
    urgency: ['fast', 'quick', 'limited', 'exclusive', 'now', 'today', 'hurry', 'rare', 'rare opportunity'],
    aspiration: ['dream', 'goal', 'achieve', 'success', 'transform', 'master', 'pro', 'expert', 'level up'],
    authority: ['power', 'strong', 'leadership', 'command', 'dominate', 'control', 'ultimate'],
    satisfaction: ['satisfying', 'calming', 'relaxing', 'asmr', 'peaceful', 'zen'],
  };

  let emotionalTone = 'dynamic';
  for (const [emotion, keywords] of Object.entries(emotionMap)) {
    if (keywords.some(kw => combinedText.includes(kw))) {
      emotionalTone = emotion;
      break;
    }
  }

  // Extract main subject
  const subjectIndicators = combinedText.split(' ').filter(w => w.length > 4);
  const mainSubject = subjectIndicators[0] || 'content showcase';

  // Context detection
  const contextMap: Record<string, string[]> = {
    product: ['product', 'review', 'unboxing', 'test', 'gear', 'device', 'item'],
    gaming: ['game', 'gaming', 'stream', 'esports', 'gameplay', 'gamer'],
    tutorial: ['tutorial', 'learn', 'guide', 'how to', 'lesson', 'teach'],
    entertainment: ['funny', 'comedy', 'prank', 'comedy', 'entertaining', 'hilarious'],
    transformation: ['transform', 'before after', 'makeover', 'changed', 'journey'],
    challenge: ['challenge', 'attempt', 'test', 'try', 'beat', 'vs'],
    vlog: ['vlog', 'day', 'life', 'lifestyle', 'routine', 'daily'],
  };

  let contextualScenario = 'general content';
  for (const [context, keywords] of Object.entries(contextMap)) {
    if (keywords.some(kw => combinedText.includes(kw))) {
      contextualScenario = context;
      break;
    }
  }

  // Target audience inference
  const audienceMap: Record<string, string[]> = {
    young: ['teens', 'kids', 'youth', 'gaming', 'meme', 'trending'],
    professional: ['business', 'corporate', 'professional', 'finance', 'enterprise'],
    educational: ['learn', 'science', 'education', 'explained', 'research'],
    entertainment: ['funny', 'comedy', 'entertainment', 'streaming', 'vlog'],
    enthusiasts: ['review', 'tech', 'gear', 'hardcore', 'expert', 'pro'],
  };

  let targetAudience = 'content creators';
  for (const [audience, keywords] of Object.entries(audienceMap)) {
    if (keywords.some(kw => combinedText.includes(kw))) {
      targetAudience = audience + ' audience';
      break;
    }
  }

  // Extract visual elements from description
  const visualKeywords = ['cinematic', 'dramatic', 'vibrant', 'dark', 'bright', 'glossy', 'minimalist', '3d', 'cartoon', 'realistic'];
  const visualElements = visualKeywords.filter(kw => combinedText.includes(kw));

  // CTR factors
  const ctrFactors: string[] = [];
  if (combinedText.includes('shocking') || combinedText.includes('wow')) ctrFactors.push('shock value');
  if (combinedText.includes('mystery') || combinedText.includes('secret')) ctrFactors.push('curiosity gap');
  if (combinedText.includes('fail') || combinedText.includes('epic')) ctrFactors.push('emotional reaction');
  if (combinedText.includes('test') || combinedText.includes('vs')) ctrFactors.push('comparison element');
  if (emotionalTone === 'urgency') ctrFactors.push('scarcity/urgency');

  return {
    mainSubject: title.substring(0, 50),
    emotionalTone,
    contextualScenario,
    targetAudience,
    visualElements: visualElements.length > 0 ? visualElements : ['dynamic', 'professional'],
    ctrFactors: ctrFactors.length > 0 ? ctrFactors : ['visual impact', 'curiosity', 'engagement'],
  };
}

// Generate a highly detailed, unique thumbnail concept
function generateDynamicThumbnailConcept(
  title: string,
  userPrompt: string,
  userStyle: string,
  colorScheme: string,
  aspectRatio: string,
  textOverlay: string
): ThumbnailConcept {
  const analysis = analyzeUserInput(title, userPrompt);

  console.log('\n========== THUMBNAIL CONCEPT ANALYSIS ==========');
  console.log(`Main Subject: ${analysis.mainSubject}`);
  console.log(`Emotional Tone: ${analysis.emotionalTone}`);
  console.log(`Context: ${analysis.contextualScenario}`);
  console.log(`Target Audience: ${analysis.targetAudience}`);
  console.log(`CTR Factors: ${analysis.ctrFactors.join(', ')}`);

  // Generate dynamic visual scene based on analysis
  const sceneDescriptions: Record<string, string> = {
    excitement: 'explosive energy with dynamic movement and sharp focus, intense action in the moment',
    curiosity: 'intrigue-driven composition with layered depth, mysterious shadows, hidden revelations',
    fear: 'tension-filled atmosphere with ominous lighting, dark undertones, sense of urgency and threat',
    joy: 'bright uplifting energy, warm lighting, positive motion flowing outward, celebratory mood',
    urgency: 'fast-paced composition with motion blur, sharp contrasts, time-sensitive visual cues',
    aspiration: 'aspirational framing with subject elevated or centered, inspiring lighting, goal-oriented focus',
    authority: 'commanding central positioning, dominant subject, powerful lighting from above or sides',
    satisfaction: 'serene composition with meditative elements, smooth textures, calming color harmony',
  };

  const visualScene = sceneDescriptions[analysis.emotionalTone] || 'vibrant, engaging composition with clear focal point';

  // Background and color strategy based on analysis and user selection
  const colorGuide: Record<string, string> = {
    vibrant: 'saturated, high-contrast colors that pop off screen, maximum visual impact',
    sunset: 'warm gradient tones (orange to purple), cinematic glow with dramatic shadows',
    forest: 'natural earth tones with organic textures, calming green-brown palette',
    neon: 'electric neon accents (cyan, pink, magenta) against deep blacks for cyberpunk feel',
    purple: 'rich purples and magentas creating modern, sophisticated atmosphere',
    monochrome: 'high-contrast black and white with dramatic lighting creating depth',
    ocean: 'cool blues and teals with aquatic atmosphere and flowing movement',
    pastel: 'soft, muted tones with gentle transitions, friendly approachable feel',
  };

  const backgroundDescription = colorGuide[colorScheme as keyof typeof colorGuide] || 'dynamic, visually striking color palette';

  // Use user-provided text overlay, fallback to title if not provided
  const displayText = (textOverlay && typeof textOverlay === 'string' ? textOverlay.trim() : '') || title.substring(0, 15);
  const textOverlayFinal = displayText.substring(0, 50);

  // Style determiner
  const styleMap: Record<string, string> = {
    'Bold & Graphic': 'bold, high-contrast, graphic design style with strong typography',
    'Tech/Futuristic': 'futuristic, sleek, digital aesthetic with modern tech elements',
    'Minimalist': 'clean minimalist design, spacious composition, elegant simplicity',
    'Photorealistic': 'photorealistic, ultra-detailed, professional photography quality',
    'Illustrated': 'illustrated art style, creative, artistic hand-painted quality',
  };

  const styleDescription = styleMap[userStyle as keyof typeof styleMap] || 'visually striking modern style';

  // Build comprehensive full prompt for AI
  const fullPrompt = `Create an absolutely stunning, high-impact thumbnail that MUST capture attention immediately.

ANALYSIS-BASED REQUIREMENTS:
- Main focus: ${analysis.mainSubject}
- Emotional tone: ${analysis.emotionalTone}
- Context: ${analysis.contextualScenario}
- Target audience: ${analysis.targetAudience}
- CTR factors to include: ${analysis.ctrFactors.join(', ')}

VISUAL DIRECTION:
- Scene composition: ${visualScene}
- Color palette: ${backgroundDescription}
- Overall style: ${styleDescription}
- Aspect ratio: ${aspectRatio}

CONTENT INSTRUCTIONS:
${userPrompt ? `- Core content: ${userPrompt}` : ''}
- Title text: "${title}"
- Display text on thumbnail: EXACTLY "${textOverlayFinal}" - DO NOT MODIFY, CHANGE, SHORTEN, OR REPHRASE

TEXT RENDERING (CRITICAL - HIGHEST PRIORITY):
- RENDER EXACT TEXT: "${textOverlayFinal}"
- TEXT MUST MATCH EXACTLY: "${textOverlayFinal}"
- NO SPELLING CHANGES - render literally as written: "${textOverlayFinal}"
- Font: Large, bold, high-contrast
- Text should be visible even at small thumbnail size
- Strategic placement that enhances overall composition
- DO NOT truncate, change case, or modify the text in any way
- THIS TEXT MUST APPEAR EXACTLY AS: "${textOverlayFinal}"

THUMBNAIL OPTIMIZATION:
- Designed for maximum CTR (click-through rate)
- Visually impossible to ignore
- Professional and polished quality
- Unique, non-generic concept
- Specific ${aspectRatio} format

Make this thumbnail so visually striking that people MUST click it.`;

  const concept: ThumbnailConcept = {
    titleIdea: `${title} - ${analysis.emotionalTone.charAt(0).toUpperCase() + analysis.emotionalTone.slice(1)} Impact`,
    visualSceneDescription: visualScene,
    subjectDetails: `${analysis.mainSubject} with ${analysis.emotionalTone} energy, designed to appeal to ${analysis.targetAudience}`,
    backgroundColors: backgroundDescription,
    textOverlay: textOverlayFinal,
    style: styleDescription,
    fullPrompt: fullPrompt,
  };

  console.log('\n========== GENERATED CONCEPT ==========');
  console.log(`Title Idea: ${concept.titleIdea}`);
  console.log(`Visual Scene: ${concept.visualSceneDescription}`);
  console.log(`Text Overlay: ${concept.textOverlay}`);
  console.log(`Style: ${concept.style}`);
  console.log('==========================================\n');

  return concept;
}

// Background function to generate and upload the thumbnail
const generateThumbnailAsync = async (thumbnailId: string, userId: string, title: string, user_prompt: string, style: string, aspect_ratio: string, color_scheme: string, text_overlay: string) => {
  try {
    console.log(`\n========== STARTING THUMBNAIL GENERATION ==========`);
    console.log(`Title: ${title}`);
    console.log(`User Description: ${user_prompt}`);
    console.log(`Style: ${style}`);
    console.log(`Color Scheme: ${color_scheme}`);
    console.log(`Aspect Ratio: ${aspect_ratio}`);

    // Generate dynamic, adaptive thumbnail concept
    const concept = generateDynamicThumbnailConcept(title, user_prompt, style, color_scheme, aspect_ratio, text_overlay);
    const prompt = concept.fullPrompt;

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

    console.log(`\nGenerating image with Clipdrop...`);
    console.log(`Dimensions: ${width}x${height} (Aspect Ratio: ${aspect_ratio})`);
    
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
    console.log(`✅ Thumbnail ${thumbnailId} generated successfully`)
  } catch (error) {
    console.error(`❌ Error generating thumbnail ${thumbnailId}:`, error);
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
    generateThumbnailAsync(thumbnail.id, userId, title, user_prompt, style, aspect_ratio, color_scheme, text_overlay)
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