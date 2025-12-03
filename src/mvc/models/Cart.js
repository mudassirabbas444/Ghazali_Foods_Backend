import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variant: { type: String }, // Weight variant selected
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // Price at time of adding to cart
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    couponDiscount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Calculate totals
cartSchema.methods.calculateTotals = function() {
  let subtotal = 0;
  this.items.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  
  const discount = this.couponDiscount || 0;
  const total = subtotal - discount;
  
  return {
    subtotal,
    discount,
    total: Math.max(0, total)
  };
};

export default mongoose.model("Cart", cartSchema);

