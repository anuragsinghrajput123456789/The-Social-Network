const Post = require("../models/postModel");
const userModel = require("../models/userModels");

class ExploreService {
  async getExploreData() {
    // 1. Fetch trending posts (sorted by total likes count descending)
    const posts = await Post.aggregate([
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
          totalEngagement: { $add: [{ $size: "$likes" }, { $size: "$comments" }] }
        }
      },
      { $sort: { totalEngagement: -1, createdAt: -1 } },
      { $limit: 30 },
      {
        $lookup: {
          from: "users",
          localField: "uploadedBy",
          foreignField: "_id",
          as: "uploadedByInfo"
        }
      },
      {
        $unwind: {
          path: "$uploadedByInfo",
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    // 2. Extract popular hashtags from post captions
    const hashtagMap = new Map();
    posts.forEach((p) => {
      if (p.caption) {
        const matches = p.caption.match(/#[a-zA-Z0-9_]+/g);
        if (matches) {
          matches.forEach((tag) => {
            const cleanTag = tag.toLowerCase();
            hashtagMap.set(cleanTag, (hashtagMap.get(cleanTag) || 0) + 1);
          });
        }
      }
    });

    const popularHashtags = Array.from(hashtagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 3. Fetch suggested creators
    const suggestedCreators = await userModel
      .find({})
      .select("_id username name followers")
      .limit(8)
      .lean();

    return {
      success: true,
      trendingPosts: posts,
      popularHashtags,
      suggestedCreators
    };
  }
}

module.exports = new ExploreService();
