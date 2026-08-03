import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import SinglePost from "../components/Post/SinglePost";
import PostSkeleton from "../components/Post/PostSkeleton";
import { FaBookmark, FaFolderPlus } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FiFolder, FiX } from "react-icons/fi";

const Saved = () => {
  const [data, setData] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const currentUserId = localStorage.getItem("userId");

  const fetchSavedPosts = async () => {
    try {
      const result = await api.getSavedPosts();
      if (result.success) {
        setData(result.data || []);
      }

      const collData = await api.getUserCollections();
      if (collData.success) {
        setCollections(collData.collections || []);
      }
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const res = await api.createCollection(newFolderName.trim());
    if (res.success) {
      toast.success("Collection folder created!");
      setNewFolderName("");
      setShowFolderModal(false);
      fetchSavedPosts();
    } else {
      toast.error(res.msg || "Failed to create collection");
    }
  };

  const toggleLike = async (id) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.post._id === id
          ? {
              ...item,
              post: {
                ...item.post,
                isYouLiked: !item.post.isYouLiked,
                likes: item.post.isYouLiked ? item.post.likes - 1 : item.post.likes + 1
              }
            }
          : item
      )
    );

    try {
      await api.toggleLike(id);
    } catch (error) {
      fetchSavedPosts();
    }
  };

  const onPostDeleted = (postId) => {
    setData((prev) => prev.filter((item) => item.post._id !== postId));
  };

  const onPostUpdated = (postId, newCaption) => {
    setData((prev) =>
      prev.map((item) =>
        item.post._id === postId
          ? {
              ...item,
              post: {
                ...item.post,
                caption: newCaption
              }
            }
          : item
      )
    );
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center w-full min-h-screen bg-ig-bg pt-8 px-4 pb-20">
        <div className="w-full max-w-[600px]">
          <PostSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-ig-bg pt-6 px-4 pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="w-full max-w-[600px] mb-6 flex items-center justify-between border-b border-ig-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-ig-primary/10 text-ig-primary rounded-xl">
            <FaBookmark size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ig-text">Saved Collections</h2>
            <p className="text-xs text-ig-text-secondary">Organize photos & posts into custom folders</p>
          </div>
        </div>

        <button
          onClick={() => setShowFolderModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-ig-primary hover:bg-ig-primary-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <FaFolderPlus size={14} /> New Folder
        </button>
      </div>

      {/* Collection Folder Filter Tabs */}
      {collections.length > 0 && (
        <div className="w-full max-w-[600px] flex gap-2 overflow-x-auto no-scrollbar mb-6">
          <button
            onClick={() => setActiveCollection("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeCollection === "all"
                ? "bg-ig-primary text-white"
                : "bg-ig-surface border border-ig-border text-ig-text hover:bg-ig-hover"
            }`}
          >
            <FaBookmark size={12} /> All Saved ({data.length})
          </button>
          {collections.map((col) => (
            <button
              key={col._id}
              onClick={() => setActiveCollection(col._id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeCollection === col._id
                  ? "bg-ig-primary text-white"
                  : "bg-ig-surface border border-ig-border text-ig-text hover:bg-ig-hover"
              }`}
            >
              <FiFolder size={14} /> {col.name} ({col.posts?.length || 0})
            </button>
          ))}
        </div>
      )}

      {/* Saved Posts Feed */}
      <div className="w-full max-w-[600px]">
        {data.length > 0 ? (
          data.map((item, index) => (
            <SinglePost
              key={item.post._id || index}
              item={item}
              toggleLike={toggleLike}
              currentUserId={currentUserId}
              onPostDeleted={onPostDeleted}
              onPostUpdated={onPostUpdated}
            />
          ))
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center p-12 text-center bg-ig-surface border border-ig-border rounded-2xl shadow-sm"
          >
            <div className="w-16 h-16 border-2 border-ig-border rounded-full flex items-center justify-center mb-4 text-ig-text-secondary">
              <FaBookmark size={30} />
            </div>
            <h3 className="font-semibold text-lg text-ig-text mb-2">No Saved Posts</h3>
            <p className="text-ig-text-secondary text-sm max-w-[280px]">
              Save photos and videos that you want to see again.
            </p>
          </motion.div>
        )}
      </div>

      {/* Folder Creation Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.form
              onSubmit={handleCreateCollection}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-[360px] bg-ig-surface border border-ig-border rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-ig-text"
            >
              <div className="flex items-center justify-between border-b border-ig-border pb-3">
                <span className="font-bold text-sm">New Collection Folder</span>
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="p-1 hover:bg-ig-hover rounded-lg text-ig-text-secondary"
                >
                  <FiX size={18} />
                </button>
              </div>

              <input
                type="text"
                placeholder="Folder Name (e.g. Travel, Design)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-ig-bg border border-ig-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ig-primary text-ig-text"
              />

              <button
                type="submit"
                disabled={!newFolderName.trim()}
                className="w-full py-2.5 bg-ig-primary hover:bg-ig-primary-hover disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Create Collection
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Saved;
