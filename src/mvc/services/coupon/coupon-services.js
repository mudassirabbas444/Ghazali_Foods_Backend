import {
  createCoupon,
  getCouponById,
  getCouponByCode,
  getAllCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon
} from "../../database/db.coupon.js";

const getCoupons = async (req) => {
  try {
    const options = {
      isActive: req?.query?.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      isPublic: req?.query?.isPublic !== undefined ? req.query.isPublic === 'true' : undefined
    };
    
    const coupons = await getAllCoupons(options);
    
    return {
      success: true,
      message: "Coupons fetched successfully",
      statusCode: 200,
      coupons: coupons || [],
      data: coupons // Keep for backward compatibility
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getCoupon = async (req) => {
  try {
    const { id } = req?.params;
    
    const coupon = await getCouponById(id);
    
    if (!coupon) {
      return {
        success: false,
        message: "Coupon not found",
        statusCode: 404
      };
    }
    
    return {
      success: true,
      message: "Coupon fetched successfully",
      statusCode: 200,
      data: coupon
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const createCouponService = async (req) => {
  try {
    const couponData = req?.body;
    
    const coupon = await createCoupon(couponData);
    
    return {
      success: true,
      message: "Coupon created successfully",
      statusCode: 201,
      data: coupon
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const updateCouponService = async (req) => {
  try {
    const { id } = req?.params;
    const updateData = req?.body;
    
    const coupon = await updateCoupon(id, updateData);
    
    return {
      success: true,
      message: "Coupon updated successfully",
      statusCode: 200,
      data: coupon
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const deleteCouponService = async (req) => {
  try {
    const { id } = req?.params;
    
    await deleteCoupon(id);
    
    return {
      success: true,
      message: "Coupon deleted successfully",
      statusCode: 200
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const validateCouponService = async (req) => {
  try {
    const { code } = req?.body;
    const userId = req?.user?.id;
    const { cartTotal, cartItems } = req?.body;
    
    if (!code) {
      return {
        success: false,
        message: "Coupon code is required",
        statusCode: 400
      };
    }
    
    const validation = await validateCoupon(code, userId, cartTotal || 0, cartItems || []);
    
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
        statusCode: 400
      };
    }
    
    return {
      success: true,
      message: "Coupon is valid",
      statusCode: 200,
      data: {
        coupon: validation.coupon,
        discount: validation.discount
      }
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

export default {
  getCoupons,
  getCoupon,
  createCouponService,
  updateCouponService,
  deleteCouponService,
  validateCouponService
};

