const userService = require("../services/userService");

class UserController {
  async getUserDetails(req, res) {
    const currentUserId = req.user.userId;
    const targetUserId = req.body.userId || currentUserId;
    const result = await userService.getUserDetails(currentUserId, targetUserId);
    return res.json(result);
  }

  async toggleFollow(req, res) {
    const currentUserId = req.user.userId;
    const { userId: targetUserId } = req.body;
    const result = await userService.toggleFollow(currentUserId, targetUserId);
    return res.json(result);
  }

  async acceptFollowRequest(req, res) {
    const currentUserId = req.user.userId;
    const { requesterId } = req.body;
    const result = await userService.acceptFollowRequest(currentUserId, requesterId);
    return res.json(result);
  }

  async createCollection(req, res) {
    const currentUserId = req.user.userId;
    const { name } = req.body;
    const result = await userService.createCollection(currentUserId, name);
    return res.json(result);
  }

  async getUserCollections(req, res) {
    const currentUserId = req.user.userId;
    const result = await userService.getUserCollections(currentUserId);
    return res.json(result);
  }

  async updateUserSettings(req, res) {
    const currentUserId = req.user.userId;
    const settingsData = req.body;
    const result = await userService.updateUserSettings(currentUserId, settingsData);
    return res.json(result);
  }

  async updateTheme(req, res) {
    const currentUserId = req.user.userId;
    const { theme } = req.body;
    const result = await userService.updateTheme(currentUserId, theme);
    return res.json(result);
  }

  async getSuggestedUsers(req, res) {
    const currentUserId = req.user.userId;
    const result = await userService.getSuggestedUsers(currentUserId);
    return res.json(result);
  }

  async getFollowersList(req, res) {
    const { userId: targetUserId } = req.body;
    const result = await userService.getFollowersList(targetUserId || req.user.userId);
    return res.json(result);
  }

  async getFollowingList(req, res) {
    const { userId: targetUserId } = req.body;
    const result = await userService.getFollowingList(targetUserId || req.user.userId);
    return res.json(result);
  }
}

module.exports = new UserController();
