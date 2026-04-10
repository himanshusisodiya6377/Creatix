import { Request, Response } from 'express';
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
      console.warn(` Validation Failed [${check.name}]: ${check.error}`);
      return false;
    }
  }

  console.log(' Validation passed - Website structure is valid');
  return true;
};


// Controller Function to make Revision
export const makeRevision = async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { projectId } = req.params as { projectId: string };
  const { message, model } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!userId || !user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if(!message || message.trim() == "" ){
        return res.status(400).json({ message: "Please enter a valid prompt" });
    }

    const currentProject = await prisma.websiteProject.findUnique({
        where:{id: projectId, userId},
        include: {versions: true}
    })

    if(!currentProject){
         return res.status(400).json({ message: "project not found" });
    }

    await prisma.conversation.create({
        data:{
            role: 'user',
            content: message,
            projectId: projectId
        }
    })


    const controller = new AbortController();
    taskManager.addTask(projectId, controller);
    
    //Enhance user prompt
    const enhancedPrompt = await aiService.generateContent({
        model,
        signal: controller.signal,
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: `You are a prompt enhancement specialist for a SINGLE-PAGE vertical website generator.
                        
                        If the user asks for a 'new page' or 'additional page' (e.g., 'create a contact page'), you MUST translate this into: 'Add a new [Name] section to the bottom of the existing page with high-quality design and a smooth-scroll navigation link in the header'.
                        
                        Enhance the request by:
                        1. Being specific about the section's layout and content.
                        2. Mentioning custom CSS design details (minimalist, clean spacing).
                        3. Ensuring it fits perfectly at the end of the current HTML body.
                        
                        Return ONLY the enhanced request, nothing else. Keep it concise.
                        
                        User's request: "${message}"`
                    }
                ]
            }
        ]
    });

    await prisma.conversation.create({
        data: {
            role: 'assistant',
            content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
            projectId
        }
    })
     await prisma.conversation.create({
        data: {
            role: 'assistant',
            content: 'Now making changes to your website...',
            projectId
        }
    })

    console.log(` Revision starting for project: ${projectId} (Model: ${model})`);
    // Generate website code
    const code = await aiService.generateContent({
        model,
        signal: controller.signal,
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: `You are an expert web developer.

CRITICAL REQUIREMENTS:
- Return ONLY the complete updated HTML code with the requested changes.
- DO NOT EXPLAIN ANYTHING. NO CONVERSATION. NO CODE FENCES.
- DO NOT return partial code or just the changed section.
- You MUST return the full standalone HTML document including the <head>, <style>, and <script> tags.
- Use VANILLA HTML, CSS, and JS ONLY (NO Tailwind, NO React).
- Use a single <style> tag for all responsive styling.
- Use a single <script> tag for interactivity.

VERTICAL SINGLE-PAGE ARCHITECTURE (MANDATORY):
- This is a continuous vertical page. NEVER return separate pages.
- If the user asks for new content/pages, APPEND it as a new <section> at the bottom of the <body> but before the footer.
- Add/Update navigation links in the header to point to the new section (e.g., <a href="#contact">).
- Use Fragment IDs (e.g., id="contact") for every section.
- Smooth-scrolling MUST be implemented in CSS or JS.

DESIGN PHILOSOPHY:
- Keep the code lightweight, minimalist, and simple (optimized for free AI models).
- Ensure the new section matches the aesthetic of the existing code.

Current website code:
${currentProject.current_code}

Requested change: "${enhancedPrompt}"`
                    }
                ]
            }
        ]
    });

    if (code) {
      console.log(`Revision code received for project: ${projectId} (${code.length} chars)`);
    }

    if(!code){
        await prisma.conversation.create({
            data: {
                role:'assistant',
                content: "Unable to generate code , please try again",
                projectId
            }
        })
        return res.status(500).json({
    message: "Unable to generate code, please try again"
});
    }

    const cleanCode = code.replace(/```[a-z]*\n?/gi,'').replace(/```$/g,'').trim();
    const isValidWebsite = validateWebsiteCode(cleanCode);
    
    if (!isValidWebsite) {
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "Changes rejected - generated code doesn't maintain website structure. Please try a different request.",
                projectId
            }
        })
        return res.status(400).json({
            message: "Generated code is invalid. Website structure was not maintained. Please try again with a different request."
        });
    }

    const version = await prisma.version.create({
        data:{
             code: cleanCode,
            description: 'changes made',
            projectId
        }
    })

    await prisma.conversation.create({
        data:{
            role: 'assistant',
            content: "Changes saved! Your website has been updated. You can now preview it",
            projectId
        }
    })

    await prisma.websiteProject.update({
        where: {id: projectId},
        data:{
           current_code: cleanCode,
           current_version_index: version.id
        }
    })
    

    taskManager.removeTask(projectId);
    return res.status(200).json({ message: "Revision made successfully" });
  } catch (error: any) {
    taskManager.removeTask(projectId);
    console.log(error.code || error.message);
    return res.status(500).json({ message: error.message === 'Aborted' ? 'Generation was cancelled.' : error.message });
  }
}

