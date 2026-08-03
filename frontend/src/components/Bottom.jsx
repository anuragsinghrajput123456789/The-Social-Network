import React, { useState } from "react";
import { GoHome, GoHomeFill } from "react-icons/go";
import { MdSearch } from "react-icons/md";
import { FiPlusSquare } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { RiMessengerLine } from "react-icons/ri";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import SearchModal from "./Common/SearchModal";

const Bottom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const [showSearchModal, setShowSearchModal] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-[56px] bg-ig-surface/90 border-t border-ig-border backdrop-blur-lg flex items-center justify-around z-40 px-2 pb-2 transition-all duration-300">
        <motion.div 
          whileTap={{ scale: 0.9 }}
          className="cursor-pointer p-2 rounded-xl text-ig-text hover:text-ig-primary" 
          onClick={() => navigate("/")}
        >
          {isActive("/") ? <GoHomeFill size={26} className="text-ig-primary" /> : <GoHome size={26} className="text-ig-text-secondary" />}
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSearchModal(true)}
          className="cursor-pointer p-2 rounded-xl text-ig-text-secondary hover:text-ig-primary"
        >
          <MdSearch size={26} />
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.85 }}
          className="cursor-pointer p-1.5 rounded-xl bg-gradient-to-tr from-[#6A5AE0] via-[#8B5CF6] to-[#FF3D81] shadow-md active:scale-95" 
          onClick={() => navigate("/create")}
        >
          <div className="bg-ig-surface p-1 rounded-lg">
            <FiPlusSquare size={24} className="text-ig-text" />
          </div>
        </motion.div>

        <motion.div 
          whileTap={{ scale: 0.9 }}
          className="cursor-pointer p-2 rounded-xl text-ig-text hover:text-ig-primary"
          onClick={() => navigate("/messages")}
        >
          <RiMessengerLine size={26} className={isActive("/messages") || isActive("/chat") ? "text-ig-primary" : "text-ig-text-secondary"} />
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.9 }}
          className="cursor-pointer p-2 rounded-xl"
          onClick={() => navigate(`/profile/${userId}`)}
        >
          <div className={`rounded-full p-[2px] transition-all duration-200 ${isActive(`/profile/${userId}`) ? 'ring-2 ring-ig-primary' : 'ring-1 ring-ig-border'}`}>
            <CgProfile size={22} className={isActive(`/profile/${userId}`) ? "text-ig-primary" : "text-ig-text-secondary"} />
          </div>
        </motion.div>
      </div>

      <SearchModal show={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </>
  );
};

export default Bottom;
