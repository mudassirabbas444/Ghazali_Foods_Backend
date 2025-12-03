import express from "express";
import categoryController from "../../controllers/category/category.controller.js";
import { categoryRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";
import isAdmin from "../../middlewares/isAdmin.js";
import { upload } from "../../../services/uploadService.js";

const router = express.Router();

// Public routes
router.get(categoryRoutes.GET_CATEGORIES, categoryController.getCategoriesController);
router.get(categoryRoutes.GET_CATEGORY_BY_SLUG, categoryController.getCategoryController);
router.get(categoryRoutes.GET_CATEGORY, categoryController.getCategoryController);

// Admin routes
router.post(categoryRoutes.CREATE_CATEGORY, auth, isAdmin, upload.single('image'), categoryController.createCategoryController);
router.put(categoryRoutes.UPDATE_CATEGORY, auth, isAdmin, upload.single('image'), categoryController.updateCategoryController);
router.delete(categoryRoutes.DELETE_CATEGORY, auth, isAdmin, categoryController.deleteCategoryController);

export { router as categoryRouter };

