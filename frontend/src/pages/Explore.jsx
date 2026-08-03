import React, { useState, useEffect } from "react";
import { api, API_BASE_URL } from "../services/api";
import { FiTrendingUp, FiHash, FiUserPlus, FiHeart, FiMessageCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Explore = () => {
  const navigate = useNavigate();
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [popularHashtags, setPopularHashtags] = useState([]);
  const [suggestedCreators, setSuggestedCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    const fetchExplore = async () => {
      setLoading(true);
      const data = await api.getExploreData();
      if (data.success) {
        setTrendingPosts(data.trendingPosts || []);
        setPopularHashtags(data.popularHashtags || []);
        setSuggestedCreators(data.suggestedCreators || []);
      }
      setLoading(false);
    };
    fetchExplore();
  }, []);

  const filteredPosts = selectedTag
    ? trendingPosts.filter(
        (p) => p.caption && p.caption.toLowerCase().includes(selectedTag.toLowerCase())
      )
    : trendingPosts;

  return (
    <div className="flex justify-center w-full min-h-screen bg-ig-bg p-4 md:p-8">
      <div className="w-full max-w-[935px] flex flex-col gap-8 pb-16 md:pb-0">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-ig-border pb-4">
          <div className="flex items-center gap-2 text-ig-text">
            <FiTrendingUp size={24} className="text-ig-primary" />
            <h1 className="text-xl font-bold tracking-tight">Explore & Discover</h1>
          </div>
        </div>

        {/* Popular Hashtags Filter Pills */}
        {popularHashtags.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-ig-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <FiHash size={14} /> Popular Hashtags
            </h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedTag === null
                    ? "bg-ig-primary text-white"
                    : "bg-ig-surface border border-ig-border text-ig-text hover:bg-ig-hover"
                }`}
              >
                All Posts
              </button>
              {popularHashtags.map((h, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTag(h.tag === selectedTag ? null : h.tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedTag === h.tag
                      ? "bg-ig-primary text-white"
                      : "bg-ig-surface border border-ig-border text-ig-text hover:bg-ig-hover"
                  }`}
                >
                  {h.tag} ({h.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Creators Carousel */}
        {suggestedCreators.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-ig-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <FiUserPlus size={14} /> Suggested Creators
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {suggestedCreators.slice(0, 4).map((creator) => (
                <div
                  key={creator._id}
                  onClick={() => navigate(`/profile/${creator._id}`)}
                  className="bg-ig-surface border border-ig-border rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer hover:border-ig-primary transition-all shadow-sm"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    alt={creator.username}
                    className="w-14 h-14 rounded-full object-cover border border-ig-border mb-2"
                  />
                  <span className="font-bold text-xs text-ig-text truncate w-full">{creator.username}</span>
                  <span className="text-[10px] text-ig-text-secondary truncate w-full mb-3">{creator.name}</span>
                  <button className="w-full py-1.5 bg-ig-primary hover:bg-ig-primary-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Posts Grid */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-ig-text-secondary uppercase tracking-wider">
            Trending Media
          </h3>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-ig-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post._id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/profile/${post.uploadedByInfo?._id || post.uploadedBy}`)}
                  className="relative aspect-square bg-ig-hover rounded-xl overflow-hidden cursor-pointer group shadow-sm"
                >
                  <img
                    src={`${API_BASE_URL}/uploads/${post.image}`}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold text-sm">
                    <span className="flex items-center gap-1.5">
                      <FiHeart size={18} className="fill-white" /> {post.likesCount || post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiMessageCircle size={18} className="fill-white" /> {post.commentsCount || post.comments?.length || 0}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-ig-text-secondary">
              <p className="text-sm">No trending posts matching your selection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
