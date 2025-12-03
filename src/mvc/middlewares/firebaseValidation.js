/**
 * Middleware for validating Firebase Storage URLs in requests
 */

import { validateProductImages, validateAvatarUrl } from '../../utils/firebaseValidation.js';

/**
 * Middleware to validate product images in request body
 */
export const validateProductImagesMiddleware = (req, res, next) => {
  try {
    if (req.body.images) {
      const validation = validateProductImages(req.body.images);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image URLs',
          errors: validation.errors
        });
      }
      
      // Replace with validated URLs
      req.body.images = validation.validUrls;
    }
    
    next();
  } catch (error) {
    console.error('Error validating product images:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating images'
    });
  }
};

/**
 * Middleware to validate avatar URL in request body
 */
export const validateAvatarMiddleware = (req, res, next) => {
  try {
    if (req.body.avatar) {
      const validation = validateAvatarUrl(req.body.avatar);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid avatar URL',
          errors: validation.errors
        });
      }
      
      // Replace with validated URL
      req.body.avatar = validation.validUrl;
    }
    
    next();
  } catch (error) {
    console.error('Error validating avatar URL:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating avatar'
    });
  }
};

/**
 * Middleware to sanitize request body
 */
export const sanitizeRequestBody = (req, res, next) => {
  try {
    // Sanitize string fields
    const stringFields = ['title', 'description', 'name', 'city', 'area', 'address', 'tags'];
    
    stringFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = req.body[field].trim();
      }
    });
    
    // Sanitize email
    if (req.body.email && typeof req.body.email === 'string') {
      req.body.email = req.body.email.toLowerCase().trim();
    }
    
    // Sanitize phone
    if (req.body.phone && typeof req.body.phone === 'string') {
      req.body.phone = req.body.phone.trim();
    }
    
    // Sanitize price
    if (req.body.price) {
      req.body.price = parseFloat(req.body.price);
    }
    
    next();
  } catch (error) {
    console.error('Error sanitizing request body:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing request'
    });
  }
};

export default {
  validateProductImagesMiddleware,
  validateAvatarMiddleware,
  sanitizeRequestBody
};
