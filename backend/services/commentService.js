const postModel = require("../models/postModel");
const userModel = require("../models/userModels");
const notificationService = require("./notificationService");

class CommentService {
  async addComment(currentUserId, postId, commentText) {
    if (!commentText || !commentText.trim()) {
      return { success: false, msg: "Comment text cannot be empty" };
    }

    const user = await userModel.findById(currentUserId);
    if (!user) {
      return { success: false, msg: "User not found" };
    }

    const post = await postModel.findById(postId);
    if (!post) {
      return { success: false, msg: "Post not found" };
    }

    const newComment = {
      userId: currentUserId,
      username: user.username,
      comment: commentText.trim()
    };

    post.comments.push(newComment);
    await post.save();

    const savedComment = post.comments[post.comments.length - 1];

    // Trigger notification
    await notificationService.createNotification({
      recipientId: post.uploadedBy,
      senderId: currentUserId,
      type: "comment",
      postId: post._id,
      commentText: commentText.trim()
    });

    return {
      success: true,
      msg: "Comment added successfully",
      comment: savedComment
    };
  }

  async deleteComment(currentUserId, postId, commentId) {
    const post = await postModel.findById(postId);
    if (!post) {
      return { success: false, msg: "Post not found" };
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return { success: false, msg: "Comment not found" };
    }

    const isCommentAuthor = comment.userId.toString() === currentUserId.toString();
    const isPostOwner = post.uploadedBy.toString() === currentUserId.toString();

    if (!isCommentAuthor && !isPostOwner) {
      return { success: false, msg: "Unauthorized" };
    }

    post.comments.pull(commentId);
    await post.save();

    return {
      success: true,
      msg: "Comment deleted successfully"
    };
  }

  async getComments(postId) {
    const post = await postModel.findById(postId);
    if (!post) {
      return { success: false, msg: "Post not found" };
    }

    return {
      success: true,
      comments: post.comments || []
    };
  }
}

module.exports = new CommentService();
