import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    image: { type: String, required: true },
    link: { type: String }, // URL to redirect
    linkType: { type: String, enum: ["product", "category", "external", "none"], default: "none" },
    linkId: { type: mongoose.Schema.Types.ObjectId }, // Product or Category ID
    position: { type: String, enum: ["home_slider", "home_banner", "category_banner", "sidebar"], default: "home_slider" },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);

