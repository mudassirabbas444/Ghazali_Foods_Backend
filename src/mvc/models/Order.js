import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true },
  variant: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // Price at time of order
  total: { type: Number, required: true },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Shipping details
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      area: { type: String },
      postalCode: { type: String },
      landmark: { type: String },
    },
    
    // Order items
    items: [orderItemSchema],
    
    // Pricing
    subtotal: { type: Number, required: true },
    deliveryCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null },
    total: { type: Number, required: true },
    
    // Payment
    paymentMethod: { type: String, enum: ["cod", "card", "wallet", "jazzcash", "easypaisa"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paymentId: { type: String },
    
    // Order status
    status: { 
      type: String, 
      enum: ["pending", "processing", "packed", "out_for_delivery", "delivered", "cancelled", "returned"],
      default: "pending" 
    },
    
    // Tracking
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    
    // Admin notes
    adminNotes: { type: String },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ["user", "admin"], default: null },
    
    // Delivery
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Delivery boy
  },
  { timestamps: true }
);

// Generate order number
orderSchema.pre("save", async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  next();
});

// Ensure orderNumber is set before validation
orderSchema.pre("validate", function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  next();
});

export default mongoose.model("Order", orderSchema);

