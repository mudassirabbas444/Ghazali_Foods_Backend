import express from "express";
import notificationController from "../../controllers/notification/notification.controller.js";
import { notificationRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

// User routes (authenticated)
router.post(notificationRoutes.CREATE, auth, notificationController.createNotificationController);
router.get(notificationRoutes.GET_USER_NOTIFICATIONS, auth, notificationController.getUserNotificationsController);
router.get(notificationRoutes.GET_UNREAD_COUNT, auth, notificationController.getUnreadCountController);
router.put(notificationRoutes.MARK_AS_READ, auth, notificationController.markAsReadController);
router.put(notificationRoutes.MARK_ALL_AS_READ, auth, notificationController.markAllAsReadController);
router.put(notificationRoutes.UPDATE, auth, notificationController.updateNotificationController);
router.delete(notificationRoutes.DELETE, auth, notificationController.deleteNotificationController);
router.delete(notificationRoutes.DELETE_ALL, auth, notificationController.deleteAllNotificationsController);
router.delete(notificationRoutes.DELETE_READ, auth, notificationController.deleteReadNotificationsController);

// Admin routes
router.get(notificationRoutes.GET_ALL, auth, isAdmin, notificationController.getAllNotificationsController);
router.post(notificationRoutes.CREATE_BULK, auth, isAdmin, notificationController.createBulkNotificationsController);
router.post(notificationRoutes.CLEANUP, auth, isAdmin, notificationController.cleanupExpiredNotificationsController);

export { router as notificationRouter };

