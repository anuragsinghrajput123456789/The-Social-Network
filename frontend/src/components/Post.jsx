import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaRegHeart } from "react-icons/fa6";
import { FiRefreshCw } from "react-icons/fi";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

import SinglePost from "./Post/SinglePost";
import PostSkeleton from "./Post/PostSkeleton";

const Post = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Pull to refresh state
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartRef = useRef(0);

  const currentUserId = localStorage.getItem("userId");
  const observerRef = useRef(null);

  const getPosts = async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);

      const result = await api.getPosts(pageNum, 10);
      if (result.success) {
        const newPosts = result.data || [];
        if (append) {
          setData((prev) => {
            const existingIds = new Set(prev.map((p) => p.post._id));
            const filteredNew = newPosts.filter((p) => !existingIds.has(p.post._id));
            return [...prev, ...filteredNew];
          });
        } else {
          setData(newPosts);
        }
        setHasMore(result.hasMore !== undefined ? result.hasMore : newPosts.length >= 10);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      setPullY(0);
    }
  };

  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    getPosts(nextPage, true);
  }, [loadingMore, hasMore, loading, page]);

  // Infinite Scroll IntersectionObserver
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore, loadMorePosts]
  );

  // Mobile Pull to Refresh Handlers
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      touchStartRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (window.scrollY === 0 && touchStartRef.current > 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartRef.current;
      if (diff > 0) {
        setPullY(Math.min(diff * 0.4, 80));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullY > 60 && !refreshing) {
      setRefreshing(true);
      setPage(1);
      getPosts(1, false);
    } else {
      setPullY(0);
    }
    touchStartRef.current = 0;
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
      const result = await api.toggleLike(id);
      if (!result.success) {
        toast.error(result.msg);
        getPosts(1, false);
      }
    } catch (error) {
      getPosts(1, false);
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
    getPosts(1, false);
  }, []);

  if (loading) {
    return <PostSkeleton />;
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col gap-1 pb-20 w-full relative"
    >
      {/* Mobile Pull-to-Refresh Indicator */}
      <AnimatePresence>
        {(pullY > 0 || refreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: pullY || 50, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center overflow-hidden w-full text-ig-primary font-bold text-xs gap-2"
          >
            <FiRefreshCw className={refreshing ? "animate-spin text-lg" : "text-lg"} style={{ transform: `rotate(${pullY * 3}deg)` }} />
            <span>{refreshing ? "Refreshing Feed..." : pullY > 60 ? "Release to refresh" : "Pull down to refresh"}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {data.length > 0 ? (
        <>
          {data.map((item, index) => {
            const isLast = index === data.length - 1;
            return (
              <div key={item.post._id || index} ref={isLast ? lastPostElementRef : null}>
                <SinglePost
                  item={item}
                  toggleLike={toggleLike}
                  currentUserId={currentUserId}
                  onPostDeleted={onPostDeleted}
                  onPostUpdated={onPostUpdated}
                />
              </div>
            );
          })}

          {loadingMore && (
            <div className="flex justify-center py-6">
              <div className="w-7 h-7 border-2 border-ig-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!hasMore && data.length > 3 && (
            <div className="text-center py-8 text-xs font-semibold text-ig-text-secondary/60 tracking-wider uppercase">
              ✨ You're all caught up!
            </div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center p-12 text-center bg-ig-surface border border-ig-border rounded-2xl"
        >
          <div className="w-16 h-16 border-2 border-ig-border rounded-full flex items-center justify-center mb-4 text-ig-text-secondary">
            <FaRegHeart size={32} />
          </div>
          <h3 className="font-semibold text-lg text-ig-text mb-2">No Posts Yet</h3>
          <p className="text-ig-text-secondary text-sm mb-6 max-w-[280px]">
            Start following people or create a post to see updates here.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Post;
