import {Request,Response} from 'express';
import prisma from "../lib/prisma.js";
import ai from "../configs/ai.js";

// ==============================
// WEBSITE VALIDATION FUNCTION
// ==============================
const validateWebsiteCode = (code: string): boolean => {
  // Check for required HTML structure
  if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
    console.warn('❌ Validation: Missing HTML structure');
    return false;
  }
  
  // Check for body tag
  if (!code.includes('<body')) {
    console.warn('❌ Validation: Missing body tag');
    return false;
  }
  
  // Check for multi-page router pattern (pages object + addEventListener)
  if (!code.includes('pages') || !code.includes('hashchange')) {
    console.warn('❌ Validation: Missing multi-page router pattern');
    return false;
  }
  
  // Check for at least one page link (hash navigation)
  if (!/href\s*=\s*["']#\//g.test(code)) {
    console.warn('❌ Validation: Missing page navigation links');
    return false;
  }

  // Check for Tailwind CSS
  if (!code.includes('tailwindcss') && !code.includes('tailwind')) {
    console.warn('❌ Validation: Missing Tailwind CSS');
    return false;
  }

  // Check minimum code length (valid website should be >1KB)
  if (code.length < 1000) {
    console.warn('❌ Validation: Code too short - likely incomplete');
    return false;
  }

  console.log('✅ Validation passed - Website structure is valid');
  return true;
};


// Controller Function to make Revision
export const makeRevision = async (req: Request, res: Response) => {
     const userId = req.userId as string;
  try {
    
    const {projectId} = req.params as { projectId: string };
    const {message} = req.body;
    
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


    //Enhance user prompt
    const promptEnhanceResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                  {
                    text: `You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

Enhance this by:
1. Being specific about what elements to change.
2. Mentioning design details (colors, spacing, sizes)
3. Clarifying the desired outcome.
4. Using clear technical terms

Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).

User's request: "${message}"`
                  }
                ]
            }
        ]
    })

    const enhancedPrompt = promptEnhanceResponse.candidates?.[0]?.content?.parts?.[0]?.text;

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

    // Generate website code
    const codegenerationresponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                  {
                    text: `You are an expert web developer.

CRITICAL REQUIREMENTS:
- Return ONLY the complete updated HTML code with the requested changes.
- Use Tailwind CSS for ALL styling (NO custom CSS).
- Use tailwind utility classes for all styling changes.
- Include the Tailwind script: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> in head.
- Include all JavaScript in <script> tags before closing </body>
- Make sure it's a complete, standalone HTML document with Tailwind CSS.
- Return the HTML Code Only, nothing else. No explanations or code fences.

MULTIPAGE INTEGRITY:
- Keep ALL 5 pages (Home, About, Services, Pricing, Contact) intact and fully functional
- EVERY page MUST have working navigation links to ALL other pages
- ALL navigation links MUST use format: <a href="#/page-name">
- Keep footer with page links on ALL pages
- Mobile menu MUST work on all pages with all page links
- Apply changes ONLY to requested elements - do NOT break or remove any page links
- Each page function MUST return COMPLETE HTML (no partial code)
- Verify: clicking every nav link must navigate correctly to that page

Current website code:
${currentProject.current_code}

Requested change: "${enhancedPrompt}"`
                  }
                ]
            }
        ]
    })

    const code = codegenerationresponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
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

    // ✅ Validate HTML structure before saving
    const cleanCode = code.replace(/```[a-z]*\n?/gi,'').replace(/```$/g,'').trim();
    const isValidWebsite = validateWebsiteCode(cleanCode);
    
    if (!isValidWebsite) {
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "❌ Changes rejected - generated code doesn't maintain website structure. Please try a different request.",
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
            content: "✅ Changes saved! Your website has been updated. You can now preview it",
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
    

    return res.status(200).json({ message: "Changes made successfully" });
  } catch (error: any) {
    console.log(error.code || error.message);
    return res.status(500).json({ message: error.message });
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