import {
  createReview,
  getReviewById,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  approveReview,
  getReviewByOrder,
  getReviewByUserAndProduct,
  getAllReviews
} from "../../database/db.review.js";

const getReviews = async (req) => {
  try {
    const { productId } = req?.params;
    const options = {
      page: req?.query?.page || 1,
      limit: req?.query?.limit || 10,
      rating: req?.query?.rating ? parseInt(req.query.rating) : undefined
    };
    
    const result = await getProductReviews(productId, options);
    
    return {
      success: true,
      message: "Reviews fetched successfully",
      statusCode: 200,
      reviews: result.reviews || [],
      total: result.total || 0,
      page: result.page || 1,
      pages: result.pages || 1,
      data: result // Keep for backward compatibility
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getUserReviewsService = async (req) => {
  try {
    const userId = req?.user?.id;
    
    const reviews = await getUserReviews(userId);
    
    return {
      success: true,
      message: "User reviews fetched successfully",
      statusCode: 200,
      reviews: reviews
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const createReviewService = async (req) => {
  try {
    const userId = req?.user?.id;
    // Handle both JSON and FormData
    const productId = req?.body?.productId || req?.body?.product;
    const rating = req?.body?.rating ? parseInt(req?.body?.rating) : null;
    const title = req?.body?.title;
    const comment = req?.body?.comment;
    const orderId = req?.body?.orderId || req?.body?.order;
    
    if (!productId || !rating) {
      return {
        success: false,
        message: "Product ID and rating are required",
        statusCode: 400
      };
    }
    
    if (rating < 1 || rating > 5) {
      return {
        success: false,
        message: "Rating must be between 1 and 5",
        statusCode: 400
      };
    }
    
    // Validate order if provided
    if (orderId) {
      const Order = (await import("../../models/Order.js")).default;
      const order = await Order.findById(orderId)
        .populate('items.product');
      
      if (!order) {
        return {
          success: false,
          message: "Order not found",
          statusCode: 404
        };
      }
      
      // Check if order belongs to user
      if (order.user.toString() !== userId) {
        return {
          success: false,
          message: "Unauthorized: This order does not belong to you",
          statusCode: 403
        };
      }
      
      // Check if order is delivered
      if (order.status !== 'delivered') {
        return {
          success: false,
          message: "You can only review products from delivered orders",
          statusCode: 400
        };
      }
      
      // Check if product is in the order
      const productInOrder = order.items.some(item => {
        const itemProductId = item.product?._id?.toString() || item.product?.toString() || item.product;
        return itemProductId === productId;
      });
      
      if (!productInOrder) {
        return {
          success: false,
          message: "This product is not in the selected order",
          statusCode: 400
        };
      }
      
      // Check if review already exists for this order and product combination
      const existingReviewForOrder = await Review.findOne({ 
        order: orderId,
        product: productId 
      });
      if (existingReviewForOrder) {
        return {
          success: false,
          message: "You have already reviewed this product for this order",
          statusCode: 400
        };
      }
    } else {
      // If no order provided, require that user has at least one delivered order with this product
      const Order = (await import("../../models/Order.js")).default;
      const deliveredOrders = await Order.find({
        user: userId,
        status: 'delivered'
      }).populate('items.product');
      
      // Check if any order contains this product
      const hasProductInOrder = deliveredOrders.some(order =>
        order.items.some(item => {
          const itemProductId = item.product?._id?.toString() || item.product?.toString() || item.product;
          return itemProductId === productId;
        })
      );
      
      if (!hasProductInOrder) {
        return {
          success: false,
          message: "You can only review products you have purchased and received. Please select an order or ensure you have a delivered order with this product.",
          statusCode: 400
        };
      }
      
      // Check if review already exists for this user and product (without order)
      const existingReview = await getReviewByUserAndProduct(userId, productId);
      if (existingReview) {
        return {
          success: false,
          message: "You have already reviewed this product",
          statusCode: 400
        };
      }
    }
    
    // Handle image uploads if provided
    let images = [];
    if (req?.files && req.files.length > 0) {
      const { uploadMultipleImages } = await import("../../../services/uploadService.js");
      const uploadResult = await uploadMultipleImages(
        req.files,
        'reviews',
        userId
      );
      images = uploadResult.images.map(img => img.url);
    }
    
    const reviewData = {
      user: userId,
      product: productId,
      order: orderId || null,
      rating,
      title: title || null,
      comment: comment || null,
      images,
      isVerifiedPurchase: !!orderId
    };
    
    const review = await createReview(reviewData);
    
    return {
      success: true,
      message: "Review created successfully",
      statusCode: 201,
      data: review
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const updateReviewService = async (req) => {
  try {
    const { id } = req?.params;
    const userId = req?.user?.id;
    const updateData = { ...req?.body };
    
    const review = await getReviewById(id);
    if (!review) {
      return {
        success: false,
        message: "Review not found",
        statusCode: 404
      };
    }
    
    // Check ownership
    if (review.user.toString() !== userId && !req.user.isAdmin) {
      return {
        success: false,
        message: "Unauthorized",
        statusCode: 403
      };
    }
    
    // Handle image uploads if provided
    if (req?.files && req.files.length > 0) {
      const { uploadMultipleImages } = await import("../../../services/uploadService.js");
      const uploadResult = await uploadMultipleImages(
        req.files,
        'reviews',
        userId
      );
      updateData.images = [...(review.images || []), ...uploadResult.images.map(img => img.url)];
    }
    
    const updatedReview = await updateReview(id, updateData);
    
    return {
      success: true,
      message: "Review updated successfully",
      statusCode: 200,
      data: updatedReview
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const deleteReviewService = async (req) => {
  try {
    const { id } = req?.params;
    const userId = req?.user?.id;
    
    const review = await getReviewById(id);
    if (!review) {
      return {
        success: false,
        message: "Review not found",
        statusCode: 404
      };
    }
    
    // Check ownership
    if (review.user.toString() !== userId && !req.user.isAdmin) {
      return {
        success: false,
        message: "Unauthorized",
        statusCode: 403
      };
    }
    
    await deleteReview(id);
    
    return {
      success: true,
      message: "Review deleted successfully",
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

const approveReviewService = async (req) => {
  try {
    const { id } = req?.params;
    
    const review = await approveReview(id);
    
    return {
      success: true,
      message: "Review approved successfully",
      statusCode: 200,
      data: review
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getAllReviewsService = async (req) => {
  try {
    const options = {
      page: req?.query?.page || 1,
      limit: req?.query?.limit || 20,
      isApproved: req?.query?.isApproved !== undefined ? req.query.isApproved === 'true' : undefined,
      rating: req?.query?.rating ? parseInt(req.query.rating) : undefined,
      search: req?.query?.search || ''
    };
    
    const result = await getAllReviews(options);
    
    return {
      success: true,
      message: "Reviews fetched successfully",
      statusCode: 200,
      reviews: result.reviews || [],
      total: result.total || 0,
      page: result.page || 1,
      pages: result.pages || 1,
      data: result // Keep for backward compatibility
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
  getReviews,
  getUserReviewsService,
  createReviewService,
  updateReviewService,
  deleteReviewService,
  approveReviewService,
  getAllReviewsService
};

