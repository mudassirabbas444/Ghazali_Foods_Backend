import mongoose from "mongoose";
import {
  createCategory,
  getCategoryById,
  getCategoryBySlug,
  getAllCategories,
  updateCategory,
  deleteCategory
} from "../../database/db.category.js";

const getCategories = async (req) => {
  try {
    const options = {
    };
    
    const categories = await getAllCategories(options);
    
    return {
      success: true,
      message: "Categories fetched successfully",
      statusCode: 200,
      data: categories,
      categories: categories // Keep for backward compatibility
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getCategory = async (req) => {
  try {
    const { id, slug } = req?.params;
    
    let category;
    if (slug) {
      category = await getCategoryBySlug(slug);
    } else {
      category = await getCategoryById(id);
    }
    
    if (!category) {
      return {
        success: false,
        message: "Category not found",
        statusCode: 404
      };
    }
    
    return {
      success: true,
      message: "Category fetched successfully",
      statusCode: 200,
      data: category
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const createCategoryService = async (req) => {
  try {
    console.log('[createCategoryService] Starting category creation');
    console.log('[createCategoryService] Request body:', JSON.stringify(req?.body, null, 2));
    console.log('[createCategoryService] Has file:', !!req?.file);
    console.log('[createCategoryService] User ID:', req?.user?.id);
    
    const categoryData = req?.body;
    
    // Validate required fields
    if (!categoryData.name) {
      console.log('[createCategoryService] Validation failed: name is required');
      return {
        success: false,
        message: "Category name is required",
        statusCode: 400
      };
    }
    
    // Handle parentCategory - convert empty strings to null, validate if provided
    console.log('[createCategoryService] Original parentCategory:', categoryData.parentCategory);
    if (categoryData.parentCategory !== undefined && categoryData.parentCategory !== null) {
      if (categoryData.parentCategory === '' || categoryData.parentCategory === 'null') {
        console.log('[createCategoryService] Converting empty parentCategory to null');
        categoryData.parentCategory = null;
      } else if (!mongoose.Types.ObjectId.isValid(categoryData.parentCategory)) {
        console.log('[createCategoryService] Invalid parentCategory ID:', categoryData.parentCategory);
        return {
          success: false,
          message: "Invalid parentCategory ID",
          statusCode: 400
        };
      }
    }
    console.log('[createCategoryService] Processed parentCategory:', categoryData.parentCategory);
    
    // Handle image upload if provided
    if (req?.file) {
      console.log('[createCategoryService] Processing image upload');
      try {
        const { uploadImage } = await import("../../../services/uploadService.js");
        const uploadResult = await uploadImage(
          req.file.buffer,
          'categories',
          req.user?.id,
          req.file.originalname
        );
        categoryData.image = uploadResult.url;
        console.log('[createCategoryService] Image uploaded successfully:', uploadResult.url);
      } catch (uploadError) {
        console.error('[createCategoryService] Image upload error:', uploadError);
        return {
          success: false,
          message: `Image upload failed: ${uploadError.message}`,
          statusCode: 500
        };
      }
    }
    
    console.log('[createCategoryService] Final category data before save:', JSON.stringify(categoryData, null, 2));
    console.log('[createCategoryService] Calling createCategory database function');
    
    const category = await createCategory(categoryData);
    
    console.log('[createCategoryService] Category created successfully:', category?._id);
    
    return {
      success: true,
      message: "Category created successfully",
      statusCode: 201,
      data: category
    };
  } catch (error) {
    console.error('[createCategoryService] Error creating category:', error);
    console.error('[createCategoryService] Error stack:', error.stack);
    console.error('[createCategoryService] Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    return {
      success: false,
      statusCode: 500,
      message: error.message || "Internal server error. Please try again later."
    };
  }
};

const updateCategoryService = async (req) => {
  try {
    const { id } = req?.params;
    const updateData = req?.body;
    
    // Handle parentCategory - convert empty strings to null, validate if provided
    if (updateData.parentCategory !== undefined && updateData.parentCategory !== null) {
      if (updateData.parentCategory === '' || updateData.parentCategory === 'null') {
        updateData.parentCategory = null;
      } else if (!mongoose.Types.ObjectId.isValid(updateData.parentCategory)) {
        return {
          success: false,
          message: "Invalid parentCategory ID",
          statusCode: 400
        };
      }
    }
    
    // Handle image upload if provided
    if (req?.file) {
      const { uploadImage } = await import("../../../services/uploadService.js");
      const uploadResult = await uploadImage(
        req.file.buffer,
        'categories',
        req.user?.id,
        req.file.originalname
      );
      updateData.image = uploadResult.url;
    }
    
    const category = await updateCategory(id, updateData);
    
    return {
      success: true,
      message: "Category updated successfully",
      statusCode: 200,
      data: category
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const deleteCategoryService = async (req) => {
  try {
    const { id } = req?.params;
    
    await deleteCategory(id);
    
    return {
      success: true,
      message: "Category deleted successfully",
      statusCode: 200
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

export default {
  getCategories,
  getCategory,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService
};

