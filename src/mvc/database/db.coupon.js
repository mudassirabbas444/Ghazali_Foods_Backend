import Coupon from "../models/Coupon.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

export const createCoupon = async (couponData) => {
  try {
    await ensureConnection();
    // Convert code to uppercase
    if (couponData.code) {
      couponData.code = couponData.code.toUpperCase().trim();
    }
    const coupon = new Coupon(couponData);
    return await coupon.save();
  } catch (error) {
    throw new Error("Error creating coupon: " + error.message);
  }
};

export const getCouponById = async (couponId) => {
  try {
    await ensureConnection();
    return await Coupon.findById(couponId);
  } catch (error) {
    throw new Error("Error fetching coupon: " + error.message);
  }
};

export const getCouponByCode = async (code) => {
  try {
    await ensureConnection();
    return await Coupon.findOne({ 
      code: code.toUpperCase().trim(),
      isActive: true 
    });
  } catch (error) {
    throw new Error("Error fetching coupon by code: " + error.message);
  }
};

export const getAllCoupons = async (options = {}) => {
  try {
    await ensureConnection();
    const query = {};
    
    if (options.isActive !== undefined) {
      query.isActive = options.isActive;
    }
    
    if (options.isPublic !== undefined) {
      query.isPublic = options.isPublic;
    }
    
    const coupons = await Coupon.find(query)
      .populate('applicableCategories', 'name')
      .populate('applicableProducts', 'name')
      .sort({ createdAt: -1 });
    
    return coupons;
  } catch (error) {
    throw new Error("Error fetching coupons: " + error.message);
  }
};

export const validateCoupon = async (code, userId, cartTotal, cartItems = []) => {
  try {
    await ensureConnection();
    const coupon = await getCouponByCode(code);
    
    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }
    
    // Check dates
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return { valid: false, message: "Coupon has expired" };
    }
    
    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: "Coupon usage limit reached" };
    }
    
    // Check minimum purchase amount
    if (cartTotal < coupon.minPurchaseAmount) {
      return { 
        valid: false, 
        message: `Minimum purchase amount of ${coupon.minPurchaseAmount} required` 
      };
    }
    
    // Check applicable categories/products
    if (coupon.applicableCategories.length > 0 || coupon.applicableProducts.length > 0) {
      const applicable = cartItems.some(item => {
        const productId = item.product.toString();
        const categoryId = item.product.category?.toString();
        
        return coupon.applicableProducts.some(id => id.toString() === productId) ||
               coupon.applicableCategories.some(id => id.toString() === categoryId);
      });
      
      if (!applicable) {
        return { valid: false, message: "Coupon not applicable to cart items" };
      }
    }
    
    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = coupon.discountValue;
    }
    
    return {
      valid: true,
      coupon,
      discount: Math.min(discount, cartTotal)
    };
  } catch (error) {
    throw new Error("Error validating coupon: " + error.message);
  }
};

export const applyCoupon = async (couponId) => {
  try {
    await ensureConnection();
    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    return coupon;
  } catch (error) {
    throw new Error("Error applying coupon: " + error.message);
  }
};

export const updateCoupon = async (couponId, updateData) => {
  try {
    await ensureConnection();
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase().trim();
    }
    const coupon = await Coupon.findByIdAndUpdate(couponId, updateData, { new: true });
    if (!coupon) {
      throw new Error("Coupon not found");
    }
    return coupon;
  } catch (error) {
    throw new Error("Error updating coupon: " + error.message);
  }
};

export const deleteCoupon = async (couponId) => {
  try {
    await ensureConnection();
    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      throw new Error("Coupon not found");
    }
    return coupon;
  } catch (error) {
    throw new Error("Error deleting coupon: " + error.message);
  }
};

