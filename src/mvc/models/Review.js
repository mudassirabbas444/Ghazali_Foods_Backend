import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, trim: true },
    images: [{ type: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false }, // Admin approval
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One review per order (if order is provided)
reviewSchema.index({ order: 1 }, { unique: true, sparse: true });
// One review per user per product (if no order)
reviewSchema.index({ user: 1, product: 1 }, { unique: true, partialFilterExpression: { order: null } });

export default mongoose.model("Review", reviewSchema);

