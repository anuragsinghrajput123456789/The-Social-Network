const chatService = require("../services/chatService");

class ChatController {
  async getChatMessages(req, res) {
    const currentUserId = req.user.userId;
    const { otherUserId, page, limit } = req.body;
    const result = await chatService.getChatMessages(currentUserId, otherUserId, page, limit);
    return res.json(result);
  }

  async getChatList(req, res) {
    const currentUserId = req.user.userId;
    const result = await chatService.getChatList(currentUserId);
    return res.json(result);
  }

  async sendMessage(req, res) {
    const currentUserId = req.user.userId;
    const { receiverId, message, sharedPostId, replyTo } = req.body;
    const imageFileName = req.file ? req.file.filename : null;

    const result = await chatService.sendMessage(
      currentUserId,
      receiverId,
      message,
      imageFileName,
      sharedPostId,
      replyTo
    );
    return res.json(result);
  }

  async searchMessages(req, res) {
    const currentUserId = req.user.userId;
    const { otherUserId, query } = req.body;
    const result = await chatService.searchMessages(currentUserId, otherUserId, query);
    return res.json(result);
  }
}

module.exports = new ChatController();
