import React from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ConnectionsModal = ({
  show,
  onClose,
  modalType,
  connectionsList,
  loading
}) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-ig-surface border border-ig-border rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl flex flex-col h-[400px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-ig-border/80 flex items-center justify-between">
              <h3 className="font-bold text-base capitalize">{modalType}</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-ig-hover rounded-lg text-ig-text-secondary hover:text-ig-text cursor-pointer transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Connections List */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-6 h-6 border-2 border-ig-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : connectionsList.length > 0 ? (
                connectionsList.map((conn) => (
                  <div
                    key={conn._id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-ig-hover transition-all duration-200"
                  >
                    <div
                      onClick={() => {
                        navigate(`/profile/${conn._id}`);
                        onClose();
                      }}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        className="w-9 h-9 rounded-full object-cover border border-ig-border/40"
                        alt={conn.username}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-ig-text hover:underline">
                          {conn.username}
                        </span>
                        <span className="text-[10px] text-ig-text-secondary">{conn.name}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        navigate("/messages");
                      }}
                      className="text-xs bg-ig-hover text-ig-text border border-ig-border py-1.5 px-4 rounded-lg cursor-pointer hover:bg-ig-border transition-all font-semibold"
                    >
                      Message
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-ig-text-secondary">
                  <p className="text-xs">No {modalType} yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionsModal;
