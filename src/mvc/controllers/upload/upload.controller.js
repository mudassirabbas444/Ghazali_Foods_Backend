import { uploadImage, uploadMultipleImages, deleteImage } from '../../../services/uploadService.js';

/**
 * Upload single image
 */
export const uploadSingleImage = async (req, res) => {
  try {
    console.log('[uploadSingleImage] Request received');
    console.log('[uploadSingleImage] File:', req.file ? 'Present' : 'Missing');
    console.log('[uploadSingleImage] Body:', req.body);
    console.log('[uploadSingleImage] User:', req.user ? `ID: ${req.user.id}` : 'Not authenticated');

    if (!req.file) {
      console.error('[uploadSingleImage] No file provided in request');
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { folder = 'images', userId } = req.body;
    console.log('[uploadSingleImage] Starting upload with folder:', folder, 'userId:', userId || req.user?.id);
    
    const result = await uploadImage(
      req.file.buffer, 
      folder, 
      userId || req.user?.id, 
      req.file.originalname
    );

    console.log('[uploadSingleImage] Upload successful');
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('[uploadSingleImage] Upload error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImage = async (req, res) => {
  try {
    console.log('[uploadMultipleImage] Request received');
    console.log('[uploadMultipleImage] Files:', req.files ? `${req.files.length} files` : 'Missing');
    console.log('[uploadMultipleImage] Body:', req.body);
    console.log('[uploadMultipleImage] User:', req.user ? `ID: ${req.user.id}` : 'Not authenticated');

    if (!req.files || req.files.length === 0) {
      console.error('[uploadMultipleImage] No files provided in request');
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const { folder = 'images', userId } = req.body;
    console.log('[uploadMultipleImage] Starting upload with folder:', folder, 'userId:', userId || req.user?.id);
    
    const result = await uploadMultipleImages(
      req.files, 
      folder, 
      userId || req.user?.id
    );

    console.log('[uploadMultipleImage] Upload successful');
    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('[uploadMultipleImage] Upload error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload images'
    });
  }
};

/**
 * Delete image
 */
export const deleteImageController = async (req, res) => {
  try {
    const { fileName } = req.params;
    
    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'File name is required'
      });
    }

    const result = await deleteImage(fileName);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete image'
    });
  }
};

export default {
  uploadSingleImage,
  uploadMultipleImage,
  deleteImageController
};
