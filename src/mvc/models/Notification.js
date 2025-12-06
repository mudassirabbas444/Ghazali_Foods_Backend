import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    
    // Notification content
    type: { 
      type: String, 
      enum: ["success", "error", "warning", "info"], 
      required: true 
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    
    // Notification metadata
    priority: { 
      type: String, 
      enum: ["critical", "high", "normal"], 
      default: "normal",
      index: true 
    },
    category: { type: String, trim: true }, // e.g., "Order", "Product", "System"
    
    // Status
    read: { type: Boolean, default: false, index: true },
    isAdmin: { type: Boolean, default: false, index: true },
    
    // Action buttons (stored as JSON)
    actions: [{
      label: { type: String, required: true },
      onClick: { type: String }, // URL or action identifier
      primary: { type: Boolean, default: false },
      dismiss: { type: Boolean, default: true },
    }],
    
    // Related entities (optional)
    relatedEntity: {
      type: { type: String }, // "order", "product", "review", etc.
      id: { type: mongoose.Schema.Types.ObjectId },
    },
    
    // Expiration
    expiresAt: { type: Date, index: true },
    
    // Auto-dismiss settings
    persist: { type: Boolean, default: false }, // Don't auto-dismiss
    duration: { type: Number, default: 5000 }, // Auto-dismiss duration in ms
  },
  { timestamps: true }
);

// Indexes for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isAdmin: 1, createdAt: -1 });
notificationSchema.index({ user: 1, priority: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

// Virtual for unread count
notificationSchema.virtual('unreadCount').get(function() {
  return this.read === false ? 1 : 0;
});

export default mongoose.model("Notification", notificationSchema);

