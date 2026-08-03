import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiEye } from "react-icons/fi";
import { API_BASE_URL, api } from "../../services/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const StoryViewerModal = ({ storyGroup, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const currentUserId = localStorage.getItem("userId");

  const stories = storyGroup?.stories || [];
  const currentStory = stories[currentIndex];
  const isOwnStory = currentStory?.userId === currentUserId;

  const quickEmojis = ["❤️", "🔥", "😂", "😮", "👏", "😍"];

  useEffect(() => {
    if (currentStory) {
      api.viewStory(currentStory._id);
    }
  }, [currentIndex, currentStory]);

  // Auto advance story after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < stories.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, stories.length, onClose]);

  if (!currentStory) return null;

  const handleReact = async (emoji) => {
    const data = await api.reactStory(currentStory._id, emoji);
    if (data.success) {
      toast.success(`Reacted ${emoji}`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-[420px] h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
          {/* Top Progress Segments */}
          <div className="absolute top-0 left-0 right-0 p-3 z-30 flex flex-col gap-2 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex gap-1.5 w-full">
              {stories.map((s, idx) => (
                <div key={s._id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      idx < currentIndex
                        ? "w-full"
                        : idx === currentIndex
                        ? "w-full animate-pulse"
                        : "w-0"
                    }`}
                  ></div>
                </div>
              ))}
            </div>

            {/* Header info */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  alt={storyGroup.username}
                  className="w-8 h-8 rounded-full border border-white/40 object-cover"
                />
                <span className="text-white font-bold text-xs">{storyGroup.username}</span>
                <span className="text-white/60 text-[10px]">
                  {dayjs(currentStory.createdAt).fromNow()}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Story Main Image */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={`${API_BASE_URL}/uploads/${currentStory.image}`}
              alt="Story"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Navigation Click Overlay */}
          <div className="absolute inset-0 z-20 flex">
            <div
              className="w-1/2 h-full cursor-pointer"
              onClick={() => currentIndex > 0 && setCurrentIndex((prev) => prev - 1)}
            ></div>
            <div
              className="w-1/2 h-full cursor-pointer"
              onClick={() =>
                currentIndex < stories.length - 1 ? setCurrentIndex((prev) => prev + 1) : onClose()
              }
            ></div>
          </div>

          {/* Bottom Bar: Reactions or Viewers List */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-30 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            {isOwnStory ? (
              <button
                onClick={() => setShowViewers(!showViewers)}
                className="flex items-center gap-2 text-white/90 text-xs font-semibold bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md hover:bg-white/20 cursor-pointer"
              >
                <FiEye size={16} />
                <span>Seen by {currentStory.viewers?.length || 0} users</span>
              </button>
            ) : (
              <div className="flex items-center justify-around bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                {quickEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleReact(emoji)}
                    className="text-2xl hover:scale-130 transition-transform cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Viewers Drawer Popover */}
            {showViewers && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 bg-ig-surface/95 border border-ig-border rounded-xl p-3 text-ig-text max-h-[160px] overflow-y-auto"
              >
                <h4 className="text-xs font-bold mb-2">Story Viewers</h4>
                {currentStory.viewers?.length > 0 ? (
                  currentStory.viewers.map((v, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <span className="font-semibold">{v.username}</span>
                      <span className="text-[10px] text-ig-text-secondary">
                        {dayjs(v.date).format("h:mm A")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-ig-text-secondary">No views yet.</p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default StoryViewerModal;
