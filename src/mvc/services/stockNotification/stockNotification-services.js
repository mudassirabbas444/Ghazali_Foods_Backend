import {
  createStockNotification,
  getStockNotificationById,
  getStockNotificationsByUser,
  getStockNotificationsByProduct,
  getAllStockNotifications,
  updateStockNotification,
  deleteStockNotification,
  markAsNotified,
  checkExistingNotification,
} from "../../database/db.stockNotification.js";
import { getProductById } from "../../database/db.product.js";
import { sendEmail } from "../../../services/emailService.js";

const subscribeStockNotification = async (req) => {
  try {
    const userId = req?.user?.id;
    const { productId, variant, email } = req?.body;

    if (!productId || !email) {
      return {
        success: false,
        message: "Product ID and email are required",
        statusCode: 400,
      };
    }

    // Check if product exists
    const product = await getProductById(productId);
    if (!product) {
      return {
        success: false,
        message: "Product not found",
        statusCode: 404,
      };
    }

    // Check if already subscribed
    const existing = await checkExistingNotification(userId, productId, variant);
    if (existing) {
      return {
        success: false,
        message: "You are already subscribed to notifications for this product",
        statusCode: 400,
      };
    }

    // Check if product is actually out of stock
    let isOutOfStock = product.stock === 0;
    if (variant) {
      const variantObj = product.variants?.find(v => v.weight === variant);
      isOutOfStock = variantObj ? variantObj.stock === 0 : true;
    }

    if (!isOutOfStock) {
      return {
        success: false,
        message: "Product is currently in stock",
        statusCode: 400,
      };
    }

    const notification = await createStockNotification({
      user: userId,
      product: productId,
      variant: variant || null,
      email,
    });

    return {
      success: true,
      message: "Successfully subscribed to stock notifications",
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

const getUserStockNotifications = async (req) => {
  try {
    const userId = req?.user?.id;

    const notifications = await getStockNotificationsByUser(userId);

    return {
      success: true,
      message: "Stock notifications fetched successfully",
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

const getAllStockNotificationsService = async (req) => {
  try {
    const filters = {
      isNotified: req?.query?.isNotified !== undefined 
        ? req.query.isNotified === 'true' 
        : undefined,
      product: req?.query?.product || undefined,
    };

    const notifications = await getAllStockNotifications(filters);

    return {
      success: true,
      message: "Stock notifications fetched successfully",
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

const unsubscribeStockNotification = async (req) => {
  try {
    const userId = req?.user?.id;
    const { notificationId } = req?.params;

    const notification = await getStockNotificationById(notificationId);
    if (!notification) {
      return {
        success: false,
        message: "Notification not found",
        statusCode: 404,
      };
    }

    if (notification.user.toString() !== userId) {
      return {
        success: false,
        message: "Unauthorized",
        statusCode: 403,
      };
    }

    await deleteStockNotification(notificationId);

    return {
      success: true,
      message: "Successfully unsubscribed from stock notifications",
      statusCode: 200,
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
    };
  }
};

// Function to check and notify users when stock is back
const checkAndNotifyStock = async (productId, variant = null) => {
  try {
    const notifications = await getStockNotificationsByProduct(productId, variant);
    
    for (const notification of notifications) {
      if (!notification.isNotified) {
        // Send email notification
        try {
          await sendEmail({
            to: notification.email,
            subject: `Product Back in Stock - ${notification.product?.name || 'Product'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Great News! Product Back in Stock</h2>
                <p>The product you were interested in is now back in stock!</p>
                <p><strong>Product:</strong> ${notification.product?.name || 'Product'}</p>
                ${variant ? `<p><strong>Variant:</strong> ${variant}</p>` : ''}
                <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/product/${notification.product?.slug}" style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">View Product</a></p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Error sending stock notification email:", emailError);
        }

        // Mark as notified
        await markAsNotified(notification._id);
      }
    }

    return { success: true, notified: notifications.length };
  } catch (error) {
    console.error("Error checking and notifying stock:", error);
    return { success: false, error: error.message };
  }
};

export {
  subscribeStockNotification,
  getUserStockNotifications,
  getAllStockNotificationsService,
  unsubscribeStockNotification,
  checkAndNotifyStock,
};

