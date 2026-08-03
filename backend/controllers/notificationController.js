const notificationService = require("../services/notificationService");

class NotificationController {
  async getNotifications(req, res) {
    const currentUserId = req.user.userId;
    const result = await notificationService.getNotifications(currentUserId);
    return res.json(result);
  }

  async markAsRead(req, res) {
    const currentUserId = req.user.userId;
    const result = await notificationService.markAsRead(currentUserId);
    return res.json(result);
  }
}

module.exports = new NotificationController();
