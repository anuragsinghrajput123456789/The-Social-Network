import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiShield, FiBell, FiMoon, FiLock } from "react-icons/fi";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import { useTheme } from "../../App";

const SettingsModal = ({ show, onClose }) => {
  const { theme, changeTheme } = useTheme();
  const userId = localStorage.getItem("userId");

  const [isPrivate, setIsPrivate] = useState(false);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
    messageNotifications: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && userId) {
      const fetchUserDetails = async () => {
        const data = await api.getUserDetails(userId);
        if (data.success && data.data) {
          setIsPrivate(data.data.isPrivate || false);
          if (data.data.settings) {
            setSettings((prev) => ({ ...prev, ...data.data.settings }));
          }
        }
      };
      fetchUserDetails();
    }
  }, [show, userId]);

  if (!show) return null;

  const handleTogglePrivacy = async () => {
    const newStatus = !isPrivate;
    setIsPrivate(newStatus);
    const data = await api.updateUserSettings({ isPrivate: newStatus });
    if (data.success) {
      toast.success(newStatus ? "Account is now Private" : "Account is now Public");
    }
  };

  const handleSettingChange = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    await api.updateUserSettings({ settings: updated });
    toast.success("Preferences updated");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-[440px] bg-ig-surface border border-ig-border rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-ig-text"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ig-border pb-3">
            <div className="flex items-center gap-2 font-bold text-base">
              <FiShield className="text-ig-primary" size={20} />
              <span>Settings & Privacy</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-ig-hover rounded-xl text-ig-text-secondary hover:text-ig-text cursor-pointer transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Account Privacy Toggle */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ig-text-secondary flex items-center gap-1.5">
              <FiLock size={14} /> Privacy Controls
            </h4>
            <div className="flex items-center justify-between bg-ig-bg/50 border border-ig-border p-3.5 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold">Private Account</span>
                <span className="text-[10px] text-ig-text-secondary">
                  Only approved followers can view your posts and stories.
                </span>
              </div>
              <button
                onClick={handleTogglePrivacy}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isPrivate ? "bg-ig-primary" : "bg-ig-border"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    isPrivate ? "translate-x-5" : "translate-x-0"
                  }`}
                ></span>
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ig-text-secondary flex items-center gap-1.5">
              <FiBell size={14} /> Notification Preferences
            </h4>
            <div className="flex flex-col gap-2 bg-ig-bg/50 border border-ig-border p-3.5 rounded-xl">
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-medium">Likes & Reactions</span>
                <input
                  type="checkbox"
                  checked={settings.likeNotifications}
                  onChange={() => handleSettingChange("likeNotifications")}
                  className="accent-ig-primary w-4 h-4 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between py-1 border-t border-ig-border/40">
                <span className="text-xs font-medium">Comments</span>
                <input
                  type="checkbox"
                  checked={settings.commentNotifications}
                  onChange={() => handleSettingChange("commentNotifications")}
                  className="accent-ig-primary w-4 h-4 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between py-1 border-t border-ig-border/40">
                <span className="text-xs font-medium">Direct Messages</span>
                <input
                  type="checkbox"
                  checked={settings.messageNotifications}
                  onChange={() => handleSettingChange("messageNotifications")}
                  className="accent-ig-primary w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Appearance & Theme */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ig-text-secondary flex items-center gap-1.5">
              <FiMoon size={14} /> Theme Selector
            </h4>
            <div className="flex gap-2">
              {["light", "dark", "violet", "sunset"].map((t) => (
                <button
                  key={t}
                  onClick={() => changeTheme(t)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize border cursor-pointer transition-all ${
                    theme === t
                      ? "bg-ig-primary text-white border-ig-primary shadow-sm"
                      : "bg-ig-bg/50 text-ig-text-secondary border-ig-border hover:bg-ig-hover"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
