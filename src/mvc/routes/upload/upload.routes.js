import express from 'express';
import { uploadSingleImage, uploadMultipleImage, deleteImageController } from '../../controllers/upload/upload.controller.js';
import { upload } from '../../../services/uploadService.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

// Upload single image
router.post('/single', auth, upload.single('image'), uploadSingleImage);

// Upload multiple images
router.post('/multiple', auth, upload.array('images', 10), uploadMultipleImage);

// Delete image
router.delete('/:fileName', auth, deleteImageController);

export default router;
