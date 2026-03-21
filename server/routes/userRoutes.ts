import express from "express";
import { createUserProject, getThumbnailbyId, getUserCredits, getUserProject, getUserProjects, getUsersThumbnails, purchaseCredits, togglePublish } from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

const userRouter = express.Router()
userRouter.get('/credits',protect,getUserCredits)
userRouter.post('/project',protect,createUserProject)
userRouter.get('/project/:projectId',protect,getUserProject)
userRouter.get('/projects',protect,getUserProjects)
userRouter.get('/publish-toggle/:projectId',protect,togglePublish)
userRouter.get('/purchase-credits',protect,purchaseCredits)
userRouter.get('/thumbnails',protect, getUsersThumbnails)
userRouter.get('/thumbnail/:id',protect,getThumbnailbyId)

export default userRouter



