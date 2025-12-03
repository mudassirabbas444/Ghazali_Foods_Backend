import mongoose from "mongoose";

const productQuestionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, trim: true },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin/Seller
    answeredAt: { type: Date },
    isApproved: { type: Boolean, default: false }, // For moderation
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("ProductQuestion", productQuestionSchema);

