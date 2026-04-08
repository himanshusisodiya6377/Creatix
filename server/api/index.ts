import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";
import userRouter from "../routes/userRoutes.js";
import projectRouter from "../routes/projectRoutes.js";
import ThumbnailRouter from "../routes/thumbnailRoutes.js";

const app = express();

const corsOptions = {
  origin: process.env.TRUSTED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] INCOMING REQUEST :  ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors(corsOptions))
app.use(express.json({limit:'50mb'}));

// Routes
app.use("/api/auth", toNodeHandler(auth));
app.use("/api/thumbnail", ThumbnailRouter);

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Server is Live! 🚀' });
});

app.use('/api/user', userRouter)
app.use('/api/project', projectRouter)

// Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(`[ERROR] [${new Date().toISOString()}]`, err);
  res.status(err.status || 500).json({ 
    message: err.message || "Internal Server Error"
  });
});

export default app;
