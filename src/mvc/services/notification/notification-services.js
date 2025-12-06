import {
  createNotification,
  getNotificationById,
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  updateNotification,
  deleteNotification,
  deleteAllNotifications,
  deleteReadNotifications,
  getAllNotifications,
  createBulkNotifications,
  cleanupExpiredNotifications,
} from "../../database/db.notification.js";

// Create a notification
const createNotificationService = async (req) => {
  try {
    const userId = req?.user?.id;
    const {
      type,
      title,
      message,
      priority,
      category,
      isAdmin,
      actions,
      relatedEntity,
      persist,
      duration,
      expiresAt,
    } = req?.body;

    // Validation
    if (!type || !title || !message) {
      return {
        success: false,
        message: "Type, title, and message are required",
        statusCode: 400,
      };
    }

    if (!["success", "error", "warning", "info"].includes(type)) {
      return {
        success: false,
        message: "Invalid notification type",
        statusCode: 400,
      };
    }

    const notificationData = {
      user: userId,
      type,
      title,
      message,
      priority: priority || "normal",
      category: category || null,
      isAdmin: isAdmin || false,
      actions: actions || [],
      persist: persist || false,
      duration: duration || (type === "error" ? 8000 : 5000),
    };

    if (relatedEntity) {
      notificationData.relatedEntity = relatedEntity;
    }

    if (expiresAt) {
      notificationData.expiresAt = new Date(expiresAt);
    }

    const notification = await createNotification(notificationData);

    return {
      success: true,
      message: "Notification created successfully",
      statusCode: 201,
      data: notification,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

// Get user notifications
const getUserNotificationsService = async (req) => {
  try {
    const userId = req?.user?.id;
    const filters = {
      read: req?.query?.read !== undefined ? req.query.read === "true" : undefined,
      isAdmin: req?.query?.isAdmin !== undefined ? req.query.isAdmin === "true" : undefined,
      type: req?.query?.type || undefined,
      priority: req?.query?.priority || undefined,
      category: req?.query?.category || undefined,
      sort: { createdAt: -1 },
      limit: req?.query?.limit ? parseInt(req.query.limit) : undefined,
      skip: req?.query?.skip ? parseInt(req.query.skip) : undefined,
    };

    const notifications = await getNotificationsByUser(userId, filters);
    const unreadCount = await getUnreadCount(
      userId,
      filters.isAdmin !== undefined ? filters.isAdmin : false
    );

    return {
      success: true,
      message: "Notifications fetched successfully",
      statusCode: 200,
      data: notifications,
      unreadCount,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

// Get unread count
const getUnreadCountService = async (req) => {
  try {
    const userId = req?.user?.id;
    const isAdmin = req?.query?.isAdmin === "true";

    const count = await getUnreadCount(userId, isAdmin);

    return {
      success: true,
      message: "Unread count fetched successfully",
      statusCode: 200,
      unreadCount: count,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

// Mark notification as read
const markAsReadService = async (req) => {
  try {
    const userId = req?.user?.id;
    const { notificationId } = req?.params;

    const notification = await markAsRead(notificationId, userId);

    return {
      success: true,
      message: "Notification marked as read",
      statusCode: 200,
      data: notification,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: error.message.includes("not found") ? 404 : 500,
      message: error.message,
    };
  }
};

// Mark all notifications as read
const markAllAsReadService = async (req) => {
  try {
    const userId = req?.user?.id;
    const isAdmin = req?.body?.isAdmin || req?.query?.isAdmin === "true";

    const result = await markAllAsRead(userId, isAdmin);

    return {
      success: true,
      message: "All notifications marked as read",
      statusCode: 200,
      updatedCount: result.modifiedCount,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

// Update notification
const updateNotificationService = async (req) => {
  try {
    const userId = req?.user?.id;
    const { notificationId } = req?.params;
    const updateData = req?.body;

    const notification = await updateNotification(notificationId, updateData, userId);

    return {
      success: true,
      message: "Notification updated successfully",
      statusCode: 200,
      data: notification,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: error.message.includes("not found") ? 404 : 500,
      message: error.message,
    };
  }
};

// Delete notification
const deleteNotificationService = async (req) => {
  try {
    const userId = req?.user?.id;
    const { notificationId } = req?.params;

    await deleteNotification(notificationId, userId);

    return {
      success: true,
      message: "Notification deleted successfully",
      statusCode: 200,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: error.message.includes("not found") ? 404 : 500,
      message: error.message,
    };
  }
};

// Delete all notifications
const deleteAllNotificationsService = async (req) => {
  try {
    const userId = req?.user?.id;
    const isAdmin = req?.body?.isAdmin || req?.query?.isAdmin === "true";

    const result = await deleteAllNotifications(userId, isAdmin);

    return {
      success: true,
      message: "All notifications deleted successfully",
      statusCode: 200,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

// Delete read notifications
const deleteReadNotificationsService = async (req) => {
  try {
    const userId = req?.user?.id;
    const isAdmin = req?.body?.isAdmin || req?.query?.isAdmin === "true";

    const result = await deleteReadNotifications(userId, isAdmin);

    return {
      success: true,
      message: "Read notifications deleted successfully",
      statusCode: 200,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

// Admin: Get all notifications
const getAllNotificationsService = async (req) => {
  try {
    const filters = {
      user: req?.query?.user || undefined,
      read: req?.query?.read !== undefined ? req.query.read === "true" : undefined,
      isAdmin: req?.query?.isAdmin !== undefined ? req.query.isAdmin === "true" : undefined,
      type: req?.query?.type || undefined,
      priority: req?.query?.priority || undefined,
      category: req?.query?.category || undefined,
      sort: { createdAt: -1 },
      limit: req?.query?.limit ? parseInt(req.query.limit) : undefined,
      skip: req?.query?.skip ? parseInt(req.query.skip) : undefined,
    };

    const notifications = await getAllNotifications(filters);

    return {
      success: true,
      message: "All notifications fetched successfully",
      statusCode: 200,
      data: notifications,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

// Admin: Create bulk notifications
const createBulkNotificationsService = async (req) => {
  try {
    const { notifications } = req?.body;

    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return {
        success: false,
        message: "Notifications array is required",
        statusCode: 400,
      };
    }

    // Validate each notification
    for (const notif of notifications) {
      if (!notif.user || !notif.type || !notif.title || !notif.message) {
        return {
          success: false,
          message: "Each notification must have user, type, title, and message",
          statusCode: 400,
        };
      }
    }

    const createdNotifications = await createBulkNotifications(notifications);

    return {
      success: true,
      message: "Bulk notifications created successfully",
      statusCode: 201,
      data: createdNotifications,
      count: createdNotifications.length,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

// Cleanup expired notifications (admin or cron job)
const cleanupExpiredNotificationsService = async (req) => {
  try {
    const result = await cleanupExpiredNotifications();

    return {
      success: true,
      message: "Expired notifications cleaned up successfully",
      statusCode: 200,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

export {
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
};

