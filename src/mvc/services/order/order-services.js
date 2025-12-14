import {
  createOrder,
  getOrderById,
  getOrderByNumber,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats
} from "../../database/db.order.js";
import { getCartByUser, clearCart } from "../../database/db.cart.js";
import { getProductById, updateProductStock } from "../../database/db.product.js";
import { applyCoupon } from "../../database/db.coupon.js";
import { sendEmail } from "../../../services/emailService.js";
import { env } from "../../../config/env.js";
import Order from "../../models/Order.js";
import User from "../../models/User.js";
import Product from "../../models/Product.js";
import {
  generateOrderConfirmationEmail,
  generateOrderStatusUpdateEmail,
  generateAdminOrderNotificationEmail,
  generateAdminOrderStatusUpdateEmail,
  ADMIN_EMAIL
} from "../../../utils/emailTemplates.js";

const createOrderService = async (req) => {
  try {
    const userId = req?.user?.id;
    const { shippingAddress, paymentMethod, deliveryCharges } = req?.body;
    
    if (!shippingAddress || !paymentMethod) {
      return {
        success: false,
        message: "Shipping address and payment method are required",
        statusCode: 400
      };
    }
    
    // Validate payment method
    const validPaymentMethods = ["cod", "card", "wallet", "jazzcash", "easypaisa"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return {
        success: false,
        message: "Invalid payment method",
        statusCode: 400
      };
    }
    
    // Get cart
    const cart = await getCartByUser(userId);
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Cart is empty",
        statusCode: 400
      };
    }
    
    // Calculate totals
    const totals = cart.calculateTotals();
    
    // Calculate delivery charges: Free for orders above 2500, otherwise 240
    const orderTotal = totals.subtotal - totals.discount;
    const calculatedDeliveryCharges = orderTotal >= 2500 ? 0 : (deliveryCharges || 240);
    
    // Prepare order items
    const orderItems = [];
    for (const item of cart.items) {
      // Handle both populated and unpopulated product references
      const productId = item.product?._id || item.product;
      const product = await getProductById(productId);
      
      if (!product || !product.isActive) {
        return {
          success: false,
          message: `Product ${product?.name || 'Unknown'} is not available`,
          statusCode: 400
        };
      }
      
      // Check stock
      let stock = product.stock || 0;
      if (item.variant) {
        const variant = product.variants?.find(v => v.weight === item.variant);
        if (!variant) {
          return {
            success: false,
            message: `Variant ${item.variant} is not available`,
            statusCode: 400
          };
        }
        stock = variant.stock || 0;
      }
      
      if (stock < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for ${product.name}`,
          statusCode: 400
        };
      }
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        variant: item.variant || null,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        image: product.thumbnail || (product.images && product.images.length > 0 ? product.images[0] : null) || null
      });
    }
    
    // Create order
    const orderData = {
      user: userId,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        area: shippingAddress.area || '',
        postalCode: shippingAddress.postalCode || '',
        landmark: shippingAddress.landmark || ''
      },
      items: orderItems,
      subtotal: totals.subtotal,
      deliveryCharges: calculatedDeliveryCharges,
      discount: totals.discount || 0,
      coupon: cart.coupon?._id || cart.coupon || null,
      total: totals.total + calculatedDeliveryCharges + 1, // Add 1 rupee FBR POS charges
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      status: 'pending'
    };
    
    const order = await createOrder(orderData);
    
    // Update stock
    for (const item of cart.items) {
      // Handle both populated and unpopulated product references
      const productId = item.product?._id || item.product;
      const product = await getProductById(productId);
      
      if (!product) continue;
      
      if (item.variant) {
        const variantIndex = product.variants?.findIndex(v => v.weight === item.variant);
        if (variantIndex !== -1 && product.variants[variantIndex]) {
          product.variants[variantIndex].stock = Math.max(0, (product.variants[variantIndex].stock || 0) - item.quantity);
        }
      } else {
        product.stock = Math.max(0, (product.stock || 0) - item.quantity);
      }
      
      await product.save();
    }
    
    // Apply coupon usage
    if (cart.coupon) {
      await applyCoupon(cart.coupon);
    }
    
    // Clear cart
    await clearCart(userId);
    
    // Get populated order for email
    const populatedOrder = await getOrderById(order._id);
    
    // Send order confirmation emails to user and admin
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        // Send email to user
        await sendEmail({
          to: user.email,
          subject: `Order Confirmation - ${order.orderNumber}`,
          html: generateOrderConfirmationEmail(populatedOrder, user)
        });
        
        // Send email to admin
        await sendEmail({
          to: ADMIN_EMAIL,
          subject: `New Order Received - ${order.orderNumber}`,
          html: generateAdminOrderNotificationEmail(populatedOrder, user)
        });
      }
    } catch (emailError) {
      console.error("Error sending order confirmation emails:", emailError);
    }
    
    return {
      success: true,
      message: "Order placed successfully",
      statusCode: 201,
      data: populatedOrder
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getOrder = async (req) => {
  try {
    const { id, orderNumber } = req?.params;
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return {
        success: false,
        message: "User not authenticated",
        statusCode: 401
      };
    }
    
    let order;
    if (orderNumber) {
      order = await getOrderByNumber(orderNumber);
    } else {
      order = await getOrderById(id);
    }
    
    if (!order) {
      return {
        success: false,
        message: "Order not found",
        statusCode: 404
      };
    }
    
    // Check if user owns this order (unless admin)
    // Handle both populated user object and ObjectId
    const orderUserId = order.user?._id?.toString() || order.user?.toString();
    const userStringId = userId.toString();
    
    if (!req.user?.isAdmin && orderUserId !== userStringId) {
      return {
        success: false,
        message: "Unauthorized - You can only view your own orders",
        statusCode: 403
      };
    }
    
    return {
      success: true,
      message: "Order fetched successfully",
      statusCode: 200,
      data: order
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getUserOrdersService = async (req) => {
  try {
    const userId = req?.user?.id;
    const options = {
      page: req?.query?.page || 1,
      limit: req?.query?.limit || 20,
      status: req?.query?.status
    };
    
    const result = await getUserOrders(userId, options);
    
    return {
      success: true,
      message: "Orders fetched successfully",
      statusCode: 200,
      orders: result.orders || [],
      total: result.total || 0,
      page: result.page || 1,
      pages: result.pages || 1,
      data: result // Keep for backward compatibility
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getAllOrdersService = async (req) => {
  try {
    const options = {
      page: req?.query?.page || 1,
      limit: req?.query?.limit || 20,
      status: req?.query?.status,
      paymentStatus: req?.query?.paymentStatus,
      search: req?.query?.search,
      startDate: req?.query?.startDate,
      endDate: req?.query?.endDate
    };
    
    const result = await getAllOrders(options);
    
    return {
      success: true,
      message: "Orders fetched successfully",
      statusCode: 200,
      orders: result.orders || [],
      total: result.total || 0,
      page: result.page || 1,
      pages: result.pages || 1,
      data: result // Keep for backward compatibility
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const updateOrderStatusService = async (req) => {
  try {
    const { id } = req?.params;
    const { status, adminNotes } = req?.body;
    
    if (!status) {
      return {
        success: false,
        message: "Status is required",
        statusCode: 400
      };
    }
    
    // Get previous status before updating
    const previousOrder = await getOrderById(id);
    const previousStatus = previousOrder ? previousOrder.status : null;
    
    const order = await updateOrderStatus(id, status, adminNotes);
    
    // Get populated order for email
    const populatedOrder = await getOrderById(id);
    
    // Send notification emails to user and admin for all status changes
    try {
      if (populatedOrder.user && populatedOrder.user.email) {
        // Send email to user
        await sendEmail({
          to: populatedOrder.user.email,
          subject: `Order Status Update - ${order.orderNumber}`,
          html: generateOrderStatusUpdateEmail(populatedOrder, populatedOrder.user, previousStatus)
        });
        
        // Send email to admin
        await sendEmail({
          to: ADMIN_EMAIL,
          subject: `Order Status Updated - ${order.orderNumber}`,
          html: generateAdminOrderStatusUpdateEmail(populatedOrder, populatedOrder.user, previousStatus)
        });
      }
    } catch (emailError) {
      console.error("Error sending order status update emails:", emailError);
    }
    
    return {
      success: true,
      message: "Order status updated successfully",
      statusCode: 200,
      data: order
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const cancelOrderService = async (req) => {
  try {
    const { id } = req?.params;
    const { reason } = req?.body;
    const userId = req?.user?.id || req?.user?._id;
    
    if (!userId) {
      return {
        success: false,
        message: "User not authenticated",
        statusCode: 401
      };
    }
    
    const order = await getOrderById(id);
    if (!order) {
      return {
        success: false,
        message: "Order not found",
        statusCode: 404
      };
    }
    
    // Check if user can cancel (only pending or processing)
    if (order.status !== 'pending' && order.status !== 'processing') {
      return {
        success: false,
        message: "Order cannot be cancelled at this stage",
        statusCode: 400
      };
    }
    
    // Check ownership - handle both populated user object and ObjectId
    const orderUserId = order.user?._id?.toString() || order.user?.toString();
    const userStringId = userId.toString();
    
    if (!req.user?.isAdmin && orderUserId !== userStringId) {
      return {
        success: false,
        message: "Unauthorized - You can only cancel your own orders",
        statusCode: 403
      };
    }
    
    const cancelledOrder = await cancelOrder(id, reason, req.user.isAdmin ? 'admin' : 'user');
    
    // Restore stock
    for (const item of order.items) {
      // Handle both populated and unpopulated product references
      const productId = item.product?._id || item.product;
      const product = await getProductById(productId);
      
      if (!product) continue;
      
      if (item.variant) {
        const variantIndex = product.variants?.findIndex(v => v.weight === item.variant);
        if (variantIndex !== -1 && product.variants[variantIndex]) {
          product.variants[variantIndex].stock = (product.variants[variantIndex].stock || 0) + item.quantity;
        }
      } else {
        product.stock = (product.stock || 0) + item.quantity;
      }
      await product.save();
    }
    
    return {
      success: true,
      message: "Order cancelled successfully",
      statusCode: 200,
      data: cancelledOrder
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const updatePaymentStatusService = async (req) => {
  try {
    const { id } = req?.params;
    const { paymentStatus } = req?.body;
    
    if (!paymentStatus) {
      return {
        success: false,
        message: "Payment status is required",
        statusCode: 400
      };
    }
    
    const validStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return {
        success: false,
        message: "Invalid payment status",
        statusCode: 400
      };
    }
    
    const order = await updatePaymentStatus(id, paymentStatus);
    
    return {
      success: true,
      message: "Payment status updated successfully",
      statusCode: 200,
      data: order
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getOrderStatsService = async (req) => {
  try {
    // Calculate date range (last 30 days by default)
    const endDate = req?.query?.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req?.query?.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }
    
    // Ensure startDate is before endDate
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }
    
    const stats = await getOrderStats(startDate, endDate);
    // Get additional stats
    const totalCustomers = await User.countDocuments({ isActive: { $ne: false } });
    const totalProducts = await Product.countDocuments({ isActive: { $ne: false } });

    
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
   
    
    // Calculate previous period stats for comparison
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(startDate);
    previousStartDate.setTime(previousStartDate.getTime() - (periodDays * 24 * 60 * 60 * 1000));
    const previousEndDate = new Date(startDate);
    previousEndDate.setTime(previousEndDate.getTime() - 1); // Just before startDate
    
    const previousStats = await getOrderStats(previousStartDate, previousEndDate);
    
    const revenueChange = previousStats && previousStats.totalRevenue > 0
      ? ((stats.totalRevenue - previousStats.totalRevenue) / previousStats.totalRevenue) * 100
      : (stats.totalRevenue > 0 ? 100 : 0); // If no previous revenue but current exists, show 100% increase
    const ordersChange = previousStats && previousStats.totalOrders > 0
      ? ((stats.totalOrders - previousStats.totalOrders) / previousStats.totalOrders) * 100
      : (stats.totalOrders > 0 ? 100 : 0); // If no previous orders but current exists, show 100% increase
    
    const result = {
      success: true,
      message: "Order stats fetched successfully",
      statusCode: 200,
      data: {
        totalRevenue: stats.totalRevenue || 0,
        totalOrders: stats.totalOrders || 0,
        totalCustomers: totalCustomers || 0,
        totalProducts: totalProducts || 0,
        pendingOrders: pendingOrders || 0,
        averageOrderValue: stats.averageOrderValue || 0,
        revenueChange: Math.round(revenueChange * 10) / 10,
        ordersChange: Math.round(ordersChange * 10) / 10,
        customersChange: 0, // Can be calculated if needed
        productsChange: 0, // Can be calculated if needed
        conversionRate: 0, // Can be calculated if needed
      }
    };
    
    return result;
  } catch (error) {
    console.error('Error in getOrderStatsService:', error); 
    return {
      success: false,
      statusCode: 500,
      message: error.message || 'Error fetching order stats'
    };
  }
};

export default {
  createOrderService,
  getOrder,
  getUserOrdersService,
  getAllOrdersService,
  updateOrderStatusService,
  updatePaymentStatusService,
  cancelOrderService,
  getOrderStatsService
};

