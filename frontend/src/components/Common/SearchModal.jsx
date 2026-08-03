import React, { useState, useEffect } from "react";
import { FiX, FiSearch, FiUser, FiHash, FiImage } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { api, API_BASE_URL } from "../../services/api";
import { useNavigate } from "react-router-dom";

const SearchModal = ({ show, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users"); // "users" | "posts" | "hashtags"
  const [results, setResults] = useState({ users: [], posts: [], hashtags: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], posts: [], hashtags: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const data = await api.search(query);
      if (data.success) {
        setResults({
          users: data.users || [],
          posts: data.posts || [],
          hashtags: data.hashtags || []
        });
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-ig-surface border border-ig-border rounded-2xl w-full max-w-[500px] overflow-hidden shadow-2xl flex flex-col h-[520px]"
          >
            {/* Search Input Bar */}
            <div className="p-4 border-b border-ig-border/80 flex items-center gap-3">
              <FiSearch className="text-ig-text-secondary" size={20} />
              <input
                type="text"
                autoFocus
                placeholder="Search users, captions, #hashtags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-ig-text placeholder-ig-text-secondary"
              />
              <button
                onClick={onClose}
                className="p-1 hover:bg-ig-hover rounded-lg text-ig-text-secondary hover:text-ig-text cursor-pointer transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-ig-border/40 bg-ig-bg/20">
              <button
                onClick={() => setActiveTab("users")}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${activeTab === "users" ? "border-ig-primary text-ig-primary" : "border-transparent text-ig-text-secondary"}`}
              >
                <FiUser size={14} /> Accounts ({results.users.length})
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${activeTab === "posts" ? "border-ig-primary text-ig-primary" : "border-transparent text-ig-text-secondary"}`}
              >
                <FiImage size={14} /> Posts ({results.posts.length})
              </button>
              <button
                onClick={() => setActiveTab("hashtags")}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${activeTab === "hashtags" ? "border-ig-primary text-ig-primary" : "border-transparent text-ig-text-secondary"}`}
              >
                <FiHash size={14} /> Hashtags ({results.hashtags.length})
              </button>
            </div>

            {/* Results feed */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-6 h-6 border-2 border-ig-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : !query.trim() ? (
                <div className="text-center py-20 text-ig-text-secondary">
                  <p className="text-sm font-semibold">Search Instagram</p>
                  <p className="text-xs text-ig-text-secondary/60 mt-1">Search for people, post captions, or #hashtags</p>
                </div>
              ) : activeTab === "users" ? (
                results.users.length > 0 ? (
                  results.users.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => {
                        navigate(`/profile/${u._id}`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-ig-hover cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          className="w-10 h-10 rounded-full object-cover border border-ig-border/40"
                          alt={u.username}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-ig-text">{u.username}</span>
                          <span className="text-xs text-ig-text-secondary">{u.name} • {u.followersCount} followers</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-16 text-xs text-ig-text-secondary">No users found for "{query}"</p>
                )
              ) : activeTab === "posts" ? (
                results.posts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 p-1">
                    {results.posts.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => {
                          onClose();
                          window.location.hash = `post-${p._id}`;
                        }}
                        className="aspect-square bg-ig-hover rounded-xl overflow-hidden cursor-pointer relative group border border-ig-border/40"
                      >
                        <img
                          src={`${API_BASE_URL}/uploads/${p.image}`}
                          alt={p.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                          ❤️ {p.likes}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-16 text-xs text-ig-text-secondary">No posts found matching "{query}"</p>
                )
              ) : (
                results.hashtags.length > 0 ? (
                  results.hashtags.map((h, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setQuery(h.tag);
                        setActiveTab("posts");
                      }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-ig-hover cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full border border-ig-border flex items-center justify-center text-ig-primary bg-ig-primary/10">
                          <FiHash size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-ig-text">{h.tag}</span>
                          <span className="text-xs text-ig-text-secondary">{h.count} posts</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-16 text-xs text-ig-text-secondary">No hashtags found matching "{query}"</p>
                )
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
