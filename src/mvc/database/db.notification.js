import Notification from "../models/Notification.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

export const createNotification = async (notificationData) => {
  try {
    await ensureConnection();
    const notification = new Notification(notificationData);
    return await notification.save();
  } catch (error) {
    throw new Error("Error creating notification: " + error.message);
  }
};

export const getNotificationById = async (notificationId) => {
  try {
    await ensureConnection();
    return await Notification.findById(notificationId)
      .populate('user', 'fullName email')
      .populate('relatedEntity.id');
  } catch (error) {
    throw new Error("Error fetching notification: " + error.message);
  }
};

export const getNotificationsByUser = async (userId, filters = {}) => {
  try {
    await ensureConnection();
    const query = { user: userId };
    
    // Apply filters
    if (filters.read !== undefined) {
      query.read = filters.read;
    }
    if (filters.isAdmin !== undefined) {
      query.isAdmin = filters.isAdmin;
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.category) {
      query.category = filters.category;
    }
    
    // Exclude expired notifications
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ];
    
    const sort = filters.sort || { createdAt: -1 };
    const limit = filters.limit || undefined;
    const skip = filters.skip || 0;
    
    let queryBuilder = Notification.find(query)
      .populate('user', 'fullName email')
      .sort(sort)
      .skip(skip);
    
    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }
    
    return await queryBuilder;
  } catch (error) {
    throw new Error("Error fetching user notifications: " + error.message);
  }
};

export const getUnreadCount = async (userId, isAdmin = false) => {
  try {
    await ensureConnection();
    const query = { 
      user: userId, 
      read: false,
      isAdmin: isAdmin,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    };
    return await Notification.countDocuments(query);
  } catch (error) {
    throw new Error("Error fetching unread count: " + error.message);
  }
};

export const markAsRead = async (notificationId, userId) => {
  try {
    await ensureConnection();
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      throw new Error("Notification not found or unauthorized");
    }
    return notification;
  } catch (error) {
    throw new Error("Error marking notification as read: " + error.message);
  }
};

export const markAllAsRead = async (userId, isAdmin = false) => {
  try {
    await ensureConnection();
    const result = await Notification.updateMany(
      { 
        user: userId, 
        read: false,
        isAdmin: isAdmin,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ]
      },
      { read: true, readAt: new Date() }
    );
    return result;
  } catch (error) {
    throw new Error("Error marking all notifications as read: " + error.message);
  }
};

export const updateNotification = async (notificationId, updateData, userId) => {
  try {
    await ensureConnection();
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      updateData,
      { new: true }
    );
    if (!notification) {
      throw new Error("Notification not found or unauthorized");
    }
    return notification;
  } catch (error) {
    throw new Error("Error updating notification: " + error.message);
  }
};

export const deleteNotification = async (notificationId, userId) => {
  try {
    await ensureConnection();
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });
    if (!notification) {
      throw new Error("Notification not found or unauthorized");
    }
    return notification;
  } catch (error) {
    throw new Error("Error deleting notification: " + error.message);
  }
};

export const deleteAllNotifications = async (userId, isAdmin = false) => {
  try {
    await ensureConnection();
    const result = await Notification.deleteMany({
      user: userId,
      isAdmin: isAdmin
    });
    return result;
  } catch (error) {
    throw new Error("Error deleting all notifications: " + error.message);
  }
};

export const deleteReadNotifications = async (userId, isAdmin = false) => {
  try {
    await ensureConnection();
    const result = await Notification.deleteMany({
      user: userId,
      read: true,
      isAdmin: isAdmin
    });
    return result;
  } catch (error) {
    throw new Error("Error deleting read notifications: " + error.message);
  }
};

// Admin functions
export const getAllNotifications = async (filters = {}) => {
  try {
    await ensureConnection();
    const query = {};
    
    if (filters.user) {
      query.user = filters.user;
    }
    if (filters.read !== undefined) {
      query.read = filters.read;
    }
    if (filters.isAdmin !== undefined) {
      query.isAdmin = filters.isAdmin;
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.category) {
      query.category = filters.category;
    }
    
    const sort = filters.sort || { createdAt: -1 };
    const limit = filters.limit || undefined;
    const skip = filters.skip || 0;
    
    let queryBuilder = Notification.find(query)
      .populate('user', 'fullName email')
      .sort(sort)
      .skip(skip);
    
    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }
    
    return await queryBuilder;
  } catch (error) {
    throw new Error("Error fetching all notifications: " + error.message);
  }
};

// Create notification for multiple users (bulk)
export const createBulkNotifications = async (notificationsData) => {
  try {
    await ensureConnection();
    return await Notification.insertMany(notificationsData);
  } catch (error) {
    throw new Error("Error creating bulk notifications: " + error.message);
  }
};

// Clean up expired notifications (can be called by a cron job)
export const cleanupExpiredNotifications = async () => {
  try {
    await ensureConnection();
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    return result;
  } catch (error) {
    throw new Error("Error cleaning up expired notifications: " + error.message);
  }
};

