import { bucket } from '../global/firebaseAdmin.js';

export const deleteFirebaseImage = async (fileName) => {
  try {
    if (!fileName) {
      throw new Error('File name is required');
    }
    if (!bucket) {
      throw new Error('Firebase Storage bucket is not initialized');
    }
    await bucket.file(fileName).delete({ ignoreNotFound: true });
    console.log(`Firebase image deleted: ${fileName}`);
    return { success: true, message: 'Image deleted successfully', fileName };
  } catch (error) {
    console.error('Error deleting Firebase image:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};
export const deleteMultipleFirebaseImages = async (fileNames) => {
  try {
    if (!Array.isArray(fileNames) || fileNames.length === 0) {
      throw new Error('File names array is required');
    }

    const results = [];
    const errors = [];

    for (const fileName of fileNames) {
      try {
        const result = await deleteFirebaseImage(fileName);
        results.push(result);
      } catch (error) {
        errors.push({
          fileName,
          error: error.message
        });
      }
    }

    return {
      success: errors.length === 0,
      deletedCount: results.length,
      errorCount: errors.length,
      results,
      errors
    };
  } catch (error) {
    console.error('Error deleting multiple Firebase images:', error);
    throw new Error(`Failed to delete images: ${error.message}`);
  }
};

export const isValidFirebaseUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const firebasePatterns = [
    /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/[^?]+/,
    /^https:\/\/storage\.googleapis\.com\/[^\/]+\/[^\/]+\/[^?]+/
  ];

  return firebasePatterns.some(pattern => pattern.test(url));
};
export const extractFirebaseFilePath = (url) => {
  try {
    if (!isValidFirebaseUrl(url)) {
      throw new Error('Invalid Firebase Storage URL');
    }

    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Firebase Storage URLs have the format: /v0/b/{bucket}/o/{filePath}
    if (pathParts.length >= 5 && pathParts[1] === 'v0' && pathParts[2] === 'b') {
      return decodeURIComponent(pathParts[4]);
    }
    
    throw new Error('Unable to extract file path from URL');
  } catch (error) {
    console.error('Error extracting Firebase file path:', error);
    throw new Error(`Invalid Firebase URL: ${error.message}`);
  }
};
export const cleanupProductImages = async (product) => {
  try {
    if (!product || !product.images || !Array.isArray(product.images)) {
      return {
        success: true,
        message: 'No images to cleanup',
        cleanedImages: []
      };
    }

    const imageUrls = product.images.map(img => img.url).filter(Boolean);
    
    if (imageUrls.length === 0) {
      return {
        success: true,
        message: 'No valid image URLs found',
        cleanedImages: []
      };
    }

    // Extract file paths from URLs
    const filePaths = [];
    const errors = [];

    imageUrls.forEach((url, index) => {
      try {
        if (isValidFirebaseUrl(url)) {
          const filePath = extractFirebaseFilePath(url);
          filePaths.push(filePath);
        } else {
          errors.push(`Invalid Firebase URL at index ${index}: ${url}`);
        }
      } catch (error) {
        errors.push(`Error processing URL at index ${index}: ${error.message}`);
      }
    });

    if (filePaths.length > 0) {
      if (bucket) {
        const results = await Promise.allSettled(
          filePaths.map(fp => bucket.file(fp).delete({ ignoreNotFound: true }))
        );
        const failed = results.filter(r => r.status === 'rejected');
        return {
          success: failed.length === 0,
          message: `Cleaned up ${filePaths.length - failed.length} images`,
          cleanedImages: filePaths,
          errors: [...errors, ...failed.map(f => f.reason?.message).filter(Boolean)]
        };
      }
      return {
        success: true,
        message: `Identified ${filePaths.length} images (dry-run)`,
        cleanedImages: filePaths,
        errors
      };
    }

    return {
      success: true,
      message: 'No valid images to cleanup',
      cleanedImages: [],
      errors
    };
  } catch (error) {
    console.error('Error during product image cleanup:', error);
    return {
      success: false,
      message: 'Failed to cleanup images',
      error: error.message
    };
  }
};
export const cleanupUserAvatar = async (user) => {
  try {
    if (!user || !user.avatar) {
      return {
        success: true,
        message: 'No avatar to cleanup',
        cleanedAvatar: null
      };
    }

    if (!isValidFirebaseUrl(user.avatar)) {
      return {
        success: true,
        message: 'Invalid avatar URL, no cleanup needed',
        cleanedAvatar: null
      };
    }

    const filePath = extractFirebaseFilePath(user.avatar);
    const deleteResult = await deleteFirebaseImage(filePath);
    
    return {
      success: deleteResult.success,
      message: 'Avatar cleaned up successfully',
      cleanedAvatar: filePath
    };
  } catch (error) {
    console.error('Error during avatar cleanup:', error);
    return {
      success: false,
      message: 'Failed to cleanup avatar',
      error: error.message
    };
  }
};

export default {
  deleteFirebaseImage,
  deleteMultipleFirebaseImages,
  isValidFirebaseUrl,
  extractFirebaseFilePath,
  cleanupProductImages,
  cleanupUserAvatar
};
