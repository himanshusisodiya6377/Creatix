import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import aiService from "../lib/aiService.js";
import { taskManager } from "../lib/taskManager.js";

const validateWebsiteCode = (code: string): boolean => {
  const checks = [
    { 
      name: 'HTML/Doctype', 
      test: () => code.includes('<html') || code.includes('<!DOCTYPE'),
      error: 'Missing basic HTML structure or <!DOCTYPE>'
    },
    { 
      name: 'Body Tag', 
      test: () => code.includes('<body'),
      error: 'Missing <body> tag' 
    },
    { 
      name: 'Code Length', 
      test: () => code.length >= 500,
      error: 'Code too short (< 500 chars) - likely incomplete' 
    }
  ];

  for (const check of checks) {
    if (!check.test()) {
      console.warn(`Validation Failed [${check.name}]: ${check.error}`);
      return false;
    }
  }

  console.log('Validation passed - Website structure is valid');
  return true;
};

export const createUserProject = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const { initial_prompt, model } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await prisma.websiteProject.create({
      data: {
        name:
          initial_prompt.length > 50
            ? initial_prompt.substring(0, 47) + "..."
            : initial_prompt,
        initial_prompt,
        userId,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "user",
        content: initial_prompt,
        projectId: project.id,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        totalCreation: { increment: 1 },
      },
    });

    res.status(200).json({ projectId: project.id });

    (async () => {
      try {
        const controller = new AbortController();
        taskManager.addTask(project.id, controller);

        const responseText = await aiService.generateContent({
          model,
          signal: controller.signal,
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Create a professional, minimalist, and lightweight SINGLE-PAGE website for: "${initial_prompt}"
                  
                  CRITICAL REQUIREMENTS:
                  - Use VANILLA HTML, CSS, and JS ONLY.
                  - NO Tailwind CSS. NO React. NO External Libraries (except for icons/fonts).
                  - Use a single <style> tag for ALL beautiful, modern, and responsive CSS.
                  - Use a single <script> tag for simple interactivity.
                  - Return ONLY the complete HTML code. NO explanation. NO code fences.
                  
                  STRUCTURE & NAVIGATION:
                  - Build a clean, vertical single-page layout.
                  - Use Fragment IDs (e.g., id="about", id="work") for sections.
                  - Navigation links MUST use the format: <a href="#about">About</a>.
                  - The navbar and footer MUST be included in the single HTML document.
                  - Use smooth-scrolling for a premium feel.
                  
                  IMAGES:
                  - If you need images, use ONLY .https://picsum.photos/{width}/{height} (e.g., https://picsum.photos/800/400)
                  - Do NOT use via.placeholder.com, placehold.co, or any other placeholder service.
                  - Prefer CSS gradients, SVG icons, and background colors over images where possible.
                  
                  DESIGN PHILOSOPHY:
                  - Keep the code lightweight and simple (optimized for free AI models).
                  - Focus on high-quality typography and clean minimalist aesthetics.`,
                },
              ],
            },
          ],
        });

        const htmlCode = responseText.replace(/```[a-z]*\n?/gi, "").replace(/```$/g, "").trim();
        const enhancedPrompt = initial_prompt;

        if (!htmlCode) throw new Error("Empty AI response");

        const isValidWebsite = validateWebsiteCode(htmlCode);
        if (!isValidWebsite) {
          throw new Error("Invalid website structure - missing required HTML/router elements");
        }

        await prisma.conversation.create({
          data: {
            role: "assistant",
            content: `Enhanced prompt: ${enhancedPrompt}`,
            projectId: project.id,
          },
        });

        await prisma.conversation.create({
          data: {
            role: "assistant",
            content: "Website created successfully",
            projectId: project.id,
          },
        });

        const cleanCode = htmlCode
          .trim();

        const version = await prisma.version.create({
          data: {
            code: cleanCode,
            description: "Initial Version",
            projectId: project.id,
          },
        });

        await prisma.websiteProject.update({
          where: { id: project.id },
          data: {
            current_code: cleanCode,
            current_version_index: version.id,
          },
        });

        taskManager.removeTask(project.id);
      } catch (err: any) {
        console.error("AI GENERATION FAILED:", err);
        taskManager.removeTask(project.id);
        const errorMessage = err.message === 'Aborted' ? "Generation was cancelled." : (err.message || "Something went wrong while generating your website. Please check your API key.");
        
        await prisma.conversation.create({
          data: {
            role: "assistant",
            content: errorMessage,
            projectId: project.id,
          },
        });
      }
    })();

  } catch (error: any) {
    console.error(error);

    return res.status(500).json({ message: error.message });
  }
};

export const getUserProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { projectId } = req.params as { projectId: string };

    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
      include: {
        conversation: { orderBy: { timestamp: "asc" } },
        versions: { orderBy: { timestamp: "asc" } },
      },
    });

    return res.status(200).json({ project });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await prisma.websiteProject.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return res.status(200).json({ projects });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// to toggle Project Publish
export const togglePublish = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projectId = req.params.projectId as string

    const project = await prisma.websiteProject.findUnique({
        where:{id:projectId,userId}
    })

    if(!project){
        return res.status(404).json({message:'Project not Found'})
    }
    await prisma.websiteProject.update({
        where: {
        id: projectId,
        userId,
      },
        data:{
            isPublished:!project.isPublished
        }

    })
    return res.status(200).json({message : !project.isPublished ? 'Project Published Successfully' : 'Project Unpublished'})
  } catch (error: any) {
    console.log(error.code || error.message);
    return res.status(500).json({ message: error.message });
  }
};




export const getUsersThumbnails = async (req: Request, res: Response)=>{
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - no userId" });
    }

    const thumbnails = await prisma.thumbnail.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json({thumbnails})
  } catch (error: any) {
    console.log("Error in getUsersThumbnails:", error);
    return res.status(500).json({message: error.message })
  }
}

export const getThumbnailbyId = async (req: Request, res: Response)=>{
  try {
     const userId = req.userId as string;
     
     if (!userId) {
      return res.status(401).json({ message: "Unauthorized - no userId" });
     }
     
    const { id } = req.params as { id: string };

    const thumbnail = await prisma.thumbnail.findFirst({
      where: { userId: userId, id: id }
    });
    return res.status(200).json({thumbnail})

  } catch (error: any) {
    console.log("Error in getThumbnailbyId:", error);
    return res.status(500).json({message: error.message })
  }
}

export const checkProjectStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId as string, userId: userId as string },
      select: { current_code: true, current_version_index: true }
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isGenerated = !!project.current_code && project.current_version_index !== "";

    return res.status(200).json({
      projectId,
      isGenerated,
      hasCode: !!project.current_code
    });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
export const cancelProjectGeneration = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const userId = req.userId;

  try {
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cancelled = taskManager.cancelTask(projectId);
    
    // Update conversation to show it was cancelled
    await prisma.conversation.create({
      data: {
        role: 'assistant',
        content: 'Generation was cancelled by the user.',
        projectId,
      },
    });

    return res.status(200).json({ 
      success: true, 
      message: cancelled ? 'Generation cancelled successfully' : 'Task already completed or not found' 
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
