import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SuggestedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followedStates, setFollowedStates] = useState({});
  const navigate = useNavigate();

  const fetchSuggested = async () => {
    try {
      const result = await api.getSuggestedUsers();
      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const result = await api.toggleFollow(userId);
      if (result.success) {
        setFollowedStates(prev => ({
          ...prev,
          [userId]: result.action === "follow"
        }));
        toast.success(result.action === "follow" ? "Followed successfully!" : "Unfollowed successfully!");
      } else {
        toast.error(result.msg);
      }
    } catch (error) {
      toast.error("Failed to update follow status.");
    }
  };

  useEffect(() => {
    fetchSuggested();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="h-4 w-28 bg-ig-border rounded skeleton-shimmer mb-2"></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-ig-border skeleton-shimmer"></div>
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-20 bg-ig-border rounded skeleton-shimmer"></div>
                <div className="h-2.5 w-16 bg-ig-border rounded skeleton-shimmer"></div>
              </div>
            </div>
            <div className="h-6 w-12 bg-ig-border rounded skeleton-shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 w-full bg-ig-surface border border-ig-border rounded-2xl p-4.5 shadow-xl transition-all duration-300">
      <div className="flex justify-between items-center w-full">
        <span className="text-[13px] font-bold uppercase tracking-wider text-ig-text-secondary">Suggested for you</span>
        <button className="text-[12px] font-bold text-ig-primary hover:text-ig-primary-hover transition-colors">See All</button>
      </div>

      <div className="flex flex-col gap-3.5">
        {users.map((user) => {
          const isFollowed = followedStates[user._id];
          return (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              key={user._id} 
              className="flex items-center justify-between w-full group p-1.5 rounded-xl hover:bg-ig-hover/50 transition-colors"
            >
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6A5AE0] to-[#FF3D81] p-[2px]">
                  <img
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300 border border-ig-surface"
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    alt={user.username}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-ig-text hover:text-ig-primary transition-colors leading-4">{user.username}</span>
                  <span className="text-[11px] text-ig-text-secondary leading-3">{user.name || "Suggested creator"}</span>
                </div>
              </div>

              <button
                onClick={() => handleFollow(user._id)}
                className={`text-[12px] font-bold px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  isFollowed 
                    ? 'bg-ig-hover text-ig-text-secondary hover:text-ig-text border border-ig-border' 
                    : 'bg-ig-primary text-white hover:bg-ig-primary-hover shadow-md shadow-ig-primary/30'
                }`}
              >
                {isFollowed ? "Following" : "Follow"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedUsers;
