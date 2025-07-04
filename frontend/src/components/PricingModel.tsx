// "use client";

// import type React from "react";

// import { useState, useEffect } from "react";
// import { X, Rocket, Zap, Sparkles, Gem } from "lucide-react";
// // import { useRouter } from "next/navigation";
// import { useNavigate } from "react-router-dom";
// import { createPortal } from "react-dom";
// import { motion, AnimatePresence } from "framer-motion";

// interface PricingTier {
//   title: string;
//   price: string;
//   features: string[];
//   popular?: boolean;
// }

// interface InterestData {
//   name: string;
//   audience: number;
//   competition: string;
// }

// interface PricingModelProps {
//   onClose: () => void;
// }

// export default function PricingModel({ onClose }: PricingModelProps) {
//   const router = useNavigate();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, []);

//   const pricingTiers: PricingTier[] = [
//     {
//       title: "Free Miner",
//       price: "0",
//       features: [
//         "5 daily interest searches",
//         "Basic interest analytics",
//         "Community support",
//         "Export up to 10 items/day",
//       ],
//     },
//     {
//       title: "Prospector",
//       price: "5",
//       features: [
//         "50 daily searches",
//         "Advanced filters",
//         "Priority support",
//         "CSV exports",
//         "Basic trend analysis",
//       ],
//       popular: true,
//     },
//     {
//       title: "Expert Miner",
//       price: "15",
//       features: [
//         "Unlimited searches",
//         "AI-powered insights",
//         "Competitor analysis",
//         "API access",
//         "Weekly reports",
//       ],
//     },
//     {
//       title: "Enterprise",
//       price: "30",
//       features: [
//         "Custom audience tracking",
//         "Dedicated support",
//         "White-label reports",
//         "Team collaboration",
//         "Advanced API",
//       ],
//     },
//   ];

//   const popularInterests: InterestData[] = [
//     { name: "Sustainable Living", audience: 2500000, competition: "Medium" },
//     { name: "AI Tools", audience: 4800000, competition: "High" },
//     { name: "Home Workouts", audience: 3200000, competition: "Low" },
//     { name: "Cryptocurrency", audience: 6500000, competition: "High" },
//   ];

//   function handleBackdropClick(
//     e: React.MouseEvent<HTMLDivElement, MouseEvent>
//   ) {
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   }

//   if (!mounted) {
//     return null;
//   }

//   return createPortal(
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-lg"
//         onClick={handleBackdropClick}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         transition={{ duration: 0.1 }}>
//         {/* The main modal content wrapper */}
//         <motion.div
//           className="relative bg-[#f1f5f9] border border-[#2d3748]/20 rounded-2xl shadow-2xl max-w-7xl w-full mx-4 p-8 md:p-12 overflow-y-auto max-h-[90vh]"
//           onClick={(e) => e.stopPropagation()}
//           initial={{ opacity: 0, scale: 0.9, y: 20 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           exit={{ opacity: 0, scale: 0.9, y: 20 }}
//           transition={{ duration: 0.1, ease: "easeOut" }}>
//           {/* Close button */}
//           <motion.button
//             onClick={onClose}
//             className="absolute top-5 right-5 p-2 rounded-full bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
//             aria-label="Close"
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}>
//             <X className="h-5 w-5 text-[#2d3748]" />
//           </motion.button>

//           <motion.h2
//             className="text-4xl md:text-5xl font-bold text-[#111827] mb-10 text-center tracking-tight mt-10"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}>
//             Choose Your Pricing Plan
//           </motion.h2>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
//             {pricingTiers.map((tier, index) => (
//               <motion.div
//                 key={index}
//                 className={`relative min-h-[28rem] bg-[#f1f5f9] border pt-10 border-[#2d3748]/20 rounded-2xl p-6 hover:border-[#3b82f6]/50 transition-all duration-300 shadow-lg hover:shadow-blue-100 group ${
//                   tier.popular ? "ring-2 ring-[#3b82f6]/50" : ""
//                 }`}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 whileHover={{ scale: 1.02, y: -5 }}>
//                 {tier.popular && (
//                   <motion.div
//                     className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md"
//                     animate={{ y: [0, -2, 0] }}
//                     transition={{
//                       duration: 2,
//                       repeat: Number.POSITIVE_INFINITY,
//                       ease: "easeInOut",
//                     }}>
//                     MOST POPULAR
//                   </motion.div>
//                 )}
//                 <div className="flex items-center gap-3 mb-4">
//                   {index === 0 && (
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ duration: 0.3, delay: index * 0.15 + 0.3 }}>
//                       <Rocket className="h-6 w-6 text-[#3b82f6]" />
//                     </motion.div>
//                   )}
//                   {index === 1 && (
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ duration: 0.3, delay: index * 0.15 + 0.3 }}>
//                       <Zap className="h-6 w-6 text-[#2563eb]" />
//                     </motion.div>
//                   )}
//                   {index === 2 && (
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ duration: 0.3, delay: index * 0.15 + 0.3 }}>
//                       <Sparkles className="h-6 w-6 text-emerald-600" />
//                     </motion.div>
//                   )}
//                   {index === 3 && (
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ duration: 0.3, delay: index * 0.15 + 0.3 }}>
//                       <Gem className="h-6 w-6 text-amber-600" />
//                     </motion.div>
//                   )}
//                   <h3 className="text-xl font-semibold text-[#111827]">
//                     {tier.title}
//                   </h3>
//                 </div>
//                 <div className="flex items-baseline mb-6">
//                   <motion.span
//                     className="text-4xl font-bold text-[#111827]"
//                     initial={{ scale: 0.8, opacity: 0 }}
//                     animate={{ scale: 1, opacity: 1 }}
//                     transition={{ duration: 0.6, delay: index * 0.15 + 0.4 }}>
//                     ${tier.price}
//                   </motion.span>
//                   <span className="ml-2 text-[#2d3748] text-sm">/month</span>
//                 </div>
//                 <div className="h-52">
//                   <ul className="space-y-3 mb-6 flex-1">
//                     {tier.features.map((feature, fIndex) => (
//                       <motion.li
//                         key={fIndex}
//                         className="flex items-start text-[#2d3748] text-sm"
//                         initial={{ opacity: 0, x: -10 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{
//                           duration: 0.4,
//                           delay: index * 0.15 + fIndex * 0.05 + 0.5,
//                         }}>
//                         <svg
//                           className="w-5 h-5 mr-2 text-[#3b82f6] flex-shrink-0 mt-0.5"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24">
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M5 13l4 4L19 7"
//                           />
//                         </svg>
//                         {feature}
//                       </motion.li>
//                     ))}
//                   </ul>
//                 </div>
//                 <motion.button
//                   onClick={() => {
//                     if (tier.title === "Prospector") {
//                       router("/permium-miner");
//                       onClose();
//                     } else {
//                       alert(`Selected ${tier.title} plan!`);
//                       onClose();
//                     }
//                   }}
//                   className="w-full bg-[#3b82f6] hover:bg-[#2d3748] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2"
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.97 }}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.3, delay: index * 0.15 }}>
//                   Select Plan
//                 </motion.button>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>,
//     document.body
//   );
// }
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X, Rocket, Zap, Sparkles, Gem } from "lucide-react";
// import { useRouter } from "next/navigation"
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface PricingTier {
  title: string;
  price: string;
  features: string[];
  popular?: boolean;
}

