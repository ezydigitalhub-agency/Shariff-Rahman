import React from "react";
import { motion } from "motion/react";

export default function GlowBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-black overflow-hidden pointer-events-none">
      {/* Light Leak Top Left (Deep Blue) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.45, 0.3],
          x: [0, 20, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/20 blur-[80px] sm:blur-[120px] -top-20 -left-20 rounded-full"
      />

      {/* Light Leak Bottom Right (Azure Blue) */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
          x: [0, -30, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-blue-400/15 blur-[60px] sm:blur-[100px] -bottom-20 -right-20 rounded-full"
      />

      {/* Center ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[800px] bg-blue-900/5 blur-[100px] sm:blur-[180px] rounded-full" />
    </div>
  );
}
