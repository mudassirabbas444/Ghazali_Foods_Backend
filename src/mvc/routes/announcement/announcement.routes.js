import express from "express";
import announcementController from "../../controllers/announcement/announcement.controller.js";
import { announcementRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

// Public routes
router.get(announcementRoutes.GET_ANNOUNCEMENTS, announcementController.getAnnouncementsController);
router.get(announcementRoutes.GET_ANNOUNCEMENT, announcementController.getAnnouncementController);

// Admin routes
router.post(announcementRoutes.CREATE_ANNOUNCEMENT, auth, isAdmin, announcementController.createAnnouncementController);
router.put(announcementRoutes.UPDATE_ANNOUNCEMENT, auth, isAdmin, announcementController.updateAnnouncementController);
router.delete(announcementRoutes.DELETE_ANNOUNCEMENT, auth, isAdmin, announcementController.deleteAnnouncementController);

export { router as announcementRouter };

