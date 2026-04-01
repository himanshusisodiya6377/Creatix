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

    // ===================================
    // 🧠 SMART AI FALLBACK PIPELINE
    // ===================================
    (async () => {
      const FALLBACK_MODELS = [
        "models/gemini-2.0-flash",
        "models/gemini-2.5-flash",
        "models/gemini-1.5-flash",
      ];
      let lastError: any = null;

      console.log("🚀 AI START:", project.id);

      for (const modelId of FALLBACK_MODELS) {
        try {
          console.log(`🤖 Attempting generation with: ${modelId}`);

          const result = await ai.models.generateContent({
            model: modelId,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are an expert web developer and prompt engineer.
Your task is to take the user's request, enhance it for clarity and detail, and then generate a high-quality, fully responsive website.

Return ONLY a JSON object with this structure:
{
  "enhancedPrompt": "the detailed version of the user request",
  "htmlCode": "the complete HTML code including Tailwind CSS"
}

Rules:
- Use Tailwind CSS for ALL styling.
- Include <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> in the head.
- **FOR IMAGES**: Use **ONLY** 'https://placehold.co/WIDTHxHEIGHT?text=Description' for placeholders. 
- **NEVER** use 'via.placeholder.com' as it is unreliable.
- Ensure the code is high-quality, modern, and matches the enhanced prompt.
- No other text, no markdown fences, JUST the JSON.

User request: "${initial_prompt}"`
                  }
                ]
              }
            ]
          });

          const responseText = result.text || "";
          let enhancedPrompt = initial_prompt;
          let htmlCode = "";

          try {
            // Extract JSON if model wraps it in md fences
            const jsonContent = responseText.replace(/```json\n?|```/g, "").trim();
            const parsed = JSON.parse(jsonContent);
            enhancedPrompt = parsed.enhancedPrompt || initial_prompt;
            htmlCode = parsed.htmlCode || "";
          } catch (e) {
            console.error("Failed to parse AI JSON response, falling back to raw text.");
            htmlCode = responseText;
          }

          if (!htmlCode) throw new Error("Empty AI response");

          // 1️⃣ Save Enhanced Prompt record
          await prisma.conversation.create({
            data: {
              role: "assistant",
              content: `Enhanced prompt: ${enhancedPrompt}`,
              projectId: project.id,
            },
          });

          // 2️⃣ Save success status message
          await prisma.conversation.create({
            data: {
              role: "assistant",
              content: "Website created successfully 🚀",
              projectId: project.id,
            },
          });

          console.log("⚡ Saving generated code...");

          const cleanCode = htmlCode
            .replace(/```[a-z]*\n?/gi, "")
            .replace(/```$/g, "")
            .trim();

          // 3️⃣ Save version
          const version = await prisma.version.create({
            data: {
              code: cleanCode,
              description: "Initial Version",
              projectId: project.id,
            },
          });

          // 4️⃣ Update project
          await prisma.websiteProject.update({
            where: { id: project.id },
            data: {
              current_code: cleanCode,
              current_version_index: version.id,
            },
          });

          console.log("✅ AI DONE:", project.id, "using", modelId);
          return; // EXIT LOOP ON SUCCESS

        } catch (err: any) {
          lastError = err;
          console.warn(`⚠️ Model ${modelId} failed:`, err.status || err.message);
          
          // Only continue to fallback if it's a quota error (429) or model-not-found (404)
          if (err.status !== 429 && err.status !== 404) {
            break; 
          }
        }
      }

      // If we reach here, all models failed
      console.error("🔥 ALL AI MODELS FAILED:", lastError);

      const isQuotaError = lastError?.status === 429;
      const errorMessage = isQuotaError
        ? "AI Quota limit reached (Free Tier). Please wait 60 seconds and try again."
        : "Something went wrong while generating your website. Please check your API key.";

      await prisma.conversation.create({
        data: {
          role: "assistant",
          content: errorMessage,
          projectId: project.id,
        },
      });
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