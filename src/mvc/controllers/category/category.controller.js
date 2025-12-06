import {
  getCategories,
  getCategory,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService
} from "../../services/category/index.js";

const getCategoriesController = async (req, res) => {
  try {
    const result = await getCategories(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getCategoryController = async (req, res) => {
  try {
    const result = await getCategory(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createCategoryController = async (req, res) => {
  try {
    console.log('[createCategoryController] Request received');
    console.log('[createCategoryController] Method:', req.method);
    console.log('[createCategoryController] URL:', req.url);
    console.log('[createCategoryController] Headers:', JSON.stringify(req.headers, null, 2));
    console.log('[createCategoryController] Body:', JSON.stringify(req.body, null, 2));
    console.log('[createCategoryController] Has file:', !!req.file);
    console.log('[createCategoryController] User:', req.user ? { id: req.user.id, email: req.user.email } : 'No user');
    
    const result = await createCategoryService(req);
    
    console.log('[createCategoryController] Service response:', JSON.stringify(result, null, 2));
    
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('[createCategoryController] Controller error:', error);
    console.error('[createCategoryController] Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error. Please try again later."
    });
  }
};

const updateCategoryController = async (req, res) => {
  try {
    const result = await updateCategoryService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteCategoryController = async (req, res) => {
  try {
    const result = await deleteCategoryService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getCategoriesController,
  getCategoryController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController
};

