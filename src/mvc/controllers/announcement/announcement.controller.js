import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncementService,
  updateAnnouncementService,
  deleteAnnouncementService
} from "../../services/announcement/index.js";

const getAnnouncementsController = async (req, res) => {
  try {
    const result = await getAnnouncements(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAnnouncementController = async (req, res) => {
  try {
    const result = await getAnnouncement(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createAnnouncementController = async (req, res) => {
  try {
    const result = await createAnnouncementService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateAnnouncementController = async (req, res) => {
  try {
    const result = await updateAnnouncementService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteAnnouncementController = async (req, res) => {
  try {
    const result = await deleteAnnouncementService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getAnnouncementsController,
  getAnnouncementController,
  createAnnouncementController,
  updateAnnouncementController,
  deleteAnnouncementController
};

