import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import ai from "../configs/ai.js";


// ==============================
// CREATE PROJECT (NON-BLOCKING)
// ==============================
export const createUserProject = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const { initial_prompt } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1️⃣ Create project
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

    // 2️⃣ Save user message
    await prisma.conversation.create({
      data: {
        role: "user",
        content: initial_prompt,
        projectId: project.id,
      },
    });

    // 3️⃣ Update stats
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalCreation: { increment: 1 },
      },
    });

    // ✅ Respond immediately (IMPORTANT)
    res.status(200).json({ projectId: project.id });

    // ==============================
    // 🧠 BACKGROUND AI PIPELINE
    // ==============================
    (async () => {
      try {
        console.log("🚀 AI START:", project.id);

        // STEP 1 — Enhance prompt
        const enhanceRes = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a prompt enhancement expert.
Make the user's request detailed, clear and developer-friendly.
Return ONLY the enhanced prompt.

User request: "${initial_prompt}"`
                }
              ]
            }
          ]
        });

        const enhancedPrompt =
          enhanceRes.candidates?.[0]?.content?.parts?.[0]?.text || initial_prompt;

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
            content: "Generating your website...",
            projectId: project.id,
          },
        });

        console.log("⚡ Generating code...");

        // STEP 2 — Generate code
        const codeRes = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Return ONLY valid HTML.
Use Tailwind CSS for ALL styling.
Include <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> in head.
No explanations, no markdown, no code fences.

Request: "${enhancedPrompt}"`
                }
              ]
            }
          ]
        });

        const code =
          codeRes.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        if (!code) {
          await prisma.conversation.create({
            data: {
              role: "assistant",
              content: "Failed to generate website. Try again.",
              projectId: project.id,
            },
          });

          return;
        }

        const cleanCode = code
          .replace(/```[a-z]*\n?/gi, "")
          .replace(/```$/g, "")
          .trim();

        // STEP 3 — Save version
        const version = await prisma.version.create({
          data: {
            code: cleanCode,
            description: "Initial Version",
            projectId: project.id,
          },
        });

        // STEP 4 — Update project
        await prisma.websiteProject.update({
          where: { id: project.id },
          data: {
            current_code: cleanCode,
            current_version_index: version.id,
          },
        });

        // STEP 5 — Final message
        await prisma.conversation.create({
          data: {
            role: "assistant",
            content: "Website created successfully 🚀",
            projectId: project.id,
          },
        });

        console.log("✅ AI DONE:", project.id);

      } catch (err) {
        console.error("🔥 AI ERROR:", err);

        await prisma.conversation.create({
          data: {
            role: "assistant",
            content: "Something went wrong while generating your website.",
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


// ==============================
// GET SINGLE PROJECT
// ==============================
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


// ==============================
// GET ALL PROJECTS
// ==============================
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

    const projectId = req.params.id as string

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

// ==============================
// CHECK PROJECT STATUS (for polling)
// ==============================
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