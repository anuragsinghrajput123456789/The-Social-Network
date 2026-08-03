import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { FaTrash, FaRegHeart, FaHeart } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const CommentsDrawer = ({ show, onClose, postId, currentUserId, isOwnPost }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentLikes, setCommentLikes] = useState({});

  const emojis = ["❤️", "🔥", "👏", "🙌", "😍", "😮"];

  const fetchComments = async () => {
    setLoading(true);
    const data = await api.getComments(postId);
    if (data.success) {
      setComments(data.comments || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (show && postId) {
      fetchComments();
    }
  }, [show, postId]);

  const handleAddComment = async (e) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim()) return;

    const data = await api.addComment(postId, newCommentText.trim());
    if (data.success) {
      setComments((prev) => [...prev, data.comment]);
      setNewCommentText("");
      toast.success("Comment posted!");
    } else {
      toast.error(data.msg);
    }
  };

  const handleInsertEmoji = (emoji) => {
    setNewCommentText((prev) => prev + emoji);
  };

  const handleReplyToUser = (username) => {
    setNewCommentText(`@${username} `);
  };

  const toggleCommentLike = (commentId) => {
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete comment?")) return;
    const data = await api.deleteComment(postId, commentId);
    if (data.success) {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted");
    } else {
      toast.error(data.msg);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end transition-all duration-300">
          <div className="flex-1" onClick={onClose}></div>

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-[450px] bg-ig-surface border-l border-ig-border h-full flex flex-col relative shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-ig-border/80 flex items-center justify-between">
              <h3 className="font-bold text-base text-ig-text">
                Comments ({comments.length})
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-ig-hover rounded-xl text-ig-text-secondary hover:text-ig-text cursor-pointer transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-ig-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => {
                  const isOwnComment = comment.userId === currentUserId || isOwnPost;
                  const isLiked = commentLikes[comment._id];
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={comment._id}
                      className="flex items-start justify-between gap-3 group bg-ig-bg/20 p-3 rounded-xl border border-transparent hover:border-ig-border/40 hover:bg-ig-hover/10 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          className="w-8 h-8 rounded-full object-cover mt-0.5 border border-ig-border/40"
                          alt={comment.username}
                        />
                        <div className="flex flex-col flex-1">
                          <div className="text-sm">
                            <span
                              className="font-bold text-ig-text mr-1.5 hover:underline cursor-pointer"
                              onClick={() => {
                                navigate(`/profile/${comment.userId}`);
                                onClose();
                              }}
                            >
                              {comment.username}
                            </span>
                            <span className="text-ig-text-secondary">{comment.comment}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-ig-text-secondary/60">
                            <span>{dayjs(comment.date).fromNow()}</span>
                            <button
                              onClick={() => handleReplyToUser(comment.username)}
                              className="font-semibold hover:text-ig-primary cursor-pointer transition-colors"
                            >
                              Reply
                            </button>
                            {isOwnComment && (
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="hover:text-red-500 transition-all cursor-pointer font-semibold"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleCommentLike(comment._id)}
                        className="p-1 text-ig-text-secondary hover:text-red-500 cursor-pointer transition-colors mt-1"
                      >
                        {isLiked ? (
                          <FaHeart className="text-[#ff3040]" size={14} />
                        ) : (
                          <FaRegHeart size={14} />
                        )}
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-20 text-ig-text-secondary">
                  <p className="text-sm">No comments yet.</p>
                  <p className="text-xs text-ig-text-secondary/60 mt-1">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

            {/* Quick Emoji Bar */}
            <div className="px-4 py-2 bg-ig-bg/30 border-t border-ig-border/40 flex justify-around">
              {emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInsertEmoji(emoji)}
                  className="text-lg hover:scale-125 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleAddComment}
              className="p-4 border-t border-ig-border/80 bg-ig-surface flex gap-3 items-center"
            >
              <input
                type="text"
                placeholder="Add a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-ig-bg/50 border border-ig-border rounded-xl px-4 py-3 text-sm outline-none focus:border-ig-primary focus:ring-2 focus:ring-ig-primary/20 placeholder-ig-text-secondary/55 text-ig-text transition-all duration-300"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="text-sm font-bold text-ig-primary hover:text-ig-primary-hover disabled:opacity-40 transition-colors cursor-pointer"
              >
                Post
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommentsDrawer;
