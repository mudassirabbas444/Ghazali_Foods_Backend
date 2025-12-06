import express from 'express';
import { uploadSingleImage, uploadMultipleImage, deleteImageController } from '../../controllers/upload/upload.controller.js';
import { upload } from '../../../services/uploadService.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('[Multer Error]:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.'
      });
    }
    if (err.message && err.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  next();
};

// Upload single image
router.post('/single', auth, upload.single('image'), handleMulterError, uploadSingleImage);

// Upload multiple images
router.post('/multiple', auth, upload.array('images', 10), handleMulterError, uploadMultipleImage);

// Delete image
router.delete('/:fileName', auth, deleteImageController);

export default router;
