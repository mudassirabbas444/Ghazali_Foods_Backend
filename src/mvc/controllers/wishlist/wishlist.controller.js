import {
  getWishlist,
  addToWishlistService,
  removeFromWishlistService,
  checkWishlistService
} from "../../services/wishlist/index.js";

const getWishlistController = async (req, res) => {
  try {
    const result = await getWishlist(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const addToWishlistController = async (req, res) => {
  try {
    const result = await addToWishlistService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const removeFromWishlistController = async (req, res) => {
  try {
    const result = await removeFromWishlistService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const checkWishlistController = async (req, res) => {
  try {
    const result = await checkWishlistService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getWishlistController,
  addToWishlistController,
  removeFromWishlistController,
  checkWishlistController
};

