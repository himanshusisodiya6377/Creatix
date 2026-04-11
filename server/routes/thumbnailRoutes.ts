import express from 'express';
import { deleteThumbnail, generateThumbnail, downloadThumbnail } from '../controllers/ThumbnailController.js';
import { protect } from '../middlewares/auth.js';

const ThumbnailRouter = express.Router();

ThumbnailRouter.post('/generate',protect,generateThumbnail)
ThumbnailRouter.delete('/delete/:id',protect,deleteThumbnail)
ThumbnailRouter.get('/download/:id', protect, downloadThumbnail)

export default ThumbnailRouter