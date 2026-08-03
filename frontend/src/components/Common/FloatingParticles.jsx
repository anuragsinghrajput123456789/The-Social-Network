import React from "react";
import { motion } from "framer-motion";

const FloatingParticles = () => {
  const particles = Array.from({ length: 8 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Background Mesh Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6A5AE0]/15 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#FF3D81]/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Floating Translucent Particles */}
      {particles.map((_, i) => {
        const size = 12 + (i % 4) * 8;
        const initialX = (i * 14) % 90;
        const initialY = (i * 18) % 90;
        const duration = 12 + (i % 3) * 6;

        return (
          <motion.div
            key={i}
            initial={{ x: `${initialX}vw`, y: `${initialY}vh`, opacity: 0.15 }}
            animate={{
              y: [`${initialY}vh`, `${(initialY + 25) % 90}vh`, `${initialY}vh`],
              x: [`${initialX}vw`, `${(initialX + 15) % 90}vw`, `${initialX}vw`],
              rotate: [0, 180, 360],
              opacity: [0.15, 0.3, 0.15]
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute rounded-full border border-[#6A5AE0]/25 bg-gradient-to-tr from-[#6A5AE0]/10 to-[#FF3D81]/10 backdrop-blur-sm"
            style={{
              width: size,
              height: size
            }}
          />
        );
      })}
    </div>
  );
};

export default FloatingParticles;
