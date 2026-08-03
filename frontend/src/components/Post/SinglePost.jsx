import React, { useState } from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaHeart, FaRegHeart, FaRegComment, FaRegBookmark, FaBookmark, FaTrash } from "react-icons/fa6";
import { FiSend, FiEdit } from "react-icons/fi";
import { API_BASE_URL, api } from "../../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import CommentsDrawer from "./CommentsDrawer";
import ShareModal from "./ShareModal";
import PostAnalyticsModal from "./PostAnalyticsModal";
import LikeHeartBurst from "./LikeHeartBurst";
import { FiBarChart2 } from "react-icons/fi";

dayjs.extend(relativeTime);

const SinglePost = ({ item, toggleLike, currentUserId, onPostDeleted, onPostUpdated }) => {
  const navigate = useNavigate();

  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(item.post.isYouSaved || false);

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(item.post.caption);
  
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const isOwnPost = item.user._id === currentUserId;

  const heartBurstTimeoutRef = React.useRef(null);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        try { window.navigator.vibrate([20, 40, 20]); } catch (e) {}
      }
      if (!item.post.isYouLiked) {
        toggleLike(item.post._id);
      }
      setShowHeartBurst(true);
      if (heartBurstTimeoutRef.current) clearTimeout(heartBurstTimeoutRef.current);
      heartBurstTimeoutRef.current = setTimeout(() => setShowHeartBurst(false), 900);
    }
    setLastTap(now);
  };

  const handleToggleSave = async () => {
    const nextSaved = !isBookmarked;
    setIsBookmarked(nextSaved);
    try {
      const data = await api.toggleSavePost(item.post._id);
      if (data.success) {
        toast.success(data.action === "save" ? "Saved to collection" : "Removed from saved");
      } else {
        setIsBookmarked(!nextSaved);
        toast.error(data.msg);
      }
    } catch (err) {
      setIsBookmarked(!nextSaved);
    }
  };

  React.useEffect(() => {
    return () => {
      if (heartBurstTimeoutRef.current) clearTimeout(heartBurstTimeoutRef.current);
    };
  }, []);

  const handleEditPost = async (e) => {
    e.preventDefault();
    if (!editCaption.trim()) return;
    const data = await api.editPost(item.post._id, editCaption.trim());
    if (data.success) {
      toast.success("Caption updated!");
      onPostUpdated(item.post._id, editCaption.trim());
      setIsEditing(false);
      setShowMenu(false);
    } else {
      toast.error(data.msg);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const data = await api.deletePost(item.post._id);
    if (data.success) {
      toast.success("Post deleted successfully!");
      onPostDeleted(item.post._id);
      setShowMenu(false);
    } else {
      toast.error(data.msg);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-ig-surface border border-ig-border rounded-2xl overflow-hidden shadow-lg transition-colors duration-300 mb-6 w-full relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 relative">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/profile/${item.user._id}`)}
        >
          <div className="bg-gradient-to-tr from-[#6A5AE0] via-[#8B5CF6] to-[#FF3D81] p-[2.5px] rounded-full">
            <div className="bg-ig-surface p-[1.5px] rounded-full transition-colors duration-300">
              <img
                className="w-[34px] h-[34px] rounded-full object-cover border border-ig-border/30"
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt={item.user.username}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-ig-text hover:text-ig-primary transition-colors">
              {item.user.username}
            </span>
            <span className="text-[10px] text-ig-text-secondary leading-3">
              Joined {dayjs(item.user.joinedAt).format("MMM YYYY")}
            </span>
          </div>
        </div>

        {/* Options Dots */}
        <div className="relative">
          <HiDotsHorizontal
            size={20}
            onClick={() => setShowMenu(!showMenu)}
            className="cursor-pointer text-ig-text-secondary hover:text-ig-text transition-colors"
          />
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="absolute right-0 mt-2 w-[180px] bg-ig-surface border border-ig-border rounded-xl p-2 shadow-2xl z-40 flex flex-col gap-1"
              >
                {isOwnPost ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2.5 text-xs text-left p-2.5 rounded-lg text-ig-text hover:bg-ig-hover cursor-pointer font-medium"
                    >
                      <FiEdit size={14} className="text-ig-primary" /> Edit Caption
                    </button>
                    <button
                      onClick={handleDeletePost}
                      className="flex items-center gap-2.5 text-xs text-left p-2.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer font-medium"
                    >
                      <FaTrash size={13} /> Delete Post
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowShareModal(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2.5 text-xs text-left p-2.5 rounded-lg text-ig-text hover:bg-ig-hover cursor-pointer font-medium"
                  >
                    <FiSend size={14} className="text-ig-primary" /> Share to Chat
                  </button>
                )}
                <button
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2.5 text-xs text-left p-2.5 rounded-lg text-ig-text-secondary hover:bg-ig-hover cursor-pointer font-medium border-t border-ig-border/40 mt-1"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Caption Edit Form */}
      {isEditing && (
        <form onSubmit={handleEditPost} className="p-3.5 bg-ig-hover/30 border-y border-ig-border flex gap-3 items-center">
          <input
            type="text"
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            className="flex-1 bg-ig-bg border border-ig-border rounded-xl px-3 py-2 text-xs outline-none focus:border-ig-primary text-ig-text"
            placeholder="Edit caption..."
          />
          <button type="submit" className="text-xs bg-ig-primary text-white font-semibold py-2 px-4 rounded-xl cursor-pointer">
            Save
          </button>
          <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-ig-text-secondary cursor-pointer">
            Cancel
          </button>
        </form>
      )}

      {/* Image Area */}
      <div
        onClick={handleDoubleTap}
        className="relative w-full aspect-square bg-ig-hover flex items-center justify-center overflow-hidden cursor-pointer select-none"
      >
        <img
          className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-700"
          src={`${API_BASE_URL}/uploads/${item.post.image}`}
          alt={item.post.caption}
          loading="lazy"
          decoding="async"
        />

        <LikeHeartBurst show={showHeartBurst} />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-4">
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleLike(item.post._id)} className="cursor-pointer">
              {item.post.isYouLiked ? (
                <FaHeart size={25} className="text-[#ff3040] drop-shadow-[0_0_8px_rgba(255,48,64,0.4)]" />
              ) : (
                <FaRegHeart size={25} className="text-ig-text hover:text-ig-text-secondary transition-colors" />
              )}
            </motion.button>

            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowCommentsDrawer(true)} className="cursor-pointer text-ig-text hover:text-ig-text-secondary">
              <FaRegComment size={25} />
            </motion.button>

            <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowShareModal(true)} className="cursor-pointer text-ig-text hover:text-ig-text-secondary">
              <FiSend size={24} />
            </motion.button>
          </div>

          <motion.button whileTap={{ scale: 0.8 }} onClick={handleToggleSave} className="cursor-pointer text-ig-text hover:text-ig-text-secondary">
            {isBookmarked ? <FaBookmark size={23} className="text-ig-primary" /> : <FaRegBookmark size={23} />}
          </motion.button>
        </div>

        {/* Likes Count */}
        <p className="text-sm font-bold text-ig-text mb-2 tracking-wide">
          {item.post.likes} likes
        </p>

        {/* Caption */}
        <div className="mb-2 text-[14px]">
          <span
            className="font-bold text-ig-text mr-2 cursor-pointer hover:text-ig-primary transition-colors"
            onClick={() => navigate(`/profile/${item.user._id}`)}
          >
            {item.user.username}
          </span>
          <span className="text-ig-text-secondary">{item.post.caption}</span>
        </div>

        {/* Comments link */}
        <p onClick={() => setShowCommentsDrawer(true)} className="text-[13px] text-ig-text-secondary/80 cursor-pointer mb-2 hover:underline">
          View all comments
        </p>

        {/* Date Time & Insights */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-ig-text-secondary/60 uppercase tracking-widest font-semibold">
            {item.post.createdAt ? dayjs(item.post.createdAt).fromNow() : "JUST NOW"}
          </p>
          {isOwnPost && (
            <button
              onClick={() => setShowAnalyticsModal(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-ig-primary hover:text-ig-primary-hover cursor-pointer"
            >
              <FiBarChart2 size={13} /> View Insights
            </button>
          )}
        </div>
      </div>

      {/* Comments Drawer */}
      <CommentsDrawer
        show={showCommentsDrawer}
        onClose={() => setShowCommentsDrawer(false)}
        postId={item.post._id}
        currentUserId={currentUserId}
        isOwnPost={isOwnPost}
      />

      {/* Share Modal */}
      <ShareModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={item.post._id}
        currentUserId={currentUserId}
      />

      {/* Post Insights Analytics Modal */}
      <PostAnalyticsModal
        show={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        postId={item.post._id}
      />
    </motion.div>
  );
};

export default React.memo(SinglePost);
