import express from "express";
import cartController from "../../controllers/cart/cart.controller.js";
import { cartRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";

const router = express.Router();

// All cart routes require authentication
router.get(cartRoutes.GET_CART, auth, cartController.getCartController);
router.post(cartRoutes.ADD_TO_CART, auth, cartController.addToCartController);
router.put(cartRoutes.UPDATE_CART_ITEM, auth, cartController.updateCartItemController);
router.delete(cartRoutes.REMOVE_FROM_CART, auth, cartController.removeFromCartController);
router.delete(cartRoutes.CLEAR_CART, auth, cartController.clearCartController);
router.post(cartRoutes.APPLY_COUPON, auth, cartController.applyCouponController);
router.delete(cartRoutes.REMOVE_COUPON, auth, cartController.removeCouponController);

export { router as cartRouter };

