import React from "react";
import { BsGrid3X3 } from "react-icons/bs";
import { BiMoviePlay, BiUserPin } from "react-icons/bi";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../services/api";

const ProfileGrid = ({ posts, activeTab, setActiveTab }) => {
  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex justify-center border-t border-ig-border/60 -mt-[1px] relative">
        <div
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 h-[52px] border-t cursor-pointer mx-8 transition-colors ${
            activeTab === "posts"
              ? "border-ig-text text-ig-text font-bold"
              : "border-transparent text-ig-text-secondary"
          }`}
        >
          <BsGrid3X3 size={13} />
          <span className="text-[11px] font-bold uppercase tracking-widest">Posts</span>
        </div>
        <div
          onClick={() => setActiveTab("reels")}
          className={`flex items-center gap-2 h-[52px] border-t cursor-pointer mx-8 transition-colors ${
            activeTab === "reels"
              ? "border-ig-text text-ig-text font-bold"
              : "border-transparent text-ig-text-secondary"
          }`}
        >
          <BiMoviePlay size={13} />
          <span className="text-[11px] font-bold uppercase tracking-widest">Reels</span>
        </div>
        <div
          onClick={() => setActiveTab("tagged")}
          className={`flex items-center gap-2 h-[52px] border-t cursor-pointer mx-4 md:mx-8 transition-colors ${
            activeTab === "tagged"
              ? "border-ig-text text-ig-text font-bold"
              : "border-transparent text-ig-text-secondary"
          }`}
        >
          <BiUserPin size={13} />
          <span className="text-[11px] font-bold uppercase tracking-widest">Tagged</span>
        </div>
        <a
          href="/saved"
          className="flex items-center gap-2 h-[52px] border-t border-transparent cursor-pointer mx-4 md:mx-8 text-ig-text-secondary hover:text-ig-text transition-colors"
        >
          <BsGrid3X3 size={13} className="hidden" />
          <span className="text-[11px] font-bold uppercase tracking-widest">Saved</span>
        </a>
      </div>

      {/* Posts Grid with hover scale effects */}
      <div className="grid grid-cols-3 gap-1.5 md:gap-6 mt-4">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              key={post._id || index}
              className="relative aspect-square group cursor-pointer bg-ig-hover rounded-xl overflow-hidden shadow-md border border-ig-border/30"
            >
              <img
                src={`${API_BASE_URL}/uploads/${post.image}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt="Post"
                loading="lazy"
                decoding="async"
              />

              {/* Hover Glassmorphism overlay */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white font-bold transition-all duration-300">
                <span className="flex items-center gap-1 text-sm md:text-lg drop-shadow-md">
                  ❤️ {post.likes ? post.likes.length : 0}
                </span>
                <span className="flex items-center gap-1 text-sm md:text-lg drop-shadow-md">
                  💬 {post.comments ? post.comments.length : 0}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-ig-text-secondary">
            <BsGrid3X3 size={40} className="mb-4 text-ig-border" />
            <h2 className="text-xl font-light text-ig-text">No Posts Yet</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProfileGrid);
