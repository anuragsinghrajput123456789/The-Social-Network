import React, { useState, useEffect } from "react";
import { FiX, FiSearch, FiShare2, FiCopy, FiUser } from "react-icons/fi";
import { BsQrCode } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { toast } from "react-toastify";

const ShareModal = ({ show, onClose, postId, currentUserId }) => {
  const { socket } = useSocket();
  const [connections, setConnections] = useState([]);
  const [shareSearch, setShareSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("direct"); // "direct" | "qr"

  const postUrl = `${window.location.origin}/#post-${postId}`;
  const profileUrl = `${window.location.origin}/profile/${currentUserId}`;

  const fetchConnections = async () => {
    setLoading(true);
    const data = await api.getChatList();
    if (data.success) {
      setConnections(data.connections || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (show) {
      fetchConnections();
    }
  }, [show]);

  const handleShareToPartner = async (partnerId) => {
    try {
      if (socket && socket.connected) {
        socket.emit("sendMessage", {
          senderId: currentUserId,
          receiverId: partnerId,
          message: "",
          sharedPost: postId
        });
      } else {
        await api.sendMessage(partnerId, "Shared a post", postId);
      }
      toast.success("Post shared to chat!");
      onClose();
    } catch (err) {
      navigator.clipboard.writeText(postUrl);
      toast.success("Post link copied to clipboard!");
      onClose();
    }
  };

  const handleCopyPostLink = () => {
    navigator.clipboard.writeText(postUrl);
    toast.success("Post link copied to clipboard!");
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied to clipboard!");
  };

  const handleNativeShare = async (title, url) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url
        });
      } catch (err) {
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const filteredConnections = connections.filter(
    (conn) =>
      conn.username.toLowerCase().includes(shareSearch.toLowerCase()) ||
      conn.name.toLowerCase().includes(shareSearch.toLowerCase())
  );

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-ig-surface border border-ig-border rounded-2xl w-full max-w-[420px] overflow-hidden shadow-2xl flex flex-col h-[490px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-ig-border/80 flex items-center justify-between">
              <h3 className="font-bold text-base text-ig-text">Share</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab(activeTab === "direct" ? "qr" : "direct")}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${activeTab === "qr" ? "bg-ig-primary text-white" : "bg-ig-hover text-ig-text-secondary"}`}
                >
                  <BsQrCode size={15} /> QR Code
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-ig-hover rounded-lg text-ig-text-secondary hover:text-ig-text cursor-pointer transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {activeTab === "direct" ? (
              <>
                {/* Actions Grid */}
                <div className="p-3 border-b border-ig-border/40 grid grid-cols-3 gap-2">
                  <button
                    onClick={handleCopyPostLink}
                    className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-ig-hover border border-ig-border/60 hover:bg-ig-border/60 rounded-xl text-xs font-semibold text-ig-text transition-all cursor-pointer"
                  >
                    <FiCopy size={16} className="text-ig-primary" />
                    <span>Copy Link</span>
                  </button>
                  <button
                    onClick={handleCopyProfileLink}
                    className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-ig-hover border border-ig-border/60 hover:bg-ig-border/60 rounded-xl text-xs font-semibold text-ig-text transition-all cursor-pointer"
                  >
                    <FiUser size={16} className="text-ig-primary" />
                    <span>Share Profile</span>
                  </button>
                  <button
                    onClick={() => handleNativeShare("Check out this post on Instagram Clone", postUrl)}
                    className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-ig-hover border border-ig-border/60 hover:bg-ig-border/60 rounded-xl text-xs font-semibold text-ig-text transition-all cursor-pointer"
                  >
                    <FiShare2 size={16} className="text-ig-primary" />
                    <span>More</span>
                  </button>
                </div>

                {/* Search Connections */}
                <div className="px-3 pt-3">
                  <div className="flex items-center bg-ig-bg/50 border border-ig-border rounded-xl px-3 py-2">
                    <FiSearch className="text-ig-text-secondary/55 mr-2" size={16} />
                    <input
                      type="text"
                      placeholder="Search connection..."
                      value={shareSearch}
                      onChange={(e) => setShareSearch(e.target.value)}
                      className="bg-transparent text-xs w-full outline-none placeholder-ig-text-secondary/50 text-ig-text"
                    />
                  </div>
                </div>

                {/* Connections list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-6 h-6 border-2 border-ig-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : filteredConnections.length > 0 ? (
                    filteredConnections.map((conn) => (
                      <div
                        key={conn._id}
                        onClick={() => handleShareToPartner(conn._id)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-ig-hover cursor-pointer transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            className="w-9 h-9 rounded-full object-cover border border-ig-border/40"
                            alt={conn.username}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-ig-text">{conn.username}</span>
                            <span className="text-[10px] text-ig-text-secondary">{conn.name}</span>
                          </div>
                        </div>
                        <button className="text-xs bg-ig-primary hover:bg-ig-primary-hover text-white py-1.5 px-3.5 rounded-lg cursor-pointer font-bold transition-all">
                          Send
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-ig-text-secondary">
                      <p className="text-xs">No connections found.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* QR Code Tab */
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-5 rounded-2xl shadow-xl border-4 border-ig-primary/30 mb-4">
                  {/* Generated clean SVG QR placeholder styling */}
                  <div className="w-40 h-40 bg-slate-900 rounded-xl p-3 flex flex-col justify-between items-center text-white text-[10px] font-mono select-none">
                    <div className="flex justify-between w-full">
                      <div className="w-8 h-8 border-2 border-white bg-white/20 rounded"></div>
                      <div className="w-8 h-8 border-2 border-white bg-white/20 rounded"></div>
                    </div>
                    <div className="my-auto font-bold text-center text-xs tracking-wider uppercase text-ig-primary">
                      SCAN POST
                    </div>
                    <div className="flex justify-between w-full">
                      <div className="w-8 h-8 border-2 border-white bg-white/20 rounded"></div>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <h4 className="font-bold text-sm text-ig-text mb-1">Scan to View Post</h4>
                <p className="text-xs text-ig-text-secondary max-w-[260px] mb-4">
                  Point your mobile phone camera at this QR code to quickly open this post link.
                </p>
                <button
                  onClick={handleCopyPostLink}
                  className="bg-ig-hover hover:bg-ig-border text-ig-text text-xs font-semibold py-2 px-5 rounded-xl border border-ig-border transition-colors cursor-pointer"
                >
                  Copy URL Instead
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