interface InterestData {
  name: string;
  audience: number;
  competition: string;
}

interface PricingModelProps {
  onClose: () => void;
}

export default function PricingModel({ onClose }: PricingModelProps) {
  const router = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const pricingTiers: PricingTier[] = [
    {
      title: "Free Miner",
      price: "0",
      features: [
        "5 daily interest searches",
        "Basic interest analytics",
        "Community support",
        "Export up to 10 items/day",
      ],
    },
    {
      title: "Prospector",
      price: "5",
      features: [
        "50 daily searches",
        "Advanced filters",
        "Priority support",
        "CSV exports",
        "Basic trend analysis",
      ],
      popular: true,
    },
    {
      title: "Expert Miner",
      price: "15",
      features: [
        "Unlimited searches",
        "AI-powered insights",
        "Competitor analysis",
        "API access",
        "Weekly reports",
      ],
    },
    {
      title: "Enterprise",
      price: "30",
      features: [
        "Custom audience tracking",
        "Dedicated support",
        "White-label reports",
        "Team collaboration",
        "Advanced API",
      ],
    },
  ];

  function handleBackdropClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-lg"
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}>
        <motion.div
          className="relative bg-[#f1f5f9] border border-[#2d3748]/20 rounded-2xl shadow-2xl max-w-7xl w-full mx-4 p-8 md:p-12 overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}>
          <motion.button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            aria-label="Close"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}>
            <X className="h-5 w-5 text-[#2d3748]" />
          </motion.button>

          <motion.h2
            className="text-4xl md:text-5xl font-bold text-[#111827] mb-10 text-center tracking-tight mt-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}>
            Choose Your Pricing Plan
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                className={`relative min-h-[28rem] bg-[#f1f5f9] border pt-10 border-[#2d3748]/20 rounded-2xl p-6 hover:border-[#3b82f6]/50 transition-all duration-300 shadow-lg hover:shadow-blue-100 group ${
                  tier.popular ? "ring-2 ring-[#3b82f6]/50" : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md">
                    MOST POPULAR
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  {index === 0 && <Rocket className="h-6 w-6 text-[#3b82f6]" />}
                  {index === 1 && <Zap className="h-6 w-6 text-[#2563eb]" />}
                  {index === 2 && (
                    <Sparkles className="h-6 w-6 text-emerald-600" />
                  )}
                  {index === 3 && <Gem className="h-6 w-6 text-amber-600" />}
                  <h3 className="text-xl font-semibold text-[#111827]">
                    {tier.title}
                  </h3>
                </div>

                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-[#111827]">
                    ${tier.price}
                  </span>
                  <span className="ml-2 text-[#2d3748] text-sm">/month</span>
                </div>

                <div className="h-52">
                  <ul className="space-y-3 mb-6 flex-1">
                    {tier.features.map((feature, fIndex) => (
                      <li
                        key={fIndex}
                        className="flex items-start text-[#2d3748] text-sm">
                        <svg
                          className="w-5 h-5 mr-2 text-[#3b82f6] flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <motion.button
                  onClick={() => {
                    if (tier.title === "Prospector") {
                      router("/permium-miner");
                      onClose();
                    } else {
                      alert(`Selected ${tier.title} plan!`);
                      onClose();
                    }
                  }}
                  className="w-full bg-[#3b82f6] hover:bg-[#2d3748] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}>
                  Select Plan
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
