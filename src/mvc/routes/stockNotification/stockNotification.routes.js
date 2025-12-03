import express from "express";
import stockNotificationController from "../../controllers/stockNotification/stockNotification.controller.js";
import { stockNotificationRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

// User routes
router.post(stockNotificationRoutes.SUBSCRIBE, auth, stockNotificationController.subscribeController);
router.get(stockNotificationRoutes.GET_USER_NOTIFICATIONS, auth, stockNotificationController.getUserNotificationsController);
router.delete(stockNotificationRoutes.UNSUBSCRIBE, auth, stockNotificationController.unsubscribeController);

// Admin routes
router.get(stockNotificationRoutes.GET_ALL_NOTIFICATIONS, auth, isAdmin, stockNotificationController.getAllNotificationsController);

export { router as stockNotificationRouter };

