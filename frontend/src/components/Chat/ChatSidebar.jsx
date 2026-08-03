import React from "react";
import { RiMessengerLine } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import dayjs from "dayjs";

const ChatSidebar = ({
  activeChats,
  connections,
  searchQuery,
  setSearchQuery,
  selectedPartner,
  onSelectPartner,
  onlineUsers,
  mobileShowFeed
}) => {
  const filteredConnections = connections.filter(
    (conn) =>
      conn.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`${
        mobileShowFeed ? "hidden" : "flex"
      } md:flex flex-col w-full md:w-[350px] border-r border-ig-border bg-ig-surface h-full pb-20 md:pb-0 transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-5 border-b border-ig-border/60 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-wide">Messages</h2>
        <RiMessengerLine size={24} className="text-ig-primary animate-pulse" />
      </div>

      {/* Search */}
      <div className="p-4 relative">
        <div className="flex items-center bg-ig-bg/50 border border-ig-border rounded-xl px-3 py-2 transition-all focus-within:border-ig-primary focus-within:ring-2 focus-within:ring-ig-primary/20">
          <FiSearch size={18} className="text-ig-text-secondary/70 mr-2" />
          <input
            type="text"
            placeholder="Search followers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm w-full outline-none placeholder-ig-text-secondary/50 text-ig-text"
          />
        </div>
      </div>

      {/* Chats / Connections stream */}
      <div className="flex-1 overflow-y-auto px-2">
        {searchQuery ? (
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ig-text-secondary/80 px-4 mb-2">
              Connections
            </h4>
            {filteredConnections.length > 0 ? (
              filteredConnections.map((conn) => (
                <div
                  key={conn._id}
                  onClick={() => {
                    onSelectPartner(conn);
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-ig-hover cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <img
                      className="w-10 h-10 rounded-full object-cover"
                      src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      alt={conn.username}
                    />
                    {onlineUsers.includes(conn._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-[2px] border-ig-surface rounded-full"></span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{conn.username}</span>
                    <span className="text-[11px] text-ig-text-secondary">{conn.name}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-ig-text-secondary/70 py-4">No connections found</p>
            )}
          </div>
        ) : (
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ig-text-secondary/80 px-4 mb-2">
              Active Chats
            </h4>
            {activeChats.length > 0 ? (
              activeChats.map((chat) => (
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  key={chat._id}
                  onClick={() => onSelectPartner(chat)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all duration-200 mb-1 ${
                    selectedPartner?._id === chat._id
                      ? "bg-ig-primary/10 border border-ig-primary/20 text-ig-text font-bold"
                      : "hover:bg-ig-hover text-ig-text-secondary hover:text-ig-text border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative flex-shrink-0">
                      <img
                        className="w-[42px] h-[42px] rounded-full object-cover border border-ig-border/30"
                        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        alt={chat.username}
                      />
                      {onlineUsers.includes(chat._id) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-ig-surface rounded-full z-10"></span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-ig-text truncate">{chat.username}</span>
                      <span className="text-xs text-ig-text-secondary truncate max-w-[180px]">
                        {chat.lastMessage}
                      </span>
                    </div>
                  </div>
                  {chat.lastMessageDate && (
                    <span className="text-[9px] text-ig-text-secondary/60 shrink-0">
                      {dayjs(chat.lastMessageDate).format("h:mm A")}
                    </span>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 px-4">
                <RiMessengerLine size={32} className="mx-auto text-ig-border mb-3" />
                <p className="text-xs text-ig-text-secondary/80">No active chats.</p>
                <p className="text-[10px] text-ig-text-secondary/50 mt-1">Search above to message a connection!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
