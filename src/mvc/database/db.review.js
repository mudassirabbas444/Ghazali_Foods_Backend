import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

export const createReview = async (reviewData) => {
  try {
    await ensureConnection();
    const review = new Review(reviewData);
    const savedReview = await review.save();
    
    // Update product rating
    await updateProductRating(reviewData.product);
    
    return savedReview;
  } catch (error) {
    throw new Error("Error creating review: " + error.message);
  }
};

export const getReviewById = async (reviewId) => {
  try {
    await ensureConnection();
    return await Review.findById(reviewId)
      .populate('user', 'fullName avatar')
      .populate('product', 'name images');
  } catch (error) {
    throw new Error("Error fetching review: " + error.message);
  }
};

export const getProductReviews = async (productId, options = {}) => {
  try {
    await ensureConnection();
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = { product: productId, isApproved: true };
    
    if (options.rating) {
      query.rating = options.rating;
    }
    
    const reviews = await Review.find(query)
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Review.countDocuments(query);
    
    return {
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    throw new Error("Error fetching product reviews: " + error.message);
  }
};

export const getUserReviews = async (userId) => {
  try {
    await ensureConnection();
    return await Review.find({ user: userId })
      .populate('product', 'name images thumbnail')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Error fetching user reviews: " + error.message);
  }
};

export const getReviewByOrder = async (orderId) => {
  try {
    await ensureConnection();
    return await Review.findOne({ order: orderId });
  } catch (error) {
    throw new Error("Error fetching review by order: " + error.message);
  }
};

export const getReviewByUserAndProduct = async (userId, productId) => {
  try {
    await ensureConnection();
    return await Review.findOne({ 
      user: userId, 
      product: productId,
      order: null // Only get reviews without order (legacy reviews)
    });
  } catch (error) {
    throw new Error("Error fetching review by user and product: " + error.message);
  }
};

export const updateReview = async (reviewId, updateData) => {
  try {
    await ensureConnection();
    const review = await Review.findByIdAndUpdate(reviewId, updateData, { new: true });
    if (!review) {
      throw new Error("Review not found");
    }
    
    // Update product rating if rating changed
    if (updateData.rating) {
      await updateProductRating(review.product);
    }
    
    return review;
  } catch (error) {
    throw new Error("Error updating review: " + error.message);
  }
};

export const deleteReview = async (reviewId) => {
  try {
    await ensureConnection();
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }
    
    // Update product rating
    await updateProductRating(review.product);
    
    return review;
  } catch (error) {
    throw new Error("Error deleting review: " + error.message);
  }
};

export const approveReview = async (reviewId) => {
  try {
    await ensureConnection();
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isApproved: true },
      { new: true }
    );
    
    if (review) {
      await updateProductRating(review.product);
    }
    
    return review;
  } catch (error) {
    throw new Error("Error approving review: " + error.message);
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ 
      product: productId, 
      isApproved: true 
    });
    
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        totalReviews: 0
      });
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};

