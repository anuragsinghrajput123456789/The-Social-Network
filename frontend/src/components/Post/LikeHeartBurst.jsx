import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart } from "react-icons/fa6";

const LikeHeartBurst = ({ show }) => {
  if (!show) return null;

  const particles = Array.from({ length: 8 });

  return (
    <AnimatePresence>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        {/* Main Big Pulsing Heart */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 1.2, 0], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
        >
          <FaHeart size={90} />
        </motion.div>

        {/* Bursting Heart Particles */}
        {particles.map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const distance = 70 + (i % 2) * 20;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;

          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
              animate={{
                x: x,
                y: y,
                scale: [0.5, 1, 0],
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute text-pink-500 drop-shadow-md"
            >
              <FaHeart size={18} />
            </motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  );
};

export default LikeHeartBurst;
