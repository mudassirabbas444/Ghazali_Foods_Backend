import express from "express";
import productController from "../../controllers/product/product.controller.js";
import { productRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";
import isAdmin from "../../middlewares/isAdmin.js";
import { upload } from "../../../services/uploadService.js";

const router = express.Router();

// Public routes - Specific routes must come before parameterized routes
router.get(productRoutes.GET_PRODUCTS, productController.getProductsController);
router.get(productRoutes.GET_FEATURED, productController.getFeaturedProductsController);
router.get(productRoutes.GET_BEST_SELLERS, productController.getBestSellersController);
router.get(productRoutes.GET_NEW_ARRIVALS, productController.getNewArrivalsController);
router.get(productRoutes.GET_PRODUCT_BY_SLUG, productController.getProductController);
router.get(productRoutes.GET_PRODUCT, productController.getProductController);

// Admin routes - Specific routes must come before parameterized routes
router.get(productRoutes.GET_LOW_STOCK, auth, isAdmin, productController.getLowStockController);
router.post(productRoutes.CREATE_PRODUCT, auth, isAdmin, upload.array('images', 10), productController.createProductController);
router.put(productRoutes.UPDATE_STOCK, auth, isAdmin, productController.updateStockController);
router.put(productRoutes.UPDATE_PRODUCT, auth, isAdmin, upload.array('images', 10), productController.updateProductController);
router.delete(productRoutes.DELETE_PRODUCT, auth, isAdmin, productController.deleteProductController);

export { router as productRouter };

