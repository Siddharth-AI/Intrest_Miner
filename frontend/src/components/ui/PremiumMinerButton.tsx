// // src/components/PremiumMinerButton.tsx
// import { Brain, Star } from "lucide-react";

// interface PremiumMinerButtonProps {
//   onClick: () => void;
//   className?: string;
// }

// export default function PremiumMinerButton({
//   onClick,
//   className,
// }: PremiumMinerButtonProps) {
//   return (
//     <button
//       onClick={onClick}
//       className={`
//         flex items-center gap-2 px-3 py-2 rounded-full
//         bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600
//         shadow-lg hover:shadow-2xl hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700
//         text-white font-bold text-lg uppercase tracking-wide
//         relative
//         transition-all duration-200
//         border-2 border-yellow-300
//         focus:outline-none
//         group ${className ? className : ""}
//       `}
//       style={{
//         boxShadow: "0 2px 20px 0 rgba(236, 72, 153, 0.5)",
//       }}>
//       <span className="relative">
//         <Brain
//           size={24}
//           className="drop-shadow-md text-purple-200 group-hover:text-gray-700"
//         />
//         <Star
//           size={14}
//           className="absolute -top-2 -right-2 text-yellow-300 animate-bounce"
//           strokeWidth={3}
//           fill="currentColor"
//         />
//       </span>
//       <span>Premium Miner</span>
//       <span className=" absolute -top-3 -right-5 ml-2 px-2 py-1 rounded-full bg-yellow-400 text-white text-xs font-bold shadow-inner group-hover:scale-105 transition-all">
//         PRO
//       </span>
//     </button>
//   );
// }

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
