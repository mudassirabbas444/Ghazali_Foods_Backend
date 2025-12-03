import {
  getCartByUser,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCouponToCart,
  removeCouponFromCart
} from "../../database/db.cart.js";
import { getProductById } from "../../database/db.product.js";
import { validateCoupon } from "../../database/db.coupon.js";

const getCart = async (req) => {
  try {
    const userId = req?.user?.id;
    
    let cart = await getCartByUser(userId);
    
    if (!cart) {
      return {
        success: true,
        message: "Cart is empty",
        statusCode: 200,
        data: {
          items: [],
          totals: {
            subtotal: 0,
            discount: 0,
            total: 0
          }
        }
      };
    }
    
    const totals = cart.calculateTotals();
    
    return {
      success: true,
      message: "Cart fetched successfully",
      statusCode: 200,
      data: {
        ...cart.toObject(),
        totals
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

const addToCartService = async (req) => {
  try {
    const userId = req?.user?.id;
    // Handle both productId and product for backward compatibility
    const productId = req?.body?.productId || req?.body?.product;
    const variant = req?.body?.variant;
    const quantity = req?.body?.quantity;
    
    if (!productId || !quantity) {
      return {
        success: false,
        message: "Product ID and quantity are required",
        statusCode: 400
      };
    }
    
    // Get product to check availability and price
    const product = await getProductById(productId);
    if (!product) {
      return {
        success: false,
        message: "Product not found",
        statusCode: 404
      };
    }
    
    if (!product.isActive) {
      return {
        success: false,
        message: "Product is not available",
        statusCode: 400
      };
    }
    
    // Determine price based on variant
    let price = product.basePrice;
    let stock = product.stock;
    
    if (variant) {
      const productVariant = product.variants.find(v => v.weight === variant);
      if (!productVariant || !productVariant.isActive) {
        return {
          success: false,
          message: "Product variant not available",
          statusCode: 400
        };
      }
      price = productVariant.price;
      stock = productVariant.stock;
    }
    
    // Check stock
    if (stock < quantity) {
      return {
        success: false,
        message: "Insufficient stock",
        statusCode: 400
      };
    }
    
    await addToCart(userId, productId, variant, quantity, price);
    
    const cart = await getCartByUser(userId);
    const totals = cart.calculateTotals();
    
    return {
      success: true,
      message: "Item added to cart successfully",
      statusCode: 200,
      data: {
        ...cart.toObject(),
        totals
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

const updateCartItemService = async (req) => {
  try {
    const userId = req?.user?.id;
    const { itemId } = req?.params;
    const { quantity } = req?.body;
    
    if (!quantity || quantity < 0) {
      return {
        success: false,
        message: "Valid quantity is required",
        statusCode: 400
      };
    }
    
    await updateCartItem(userId, itemId, quantity);
    
    const cart = await getCartByUser(userId);
    const totals = cart.calculateTotals();
    
    return {
      success: true,
      message: "Cart item updated successfully",
      statusCode: 200,
      data: {
        ...cart.toObject(),
        totals
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

const removeFromCartService = async (req) => {
  try {
    const userId = req?.user?.id;
    const { itemId } = req?.params;
    
    await removeFromCart(userId, itemId);
    
    const cart = await getCartByUser(userId);
    const totals = cart.calculateTotals();
    
    return {
      success: true,
      message: "Item removed from cart successfully",
      statusCode: 200,
      data: {
        ...cart.toObject(),
        totals
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

const clearCartService = async (req) => {
  try {
    const userId = req?.user?.id;
    
    await clearCart(userId);
    
    return {
      success: true,
      message: "Cart cleared successfully",
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

const applyCouponService = async (req) => {
  try {
    const userId = req?.user?.id;
    const { code } = req?.body;
    
    if (!code) {
      return {
        success: false,
        message: "Coupon code is required",
        statusCode: 400
      };
    }
    
    const cart = await getCartByUser(userId);
    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Cart is empty",
        statusCode: 400
      };
    }
    
    // Calculate cart total
    const totals = cart.calculateTotals();
    
    // Validate coupon
    const validation = await validateCoupon(
      code,
      userId,
      totals.subtotal,
      cart.items
    );
    
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
        statusCode: 400
      };
    }
    
    await applyCouponToCart(userId, validation.coupon._id, validation.discount);
    
    const updatedCart = await getCartByUser(userId);
    const updatedTotals = updatedCart.calculateTotals();
    
    return {
      success: true,
      message: "Coupon applied successfully",
      statusCode: 200,
      data: {
        ...updatedCart.toObject(),
        totals: updatedTotals
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

const removeCouponService = async (req) => {
  try {
    const userId = req?.user?.id;
    
    await removeCouponFromCart(userId);
    
    const cart = await getCartByUser(userId);
    const totals = cart.calculateTotals();
    
    return {
      success: true,
      message: "Coupon removed successfully",
      statusCode: 200,
      data: {
        ...cart.toObject(),
        totals
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
  getCart,
  addToCartService,
  updateCartItemService,
  removeFromCartService,
  clearCartService,
  applyCouponService,
  removeCouponService
};

