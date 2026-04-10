import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import os from "os";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import ThumbnailRouter from "./routes/thumbnailRoutes.js";

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

app.use("/api/auth", toNodeHandler(auth));
app.use("/api/thumbnail",ThumbnailRouter);

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.use('/api/user',userRouter)
app.use('/api/project',projectRouter)

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
