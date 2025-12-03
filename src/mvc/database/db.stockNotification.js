import StockNotification from "../models/StockNotification.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

export const createStockNotification = async (notificationData) => {
  try {
    await ensureConnection();
    const notification = new StockNotification(notificationData);
    return await notification.save();
  } catch (error) {
    throw new Error("Error creating stock notification: " + error.message);
  }
};

export const getStockNotificationById = async (notificationId) => {
  try {
    await ensureConnection();
    return await StockNotification.findById(notificationId)
      .populate('user', 'fullName email')
      .populate('product', 'name slug thumbnail');
  } catch (error) {
    throw new Error("Error fetching stock notification: " + error.message);
  }
};

export const getStockNotificationsByUser = async (userId) => {
  try {
    await ensureConnection();
    return await StockNotification.find({ user: userId, isNotified: false })
      .populate('product', 'name slug thumbnail stock')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Error fetching user stock notifications: " + error.message);
  }
};

export const getStockNotificationsByProduct = async (productId, variant = null) => {
  try {
    await ensureConnection();
    const query = { product: productId, isNotified: false };
    if (variant) {
      query.variant = variant;
    }
    return await StockNotification.find(query)
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Error fetching product stock notifications: " + error.message);
  }
};

export const getAllStockNotifications = async (filters = {}) => {
  try {
    await ensureConnection();
    const query = {};
    
    if (filters.isNotified !== undefined) {
      query.isNotified = filters.isNotified;
    }
    if (filters.product) {
      query.product = filters.product;
    }
    
    return await StockNotification.find(query)
      .populate('user', 'fullName email')
      .populate('product', 'name slug thumbnail')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Error fetching stock notifications: " + error.message);
  }
};

export const updateStockNotification = async (notificationId, updateData) => {
  try {
    await ensureConnection();
    const notification = await StockNotification.findByIdAndUpdate(
      notificationId,
      updateData,
      { new: true }
    );
    if (!notification) {
      throw new Error("Stock notification not found");
    }
    return notification;
  } catch (error) {
    throw new Error("Error updating stock notification: " + error.message);
  }
};

export const deleteStockNotification = async (notificationId) => {
  try {
    await ensureConnection();
    const notification = await StockNotification.findByIdAndDelete(notificationId);
    if (!notification) {
      throw new Error("Stock notification not found");
    }
    return notification;
  } catch (error) {
    throw new Error("Error deleting stock notification: " + error.message);
  }
};

export const markAsNotified = async (notificationId) => {
  try {
    await ensureConnection();
    return await StockNotification.findByIdAndUpdate(
      notificationId,
      { isNotified: true, notifiedAt: new Date() },
      { new: true }
    );
  } catch (error) {
    throw new Error("Error marking notification as notified: " + error.message);
  }
};

export const checkExistingNotification = async (userId, productId, variant = null) => {
  try {
    await ensureConnection();
    const query = { user: userId, product: productId };
    if (variant) {
      query.variant = variant;
    } else {
      query.variant = { $exists: false };
    }
    return await StockNotification.findOne(query);
  } catch (error) {
    throw new Error("Error checking existing notification: " + error.message);
  }
};

