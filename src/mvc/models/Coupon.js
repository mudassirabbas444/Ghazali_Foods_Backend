import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true }, // Percentage or fixed amount
    minPurchaseAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number }, // For percentage discounts
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number }, // Total usage limit
    usageCount: { type: Number, default: 0 },
    userLimit: { type: Number, default: 1 }, // Per user usage limit
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: true }, // Show on website or private
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);

