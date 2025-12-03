import express from "express";
import wishlistController from "../../controllers/wishlist/wishlist.controller.js";
import { wishlistRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";

const router = express.Router();

// All wishlist routes require authentication
router.get(wishlistRoutes.GET_WISHLIST, auth, wishlistController.getWishlistController);
router.post(wishlistRoutes.ADD_TO_WISHLIST, auth, wishlistController.addToWishlistController);
router.delete(wishlistRoutes.REMOVE_FROM_WISHLIST, auth, wishlistController.removeFromWishlistController);
router.get(wishlistRoutes.CHECK_WISHLIST, auth, wishlistController.checkWishlistController);

export { router as wishlistRouter };

