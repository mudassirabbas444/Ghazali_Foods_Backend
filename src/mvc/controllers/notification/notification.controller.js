import {
  createNotificationService,
  getUserNotificationsService,
  getUnreadCountService,
  markAsReadService,
  markAllAsReadService,
  updateNotificationService,
  deleteNotificationService,
  deleteAllNotificationsService,
  deleteReadNotificationsService,
  getAllNotificationsService,
  createBulkNotificationsService,
  cleanupExpiredNotificationsService,
} from "../../services/notification/index.js";

const createNotificationController = async (req, res) => {
  try {
    const result = await createNotificationService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserNotificationsController = async (req, res) => {
  try {
    const result = await getUserNotificationsService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUnreadCountController = async (req, res) => {
  try {
    const result = await getUnreadCountService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markAsReadController = async (req, res) => {
  try {
    const result = await markAsReadService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markAllAsReadController = async (req, res) => {
  try {
    const result = await markAllAsReadService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateNotificationController = async (req, res) => {
  try {
    const result = await updateNotificationService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteNotificationController = async (req, res) => {
  try {
    const result = await deleteNotificationService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAllNotificationsController = async (req, res) => {
  try {
    const result = await deleteAllNotificationsService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteReadNotificationsController = async (req, res) => {
  try {
    const result = await deleteReadNotificationsService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllNotificationsController = async (req, res) => {
  try {
    const result = await getAllNotificationsService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createBulkNotificationsController = async (req, res) => {
  try {
    const result = await createBulkNotificationsService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const cleanupExpiredNotificationsController = async (req, res) => {
  try {
    const result = await cleanupExpiredNotificationsService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createNotificationController,
  getUserNotificationsController,
  getUnreadCountController,
  markAsReadController,
  markAllAsReadController,
  updateNotificationController,
  deleteNotificationController,
  deleteAllNotificationsController,
  deleteReadNotificationsController,
  getAllNotificationsController,
  createBulkNotificationsController,
  cleanupExpiredNotificationsController,
};

