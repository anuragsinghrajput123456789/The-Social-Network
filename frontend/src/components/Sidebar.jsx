import React, { useState, useEffect } from "react";
import logo from "../images/logo.png";
import { GoHomeFill, GoHome } from "react-icons/go";
import { MdSearch, MdExplore } from "react-icons/md";
import { BiMoviePlay } from "react-icons/bi";
import { RiMessengerLine, RiPaletteLine } from "react-icons/ri";
import { FaRegHeart, FaHeart, FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { IoCreateOutline } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import SearchModal from "./Common/SearchModal";
import NotificationsDrawer from "./Common/NotificationsDrawer";
import SettingsModal from "./Common/SettingsModal";
import Logo from "./Common/Logo";
import { api } from "../services/api";

const Sidebar = () => {
    const location = useLocation();
    const userId = localStorage.getItem("userId");
    const { theme, changeTheme } = useTheme();
    
    const [showThemeMenu, setShowThemeMenu] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        const checkUnread = async () => {
            try {
                const data = await api.getNotifications();
                if (data.success && data.unreadCount) {
                    setUnreadNotifications(data.unreadCount);
                }
            } catch (e) {}
        };
        checkUnread();
    }, []);

    const sidebarItems = [
        { iconFill: <GoHomeFill size={26} />, iconOutline: <GoHome size={26} />, label: "Home", path: "/" },
        { 
          iconFill: <MdSearch size={26} />, 
          iconOutline: <MdSearch size={26} />, 
          label: "Search", 
          onClick: () => setShowSearchModal(true) 
        },
        { iconFill: <MdExplore size={26} />, iconOutline: <MdExplore size={26} />, label: "Explore", path: "/explore" },
        { iconFill: <BiMoviePlay size={26} />, iconOutline: <BiMoviePlay size={26} />, label: "Reels", path: "#" },
        { iconFill: <RiMessengerLine size={26} />, iconOutline: <RiMessengerLine size={26} />, label: "Messages", path: "/messages" },
        { 
          iconFill: <FaHeart size={24} className="text-[#ff3040]" />, 
          iconOutline: <FaRegHeart size={24} />, 
          label: "Notifications", 
          badge: unreadNotifications > 0 ? unreadNotifications : null,
          onClick: () => setShowNotificationsDrawer(true) 
        },
        { iconFill: <FaBookmark size={23} className="text-ig-primary" />, iconOutline: <FaRegBookmark size={23} />, label: "Saved", path: "/saved" },
        { iconFill: <IoCreateOutline size={26} />, iconOutline: <IoCreateOutline size={26} />, label: "Create", path: "/create" },
        { iconFill: <CgProfile size={26} />, iconOutline: <CgProfile size={26} />, label: "Profile", path: `/profile/${userId}` },
    ];

    const themesList = [
        { id: "light", name: "Classic Light", color: "bg-white border-gray-300" },
        { id: "dark", name: "Midnight Dark", color: "bg-neutral-900 border-neutral-700" },
        { id: "violet", name: "Royal Violet", color: "bg-violet-950 border-violet-800" },
        { id: "sunset", name: "Sunset Orange", color: "bg-amber-950 border-amber-800" },
        { id: "cyberpunk", name: "Cyberpunk Neon", color: "bg-slate-900 border-cyan-800" },
    ];

    return (
        <>
            <div className="hidden md:flex flex-col w-[245px] h-screen border-r border-ig-border fixed left-0 top-0 px-3 pt-8 bg-ig-surface transition-all duration-300 z-40">
                {/* Logo Header */}
                <div className="mb-8 px-3">
                    <Link to="/">
                        <Logo size="large" />
                    </Link>
                </div>

                {/* Navigation items */}
                <div className="flex flex-col gap-1.5 relative">
                    {sidebarItems.map((item, index) => {
                        const active = item.path && location.pathname === item.path;
                        
                        const content = (
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                    <div className="group-hover:scale-105 transition-transform duration-200 relative">
                                        {active ? item.iconFill : item.iconOutline}
                                        {item.badge && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-ig-surface">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[15px]">{item.label}</span>
                                </div>
                            </div>
                        );

                        if (item.onClick) {
                            return (
                                <button
                                    key={index}
                                    onClick={item.onClick}
                                    className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 hover:bg-ig-hover text-left cursor-pointer text-ig-text-secondary hover:text-ig-text w-full`}
                                >
                                    {content}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                to={item.path}
                                className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 hover:bg-ig-hover group relative ${active ? "font-bold text-ig-primary" : "text-ig-text-secondary hover:text-ig-text"}`}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="activeSideBarBg"
                                        className="absolute inset-0 bg-ig-primary/10 rounded-xl -z-10"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                                {content}
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom Controls / Theme Selector Popover */}
                <div className="mt-auto mb-6 px-3 relative">
                    <AnimatePresence>
                        {showThemeMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute bottom-16 left-0 w-[220px] bg-ig-surface border border-ig-border rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-2.5"
                            >
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-ig-text-secondary mb-1">Select Theme</h4>
                                {themesList.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => changeTheme(t.id)}
                                        className={`flex items-center justify-between w-full p-2.5 rounded-xl cursor-pointer hover:bg-ig-hover transition-colors ${theme === t.id ? "bg-ig-primary/10 text-ig-text font-bold" : "text-ig-text-secondary"}`}
                                    >
                                        <span className="text-sm">{t.name}</span>
                                        <span className={`w-3.5 h-3.5 rounded-full border-2 ${t.color} ${theme === t.id ? "ring-2 ring-ig-primary ring-offset-2 ring-offset-ig-surface" : ""}`}></span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Settings & Theme Control */}
                    <div
                        onClick={() => setShowSettingsModal(true)}
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer hover:bg-ig-hover transition-all duration-200 text-ig-text-secondary hover:text-ig-text`}
                    >
                        <div className="flex items-center gap-4">
                            <RiPaletteLine size={24} />
                            <span className="text-[15px] font-medium">Settings & Privacy</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Common Search Modal */}
            <SearchModal
                show={showSearchModal}
                onClose={() => setShowSearchModal(false)}
            />

            {/* Common Notifications Drawer */}
            <NotificationsDrawer
                show={showNotificationsDrawer}
                onClose={() => setShowNotificationsDrawer(false)}
                onUnreadCountChange={(count) => setUnreadNotifications(count)}
            />

            {/* Settings & Privacy Control Center Modal */}
            <SettingsModal
                show={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />
        </>
    );
};

export default Sidebar;
