import {
  getCoupons,
  getCoupon,
  createCouponService,
  updateCouponService,
  deleteCouponService,
  validateCouponService
} from "../../services/coupon/index.js";

const getCouponsController = async (req, res) => {
  try {
    const result = await getCoupons(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getCouponController = async (req, res) => {
  try {
    const result = await getCoupon(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createCouponController = async (req, res) => {
  try {
    const result = await createCouponService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateCouponController = async (req, res) => {
  try {
    const result = await updateCouponService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteCouponController = async (req, res) => {
  try {
    const result = await deleteCouponService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const validateCouponController = async (req, res) => {
  try {
    const result = await validateCouponService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getPublicCouponsController = async (req, res) => {
  try {
    // Only return public and active coupons
    req.query = { isPublic: 'true', isActive: 'true' };
    const result = await getCoupons(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getCouponsController,
  getPublicCouponsController,
  getCouponController,
  createCouponController,
  updateCouponController,
  deleteCouponController,
  validateCouponController
};

