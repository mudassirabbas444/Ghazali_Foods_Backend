import express from "express";
import reviewController from "../../controllers/review/review.controller.js";
import { reviewRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";
import isAdmin from "../../middlewares/isAdmin.js";
import { upload } from "../../../services/uploadService.js";

const router = express.Router();

// Public routes
router.get(reviewRoutes.GET_REVIEWS, reviewController.getReviewsController);

// User routes
router.get(reviewRoutes.GET_USER_REVIEWS, auth, reviewController.getUserReviewsController);
router.post(reviewRoutes.CREATE_REVIEW, auth, upload.array('images', 5), reviewController.createReviewController);
router.put(reviewRoutes.UPDATE_REVIEW, auth, upload.array('images', 5), reviewController.updateReviewController);
router.delete(reviewRoutes.DELETE_REVIEW, auth, reviewController.deleteReviewController);

// Admin routes
router.put(reviewRoutes.APPROVE_REVIEW, auth, isAdmin, reviewController.approveReviewController);

export { router as reviewRouter };

