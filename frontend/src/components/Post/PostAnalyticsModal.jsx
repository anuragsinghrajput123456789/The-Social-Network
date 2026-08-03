import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiBarChart2, FiEye, FiHeart, FiMessageCircle, FiTrendingUp } from "react-icons/fi";
import { api } from "../../services/api";

const PostAnalyticsModal = ({ show, onClose, postId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show && postId) {
      const fetchAnalytics = async () => {
        setLoading(true);
        const data = await api.getPostAnalytics(postId);
        if (data.success) {
          setAnalytics(data.analytics);
        }
        setLoading(false);
      };
      fetchAnalytics();
    }
  }, [show, postId]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-[400px] bg-ig-surface border border-ig-border rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-ig-text"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ig-border pb-3">
            <div className="flex items-center gap-2 font-bold text-base">
              <FiBarChart2 className="text-ig-primary" size={20} />
              <span>Post Insights</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-ig-hover rounded-xl text-ig-text-secondary hover:text-ig-text cursor-pointer transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-ig-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-ig-bg/50 border border-ig-border p-3.5 rounded-xl flex flex-col gap-1">
                <span className="text-ig-text-secondary text-[11px] font-semibold uppercase flex items-center gap-1">
                  <FiEye size={13} /> Views
                </span>
                <span className="text-xl font-bold">{analytics.views}</span>
              </div>

              <div className="bg-ig-bg/50 border border-ig-border p-3.5 rounded-xl flex flex-col gap-1">
                <span className="text-ig-text-secondary text-[11px] font-semibold uppercase flex items-center gap-1">
                  <FiTrendingUp size={13} /> Reach
                </span>
                <span className="text-xl font-bold">{analytics.reach}</span>
              </div>

              <div className="bg-ig-bg/50 border border-ig-border p-3.5 rounded-xl flex flex-col gap-1">
                <span className="text-ig-text-secondary text-[11px] font-semibold uppercase flex items-center gap-1">
                  <FiHeart size={13} /> Likes
                </span>
                <span className="text-xl font-bold">{analytics.likes}</span>
              </div>

              <div className="bg-ig-bg/50 border border-ig-border p-3.5 rounded-xl flex flex-col gap-1">
                <span className="text-ig-text-secondary text-[11px] font-semibold uppercase flex items-center gap-1">
                  <FiMessageCircle size={13} /> Comments
                </span>
                <span className="text-xl font-bold">{analytics.comments}</span>
              </div>

              <div className="col-span-2 bg-ig-primary/10 border border-ig-primary/20 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-ig-primary uppercase">Engagement Rate</span>
                <span className="text-lg font-extrabold text-ig-primary">{analytics.engagementRate}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ig-text-secondary text-center py-6">Failed to load insights.</p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PostAnalyticsModal;
