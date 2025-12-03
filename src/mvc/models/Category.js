import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    image: { type: String, default: null },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);

