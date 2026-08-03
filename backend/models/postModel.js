const mongoose = require("mongoose");

const likesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const commentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        required: true
    },
    likes: [likesSchema],
    comments: [commentSchema],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

postSchema.index({ createdAt: -1 });
postSchema.index({ uploadedBy: 1, createdAt: -1 });

module.exports = mongoose.model("post", postSchema);