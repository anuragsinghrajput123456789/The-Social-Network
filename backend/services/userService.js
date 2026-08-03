const userModel = require("../models/userModels");
const postModel = require("../models/postModel");
const notificationService = require("./notificationService");

class UserService {
  async getUserDetails(currentUserId, targetUserId) {
    const otherUser = await userModel.findById(targetUserId).lean();
    if (!otherUser) {
      return { success: false, msg: "User not found" };
    }

    const targetPosts = await postModel.find({ uploadedBy: targetUserId }).select("likes").lean();
    const postsCount = targetPosts.length;
    const totalLikesReceived = targetPosts.reduce((acc, p) => acc + (p.likes ? p.likes.length : 0), 0);

    const followers = otherUser.followers || [];
    const isYoufollowed = followers.some(
      (follower) => follower.userId && follower.userId.toString() === currentUserId.toString()
    );

    const isPendingRequest = (otherUser.followRequests || []).some(
      (req) => req.userId.toString() === currentUserId.toString()
    );

    return {
      success: true,
      msg: "User details fetched successfully",
      data: {
        _id: otherUser._id,
        username: otherUser.username,
        name: otherUser.name,
        followers: otherUser.followers ? otherUser.followers.length : 0,
        following: otherUser.following ? otherUser.following.length : 0,
        date: otherUser.date,
        lastSeen: otherUser.lastSeen || otherUser.updatedAt || otherUser.date,
        isYoufollowed,
        isYouFollowed: isYoufollowed,
        isPendingRequest,
        isPrivate: otherUser.isPrivate || false,
        posts: postsCount,
        totalLikesReceived,
        isThisYou: targetUserId.toString() === currentUserId.toString(),
        theme: otherUser.theme || "dark",
        settings: otherUser.settings || {}
      }
    };
  }

  async toggleFollow(currentUserId, targetUserId) {
    if (currentUserId.toString() === targetUserId.toString()) {
      return { success: false, msg: "You cannot follow yourself" };
    }

    const user = await userModel.findById(currentUserId).lean();
    const otherUser = await userModel.findById(targetUserId);

    if (!user || !otherUser) {
      return { success: false, msg: "User not found" };
    }

    const isFollowing = (otherUser.followers || []).some(
      (f) => f.userId.toString() === currentUserId.toString()
    );

    if (isFollowing) {
      await userModel.findByIdAndUpdate(targetUserId, {
        $pull: { followers: { userId: currentUserId.toString() } }
      });
      await userModel.findByIdAndUpdate(currentUserId, {
        $pull: { following: { userId: targetUserId.toString() } }
      });

      return {
        success: true,
        msg: "User unfollowed successfully",
        action: "unfollow"
      };
    } else {
      // If private profile, send follow request
      if (otherUser.isPrivate) {
        const alreadyRequested = (otherUser.followRequests || []).some(
          (r) => r.userId.toString() === currentUserId.toString()
        );

        if (alreadyRequested) {
          otherUser.followRequests = otherUser.followRequests.filter(
            (r) => r.userId.toString() !== currentUserId.toString()
          );
          await otherUser.save();
          return { success: true, msg: "Follow request cancelled", action: "cancel_request" };
        } else {
          otherUser.followRequests.push({ userId: currentUserId.toString() });
          await otherUser.save();
          return { success: true, msg: "Follow request sent", action: "requested" };
        }
      } else {
        await userModel.findByIdAndUpdate(targetUserId, {
          $push: { followers: { userId: currentUserId.toString(), date: new Date() } }
        });
        await userModel.findByIdAndUpdate(currentUserId, {
          $push: { following: { userId: targetUserId.toString(), date: new Date() } }
        });

        await notificationService.createNotification({
          recipientId: targetUserId,
          senderId: currentUserId,
          type: "follow"
        });

        return {
          success: true,
          msg: "User followed successfully",
          action: "follow"
        };
      }
    }
  }

  async acceptFollowRequest(currentUserId, requesterId) {
    const user = await userModel.findById(currentUserId);
    if (!user) return { success: false, msg: "User not found" };

    user.followRequests = user.followRequests.filter((r) => r.userId.toString() !== requesterId.toString());
    user.followers.push({ userId: requesterId.toString(), date: new Date() });
    await user.save();

    await userModel.findByIdAndUpdate(requesterId, {
      $push: { following: { userId: currentUserId.toString(), date: new Date() } }
    });

    return { success: true, msg: "Follow request accepted" };
  }

  async createCollection(userId, collectionName) {
    if (!collectionName || !collectionName.trim()) {
      return { success: false, msg: "Collection name is required" };
    }

    const user = await userModel.findById(userId);
    if (!user) return { success: false, msg: "User not found" };

    user.collections.push({ name: collectionName.trim(), posts: [] });
    await user.save();

    return { success: true, msg: "Collection created", collections: user.collections };
  }

  async getUserCollections(userId) {
    const user = await userModel.findById(userId).populate({
      path: "collections.posts",
      model: "post"
    }).lean();

    return { success: true, collections: user?.collections || [] };
  }

  async updateUserSettings(userId, settingsData) {
    const user = await userModel.findById(userId);
    if (!user) return { success: false, msg: "User not found" };

    if (settingsData.isPrivate !== undefined) {
      user.isPrivate = settingsData.isPrivate;
    }

    if (settingsData.settings) {
      user.settings = { ...user.settings, ...settingsData.settings };
    }

    await user.save();
    return { success: true, msg: "Settings updated successfully", isPrivate: user.isPrivate, settings: user.settings };
  }

  async updateTheme(userId, theme) {
    const user = await userModel.findByIdAndUpdate(userId, { theme }, { new: true }).lean();
    if (!user) {
      return { success: false, msg: "User not found" };
    }

    return {
      success: true,
      msg: "Theme updated successfully",
      theme
    };
  }

  async getSuggestedUsers(currentUserId) {
    const suggested = await userModel
      .find({
        _id: { $ne: currentUserId },
        "followers.userId": { $ne: currentUserId.toString() }
      })
      .limit(5)
      .select("_id username name followers")
      .lean();

    return {
      success: true,
      msg: "Suggested users fetched successfully",
      data: suggested.map((u) => ({
        _id: u._id,
        username: u.username,
        name: u.name,
        followersCount: u.followers ? u.followers.length : 0
      }))
    };
  }

  async getFollowersList(targetUserId) {
    const user = await userModel.findById(targetUserId).lean();
    if (!user) {
      return { success: false, msg: "User not found" };
    }

    const followerIds = (user.followers || []).map((f) => f.userId);
    const followers = await userModel
      .find({ _id: { $in: followerIds } })
      .select("_id username name")
      .lean();

    return {
      success: true,
      data: followers
    };
  }

  async getFollowingList(targetUserId) {
    const user = await userModel.findById(targetUserId).lean();
    if (!user) {
      return { success: false, msg: "User not found" };
    }

    const followingIds = (user.following || []).map((f) => f.userId);
    const following = await userModel
      .find({ _id: { $in: followingIds } })
      .select("_id username name")
      .lean();

    return {
      success: true,
      data: following
    };
  }
}

module.exports = new UserService();
