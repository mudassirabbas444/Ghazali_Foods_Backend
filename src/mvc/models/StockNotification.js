import mongoose from "mongoose";

const stockNotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: String }, // Optional variant weight
    email: { type: String, required: true },
    isNotified: { type: Boolean, default: false },
    notifiedAt: { type: Date },
  },
  { timestamps: true }
);

// One notification per user per product/variant
stockNotificationSchema.index({ user: 1, product: 1, variant: 1 }, { unique: true });

export default mongoose.model("StockNotification", stockNotificationSchema);

