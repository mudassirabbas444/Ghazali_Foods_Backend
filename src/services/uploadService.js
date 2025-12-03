import { bucket } from '../global/firebaseAdmin.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
  }
});

/**
 * Upload single image to Firebase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Folder path (e.g., 'profiles', 'products')
 * @param {string} userId - User ID for unique naming
 * @param {string} originalName - Original filename
 * @returns {Promise<Object>} - Upload result with URL
 */
export const uploadImage = async (fileBuffer, folder = 'images', userId = null, originalName = 'image') => {
  try {
    if (!bucket) {
      console.error('[uploadImage] Bucket is null. Check Firebase Admin initialization.');
      throw new Error('Firebase Storage bucket is not initialized');
    }

    const timestamp = Date.now();
    const randomString = uuidv4().substring(0, 8);
    const fileExtension = path.extname(originalName) || '.jpg';
    const fileName = userId 
      ? `${folder}/${userId}_${timestamp}_${randomString}${fileExtension}`
      : `${folder}/${timestamp}_${randomString}${fileExtension}`;

    const file = bucket.file(fileName);

    await file.save(fileBuffer, {
      metadata: {
        contentType: getContentType(fileExtension),
        cacheControl: 'public, max-age=31536000',
      },
      resumable: false
    });

    await file.makePublic();
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return {
      success: true,
      url: downloadURL,
      fileName,
      size: fileBuffer.length,
      folder,
      publicUrl: downloadURL
    };
  } catch (error) {
    console.error('[uploadImage] Error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Upload multiple images to Firebase Storage
 * @param {Array} files - Array of file objects with buffer and originalname
 * @param {string} folder - Folder path
 * @param {string} userId - User ID for unique naming
 * @returns {Promise<Object>} - Upload results
 */
export const uploadMultipleImages = async (files, folder = 'images', userId = null) => {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided');
    }

    if (files.length > 10) {
      throw new Error('Maximum 10 images allowed');
    }

    const uploadPromises = files.map(file => 
      uploadImage(file.buffer, folder, userId, file.originalname)
    );
    
    const results = await Promise.all(uploadPromises);
    
    return {
      success: true,
      images: results,
      count: results.length
    };
  } catch (error) {
    console.error('[uploadMultipleImages] Error:', error);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

/**
 * Delete image from Firebase Storage
 * @param {string} fileName - File name/path in storage
 * @returns {Promise<Object>} - Delete result
 */
export const deleteImage = async (fileName) => {
  try {
    if (!bucket) {
      console.error('[deleteImage] Bucket is null.');
      throw new Error('Firebase Storage bucket is not initialized');
    }

    if (!fileName) {
      throw new Error('File name is required');
    }

    const file = bucket.file(fileName);
    await file.delete({ ignoreNotFound: true });
    
    return { 
      success: true, 
      message: 'Image deleted successfully',
      fileName 
    };
  } catch (error) {
    console.error('[deleteImage] Error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Get content type from file extension
 * @param {string} extension - File extension
 * @returns {string} - MIME type
 */
const getContentType = (extension) => {
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
  };
  return types[extension.toLowerCase()] || 'application/octet-stream';
};

/**
 * Extract file path from Firebase Storage URL
 * @param {string} url - Firebase Storage URL
 * @returns {string} - File path
 */
export const extractFilePath = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Firebase Storage URLs have the format: /v0/b/{bucket}/o/{filePath}
    if (pathParts.length >= 5 && pathParts[1] === 'v0' && pathParts[2] === 'b') {
      return decodeURIComponent(pathParts[4]);
    }
    
    throw new Error('Unable to extract file path from URL');
  } catch (error) {
    console.error('Error extracting file path:', error);
    throw new Error(`Invalid Firebase URL: ${error.message}`);
  }
};

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  extractFilePath,
  upload
};
