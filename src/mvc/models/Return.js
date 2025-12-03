import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema({
  orderItem: { type: mongoose.Schema.Types.ObjectId, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, required: true },
});

const returnSchema = new mongoose.Schema(
  {
    returnNumber: { type: String, required: true, unique: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [returnItemSchema],
    reason: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected", "processing", "completed", "cancelled"],
      default: "pending" 
    },
    refundAmount: { type: Number, default: 0 },
    refundMethod: { type: String, enum: ["original", "wallet", "bank"], default: "original" },
    adminNotes: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

// Generate return number
returnSchema.pre("save", async function(next) {
  if (!this.returnNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    this.returnNumber = `RET${timestamp}${random}`;
  }
  next();
});

export default mongoose.model("Return", returnSchema);

