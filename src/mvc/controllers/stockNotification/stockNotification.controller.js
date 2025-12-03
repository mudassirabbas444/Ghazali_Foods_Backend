import {
  subscribeStockNotification,
  getUserStockNotifications,
  getAllStockNotificationsService,
  unsubscribeStockNotification,
} from "../../services/stockNotification/index.js";

const subscribeController = async (req, res) => {
  try {
    const result = await subscribeStockNotification(req);
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
    const result = await getUserStockNotifications(req);
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
    const result = await getAllStockNotificationsService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const unsubscribeController = async (req, res) => {
  try {
    const result = await unsubscribeStockNotification(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  subscribeController,
  getUserNotificationsController,
  getAllNotificationsController,
  unsubscribeController,
};

