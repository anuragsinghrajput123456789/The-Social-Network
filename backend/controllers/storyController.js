const storyService = require("../services/storyService");

class StoryController {
  async uploadStory(req, res) {
    const userId = req.user.userId;
    const imageFileName = req.file ? req.file.filename : null;
    const result = await storyService.uploadStory(userId, imageFileName);
    return res.json(result);
  }

  async getFeedStories(req, res) {
    const userId = req.user.userId;
    const result = await storyService.getFeedStories(userId);
    return res.json(result);
  }

  async viewStory(req, res) {
    const userId = req.user.userId;
    const { storyId } = req.body;
    const result = await storyService.viewStory(userId, storyId);
    return res.json(result);
  }

  async reactStory(req, res) {
    const userId = req.user.userId;
    const { storyId, emoji } = req.body;
    const result = await storyService.reactStory(userId, storyId, emoji);
    return res.json(result);
  }
}

module.exports = new StoryController();
