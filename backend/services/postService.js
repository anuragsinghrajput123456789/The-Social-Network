const postModel = require("../models/postModel");
const userModel = require("../models/userModels");
const notificationService = require("./notificationService");
const fs = require("fs");
const path = require("path");

class PostService {
  async createPost({ caption, imageFileName, currentUserId }) {
    if (!imageFileName) {
      throw new Error("Image file is required");
    }

    const post = await postModel.create({
      caption: caption || "",
      image: imageFileName,
      uploadedBy: currentUserId,
      likes: []
    });

    return {
      success: true,
      msg: "Post created successfully",
      postId: post._id,
      date: post.date
    };
  }

  async getPosts(currentUserId, page = 1, limit = 10) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const currentUser = await userModel.findById(currentUserId).lean();
    const savedSet = new Set((currentUser?.savedPosts || []).map((id) => id.toString()));

    const posts = await postModel
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("uploadedBy", "_id username date followers")
      .lean();

    const fullData = posts.map((post) => {
      const postUser = post.uploadedBy || {};
      const likes = post.likes || [];
      const followers = postUser.followers || [];

      const isYouLiked = likes.some(
        (like) => like.userId && like.userId.toString() === currentUserId.toString()
      );
      const isYouFollowed = Array.isArray(followers)
        ? followers.some(
            (follower) => follower.userId && follower.userId.toString() === currentUserId.toString()
          )
        : false;
      const isYouSaved = savedSet.has(post._id.toString());

      return {
        post: {
          _id: post._id,
          caption: post.caption,
          likes: likes.length,
          commentsCount: post.comments ? post.comments.length : 0,
          image: post.image,
          createdAt: post.createdAt || post.date,
          isYouLiked,
          isYouSaved
        },
        user: {
          _id: postUser._id,
          username: postUser.username || "Unknown",
          followers: followers.length,
          joinedAt: postUser.date,
          isYouFollowed,
          isYoufollowed: isYouFollowed
        }
      };
    });

    const totalPosts = await postModel.countDocuments();

    return {
      success: true,
      msg: "Posts fetched successfully",
      data: fullData,
      hasMore: skip + posts.length < totalPosts
    };
  }

  async getMyPosts(targetUserId) {
    const otherUser = await userModel.findById(targetUserId).lean();
    if (!otherUser) {
      return { success: false, msg: "Other user not found !" };
    }

    const posts = await postModel
      .find({ uploadedBy: targetUserId })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      msg: "Posts fetched successfully",
      data: posts
    };
  }

  async toggleLike(currentUserId, postId) {
    const post = await postModel.findById(postId);
    if (!post) {
      return { success: false, msg: "Post not found" };
    }

    const alreadyLiked = post.likes.some(
      (like) => like.userId.toString() === currentUserId.toString()
    );

    if (alreadyLiked) {
      post.likes.pull({ userId: currentUserId });
      await post.save();
      return {
        success: true,
        msg: "Post unliked successfully",
        action: "dislike"
      };
    } else {
      post.likes.push({ userId: currentUserId });
      await post.save();
      await notificationService.createNotification({
        recipientId: post.uploadedBy,
        senderId: currentUserId,
        type: "like",
        postId: post._id
      });
      return {
        success: true,
        msg: "Post liked successfully",
        action: "like"
      };
    }
  }

  async toggleSavePost(currentUserId, postId) {
    const user = await userModel.findById(currentUserId);
    if (!user) {
      return { success: false, msg: "User not found" };
    }

    const savedPosts = user.savedPosts || [];
    const isSaved = savedPosts.some((id) => id.toString() === postId.toString());

    if (isSaved) {
      user.savedPosts.pull(postId);
      await user.save();
      return { success: true, msg: "Post removed from saved", action: "unsave" };
    } else {
      user.savedPosts.push(postId);
      await user.save();
      return { success: true, msg: "Post saved successfully", action: "save" };
    }
  }

  async getSavedPosts(currentUserId) {
    const user = await userModel.findById(currentUserId).populate({
      path: "savedPosts",
      populate: { path: "uploadedBy", select: "_id username date followers" }
    }).lean();

    if (!user) {
      return { success: false, msg: "User not found" };
    }

    const validSavedPosts = (user.savedPosts || []).filter(Boolean);

    const posts = validSavedPosts.map((post) => {
      const postUser = post.uploadedBy || {};
      const likes = post.likes || [];
      const followers = postUser.followers || [];

      const isYouLiked = likes.some(
        (like) => like.userId && like.userId.toString() === currentUserId.toString()
      );

      return {
        post: {
          _id: post._id,
          caption: post.caption,
          likes: likes ? likes.length : 0,
          commentsCount: post.comments ? post.comments.length : 0,
          image: post.image,
          createdAt: post.createdAt || post.date,
          isYouLiked,
          isYouSaved: true
        },
        user: {
          _id: postUser._id,
          username: postUser.username || "Unknown",
          followers: followers ? followers.length : 0,
          joinedAt: postUser.date,
          isYouFollowed: true
        }
      };
    });

    return {
      success: true,
      data: posts
    };
  }

  async editPost(currentUserId, postId, caption) {
    const post = await postModel.findById(postId);
    if (!post) {
      return { success: false, msg: "Post not found" };
    }

    if (post.uploadedBy.toString() !== currentUserId.toString()) {
      return { success: false, msg: "Unauthorized" };
    }

    post.caption = caption;
    await post.save();

    return {
      success: true,
      msg: "Post updated successfully",
      caption
    };
  }

  async deletePost(currentUserId, postId) {
    const post = await postModel.findById(postId);
    if (!post) {
      return { success: false, msg: "Post not found" };
    }

    if (post.uploadedBy.toString() !== currentUserId.toString()) {
      return { success: false, msg: "Unauthorized" };
    }

    await postModel.findByIdAndDelete(postId);

    if (post.image) {
      const filePath = path.join(__dirname, "../uploads", post.image);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting physical image file:", err.message);
      });
    }

    return {
      success: true,
      msg: "Post deleted successfully"
    };
  }

  async incrementPostView(postId) {
    await postModel.findByIdAndUpdate(postId, { $inc: { viewsCount: 1 } });
    return { success: true };
  }

  async getPostAnalytics(postId) {
    const post = await postModel.findById(postId).lean();
    if (!post) return { success: false, msg: "Post not found" };

    const views = post.viewsCount || 1;
    const likes = post.likes ? post.likes.length : 0;
    const comments = post.comments ? post.comments.length : 0;
    const reach = Math.round(views * 1.4) + likes;
    const engagementRate = (((likes + comments) / views) * 100).toFixed(1);

    return {
      success: true,
      analytics: {
        views,
        reach,
        likes,
        comments,
        engagementRate: `${engagementRate}%`
      }
    };
  }
}

module.exports = new PostService();
