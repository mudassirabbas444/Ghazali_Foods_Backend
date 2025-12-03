import { uploadImage, uploadMultipleImages, deleteImage } from '../../../services/uploadService.js';

/**
 * Upload single image
 */
export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { folder = 'images', userId } = req.body;
    const result = await uploadImage(
      req.file.buffer, 
      folder, 
      userId || req.user?.id, 
      req.file.originalname
    );

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('Upload error:', error);
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
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const { folder = 'images', userId } = req.body;
    const result = await uploadMultipleImages(
      req.files, 
      folder, 
      userId || req.user?.id
    );

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: result
    });
  } catch (error) {
    console.error('Upload error:', error);
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
