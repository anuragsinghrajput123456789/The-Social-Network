import React, { useState, useEffect, useRef } from "react";
import { FiPlus } from "react-icons/fi";
import { api, API_BASE_URL } from "../../services/api";
import { toast } from "react-toastify";
import StoryViewerModal from "./StoryViewerModal";

const StoriesBar = () => {
  const [feedStories, setFeedStories] = useState([]);
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchStories = async () => {
    const data = await api.getFeedStories();
    if (data.success) {
      setFeedStories(data.feedStories || []);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleUploadStory = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const data = await api.uploadStory(formData);
    setUploading(false);

    if (data.success) {
      toast.success("Story uploaded!");
      fetchStories();
    } else {
      toast.error(data.msg || "Failed to upload story");
    }
  };

  return (
    <div className="w-full bg-ig-surface border border-ig-border rounded-2xl p-4 mb-6 shadow-sm overflow-x-auto no-scrollbar flex items-center gap-4">
      {/* Upload Own Story Button */}
      <div className="flex flex-col items-center gap-1 min-w-[68px] cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleUploadStory}
          className="hidden"
        />
        <div className="relative w-14 h-14 rounded-full border-2 border-dashed border-ig-primary p-0.5 flex items-center justify-center bg-ig-hover/40 hover:scale-105 transition-transform">
          {uploading ? (
            <div className="w-5 h-5 border-2 border-ig-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <div className="w-full h-full rounded-full bg-ig-primary/10 flex items-center justify-center text-ig-primary font-bold">
              <FiPlus size={22} />
            </div>
          )}
        </div>
        <span className="text-[11px] font-semibold text-ig-text truncate w-14 text-center">Your Story</span>
      </div>

      {/* Connection Stories List */}
      {feedStories.map((group) => {
        const hasUnseen = group.stories.some((s) => !s.isSeen);
        return (
          <div
            key={group.userId}
            onClick={() => setActiveStoryGroup(group)}
            className="flex flex-col items-center gap-1 min-w-[68px] cursor-pointer group"
          >
            <div
              className={`w-14 h-14 rounded-full p-[2px] transition-transform duration-300 group-hover:scale-105 ${
                hasUnseen
                  ? "bg-gradient-to-tr from-[#6A5AE0] via-[#8B5CF6] to-[#FF3D81]"
                  : "bg-ig-border/80"
              }`}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt={group.username}
                className="w-full h-full rounded-full object-cover border-2 border-ig-surface"
              />
            </div>
            <span className="text-[11px] font-medium text-ig-text truncate w-14 text-center">
              {group.username}
            </span>
          </div>
        );
      })}

      {/* Story Viewer Modal */}
      {activeStoryGroup && (
        <StoryViewerModal
          storyGroup={activeStoryGroup}
          onClose={() => {
            setActiveStoryGroup(null);
            fetchStories();
          }}
        />
      )}
    </div>
  );
};

export default StoriesBar;
