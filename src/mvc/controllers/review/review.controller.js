import {
  getReviews,
  getUserReviewsService,
  createReviewService,
  updateReviewService,
  deleteReviewService,
  approveReviewService
} from "../../services/review/index.js";

const getReviewsController = async (req, res) => {
  try {
    const result = await getReviews(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getUserReviewsController = async (req, res) => {
  try {
    const result = await getUserReviewsService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createReviewController = async (req, res) => {
  try {
    const result = await createReviewService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateReviewController = async (req, res) => {
  try {
    const result = await updateReviewService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteReviewController = async (req, res) => {
  try {
    const result = await deleteReviewService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const approveReviewController = async (req, res) => {
  try {
    const result = await approveReviewService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getReviewsController,
  getUserReviewsController,
  createReviewController,
  updateReviewController,
  deleteReviewController,
  approveReviewController
};

