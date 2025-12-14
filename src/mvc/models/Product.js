import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema({
  weight: { type: String, required: true }, // e.g., "250g", "500g", "1kg"
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  sku: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    
    // Product variants (different weights/prices)
    variants: [productVariantSchema],
    
    // Images
    images: { type: [String], default: [] }, // Array of image URLs
    thumbnail: { type: String },
    
    // Pricing (base price - can be overridden by variants)
    basePrice: { type: Number, required: true },
    compareAtPrice: { type: Number }, // Original price for showing discount
    discount: { type: Number, default: 0 }, // Discount percentage
    
    // Stock
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    trackInventory: { type: Boolean, default: true },
    
    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    tags: [{ type: String }],
    
    // Status
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    
    // Ratings
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    
    // Additional info
    brand: { type: String },
    origin: { type: String },
    expiryDate: { type: Date },
    nutritionalInfo: { type: mongoose.Schema.Types.Mixed },
    
    // Display order
    displayOrder: { type: Number, default: 0 },
    
    // View tracking
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isBestSeller: 1, isActive: 1 });
productSchema.index({ isNewArrival: 1, isActive: 1 });

export default mongoose.model("Product", productSchema);

