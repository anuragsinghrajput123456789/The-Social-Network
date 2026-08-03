const userModel = require("../models/userModels");
const postModel = require("../models/postModel");

class SearchService {
  async search(query, currentUserId) {
    if (!query || !query.trim()) {
      return {
        success: true,
        users: [],
        posts: [],
        hashtags: []
      };
    }

    const cleanQuery = query.trim().replace(/^#/, "");
    const regex = new RegExp(cleanQuery, "i");

    // Search users
    const users = await userModel
      .find({
        $or: [{ username: regex }, { name: regex }]
      })
      .select("_id username name followers")
      .limit(10)
      .lean();

    // Search posts by caption
    const posts = await postModel
      .find({ caption: regex })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate("uploadedBy", "_id username name")
      .lean();

    // Extract matching hashtags from posts
    const hashtagMap = new Map();
    const allPostsWithTags = await postModel
      .find({ caption: /#/ })
      .select("caption")
      .lean();

    allPostsWithTags.forEach((p) => {
      if (p.caption) {
        const matches = p.caption.match(/#[a-zA-Z0-9_]+/g);
        if (matches) {
          matches.forEach((tag) => {
            const cleanTag = tag.substring(1);
            if (cleanTag.toLowerCase().includes(cleanQuery.toLowerCase())) {
              const count = (hashtagMap.get(tag) || 0) + 1;
              hashtagMap.set(tag, count);
            }
          });
        }
      }
    });

    const hashtags = Array.from(hashtagMap.entries()).map(([tag, count]) => ({
      tag,
      count
    }));

    return {
      success: true,
      users: users.map((u) => ({
        _id: u._id,
        username: u.username,
        name: u.name,
        followersCount: u.followers ? u.followers.length : 0
      })),
      posts: posts.map((p) => ({
        _id: p._id,
        caption: p.caption,
        image: p.image,
        likes: p.likes ? p.likes.length : 0,
        author: p.uploadedBy?.username || "Unknown"
      })),
      hashtags
    };
  }
}

module.exports = new SearchService();
