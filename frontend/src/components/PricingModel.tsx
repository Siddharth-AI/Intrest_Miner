// "use client";

// import type React from "react";

// import { useState, useEffect } from "react";
// import { X, Rocket, Zap, Sparkles, Gem } from "lucide-react";
// // import { useRouter } from "next/navigation"
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
//         "1 daily interest searches",
//         "Basic interest analytics",
//         "Community support",
//       ],
//     },
//     {
//       title: "basic Miner",
//       price: "9.00",
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
//       price: "27.00",
//       features: [
//         "150 daily searches",
//         "AI-powered insights",
//         "Competitor analysis",
//         "Weekly reports",
//         "Custom alerts",
//       ],
//     },
//     {
//       title: "Enterprise",
//       price: "90.00",
//       features: [
//         "500 daily searches",
//         "Dedicated support",
//         "White-label reports",
//         "Team collaboration",
//         "Advanced API",
//       ],
//     },
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
//         transition={{ duration: 0.3 }}>
//         <motion.div
//           className="relative bg-[#f1f5f9] border border-[#2d3748]/20 rounded-2xl shadow-2xl max-w-7xl w-full mx-4 p-8 md:p-12 overflow-y-auto max-h-[90vh]"
//           onClick={(e) => e.stopPropagation()}
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.9 }}
//           transition={{ duration: 0.3 }}>
//           <motion.button
//             onClick={onClose}
//             className="absolute top-5 right-5 p-2 rounded-full bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
//             aria-label="Close"
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//             transition={{ duration: 0.2 }}>
//             <X className="h-5 w-5 text-[#2d3748]" />
//           </motion.button>

//           <motion.h2
//             className="text-4xl md:text-5xl font-bold text-[#111827] mb-10 text-center tracking-tight mt-10"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.1 }}>
//             Choose Your Pricing Plan
//           </motion.h2>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
//             {pricingTiers.map((tier, index) => (
//               <motion.div
//                 key={index}
//                 className={`relative min-h-[28rem] bg-[#f1f5f9] border pt-10 border-[#2d3748]/20 rounded-2xl p-6 hover:border-[#3b82f6]/50 transition-all duration-300 shadow-lg hover:shadow-blue-100 group ${
//                   tier.popular ? "ring-2 ring-[#3b82f6]/50" : ""
//                 }`}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4, delay: index * 0.1 }}>
//                 {tier.popular && (
//                   <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md">
//                     MOST POPULAR
//                   </div>
//                 )}

//                 <div className="flex items-center gap-3 mb-4">
//                   {index === 0 && <Rocket className="h-6 w-6 text-[#3b82f6]" />}
//                   {index === 1 && <Zap className="h-6 w-6 text-[#2563eb]" />}
//                   {index === 2 && (
//                     <Sparkles className="h-6 w-6 text-emerald-600" />
//                   )}
//                   {index === 3 && <Gem className="h-6 w-6 text-amber-600" />}
//                   <h3 className="text-xl font-semibold text-[#111827]">
//                     {tier.title}
//                   </h3>
//                 </div>

//                 <div className="flex items-baseline mb-6">
//                   <span className="text-4xl font-bold text-[#111827]">
//                     ${tier.price}
//                   </span>
//                   <span className="ml-2 text-[#2d3748] text-sm">/month</span>
//                 </div>

//                 <div className="h-52">
//                   <ul className="space-y-3 mb-6 flex-1">
//                     {tier.features.map((feature, fIndex) => (
//                       <li
//                         key={fIndex}
//                         className="flex items-start text-[#2d3748] text-sm">
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
//                       </li>
//                     ))}
//                   </ul>
//                 </div>

//                 <motion.button
//                   onClick={() => {
//                     if (tier.title === "basic Miner") {
//                       router("/permium-miner");
//                       onClose();
//                     } else {
//                       alert(`Selected ${tier.title} plan!`);
//                       onClose();
//                     }
//                   }}
//                   className="w-full bg-[#3b82f6] hover:bg-[#2d3748] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2"
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.97 }}>
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

import React, { useState, useEffect } from "react";
import { X, Rocket, Zap, Sparkles, Gem } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PricingTier {
  plan_id: number;
  title: string;
  price: number;
  features: string[];
  popular?: boolean;
}

interface PricingModelProps {
  onClose: () => void;
}

const PLAN_IDS: Record<string, number> = {
  "basic Miner": 1,
  "Expert Miner": 2,
  Enterprise: 3,
};

const RAZORPAY_KEY_ID = "rzp_test_8BiRiW5DqgG6nA"; // 🔁 Replace with real key

export default function PricingModel({ onClose }: PricingModelProps) {
  const router = useNavigate();
  const [mounted, setMounted] = useState(false);

  const pricingTiers: PricingTier[] = [
    {
      plan_id: 0,
      title: "Free Miner",
      price: 0,
      features: [
        "1 daily interest searches",
        "Basic interest analytics",
        "Community support",
      ],
    },
    {
      plan_id: 1,
      title: "basic Miner",
      price: 9.0,
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
      plan_id: 2,
      title: "Expert Miner",
      price: 27.0,
      features: [
        "150 daily searches",
        "AI-powered insights",
        "Competitor analysis",
        "Weekly reports",
        "Custom alerts",
      ],
    },
    {
      plan_id: 3,
      title: "Enterprise",
      price: 90.0,
      features: [
        "500 daily searches",
        "Dedicated support",
        "White-label reports",
        "Team collaboration",
        "Advanced API",
      ],
    },
  ];

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleRazorpayPayment = async (id: number) => {
    const plan_id = id;

    if (!plan_id) {
      alert("Invalid plan selected");
      return;
    }
    console.log(plan_id);
    try {
      const orderRes = await axios.post(
        "http://localhost:1000/subscriptions/razorpay/order",
        { plan_id: plan_id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(orderRes);

      const { order, payment_uuid, plan } = orderRes.data;

      const scriptLoaded = await new Promise<boolean>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Interest Miner",
        description: `Subscription for ${plan.title}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post(
              "http://localhost:1000/subscriptions/razorpay/verify",
              {
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                payment_uuid,
                plan_id: plan.id,
                auto_renew: 1,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (verifyRes.data.success) {
              alert("✅ Subscription activated!");
              router("/permium-miner");
            } else {
              alert("❌ Payment verification failed");
            }
          } catch (err) {
            console.error("Verification error", err);
            alert("❌ Failed to verify payment");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#3b82f6",
        },
      });

      razorpay.open();
    } catch (error) {
      console.error("Order creation error", error);
      alert("Something went wrong");
    }
  };

  function handleBackdropClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  if (!mounted) return null;

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
            className="absolute top-5 right-5 p-2 rounded-full bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20"
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
                className={`relative min-h-[28rem] bg-[#f1f5f9] border pt-10 border-[#2d3748]/20 rounded-2xl p-6 hover:border-[#3b82f6]/50 shadow-lg hover:shadow-blue-100 group ${
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

                <ul className="space-y-3 mb-6 text-[#2d3748] text-sm h-52 overflow-y-auto">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <svg
                        className="w-5 h-5 mr-2 text-[#3b82f6] mt-0.5"
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

                <motion.button
                  onClick={() => {
                    if (tier.price === 0) {
                      alert("✅ You selected Free Plan!");
                      onClose();
                    } else {
                      handleRazorpayPayment(tier.plan_id);
                      onClose();
                    }
                  }}
                  className="w-full bg-[#3b82f6] hover:bg-[#2d3748] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
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
