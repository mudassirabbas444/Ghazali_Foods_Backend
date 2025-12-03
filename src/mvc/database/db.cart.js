import Cart from "../models/Cart.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

export const getCartByUser = async (userId) => {
  try {
    await ensureConnection();
    return await Cart.findOne({ user: userId })
      .populate('items.product', 'name slug images thumbnail basePrice variants')
      .populate('coupon', 'code discountType discountValue');
  } catch (error) {
    throw new Error("Error fetching cart: " + error.message);
  }
};

export const createCart = async (userId) => {
  try {
    await ensureConnection();
    const cart = new Cart({ user: userId, items: [] });
    return await cart.save();
  } catch (error) {
    throw new Error("Error creating cart: " + error.message);
  }
};

export const addToCart = async (userId, productId, variant, quantity, price) => {
  try {
    await ensureConnection();
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = await createCart(userId);
    }
    
    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId.toString() && item.variant === variant
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        variant: variant || null,
        quantity,
        price
      });
    }
    
    return await cart.save();
  } catch (error) {
    throw new Error("Error adding to cart: " + error.message);
  }
};

export const updateCartItem = async (userId, itemId, quantity) => {
  try {
    await ensureConnection();
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    const item = cart.items.id(itemId);
    if (!item) {
      throw new Error("Cart item not found");
    }
    
    if (quantity <= 0) {
      cart.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }
    
    return await cart.save();
  } catch (error) {
    throw new Error("Error updating cart item: " + error.message);
  }
};

export const removeFromCart = async (userId, itemId) => {
  try {
    await ensureConnection();
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    cart.items.pull(itemId);
    return await cart.save();
  } catch (error) {
    throw new Error("Error removing from cart: " + error.message);
  }
};

export const clearCart = async (userId) => {
  try {
    await ensureConnection();
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    cart.items = [];
    cart.coupon = null;
    cart.couponDiscount = 0;
    return await cart.save();
  } catch (error) {
    throw new Error("Error clearing cart: " + error.message);
  }
};

export const applyCouponToCart = async (userId, couponId, discountAmount) => {
  try {
    await ensureConnection();
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    cart.coupon = couponId;
    cart.couponDiscount = discountAmount;
    return await cart.save();
  } catch (error) {
    throw new Error("Error applying coupon: " + error.message);
  }
};

export const removeCouponFromCart = async (userId) => {
  try {
    await ensureConnection();
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    cart.coupon = null;
    cart.couponDiscount = 0;
    return await cart.save();
  } catch (error) {
    throw new Error("Error removing coupon: " + error.message);
  }
};

