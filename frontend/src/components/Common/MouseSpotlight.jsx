import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const MouseSpotlight = () => {
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [isDesktop, setIsDesktop] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e) => {
      if (window.innerWidth >= 768) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Top Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#6A5AE0] via-[#8B5CF6] to-[#FF3D81] origin-left z-50 shadow-[0_0_12px_rgba(106,90,224,0.8)]"
        style={{ scaleX }}
      />

      {/* Mouse Follow Radial Spotlight Glow (Desktop Only) */}
      {isDesktop && (
        <div
          className="fixed pointer-events-none z-30 transition-opacity duration-500"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: "translate(-50%, -50%)",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(106, 90, 224, 0.09) 0%, rgba(255, 61, 129, 0.04) 45%, transparent 70%)"
          }}
        />
      )}
    </>
  );
};

export default MouseSpotlight;
