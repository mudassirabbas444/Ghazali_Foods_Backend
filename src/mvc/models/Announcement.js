import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    link: { type: String }, // Optional link to redirect
    backgroundColor: { type: String, default: "#22c55e" }, // Green color by default
    textColor: { type: String, default: "#ffffff" }, // White text by default
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);

