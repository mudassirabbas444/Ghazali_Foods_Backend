import admin, { bucket } from '../global/firebaseAdmin.js';
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
    console.log('[Multer FileFilter] Processing file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      encoding: file.encoding
    });
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      console.log('[Multer FileFilter] File accepted:', file.originalname);
      cb(null, true);
    } else {
      console.error('[Multer FileFilter] File rejected - Invalid type:', {
        filename: file.originalname,
        mimetype: file.mimetype,
        allowedTypes
      });
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
    console.log('[uploadImage] Starting upload process...');
    console.log('[uploadImage] Folder:', folder, 'UserId:', userId, 'OriginalName:', originalName);
    console.log('[uploadImage] File buffer size:', fileBuffer?.length || 0);
    
    if (!bucket) {
      console.error('[uploadImage] Bucket is null. Check Firebase Admin initialization.');
      console.error('[uploadImage] Firebase Admin apps:', admin?.apps?.length || 0);
      throw new Error('Firebase Storage bucket is not initialized');
    }

    console.log('[uploadImage] Bucket name:', bucket.name);
    console.log('[uploadImage] Bucket exists:', bucket ? 'Yes' : 'No');

    if (!fileBuffer || fileBuffer.length === 0) {
      console.error('[uploadImage] File buffer is empty or null');
      throw new Error('File buffer is empty');
    }

    const timestamp = Date.now();
    const randomString = uuidv4().substring(0, 8);
    const fileExtension = path.extname(originalName) || '.jpg';
    const fileName = userId 
      ? `${folder}/${userId}_${timestamp}_${randomString}${fileExtension}`
      : `${folder}/${timestamp}_${randomString}${fileExtension}`;

    console.log('[uploadImage] Generated file name:', fileName);

    const file = bucket.file(fileName);

    const contentType = getContentType(fileExtension);
    console.log('[uploadImage] Saving file to Firebase Storage...', {
      fileName,
      contentType,
      fileSize: fileBuffer.length,
      bucketName: bucket.name
    });

    try {
      await file.save(fileBuffer, {
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000',
        },
        resumable: false
      });
      console.log('[uploadImage] File saved successfully to Firebase Storage');
    } catch (saveError) {
      console.error('[uploadImage] Error saving file to Firebase:', {
        message: saveError.message,
        code: saveError.code,
        stack: saveError.stack,
        fileName
      });
      throw saveError;
    }

    console.log('[uploadImage] Making file public...');
    try {
      await file.makePublic();
      console.log('[uploadImage] File made public successfully');
    } catch (publicError) {
      console.error('[uploadImage] Error making file public:', {
        message: publicError.message,
        code: publicError.code,
        fileName
      });
      // Continue even if makePublic fails, as the file might already be public
      console.warn('[uploadImage] Continuing despite makePublic error');
    }

    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log('[uploadImage] Upload successful. URL:', downloadURL);

    return {
      success: true,
      url: downloadURL,
      fileName,
      size: fileBuffer.length,
      folder,
      publicUrl: downloadURL
    };
  } catch (error) {
    console.error('[uploadImage] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      bucket: bucket ? bucket.name : 'null'
    });
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
    console.log('[uploadMultipleImages] Starting batch upload...', {
      fileCount: files?.length || 0,
      folder,
      userId,
      filesInfo: files?.map(f => ({
        originalname: f?.originalname,
        mimetype: f?.mimetype,
        size: f?.buffer?.length || 0,
        hasBuffer: !!f?.buffer
      })) || []
    });

    if (!Array.isArray(files) || files.length === 0) {
      console.error('[uploadMultipleImages] No files provided or not an array');
      throw new Error('No files provided');
    }

    if (files.length > 10) {
      console.error('[uploadMultipleImages] Too many files:', files.length);
      throw new Error('Maximum 10 images allowed');
    }

    // Validate each file before uploading
    files.forEach((file, index) => {
      if (!file.buffer || file.buffer.length === 0) {
        console.error(`[uploadMultipleImages] File ${index} (${file.originalname}) has no buffer`);
        throw new Error(`File ${file.originalname} has no data`);
      }
      if (!file.originalname) {
        console.error(`[uploadMultipleImages] File ${index} has no originalname`);
        throw new Error(`File at index ${index} has no name`);
      }
    });

    console.log('[uploadMultipleImages] All files validated, starting uploads...');
    const uploadPromises = files.map((file, index) => {
      console.log(`[uploadMultipleImages] Uploading file ${index + 1}/${files.length}:`, file.originalname);
      return uploadImage(file.buffer, folder, userId, file.originalname);
    });
    
    const results = await Promise.all(uploadPromises);
    
    console.log('[uploadMultipleImages] All uploads completed successfully:', {
      successCount: results.length,
      urls: results.map(r => r.url)
    });
    
    return {
      success: true,
      images: results,
      count: results.length
    };
  } catch (error) {
    console.error('[uploadMultipleImages] Error during batch upload:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      folder,
      userId,
      fileCount: files?.length || 0
    });
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
