import { validateFirebaseUrls, extractFilenameFromFirebaseUrl } from '../utils/firebaseValidation.js';
import { bucket } from '../global/firebaseAdmin.js';

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
    const urlValidation = validateFirebaseUrls(imageUrls);
    
    if (!urlValidation.isValid) {
      console.warn('Some product images have invalid Firebase URLs:', urlValidation.errors);
    }

    const imageFilenames = urlValidation.validUrls.map(url => extractFilenameFromFirebaseUrl(url));

    // Attempt deletions if bucket available
    if (bucket && imageFilenames.length > 0) {
      const deleteResults = await Promise.allSettled(
        imageFilenames.map(name => bucket.file(name).delete({ ignoreNotFound: true }))
      );
      const failures = deleteResults.filter(r => r.status === 'rejected');
      console.log(`Product ${product._id} deleted. Images cleanup attempted: ${imageFilenames.length}, failures: ${failures.length}`);
      return {
        success: failures.length === 0,
        message: `Cleaned up ${imageFilenames.length - failures.length} images`,
        cleanedImages: imageFilenames,
        errors: failures.map(f => f.reason?.message).filter(Boolean)
      };
    }

    console.log(`Product ${product._id} deleted. Images to cleanup (dry-run):`, imageFilenames);
    return { success: true, message: `Identified ${imageFilenames.length} images`, cleanedImages: imageFilenames };
  } catch (error) {
    console.error('Error during image cleanup:', error);
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

    const { validateFirebaseUrls } = await import('../utils/firebaseValidation.js');
    const urlValidation = validateFirebaseUrls([user.avatar]);
    
    if (!urlValidation.isValid) {
      console.warn('User avatar has invalid Firebase URL:', user.avatar);
      return {
        success: true,
        message: 'Invalid avatar URL, no cleanup needed',
        cleanedAvatar: null
      };
    }

    const avatarFilename = extractFilenameFromFirebaseUrl(user.avatar);

    if (bucket) {
      try {
        await bucket.file(avatarFilename).delete({ ignoreNotFound: true });
        console.log(`User ${user._id} deleted. Avatar cleaned:`, avatarFilename);
        return { success: true, message: 'Avatar cleaned up successfully', cleanedAvatar: avatarFilename };
      } catch (e) {
        console.error('Error deleting avatar from Firebase:', e);
        return { success: false, message: 'Failed to cleanup avatar', error: e.message };
      }
    }

    console.log(`User ${user._id} deleted. Avatar to cleanup (dry-run):`, avatarFilename);
    return { success: true, message: 'Avatar identified for cleanup', cleanedAvatar: avatarFilename };
  } catch (error) {
    console.error('Error during avatar cleanup:', error);
    return {
      success: false,
      message: 'Failed to cleanup avatar',
      error: error.message
    };
  }
};
export const validateAndSanitizeImageData = (imageData) => {
  try {
    if (!imageData) {
      return {
        isValid: false,
        errors: ['Image data is required']
      };
    }

    const errors = [];
    const sanitizedData = {};

    if (imageData.url) {
      const { validateFirebaseUrls } = require('../utils/firebaseValidation.js');
      const urlValidation = validateFirebaseUrls([imageData.url]);
      
      if (!urlValidation.isValid) {
        errors.push('Invalid Firebase Storage URL');
      } else {
        sanitizedData.url = urlValidation.validUrls[0];
      }
    }

    if (imageData.public_id) {
      sanitizedData.public_id = imageData.public_id.trim();
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Error validating image data'],
      error: error.message
    };
  }
};

export default {
  cleanupProductImages,
  cleanupUserAvatar,
  validateAndSanitizeImageData
};
