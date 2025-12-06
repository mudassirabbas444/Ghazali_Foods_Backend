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
    const result = await createCategoryService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
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

