import express from "express";
import authController from "../../controllers/auth/auth.controller.js";
import { authRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";

const router = express.Router();

// Register user (public)
router.post(authRoutes.REGISTER, authController.registerController);

// Login user (public)
router.post(authRoutes.LOGIN, authController.loginController);

export { router as authRouter };

