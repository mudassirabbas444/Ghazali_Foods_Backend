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
   
    const categoryData = req?.body;
    
    // Validate required fields
    if (!categoryData.name) {
      return {
        success: false,
        message: "Category name is required",
        statusCode: 400
      };
    }
    
       if (categoryData.parentCategory !== undefined && categoryData.parentCategory !== null) {
      if (categoryData.parentCategory === '' || categoryData.parentCategory === 'null') {
        categoryData.parentCategory = null;
      } else if (!mongoose.Types.ObjectId.isValid(categoryData.parentCategory)) {
        return {
          success: false,
          message: "Invalid parentCategory ID",
          statusCode: 400
        };
      }
    }
    
    // Handle image upload if provided
    if (req?.file) {
      try {
        const { uploadImage } = await import("../../../services/uploadService.js");
        const uploadResult = await uploadImage(
          req.file.buffer,
          'categories',
          req.user?.id,
          req.file.originalname
        );
        categoryData.image = uploadResult.url;
      } catch (uploadError) {
        return {
          success: false,
          message: `Image upload failed: ${uploadError.message}`,
          statusCode: 500
        };
      }
    }
    const category = await createCategory(categoryData);

    return {
      success: true,
      message: "Category created successfully",
      statusCode: 201,
      data: category
    };
  } catch (error) {
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

