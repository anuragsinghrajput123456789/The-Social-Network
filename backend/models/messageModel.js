const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    emoji: { type: String, required: true }
}, { _id: false });

const replyToSchema = new mongoose.Schema({
    messageId: { type: String },
    text: { type: String, default: "" },
    senderUsername: { type: String, default: "" }
}, { _id: false });

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
        index: true
    },
    receiverId: {
        type: String,
        required: true,
        index: true
    },
    message: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: null
    },
    sharedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "seen"],
        default: "sent"
    },
    reactions: [reactionSchema],
    replyTo: replyToSchema,
    deletedFor: [{ type: String }],
    isDeletedForEveryone: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
