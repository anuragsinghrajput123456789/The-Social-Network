const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["like", "comment", "follow", "share", "message"],
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  },
  commentText: {
    type: String,
    default: ""
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