// Controller Function to rollback to a specific version

export const rollbackToVersion = async (req: Request, res: Response) => {
     try {
        const userId = req.userId as string;
        if(!userId){
            return res.status(401).json({message:"Unauthorized"});
        }
        const {projectId, versionId} = req.params as { projectId: string; versionId: string };

        const project = await prisma.websiteProject.findUnique({
            where: {id: projectId, userId},
            include: {versions: true}
        })

       if(!project){
        return res.status(404).json({message:"Project not found"});
       }
       const version = project.versions.find((version: any)=> version.id === versionId);

       if(!version){
        return res.status(404).json({message:"Version not found"});
       }

       await prisma.websiteProject.update({
        where: {id: projectId, userId},
        data:{
            current_code: version.code,
            current_version_index: version.id
        }
       })

       await prisma.conversation.create({
        data:{
            role: 'assistant',
            content: "I've rolled back to selected version. You can now preview it",
            projectId: projectId
        }
       })
       return res.status(200).json({ message: 'version rolled back ' });

     } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });

     }
    
    }

    //Controller Function to Delete a Project
    export const deleteProject = async (req: Request, res: Response) => {
     try {
        const userId = req.userId as string;
         const {projectId} = req.params as { projectId: string };
       
       

         await prisma.websiteProject.delete({
            where: {id: projectId, userId},
        
        })

       res.json({ message: 'Project deleted successfully ' });

     } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });

     }
    
    }

    // Controller for getting project code for preview
 export const getProjectPreview = async (req: Request, res: Response) => {
     try {
        const userId = req.userId as string;
         const {projectId} = req.params as { projectId: string };
       if(!userId){
        return res.status(401).json({message:"Unauthorized"});
       }
       

       const project = await prisma.websiteProject.findFirst({
        where: {id: projectId, userId},
        include: {versions: true}
       })

       if(!project){
        return res.status(404).json({message:"Project not found"});
       }

       return res.status(200).json({project });

     } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });

     }
    
    }

    // Get published projects
    export const getPublishedProjects = async (req: Request, res: Response) => {
     try {
       
       

       const projects = await prisma.websiteProject.findMany({
        where: {isPublished: true},
        include: {user: true}
       })


       return res.status(200).json({projects });

     } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });

     }
    
    }

    // Get a single project by id
     export const getProjectById = async (req: Request, res: Response) => {
     try {
       
        const {projectId} = req.params as { projectId: string };
       

       const project = await prisma.websiteProject.findFirst({
        where: {id: projectId},
    
       })

       if(!project || project.isPublished === false || !project?.current_code){
        return res.status(404).json({message:"Project not found"});
       }

       return res.status(200).json({code: project.current_code }); 

     } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });

     }
    
    }

    // Controller to save project code
   export const saveProjectCode = async (req: Request, res: Response) => {
     try {
       const userId = req.userId as string;
        const {projectId} = req.params as { projectId: string };
        const {code} = req.body;
       
        if(!userId){
            return res.status(401).json({message:"Unauthorized"});
        }
        if(!code){
            return res.status(400).json({message:"Code is required"});
        }

        const project = await prisma.websiteProject.findUnique({
            where: {id: projectId, userId},
           
           })

           if(!project){
            return res.status(404).json({message:"Project not found"});
           }
           await prisma.websiteProject.update({
            where: {id: projectId},
            data: {
                current_code: code,
                current_version_index: ''
            }
           })

       
        return res.status(200).json({message: 'Project saved successfully' }); 

     } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });

     }
    
    }