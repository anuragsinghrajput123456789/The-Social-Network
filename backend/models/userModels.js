const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema({
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

const collectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }]
}, { timestamps: true });

const settingsSchema = new mongoose.Schema({
    pushNotifications: { type: Boolean, default: true },
    likeNotifications: { type: Boolean, default: true },
    commentNotifications: { type: Boolean, default: true },
    messageNotifications: { type: Boolean, default: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    followers: [followerSchema],
    following: [followerSchema],
    followRequests: [followerSchema],
    isPrivate: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    },
    theme: {
        type: String,
        default: "dark"
    },
    savedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    }],
    collections: [collectionSchema],
    settings: {
        type: settingsSchema,
        default: () => ({})
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

userSchema.index({ "followers.userId": 1 });
userSchema.index({ "following.userId": 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);