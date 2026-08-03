import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/api";
import { FiMoreHorizontal, FiCornerUpLeft, FiTrash2, FiShare2, FiCheck, FiCheckCircle } from "react-icons/fi";
import dayjs from "dayjs";

const ChatMessageItem = ({
  msg,
  currentUserId,
  onReply,
  onReact,
  onDelete,
  onForward
}) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isOwn = msg.senderId === currentUserId;
  const isDeleted = msg.isDeletedForEveryone;

  const quickEmojis = ["❤️", "😂", "😮", "😢", "🙏", "👍"];

  const renderStatus = () => {
    if (!isOwn) return null;
    if (msg.status === "seen") {
      return <span className="text-blue-500 font-bold text-[10px] ml-1">✓✓</span>;
    }
    if (msg.status === "delivered") {
      return <span className="text-ig-text-secondary/70 text-[10px] ml-1">✓✓</span>;
    }
    return <span className="text-ig-text-secondary/50 text-[10px] ml-1">✓</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowEmojiPicker(false);
      }}
      className={`flex items-end gap-2 group relative mb-2 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      {/* Quick Action Popover (Reply, React, Delete) */}
      <AnimatePresence>
        {showActions && !isDeleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute -top-9 ${isOwn ? "right-2" : "left-2"} bg-ig-surface border border-ig-border rounded-xl px-2 py-1 flex items-center gap-2 shadow-lg z-30`}
          >
            {quickEmojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => {
                  onReact(msg._id, emoji);
                  setShowActions(false);
                }}
                className="hover:scale-125 transition-transform text-xs cursor-pointer"
              >
                {emoji}
              </button>
            ))}
            <div className="w-[1px] h-3 bg-ig-border/60 mx-0.5"></div>
            <button
              onClick={() => {
                onReply(msg);
                setShowActions(false);
              }}
              title="Reply"
              className="text-ig-text-secondary hover:text-ig-primary p-0.5 cursor-pointer"
            >
              <FiCornerUpLeft size={13} />
            </button>
            <button
              onClick={() => {
                onForward(msg);
                setShowActions(false);
              }}
              title="Forward"
              className="text-ig-text-secondary hover:text-ig-primary p-0.5 cursor-pointer"
            >
              <FiShare2 size={13} />
            </button>
            <button
              onClick={() => {
                onDelete(msg._id, "me");
                setShowActions(false);
              }}
              title="Delete for me"
              className="text-ig-text-secondary hover:text-red-500 p-0.5 cursor-pointer"
            >
              <FiTrash2 size={13} />
            </button>
            {isOwn && (
              <button
                onClick={() => {
                  onDelete(msg._id, "everyone");
                  setShowActions(false);
                }}
                title="Delete for everyone"
                className="text-red-400 hover:text-red-600 text-[9px] font-bold px-1 cursor-pointer"
              >
                All
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`max-w-[75%] flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
        {/* Quoted Reply Preview */}
        {msg.replyTo && msg.replyTo.text && (
          <div className="text-[11px] bg-ig-hover/40 border-l-2 border-ig-primary px-2.5 py-1 rounded-md text-ig-text-secondary mb-0.5 max-w-full truncate">
            <span className="font-bold mr-1 text-ig-primary">@{msg.replyTo.senderUsername}:</span>
            <span>{msg.replyTo.text}</span>
          </div>
        )}

        {/* Message Content / Shared Post / Image */}
        {msg.sharedPost ? (
          <div
            onClick={() => navigate(`/profile/${msg.sharedPost.uploadedBy}`)}
            className="bg-ig-surface border border-ig-border rounded-2xl overflow-hidden cursor-pointer hover:border-ig-primary transition-all duration-300 shadow-md w-[220px]"
          >
            <div className="p-2 border-b border-ig-border/40 flex items-center gap-2 bg-ig-hover/20">
              <img
                className="w-5 h-5 rounded-full object-cover"
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                alt="shared user"
              />
              <span className="text-[10px] font-bold text-ig-text truncate">BondBase Post</span>
            </div>
            <div className="w-full aspect-square bg-ig-hover">
              <img
                src={`${API_BASE_URL}/uploads/${msg.sharedPost.image}`}
                alt="shared post"
                className="w-full h-full object-cover"
              />
            </div>
            {msg.sharedPost.caption && (
              <p className="text-[11px] p-2.5 text-ig-text-secondary truncate bg-ig-surface">
                {msg.sharedPost.caption}
              </p>
            )}
          </div>
        ) : msg.image ? (
          <div className="rounded-2xl overflow-hidden border border-ig-border max-w-[260px] bg-ig-hover shadow-sm">
            <img
              src={`${API_BASE_URL}/uploads/${msg.image}`}
              alt="Attachment"
              className="w-full h-auto object-cover max-h-[280px]"
            />
            {msg.message && (
              <p className="p-2 text-xs text-ig-text bg-ig-surface/90">{msg.message}</p>
            )}
          </div>
        ) : (
          <div
            className={`p-3 text-[14px] leading-relaxed shadow-sm ${
              isDeleted
                ? "bg-ig-hover/40 text-ig-text-secondary italic rounded-2xl border border-ig-border/40 text-xs"
                : isOwn
                ? "bg-ig-primary text-white rounded-2xl rounded-tr-sm font-medium"
                : "bg-ig-surface border border-ig-border text-ig-text rounded-2xl rounded-tl-sm"
            }`}
          >
            {msg.message}
          </div>
        )}

        {/* Reactions Display */}
        {msg.reactions && msg.reactions.length > 0 && !isDeleted && (
          <div className="flex gap-1 -mt-2.5 z-10 bg-ig-surface border border-ig-border/80 px-1.5 py-0.5 rounded-full shadow-sm text-xs">
            {msg.reactions.map((r, idx) => (
              <span key={idx}>{r.emoji}</span>
            ))}
          </div>
        )}

        {/* Timestamp & Status */}
        <div className={`flex items-center gap-1 text-[9px] text-ig-text-secondary/60 px-1 mt-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
          <span>{dayjs(msg.createdAt || msg.date).format("h:mm A")}</span>
          {renderStatus()}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(ChatMessageItem);
