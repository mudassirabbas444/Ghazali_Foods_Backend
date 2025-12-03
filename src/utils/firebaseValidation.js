export const isValidFirebaseStorageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  const firebaseStoragePatterns = [
    /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^\/]+\/o\/[^?]+/,
    /^https:\/\/storage\.googleapis\.com\/[^\/]+\/[^\/]+\/[^?]+/,
    /^https:\/\/[^\/]+\.googleapis\.com\/[^\/]+\/[^\/]+\/[^?]+/
  ];

  return firebaseStoragePatterns.some(pattern => pattern.test(url));
};

export const validateFirebaseUrls = (urls) => {
  if (!Array.isArray(urls)) {
    return {
      isValid: false,
      validUrls: [],
      invalidUrls: [],
      errors: ['URLs must be provided as an array']
    };
  }

  const validUrls = [];
  const invalidUrls = [];
  const errors = [];

  urls.forEach((url, index) => {
    if (!url || typeof url !== 'string') {
      invalidUrls.push(url);
      errors.push(`URL at index ${index} is invalid`);
      return;
    }

    if (isValidFirebaseStorageUrl(url)) {
      validUrls.push(url);
    } else {
      invalidUrls.push(url);
      errors.push(`URL at index ${index} is not a valid Firebase Storage URL`);
    }
  });

  return {
    isValid: invalidUrls.length === 0,
    validUrls,
    invalidUrls,
    errors
  };
};

export const extractFilenameFromFirebaseUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const urlParts = url?.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    const filename = lastPart?.split('?')[0];
    return decodeURIComponent(filename);
  } catch (error) {
    console.error('Error extracting filename from Firebase URL:', error);
    return '';
  }
};
export const validateProductImages = (imageUrls) => {
  if (!imageUrls || !Array.isArray(imageUrls)) {
    return {
      isValid: false,
      errors: ['Images must be provided as an array']
    };
  }

  if (imageUrls.length === 0) {
    return {
      isValid: false,
      errors: ['At least one image is required']
    };
  }

  if (imageUrls.length > 10) {
    return {
      isValid: false,
      errors: ['Maximum 10 images allowed']
    };
  }

  const urlValidation = validateFirebaseUrls(imageUrls);
  
  if (!urlValidation.isValid) {
    return {
      isValid: false,
      errors: urlValidation.errors
    };
  }

  return {
    isValid: true,
    validUrls: urlValidation.validUrls
  };
};

export const validateAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) {
    return {
      isValid: true,
      validUrl: null
    };
  }

  if (typeof avatarUrl !== 'string') {
    return {
      isValid: false,
      errors: ['Avatar URL must be a string']
    };
  }

  if (!isValidFirebaseStorageUrl(avatarUrl)) {
    return {
      isValid: false,
      errors: ['Avatar URL must be a valid Firebase Storage URL']
    };
  }

  return {
    isValid: true,
    validUrl: avatarUrl
  };
};

export const sanitizeFirebaseUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const urlObj = new URL(url);
    
    const sensitiveParams = ['token', 'key', 'signature'];
    sensitiveParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch (error) {
    console.error('Error sanitizing Firebase URL:', error);
    return url; 
  }
};

export default {
  isValidFirebaseStorageUrl,
  validateFirebaseUrls,
  extractFilenameFromFirebaseUrl,
  validateProductImages,
  validateAvatarUrl,
  sanitizeFirebaseUrl
};
