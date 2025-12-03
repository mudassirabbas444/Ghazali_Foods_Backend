import express from "express";
import bannerController from "../../controllers/banner/banner.controller.js";
import { bannerRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";
import isAdmin from "../../middlewares/isAdmin.js";
import { upload } from "../../../services/uploadService.js";

const router = express.Router();

// Public routes
router.get(bannerRoutes.GET_BANNERS, bannerController.getBannersController);
router.get(bannerRoutes.GET_BANNER, bannerController.getBannerController);

// Admin routes
router.post(bannerRoutes.CREATE_BANNER, auth, isAdmin, upload.single('image'), bannerController.createBannerController);
router.put(bannerRoutes.UPDATE_BANNER, auth, isAdmin, upload.single('image'), bannerController.updateBannerController);
router.delete(bannerRoutes.DELETE_BANNER, auth, isAdmin, bannerController.deleteBannerController);

export { router as bannerRouter };

