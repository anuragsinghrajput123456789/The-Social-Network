import React, { useEffect, useState } from "react";
import { FiX, FiCheckCircle } from "react-icons/fi";
import { FaHeart, FaComment, FaUserPlus, FaPaperPlane } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { api, API_BASE_URL } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const NotificationsDrawer = ({ show, onClose, onUnreadCountChange }) => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await api.getNotifications();
    if (data.success) {
      setNotifications(data.data || []);
      if (onUnreadCountChange) onUnreadCountChange(data.unreadCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (show) {
      fetchNotifications();
      api.markNotificationsRead().then(() => {
        if (onUnreadCountChange) onUnreadCountChange(0);
      });
    }
  }, [show]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      if (onUnreadCountChange) onUnreadCountChange((prev) => prev + 1);
    };

    socket.on("newNotification", handleNewNotification);
    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket, onUnreadCountChange]);

  const renderIcon = (type) => {
    switch (type) {
      case "like":
        return <FaHeart className="text-[#ff3040]" size={14} />;
      case "comment":
        return <FaComment className="text-blue-500" size={14} />;
      case "follow":
        return <FaUserPlus className="text-emerald-500" size={14} />;
      case "message":
      case "share":
        return <FaPaperPlane className="text-purple-500" size={14} />;
      default:
        return <FaHeart className="text-ig-primary" size={14} />;
    }
  };

  const getNotificationText = (n) => {
    const username = n.senderId?.username || "Someone";
    switch (n.type) {
      case "like":
        return `${username} liked your post.`;
      case "comment":
        return `${username} commented: "${n.commentText || "nice!"}"`;
      case "follow":
        return `${username} started following you.`;
      case "share":
        return `${username} shared a post with you.`;
      case "message":
        return `${username} sent you a message.`;
      default:
        return `${username} interacted with you.`;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-start md:ml-[245px]">
          <div className="flex-1" onClick={onClose}></div>

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-[400px] bg-ig-surface border-r border-ig-border h-full flex flex-col relative shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-ig-border/80 flex items-center justify-between">
              <h3 className="font-bold text-lg text-ig-text">Notifications</h3>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-ig-hover rounded-xl text-ig-text-secondary hover:text-ig-text cursor-pointer transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-6 h-6 border-2 border-ig-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => {
                      if (n.type === "follow" && n.senderId?._id) {
                        navigate(`/profile/${n.senderId._id}`);
                      } else if (n.type === "message" || n.type === "share") {
                        navigate("/messages");
                      }
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl hover:bg-ig-hover cursor-pointer transition-all duration-200 border ${!n.read ? "bg-ig-primary/5 border-ig-primary/20" : "border-transparent"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          className="w-10 h-10 rounded-full object-cover border border-ig-border/40"
                          alt="User"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-ig-surface p-1 rounded-full border border-ig-border">
                          {renderIcon(n.type)}
                        </div>
                      </div>
                      <div className="flex flex-col text-xs leading-tight max-w-[200px]">
                        <span className="text-ig-text font-medium">{getNotificationText(n)}</span>
                        <span className="text-[10px] text-ig-text-secondary mt-1">
                          {dayjs(n.createdAt).fromNow()}
                        </span>
                      </div>
                    </div>

                    {n.postId?.image && (
                      <img
                        src={`${API_BASE_URL}/uploads/${n.postId.image}`}
                        alt="Post"
                        className="w-10 h-10 rounded-lg object-cover border border-ig-border/40"
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-ig-text-secondary">
                  <p className="text-sm font-semibold">No notifications yet</p>
                  <p className="text-xs text-ig-text-secondary/60 mt-1">
                    When someone likes, comments, or follows you, you'll see it here.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsDrawer;
