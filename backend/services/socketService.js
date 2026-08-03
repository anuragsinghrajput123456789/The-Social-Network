const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("../models/chatModel");
const userModel = require("../models/userModels");
const env = require("../config/env");

class SocketService {
  constructor() {
    this.io = null;
    this.userSocketMap = new Map(); // userId -> socketId
  }

  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Socket JWT Authentication Middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        // Fallback to allow initial connection if token isn't attached yet
        return next();
      }
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        return next(new Error("Socket Auth Error: Invalid token"));
      }
    });

    this.io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("registerUser", (userId) => {
        if (userId) {
          this.userSocketMap.set(userId.toString(), socket.id);
          console.log(`User ${userId} registered with socket ${socket.id}`);
          this.io.emit("onlineUsers", Array.from(this.userSocketMap.keys()));
        }
      });

      socket.on("sendMessage", async (data) => {
        const { senderId, receiverId, message, image, sharedPost, replyTo } = data;
        try {
          if (!senderId || !receiverId) return;

          const isReceiverOnline = this.userSocketMap.has(receiverId.toString());
          const initialStatus = isReceiverOnline ? "delivered" : "sent";

          const newMessage = await Message.create({
            senderId,
            receiverId,
            message: message || "",
            image: image || null,
            sharedPost: sharedPost || null,
            status: initialStatus,
            replyTo: replyTo || null
          });

          let populatedMessage = await Message.findById(newMessage._id)
            .populate({ path: "sharedPost", model: "post" })
            .lean();

          const receiverSocketId = this.userSocketMap.get(receiverId.toString());
          if (receiverSocketId) {
            this.io.to(receiverSocketId).emit("receiveMessage", populatedMessage);
          }

          socket.emit("receiveMessage", populatedMessage);
        } catch (err) {
          console.error("Socket error processing message:", err.message);
        }
      });

      socket.on("markSeen", async (data) => {
        const { senderId, receiverId } = data; // messages sent by senderId to receiverId (current user)
        try {
          if (!senderId || !receiverId) return;

          await Message.updateMany(
            { senderId, receiverId, status: { $ne: "seen" } },
            { status: "seen" }
          );

          const senderSocketId = this.userSocketMap.get(senderId.toString());
          if (senderSocketId) {
            this.io.to(senderSocketId).emit("messagesSeen", { senderId, receiverId });
          }
          socket.emit("messagesSeen", { senderId, receiverId });
        } catch (err) {
          console.error("Socket error on markSeen:", err.message);
        }
      });

      socket.on("reactMessage", async (data) => {
        const { messageId, userId, emoji } = data;
        try {
          const message = await Message.findById(messageId);
          if (!message) return;

          const existingIndex = message.reactions.findIndex(
            (r) => r.userId.toString() === userId.toString()
          );

          if (existingIndex > -1) {
            if (message.reactions[existingIndex].emoji === emoji) {
              message.reactions.splice(existingIndex, 1);
            } else {
              message.reactions[existingIndex].emoji = emoji;
            }
          } else {
            message.reactions.push({ userId, emoji });
          }

          await message.save();

          const updatedMsg = await Message.findById(messageId)
            .populate({ path: "sharedPost", model: "post" })
            .lean();

          const senderSocket = this.userSocketMap.get(message.senderId.toString());
          const receiverSocket = this.userSocketMap.get(message.receiverId.toString());

          if (senderSocket) this.io.to(senderSocket).emit("messageUpdated", updatedMsg);
          if (receiverSocket) this.io.to(receiverSocket).emit("messageUpdated", updatedMsg);
        } catch (err) {
          console.error("Socket error on reactMessage:", err.message);
        }
      });

      socket.on("deleteMessage", async (data) => {
        const { messageId, userId, deleteType } = data; // 'me' | 'everyone'
        try {
          const message = await Message.findById(messageId);
          if (!message) return;

          if (deleteType === "everyone" && message.senderId.toString() === userId.toString()) {
            message.isDeletedForEveryone = true;
            message.message = "This message was deleted";
            message.image = null;
            await message.save();
          } else {
            if (!message.deletedFor.includes(userId)) {
              message.deletedFor.push(userId);
              await message.save();
            }
          }

          const updatedMsg = await Message.findById(messageId)
            .populate({ path: "sharedPost", model: "post" })
            .lean();

          const senderSocket = this.userSocketMap.get(message.senderId.toString());
          const receiverSocket = this.userSocketMap.get(message.receiverId.toString());

          if (senderSocket) this.io.to(senderSocket).emit("messageUpdated", updatedMsg);
          if (receiverSocket) this.io.to(receiverSocket).emit("messageUpdated", updatedMsg);
        } catch (err) {
          console.error("Socket error on deleteMessage:", err.message);
        }
      });

      socket.on("typing", (data) => {
        const { receiverId } = data;
        if (!receiverId) return;
        const receiverSocketId = this.userSocketMap.get(receiverId.toString());
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit("typing", data);
        }
      });

      socket.on("disconnect", async () => {
        console.log("A user disconnected:", socket.id);
        for (const [userId, socketId] of this.userSocketMap.entries()) {
          if (socketId === socket.id) {
            this.userSocketMap.delete(userId);
            console.log(`User ${userId} unregistered`);
            try {
              await userModel.findByIdAndUpdate(userId, { lastSeen: new Date() });
            } catch (e) {
              console.error("Error updating lastSeen on disconnect:", e.message);
            }
            break;
          }
        }
        this.io.emit("onlineUsers", Array.from(this.userSocketMap.keys()));
      });
    });

    return this.io;
  }

  sendNotificationToUser(recipientId, notification) {
    if (!this.io || !recipientId) return;
    const socketId = this.userSocketMap.get(recipientId.toString());
    if (socketId) {
      this.io.to(socketId).emit("newNotification", notification);
    }
  }
}

module.exports = new SocketService();
