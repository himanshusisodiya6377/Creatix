import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import os from "os";
import path from "path";
import { fileURLToPath } from 'url';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import ThumbnailRouter from "./routes/thumbnailRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const corsOptions = {
  origin: process.env.TRUSTED_ORIGINS?.split(',').map(o => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}


// Request Logging - Move to top for best visibility
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] INCOMING REQUEST :  ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors(corsOptions))
app.use(express.json({limit:'50mb'}));

// Serve static files from client/dist
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.use("/api/auth", toNodeHandler(auth));
app.use("/api/thumbnail",ThumbnailRouter);

const port = process.env.PORT || 3000;

app.use('/api/user',userRouter)
app.use('/api/project',projectRouter)

// SPA fallback - serve index.html for all non-API and non-static routes
app.use((req: Request, res: Response) => {
  // If the request doesn't match any API routes or static files,
  // serve index.html so React Router can handle the route
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Error Handler - Added at the end
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(`[ERROR] [${new Date().toISOString()}]`, err);
  res.status(err.status || 500).json({ 
    message: err.message || "Internal Server Error"
  });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
