"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

interface FloatingHelpButtonProps {
  onClick: () => void;
  help: string;
}

const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = ({
  onClick,
  help,
}) => {
  const buttonElement = (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      whileHover={{ scale: 1.1 }}
      style={{
        zIndex: 9999,
        position: "fixed", // Explicitly set position
      }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 1,
      }}>
      <motion.div
        animate={{
          rotate: [0, -10, 10, -10, 0],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          repeatDelay: 1,
        }}>
        <HelpCircle className="w-6 h-6" />
      </motion.div>

      {/* Pulse effect */}
      <div className="absolute inset-0 rounded-full bg-indigo-600 animate-ping opacity-20" />

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {help}
      </div>
    </motion.button>
  );

  return typeof document !== "undefined"
    ? createPortal(buttonElement, document.body)
    : null;
};

export default FloatingHelpButton;
