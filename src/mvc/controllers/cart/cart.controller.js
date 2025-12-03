import {
  getCart,
  addToCartService,
  updateCartItemService,
  removeFromCartService,
  clearCartService,
  applyCouponService,
  removeCouponService
} from "../../services/cart/index.js";

const getCartController = async (req, res) => {
  try {
    const result = await getCart(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const addToCartController = async (req, res) => {
  try {
    const result = await addToCartService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateCartItemController = async (req, res) => {
  try {
    const result = await updateCartItemService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const removeFromCartController = async (req, res) => {
  try {
    const result = await removeFromCartService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const clearCartController = async (req, res) => {
  try {
    const result = await clearCartService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const applyCouponController = async (req, res) => {
  try {
    const result = await applyCouponService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const removeCouponController = async (req, res) => {
  try {
    const result = await removeCouponService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
  applyCouponController,
  removeCouponController
};

