import express from "express";
import userController from "../../controllers/user/user.controller.js";
import authController from "../../controllers/auth/auth.controller.js";
import { userRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";
import isAdmin from "../../middlewares/isAdmin.js";
import { validateAvatarMiddleware, sanitizeRequestBody } from "../../middlewares/firebaseValidation.js";
import { upload } from "../../../services/uploadService.js";

const router = express.Router();

// Register user (public)
router.post(userRoutes.REGISTER_USER, userController.registerUserController);

// Login user (public)
router.post(userRoutes.LOGIN_USER, userController.loginUserController);

// OTP Verification (public)
router.post(userRoutes.VERIFY_OTP, userController.verifyOTPController);
router.post(userRoutes.RESEND_OTP, userController.resendOTPController);

// Get user profile (requires authentication)
router.get(userRoutes.GET_USER_PROFILE, auth, userController.getUserProfileController);

// Update user profile (requires authentication) - supports file upload for avatar
router.put(userRoutes.UPDATE_USER_PROFILE, auth, upload.single('avatar'), sanitizeRequestBody, validateAvatarMiddleware, userController.updateUserProfileController);

// Change password (requires authentication)
router.put(userRoutes.CHANGE_PASSWORD, auth, userController.changePasswordController);

// Get all users (requires authentication - admin only)
router.get(userRoutes.GET_ALL_USERS, auth, isAdmin, userController.getAllUsersController);

// Delete user (requires authentication - admin only)
router.delete(userRoutes.DELETE_USER, auth, isAdmin, userController.deleteUserController);

// Google OAuth authentication (public)
router.post(userRoutes.GOOGLE_AUTH, authController.googleAuthController);

// Forgot password (public)
router.post(userRoutes.FORGOT_PASSWORD, authController.forgotPasswordController);

// Reset password (public)
router.post(userRoutes.RESET_PASSWORD, authController.resetPasswordController);

export { router as userRouter };
