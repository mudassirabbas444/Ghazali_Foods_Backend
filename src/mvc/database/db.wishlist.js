import Wishlist from "../models/Wishlist.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

export const getWishlistByUser = async (userId) => {
  try {
    await ensureConnection();
    return await Wishlist.findOne({ user: userId })
      .populate('products', 'name slug images thumbnail basePrice variants discount compareAtPrice shortDescription description isActive');
  } catch (error) {
    throw new Error("Error fetching wishlist: " + error.message);
  }
};

export const createWishlist = async (userId) => {
  try {
    await ensureConnection();
    const wishlist = new Wishlist({ user: userId, products: [] });
    return await wishlist.save();
  } catch (error) {
    throw new Error("Error creating wishlist: " + error.message);
  }
};

export const addToWishlist = async (userId, productId) => {
  try {
    await ensureConnection();
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = await createWishlist(userId);
    }
    
    // Check if product already in wishlist
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
    
    return wishlist;
  } catch (error) {
    throw new Error("Error adding to wishlist: " + error.message);
  }
};

export const removeFromWishlist = async (userId, productId) => {
  try {
    await ensureConnection();
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }
    
    wishlist.products = wishlist.products.filter(
      id => id.toString() !== productId.toString()
    );
    return await wishlist.save();
  } catch (error) {
    throw new Error("Error removing from wishlist: " + error.message);
  }
};

export const isInWishlist = async (userId, productId) => {
  try {
    await ensureConnection();
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return false;
    }
    return wishlist.products.some(id => id.toString() === productId.toString());
  } catch (error) {
    throw new Error("Error checking wishlist: " + error.message);
  }
};

