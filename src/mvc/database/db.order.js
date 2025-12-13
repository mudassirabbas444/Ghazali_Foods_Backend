import Order from "../models/Order.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

export const createOrder = async (orderData) => {
  try {
    await ensureConnection();
    const order = new Order(orderData);
    return await order.save();
  } catch (error) {
    console.log(error);
    throw new Error("Error creating order: " + error.message);
  }
};

export const getOrderById = async (orderId) => {
  try {
    await ensureConnection();
    return await Order.findById(orderId)
      .populate('user', 'fullName email phone')
      .populate('items.product', 'name images thumbnail')
      .populate('coupon', 'code discountType discountValue');
  } catch (error) {
    throw new Error("Error fetching order: " + error.message);
  }
};

export const getOrderByNumber = async (orderNumber) => {
  try {
    await ensureConnection();
    return await Order.findOne({ orderNumber })
      .populate('user', 'fullName email phone')
      .populate('items.product', 'name images thumbnail')
      .populate('coupon', 'code');
  } catch (error) {
    throw new Error("Error fetching order by number: " + error.message);
  }
};

export const getUserOrders = async (userId, options = {}) => {
  try {
    await ensureConnection();
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;
    
    const query = { user: userId };
    
    if (options.status) {
      query.status = options.status;
    }
    
    const orders = await Order.find(query)
      .populate('items.product', 'name images thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments(query);
    
    return {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    throw new Error("Error fetching user orders: " + error.message);
  }
};

export const getAllOrders = async (options = {}) => {
  try {
    await ensureConnection();
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;
    
    const query = {};
    
    if (options.status) {
      query.status = options.status;
    }
    
    if (options.paymentStatus) {
      query.paymentStatus = options.paymentStatus;
    }
    
    if (options.search) {
      query.$or = [
        { orderNumber: { $regex: options.search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: options.search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: options.search, $options: 'i' } }
      ];
    }
    
    if (options.startDate && options.endDate) {
      query.createdAt = {
        $gte: new Date(options.startDate),
        $lte: new Date(options.endDate)
      };
    }
    
    const orders = await Order.find(query)
      .populate('user', 'fullName email phone')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Order.countDocuments(query);
    
    return {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    throw new Error("Error fetching orders: " + error.message);
  }
};

export const updateOrder = async (orderId, updateData) => {
  try {
    await ensureConnection();
    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  } catch (error) {
    throw new Error("Error updating order: " + error.message);
  }
};

export const updateOrderStatus = async (orderId, status, adminNotes = null) => {
  try {
    await ensureConnection();
    const updateData = { status };
    
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }
    
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    
    return await updateOrder(orderId, updateData);
  } catch (error) {
    throw new Error("Error updating order status: " + error.message);
  }
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    await ensureConnection();
    const updateData = { paymentStatus };
    
    return await updateOrder(orderId, updateData);
  } catch (error) {
    throw new Error("Error updating payment status: " + error.message);
  }
};

export const cancelOrder = async (orderId, reason, cancelledBy = 'user') => {
  try {
    await ensureConnection();
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledBy
      },
      { new: true }
    );
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    return order;
  } catch (error) {
    throw new Error("Error cancelling order: " + error.message);
  }
};

export const getOrderStats = async (startDate, endDate) => {
  try {
    await ensureConnection();
    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    const stats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          totalItems: { $sum: { $size: '$items' } },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);
    
    return stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      totalItems: 0,
      averageOrderValue: 0
    };
  } catch (error) {
    throw new Error("Error fetching order stats: " + error.message);
  }
};

