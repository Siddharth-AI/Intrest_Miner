"use client";

import { Brain, Star } from "lucide-react";
import { motion } from "framer-motion";

interface PremiumMinerButtonProps {
  onClick: () => void;
  className?: string;
}

export default function PremiumMinerButton({
  onClick,
  className = "",
}: PremiumMinerButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-full uppercase
        text-white font-semibold text-lg md:text-base
        shadow-lg hover:shadow-xl
        opacity-90 hover:opacity-100
        transition-all duration-200
        border border-black/20
        ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
      }}>
      <Brain className="md:h-4 h-6 md:w-4 w-6 animate-bounce" />
      <span>Premium</span>
    </motion.button>
  );
}
