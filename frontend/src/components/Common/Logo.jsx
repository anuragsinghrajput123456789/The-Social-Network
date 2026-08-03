import React from "react";
import { motion } from "framer-motion";

const Logo = ({ variant = "full", size = "normal", className = "" }) => {
  const iconSize = size === "small" ? 28 : size === "large" ? 44 : 34;
  const textSize = size === "small" ? "text-base" : size === "large" ? "text-2xl" : "text-xl";

  const renderIcon = () => (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="bondGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6A5AE0" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="bondGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#6A5AE0" />
          </linearGradient>
          <filter id="bondGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* BondBase Interlocking Infinity Loop */}
        <path
          d="M 16 24 C 16 16, 24 16, 24 24 C 24 32, 32 32, 32 24 C 32 16, 24 16, 24 24 C 24 32, 16 32, 16 24 Z"
          stroke="url(#bondGrad1)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#bondGlow)"
          fill="none"
        />

        {/* Outer Orbit Sparkle Ring */}
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="url(#bondGrad2)"
          strokeWidth="2.5"
          strokeDasharray="90 30"
          className="opacity-80"
        />

        {/* Core Connection Node */}
        <circle cx="24" cy="24" r="3.5" fill="#ffffff" />
      </svg>
    </div>
  );

  if (variant === "icon") {
    return renderIcon();
  }

  if (variant === "animated") {
    return (
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center gap-3 cursor-pointer"
      >
        {renderIcon()}
        <span className={`font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent ${textSize}`}>
          Social Network
        </span>
      </motion.div>
    );
  }

  return (
    <div className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      {renderIcon()}
      <div className="flex flex-col">
        <span className={`font-black tracking-tight text-ig-text group-hover:text-ig-primary transition-colors ${textSize}`}>
          Social Network
        </span>
      </div>
    </div>
  );
};

export default Logo;
