import express from "express";
import couponController from "../../controllers/coupon/coupon.controller.js";
import { couponRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

// Public routes
router.get(couponRoutes.GET_COUPONS, couponController.getPublicCouponsController);
router.post(couponRoutes.VALIDATE_COUPON, auth, couponController.validateCouponController);

// Admin routes
router.get(couponRoutes.GET_COUPONS, auth, isAdmin, couponController.getCouponsController);
router.get(couponRoutes.GET_COUPON, auth, isAdmin, couponController.getCouponController);
router.post(couponRoutes.CREATE_COUPON, auth, isAdmin, couponController.createCouponController);
router.put(couponRoutes.UPDATE_COUPON, auth, isAdmin, couponController.updateCouponController);
router.delete(couponRoutes.DELETE_COUPON, auth, isAdmin, couponController.deleteCouponController);

export { router as couponRouter };

