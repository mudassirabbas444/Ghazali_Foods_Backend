import {
  getWishlistByUser,
  addToWishlist,
  removeFromWishlist,
  isInWishlist
} from "../../database/db.wishlist.js";

const getWishlist = async (req) => {
  try {
    const userId = req?.user?.id;
    
    const wishlist = await getWishlistByUser(userId);
    
    if (!wishlist) {
      return {
        success: true,
        message: "Wishlist is empty",
        statusCode: 200,
        data: { products: [] }
      };
    }
    
    return {
      success: true,
      message: "Wishlist fetched successfully",
      statusCode: 200,
      data: wishlist
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const addToWishlistService = async (req) => {
  try {
    const userId = req?.user?.id;
    // Handle both productId and product for backward compatibility
    const productId = req?.body?.productId || req?.body?.product;
    
    if (!productId) {
      return {
        success: false,
        message: "Product ID is required",
        statusCode: 400
      };
    }
    
    await addToWishlist(userId, productId);
    
    const wishlist = await getWishlistByUser(userId);
    
    return {
      success: true,
      message: "Product added to wishlist successfully",
      statusCode: 200,
      data: wishlist
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const removeFromWishlistService = async (req) => {
  try {
    const userId = req?.user?.id;
    const { productId } = req?.params;
    
    await removeFromWishlist(userId, productId);
    
    const wishlist = await getWishlistByUser(userId);
    
    return {
      success: true,
      message: "Product removed from wishlist successfully",
      statusCode: 200,
      data: wishlist
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const checkWishlistService = async (req) => {
  try {
    const userId = req?.user?.id;
    const { productId } = req?.params;
    
    const inWishlist = await isInWishlist(userId, productId);
    
    return {
      success: true,
      message: "Wishlist status checked",
      statusCode: 200,
      data: { inWishlist }
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
  getWishlist,
  addToWishlistService,
  removeFromWishlistService,
  checkWishlistService
};

