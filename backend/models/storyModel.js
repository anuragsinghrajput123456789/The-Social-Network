const mongoose = require("mongoose");

const viewerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String },
  date: { type: Date, default: Date.now }
}, { _id: false });

const reactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  emoji: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { _id: false });

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  viewers: [viewerSchema],
  reactions: [reactionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically expire stories after 24 hours (86400 seconds)
  }
});

storySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Story", storySchema);
