import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true }, // Short description for listing
    featuredImage: { type: String }, // Main image URL
    author: { type: String, default: "Admin" },
    category: { type: String }, // Blog category (e.g., "Health", "Recipes", "News")
    tags: [{ type: String }], // Array of tags
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    metaTitle: { type: String }, // SEO meta title
    metaDescription: { type: String }, // SEO meta description
  },
  { timestamps: true }
);

// Generate slug from title before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.model("Blog", blogSchema);

