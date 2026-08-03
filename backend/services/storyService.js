const Story = require("../models/storyModel");
const userModel = require("../models/userModels");

class StoryService {
  async uploadStory(userId, imageFileName) {
    if (!imageFileName) {
      return { success: false, msg: "Image file is required for stories" };
    }

    const user = await userModel.findById(userId).lean();
    if (!user) {
      return { success: false, msg: "User not found" };
    }

    const newStory = await Story.create({
      userId,
      username: user.username,
      image: imageFileName
    });

    return {
      success: true,
      msg: "Story uploaded successfully",
      story: newStory
    };
  }

  async getFeedStories(currentUserId) {
    const user = await userModel.findById(currentUserId).lean();
    const followingIds = user?.following ? user.following.map((f) => f.userId) : [];
    const allowedUserIds = [currentUserId, ...followingIds];

    const stories = await Story.find({ userId: { $in: allowedUserIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Group stories by userId
    const storiesGrouped = new Map();
    stories.forEach((story) => {
      const uId = story.userId.toString();
      if (!storiesGrouped.has(uId)) {
        storiesGrouped.set(uId, {
          userId: uId,
          username: story.username,
          stories: []
        });
      }
      const isSeen = story.viewers.some((v) => v.userId === currentUserId);
      storiesGrouped.get(uId).stories.push({ ...story, isSeen });
    });

    return {
      success: true,
      feedStories: Array.from(storiesGrouped.values())
    };
  }

  async viewStory(currentUserId, storyId) {
    const user = await userModel.findById(currentUserId).lean();
    const story = await Story.findById(storyId);

    if (story) {
      const alreadyViewed = story.viewers.some((v) => v.userId === currentUserId);
      if (!alreadyViewed) {
        story.viewers.push({
          userId: currentUserId,
          username: user ? user.username : "User"
        });
        await story.save();
      }
    }

    return { success: true };
  }

  async reactStory(currentUserId, storyId, emoji) {
    const story = await Story.findById(storyId);
    if (!story) return { success: false, msg: "Story not found" };

    story.reactions.push({
      userId: currentUserId,
      emoji
    });
    await story.save();

    return { success: true, story };
  }
}

module.exports = new StoryService();
