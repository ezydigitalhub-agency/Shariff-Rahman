import React from "react";
import { motion } from "motion/react";

interface GlowBackgroundProps {
  isDarkMode?: boolean;
}

export default function GlowBackground({ isDarkMode = true }: GlowBackgroundProps) {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-500 ${
      isDarkMode ? "bg-[#010816]" : "bg-[#f1f5f9]"
    }`}>
      {/* Light Leak Top Left (Neon Orange / Deep Blue) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: isDarkMode ? [0.25, 0.4, 0.25] : [0.08, 0.15, 0.08],
          x: [0, 20, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] blur-[80px] sm:blur-[120px] -top-20 -left-20 rounded-full ${
          isDarkMode ? "bg-orange-500/15" : "bg-orange-500/10"
        }`}
      />

      {/* Light Leak Bottom Right (Azure Blue) */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: isDarkMode ? [0.2, 0.35, 0.2] : [0.06, 0.12, 0.06],
          x: [0, -30, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] blur-[60px] sm:blur-[100px] -bottom-20 -right-20 rounded-full ${
          isDarkMode ? "bg-blue-500/15" : "bg-blue-400/10"
        }`}
      />

      {/* Center ambient glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[800px] blur-[100px] sm:blur-[180px] rounded-full ${
        isDarkMode ? "bg-blue-900/10" : "bg-blue-200/15"
      }`} />
    </div>
  );
}
