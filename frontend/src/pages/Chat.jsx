import React, { useEffect, useState, useRef, useCallback } from "react";
import { api } from "../services/api";
import { useSocket } from "../context/SocketContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { RiMessengerLine, RiSendPlaneFill } from "react-icons/ri";
import { FiChevronLeft, FiImage, FiSmile, FiX, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import ChatSidebar from "../components/Chat/ChatSidebar";
import ChatMessageItem from "../components/Chat/ChatMessageItem";

const Chat = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const { socket, onlineUsers } = useSocket();

  const [activeChats, setActiveChats] = useState([]);
  const [connections, setConnections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileShowFeed, setMobileShowFeed] = useState(false);

  // Advanced feature states
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Search within chat
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  
  // Pagination / Infinite scrolling
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectedPartnerRef = useRef(selectedPartner);

  const quickEmojis = ["❤️", "😂", "😮", "🔥", "👍", "🙌", "😍", "🎉", "💯", "🙏"];

  useEffect(() => {
    selectedPartnerRef.current = selectedPartner;
  }, [selectedPartner]);

  // Fetch chat list
  const fetchChatList = async () => {
    try {
      const data = await api.getChatList();
      if (data.success) {
        setActiveChats(data.activeChats || []);
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error("Error fetching chats list:", error);
    }
  };

  useEffect(() => {
    fetchChatList();
  }, []);

  // Handle Socket Events & Automatic Reconnection
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      const currentPartner = selectedPartnerRef.current;
      if (
        (message.senderId === userId && message.receiverId === currentPartner?._id) ||
        (message.senderId === currentPartner?._id && message.receiverId === userId)
      ) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });

        // If currently chatting with partner, emit markSeen
        if (message.senderId === currentPartner?._id) {
          socket.emit("markSeen", {
            senderId: currentPartner._id,
            receiverId: userId
          });
        }
      }
      fetchChatList();
    };

    const handleMessagesSeen = ({ senderId, receiverId }) => {
      const currentPartner = selectedPartnerRef.current;
      if (currentPartner && (senderId === currentPartner._id || receiverId === currentPartner._id)) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === userId ? { ...m, status: "seen" } : m))
        );
      }
    };

    const handleMessageUpdated = (updatedMsg) => {
      const currentPartner = selectedPartnerRef.current;
      if (
        (updatedMsg.senderId === userId && updatedMsg.receiverId === currentPartner?._id) ||
        (updatedMsg.senderId === currentPartner?._id && updatedMsg.receiverId === userId)
      ) {
        setMessages((prev) =>
          prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
        );
      }
    };

    const handleTyping = (data) => {
      const currentPartner = selectedPartnerRef.current;
      if (data.senderId === currentPartner?._id) {
        setIsPartnerTyping(data.isTyping);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("messageUpdated", handleMessageUpdated);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messagesSeen", handleMessagesSeen);
      socket.off("messageUpdated", handleMessageUpdated);
      socket.off("typing", handleTyping);
    };
  }, [socket, userId]);

  // Fetch message history when selected partner changes
  useEffect(() => {
    if (!selectedPartner) return;

    let isMounted = true;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      setPage(1);
      setReplyingTo(null);
      setSelectedImage(null);
      setImagePreview(null);
      setShowChatSearch(false);
      setChatSearchQuery("");

      try {
        const data = await api.getChatMessages(selectedPartner._id, 1, 30);
        if (isMounted && data.success) {
          setMessages(data.messages || []);
          setHasMoreMessages(data.hasMore || false);
        }
      } catch (error) {
        if (isMounted) toast.error("Failed to load message history");
      } finally {
        if (isMounted) setLoadingMessages(false);
      }

      // Mark messages as seen via socket
      if (socket && socket.connected) {
        socket.emit("markSeen", {
          senderId: selectedPartner._id,
          receiverId: userId
        });
      }
    };

    fetchMessages();
    setIsPartnerTyping(false);

    return () => {
      isMounted = false;
    };
  }, [selectedPartner, socket, userId]);

  // Load earlier messages on scroll top
  const handleScroll = async (e) => {
    if (e.target.scrollTop === 0 && hasMoreMessages && !loadingMoreHistory && selectedPartner) {
      setLoadingMoreHistory(true);
      const nextPage = page + 1;
      try {
        const data = await api.getChatMessages(selectedPartner._id, nextPage, 30);
        if (data.success) {
          const olderMessages = data.messages || [];
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m._id));
            const filteredOlder = olderMessages.filter((m) => !existingIds.has(m._id));
            return [...filteredOlder, ...prev];
          });
          setPage(nextPage);
          setHasMoreMessages(data.hasMore || false);
        }
      } catch (err) {
        console.error("Error loading older messages:", err);
      } finally {
        setLoadingMoreHistory(false);
      }
    }
  };

  // Scroll to bottom on initial message load or new message
  useEffect(() => {
    if (page === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isPartnerTyping, page]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !selectedPartner) return;

    const messageText = newMessage.trim();
    const replyData = replyingTo
      ? {
          messageId: replyingTo._id,
          text: replyingTo.message || (replyingTo.image ? "📷 Photo" : "Attachment"),
          senderUsername: replyingTo.senderId === userId ? "You" : selectedPartner.username
        }
      : null;

    setNewMessage("");
    setReplyingTo(null);
    setImagePreview(null);
    setShowEmojiPicker(false);

    if (selectedImage) {
      // Send message via FormData endpoint
      const formData = new FormData();
      formData.append("receiverId", selectedPartner._id);
      formData.append("message", messageText);
      formData.append("image", selectedImage);
      if (replyData) formData.append("replyTo", JSON.stringify(replyData));

      setSelectedImage(null);
      const res = await api.sendMessage(formData);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        if (socket) {
          socket.emit("receiveMessage", res.data);
        }
      } else {
        toast.error(res.msg || "Failed to send image");
      }
    } else {
      setSelectedImage(null);
      if (socket && socket.connected) {
        socket.emit("sendMessage", {
          senderId: userId,
          receiverId: selectedPartner._id,
          message: messageText,
          replyTo: replyData
        });

        socket.emit("typing", {
          senderId: userId,
          receiverId: selectedPartner._id,
          isTyping: false
        });
      } else {
        // Fallback HTTP endpoint if socket re-connecting
        const res = await api.sendMessage({
          receiverId: selectedPartner._id,
          message: messageText,
          replyTo: replyData
        });
        if (res.success && res.data) {
          setMessages((prev) => [...prev, res.data]);
        }
      }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedPartner) return;

    socket.emit("typing", {
      senderId: userId,
      receiverId: selectedPartner._id,
      isTyping: true
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        senderId: userId,
        receiverId: selectedPartner._id,
        isTyping: false
      });
    }, 2000);
  };

  const handleReact = (messageId, emoji) => {
    if (socket) {
      socket.emit("reactMessage", { messageId, userId, emoji });
    }
  };

  const handleDelete = (messageId, deleteType) => {
    if (socket) {
      socket.emit("deleteMessage", { messageId, userId, deleteType });
    }
  };

  const handleForward = (msg) => {
    const textToShare = msg.message || "Check out this chat attachment";
    navigator.clipboard.writeText(textToShare);
    toast.success("Message text copied for forwarding!");
  };

  const filteredMessages = chatSearchQuery.trim()
    ? messages.filter((m) =>
        m.message && m.message.toLowerCase().includes(chatSearchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="flex w-full h-screen bg-ig-bg text-ig-text transition-colors duration-300">
      {/* Sidebar Component */}
      <ChatSidebar
        activeChats={activeChats}
        connections={connections}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPartner={selectedPartner}
        onSelectPartner={(partner) => {
          setSelectedPartner(partner);
          setMobileShowFeed(true);
        }}
        onlineUsers={onlineUsers}
        mobileShowFeed={mobileShowFeed}
      />

      {/* Main Chat Feed Panel */}
      <div
        className={`${
          !mobileShowFeed ? "hidden" : "flex"
        } md:flex flex-1 flex-col bg-ig-bg h-full transition-all duration-300 relative pb-16 md:pb-0`}
      >
        {selectedPartner ? (
          <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="p-4 border-b border-ig-border bg-ig-surface flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileShowFeed(false)}
                  className="md:hidden p-1.5 hover:bg-ig-hover rounded-xl text-ig-text cursor-pointer transition-colors"
                >
                  <FiChevronLeft size={22} />
                </button>
                <div className="relative">
                  <img
                    className="w-10 h-10 rounded-full object-cover border border-ig-border/40"
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    alt={selectedPartner.username}
                  />
                  {onlineUsers.includes(selectedPartner._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-ig-surface rounded-full"></span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span
                    onClick={() => navigate(`/profile/${selectedPartner._id}`)}
                    className="text-sm font-semibold cursor-pointer hover:underline text-ig-text"
                  >
                    {selectedPartner.username}
                  </span>
                  <span className="text-[10px] text-ig-text-secondary">
                    {onlineUsers.includes(selectedPartner._id) ? "Online now" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Search Toggle */}
              <div className="flex items-center gap-2">
                {showChatSearch && (
                  <input
                    type="text"
                    placeholder="Search in chat..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    className="bg-ig-bg border border-ig-border rounded-xl px-3 py-1 text-xs text-ig-text outline-none focus:border-ig-primary"
                  />
                )}
                <button
                  onClick={() => setShowChatSearch(!showChatSearch)}
                  className="p-2 hover:bg-ig-hover rounded-xl text-ig-text-secondary hover:text-ig-text cursor-pointer transition-colors"
                >
                  <FiSearch size={18} />
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-5 space-y-4"
            >
              {loadingMoreHistory && (
                <div className="flex justify-center py-2">
                  <div className="w-5 h-5 border-2 border-ig-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-ig-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                filteredMessages.map((msg, index) => (
                  <ChatMessageItem
                    key={msg._id || index}
                    msg={msg}
                    currentUserId={userId}
                    onReply={(m) => setReplyingTo(m)}
                    onReact={handleReact}
                    onDelete={handleDelete}
                    onForward={handleForward}
                  />
                ))
              )}

              {/* Partner Typing Indicator */}
              <AnimatePresence>
                {isPartnerTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-ig-surface border border-ig-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 bg-ig-text-secondary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-ig-text-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-ig-text-secondary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Quoted Reply Preview Bar */}
            <AnimatePresence>
              {replyingTo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-2 bg-ig-hover/40 border-t border-ig-border flex items-center justify-between"
                >
                  <div className="flex flex-col text-xs text-ig-text">
                    <span className="font-bold text-ig-primary">
                      Replying to {replyingTo.senderId === userId ? "yourself" : selectedPartner.username}
                    </span>
                    <span className="text-ig-text-secondary truncate max-w-[280px]">
                      {replyingTo.message || (replyingTo.image ? "📷 Photo" : "Attachment")}
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="p-1 text-ig-text-secondary hover:text-ig-text cursor-pointer"
                  >
                    <FiX size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Image Preview Bar */}
            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-ig-surface border-t border-ig-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-ig-border" />
                    <span className="text-xs text-ig-text font-semibold">Image attachment ready</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="p-1 text-ig-text-secondary hover:text-ig-text cursor-pointer"
                  >
                    <FiX size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Emoji Bar Popover */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-4 py-2 bg-ig-surface border-t border-ig-border flex items-center justify-around"
                >
                  {quickEmojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => setNewMessage((prev) => prev + emoji)}
                      className="text-lg hover:scale-125 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-ig-border bg-ig-surface flex items-center gap-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-ig-text-secondary hover:text-ig-primary rounded-xl hover:bg-ig-hover cursor-pointer transition-colors"
                title="Attach photo"
              >
                <FiImage size={22} />
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 text-ig-text-secondary hover:text-ig-primary rounded-xl hover:bg-ig-hover cursor-pointer transition-colors"
                title="Emojis"
              >
                <FiSmile size={22} />
              </button>

              <input
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={handleTyping}
                className="flex-1 bg-ig-bg/50 border border-ig-border rounded-2xl px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-ig-primary focus:ring-2 focus:ring-ig-primary/20 placeholder-ig-text-secondary/40 text-ig-text"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={!newMessage.trim() && !selectedImage}
                className="bg-ig-primary hover:bg-ig-primary-hover disabled:opacity-40 disabled:hover:bg-ig-primary text-white p-3 rounded-2xl shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center"
              >
                <RiSendPlaneFill size={18} />
              </motion.button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center bg-ig-bg/40">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-[100px] h-[100px] bg-ig-surface border-2 border-ig-border rounded-full flex items-center justify-center text-ig-text-secondary shadow-lg mb-6"
            >
              <RiMessengerLine size={52} className="text-ig-primary" />
            </motion.div>
            <h3 className="text-xl font-bold tracking-wide text-ig-text mb-2">Your Messages</h3>
            <p className="text-sm text-ig-text-secondary max-w-[290px] leading-relaxed">
              Send private photos and messages to a friend or connection dynamically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
