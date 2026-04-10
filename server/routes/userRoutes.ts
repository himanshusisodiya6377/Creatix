import express from "express";
import { cancelProjectGeneration, checkProjectStatus, createUserProject, getThumbnailbyId, getUserProject, getUserProjects, getUsersThumbnails, togglePublish } from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

const userRouter = express.Router()
userRouter.post('/project',protect,createUserProject)
userRouter.post('/project/cancel/:projectId',protect,cancelProjectGeneration)
userRouter.get('/project/:projectId',protect,getUserProject)
userRouter.get('/project/status/:projectId',protect,checkProjectStatus)
userRouter.get('/projects',protect,getUserProjects)
userRouter.get('/publish-toggle/:projectId',protect,togglePublish)
userRouter.get('/thumbnails',protect, getUsersThumbnails)
userRouter.get('/thumbnail/:id',protect,getThumbnailbyId)

export default userRouter
