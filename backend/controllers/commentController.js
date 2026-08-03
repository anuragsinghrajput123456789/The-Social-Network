const commentService = require("../services/commentService");

class CommentController {
  async addComment(req, res) {
    const currentUserId = req.user.userId;
    const { postId, comment } = req.body;
    const result = await commentService.addComment(currentUserId, postId, comment);
    return res.json(result);
  }

  async deleteComment(req, res) {
    const currentUserId = req.user.userId;
    const { postId, commentId } = req.body;
    const result = await commentService.deleteComment(currentUserId, postId, commentId);
    return res.json(result);
  }

  async getComments(req, res) {
    const { postId } = req.body;
    const result = await commentService.getComments(postId);
    return res.json(result);
  }
}

module.exports = new CommentController();
