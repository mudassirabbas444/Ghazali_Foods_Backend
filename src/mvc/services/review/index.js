import reviewServices from "./review-services.js";

export const {
  getReviews,
  getUserReviewsService,
  createReviewService,
  updateReviewService,
  deleteReviewService,
  approveReviewService,
  getAllReviewsService
} = reviewServices;

