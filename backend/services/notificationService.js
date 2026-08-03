const Notification = require("../models/notificationModel");
const socketService = require("./socketService");

class NotificationService {
  async createNotification({ recipientId, senderId, type, postId = null, commentText = "" }) {
    try {
      if (!recipientId || !senderId) return null;
      if (recipientId.toString() === senderId.toString()) return null; // don't notify self

      const notification = await Notification.create({
        recipientId,
        senderId,
        type,
        postId,
        commentText,
        read: false
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate("senderId", "_id username name")
        .populate("postId", "_id image caption")
        .lean();

      socketService.sendNotificationToUser(recipientId, populatedNotification);

      return populatedNotification;
    } catch (err) {
      console.error("Error creating notification:", err.message);
      return null;
    }
  }

  async getNotifications(recipientId) {
    const notifications = await Notification.find({ recipientId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("senderId", "_id username name")
      .populate("postId", "_id image caption")
      .lean();

    const unreadCount = await Notification.countDocuments({ recipientId, read: false });

    return {
      success: true,
      data: notifications,
      unreadCount
    };
  }

  async markAsRead(recipientId) {
    await Notification.updateMany({ recipientId, read: false }, { read: true });
    return {
      success: true,
      msg: "Notifications marked as read"
    };
  }
}

module.exports = new NotificationService();
