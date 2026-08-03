const postService = require("../services/postService");

class PostController {
  async createPost(req, res) {
    const currentUserId = req.user.userId;
    const { caption } = req.body;
    const imageFileName = req.file ? req.file.filename : null;

    const result = await postService.createPost({
      caption,
      imageFileName,
      currentUserId
    });
    return res.json(result);
  }

  async getPosts(req, res) {
    const currentUserId = req.user.userId;
    const { page, limit } = req.body;
    const result = await postService.getPosts(currentUserId, page, limit);
    return res.json(result);
  }

  async getMyPosts(req, res) {
    const targetUserId = req.body.userId || req.user.userId;
    const result = await postService.getMyPosts(targetUserId);
    return res.json(result);
  }

  async toggleLike(req, res) {
    const currentUserId = req.user.userId;
    const { postId } = req.body;
    const result = await postService.toggleLike(currentUserId, postId);
    return res.json(result);
  }

  async toggleSavePost(req, res) {
    const currentUserId = req.user.userId;
    const { postId } = req.body;
    const result = await postService.toggleSavePost(currentUserId, postId);
    return res.json(result);
  }

  async getSavedPosts(req, res) {
    const currentUserId = req.user.userId;
    const result = await postService.getSavedPosts(currentUserId);
    return res.json(result);
  }

  async incrementPostView(req, res) {
    const { postId } = req.body;
    const result = await postService.incrementPostView(postId);
    return res.json(result);
  }

  async getPostAnalytics(req, res) {
    const { postId } = req.body;
    const result = await postService.getPostAnalytics(postId);
    return res.json(result);
  }

  async editPost(req, res) {
    const currentUserId = req.user.userId;
    const { postId, caption } = req.body;
    const result = await postService.editPost(currentUserId, postId, caption);
    return res.json(result);
  }

  async deletePost(req, res) {
    const currentUserId = req.user.userId;
    const { postId } = req.body;
    const result = await postService.deletePost(currentUserId, postId);
    return res.json(result);
  }
}

module.exports = new PostController();
