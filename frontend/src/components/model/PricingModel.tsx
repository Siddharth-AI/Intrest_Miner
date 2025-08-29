/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// src/components/PricingModel.tsx
import React, { useState, useEffect } from "react";
import { X, Zap, Sparkles, Gem } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
// axios is still needed for loading Razorpay SDK, but direct API calls will move to Redux
import axios from "axios";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchProfileData } from "../../../store/features/profileSlice";
import {
  fetchSubscriptionPlans,
  ApiPricingTier,
} from "../../../store/features/subscriptionPlansSlice";
// Import the new Razorpay thunks and actions
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  resetRazorpayState,
} from "../../../store/features/razorpaySlice";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PricingModelProps {
  onClose: () => void;
}

export default function PricingModel({ onClose }: PricingModelProps) {
  // console.log(import.meta.env.VITE_RAZORPAY_KEY_ID);
  const router = useNavigate();
  const [mounted, setMounted] = useState(false);
  // isPaymentProcessing will now be derived from Redux state
  const dispatch = useAppDispatch();

  // Select data from the Redux store for subscription plans
  const {
    data: pricingTiers,
    status,
    error,
  } = useAppSelector((state) => state.subscriptionPlans);

  // Select data from the new Razorpay slice
  const {
    orderLoading,
    orderError,
    orderData,
    verificationLoading,
    verificationError,
    verificationSuccess,
  } = useAppSelector((state) => state.razorpay);

  // Combine loading states for the button
  const isPaymentProcessing = orderLoading || verificationLoading;

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";

    // Dispatch the async thunk to fetch subscription plans on component mount
    if (status === "idle") {
      dispatch(fetchSubscriptionPlans());
    }

    return () => {
      document.body.style.overflow = "";
      // Reset Razorpay state when the modal unmounts
      dispatch(resetRazorpayState());
    };
  }, [dispatch, status]);

  // Effect to handle order creation success and proceed with Razorpay checkout
  useEffect(() => {
    const initiateRazorpayCheckout = async () => {
      if (orderData && !orderError && !orderLoading) {
        // Step 2: Load Razorpay SDK Script
        console.log("Attempting to load Razorpay SDK...");
        const scriptLoaded = await new Promise<boolean>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => {
            console.log("Razorpay SDK loaded successfully.");
            resolve(true);
          };
          script.onerror = (e) => {
            console.error("Razorpay SDK failed to load:", e);
            console.error(
              "Razorpay SDK failed to load. Please check your internet connection."
            );
            resolve(false);
          };
          document.body.appendChild(script);
        });

        if (!scriptLoaded) {
          // No need to set isPaymentProcessing here, Redux state handles it
          return;
        }

        // Step 3: Initialize and Open Razorpay Checkout
        console.log("Initializing Razorpay checkout...");
        if (!window.Razorpay) {
          console.error("window.Razorpay is undefined after script load.");
          console.error("Razorpay payment gateway is not available.");
          return;
        }
        const razorpay = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.order.amount, // amount in paisa
          currency: orderData.order.currency,
          name: "Interest Miner",
          description: `Subscription for ${orderData.plan.name}`,
          order_id: orderData.order.id,
          handler: async function (response: any) {
            console.log(
              "Razorpay payment handler triggered. Response:",
              response
            );
            // Dispatch verification thunk
            dispatch(
              verifyRazorpayPayment({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                payment_uuid: orderData.payment_uuid,
                plan_id: orderData.plan.id, // Pass the plan's UUID
                auto_renew: 1,
              })
            );
          },
          prefill: {
            name: "Interest Miner User", // Consider getting actual user name from profile data
            email: "user@example.com", // Consider getting actual user email from profile data
          },
          theme: {
            color: "#3b82f6",
          },
        });

        razorpay.on("payment.failed", (response: any) => {
          console.error("Razorpay payment failed:", response.error);
          console.error(
            `Payment failed: ${response.error.description || "Unknown error"}`
          );
          // Redux state will reflect this error via verifyRazorpayPayment.rejected if it was a backend error
          // For frontend-only failures, you might dispatch a local error action if needed.
        });

        razorpay.open();
      }
    };

    initiateRazorpayCheckout();
  }, [orderData, orderError, orderLoading, dispatch]);

  // Effect to handle payment verification success/failure
  useEffect(() => {
    if (verificationSuccess) {
      console.log("Subscription activated successfully!");
      dispatch(fetchProfileData());
      router("/permium-miner");
      onClose();
      dispatch(resetRazorpayState()); // Reset state after successful flow
    } else if (verificationError) {
      console.error("Payment verification failed:", verificationError);
      // Display error message to user
    }
  }, [verificationSuccess, verificationError, dispatch, router, onClose]);

  const handleRazorpayPayment = async (planSortOrder: number) => {
    // Changed to planSortOrder as per the tier.sort_order
    console.log(
      "handleRazorpayPayment called for plan sort_order:",
      planSortOrder
    );

    const selectedPlan = pricingTiers.find(
      (tier) => tier.sort_order === planSortOrder
    );

    if (!selectedPlan || !selectedPlan.uuid) {
      // Ensure UUID is available
      console.error(
        "Invalid plan selected: UUID is missing or plan not found."
      );
      return;
    }

    // Dispatch the create order thunk
    dispatch(createRazorpayOrder(selectedPlan.sort_order)); // Pass the plan's UUID
  };

  function handleBackdropClick(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    if (e.target === e.currentTarget) {
      onClose(); // Use the prop to close
    }
  }

  // Render null until mounted to ensure createPortal has a DOM target
  if (!mounted) return null;

  // Handle loading and error states for subscription plans
  if (status === "loading") {
    return createPortal(
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <div className="text-white text-xl">Loading plans...</div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  }

  if (status === "failed") {
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
            className="relative bg-[#f1f5f9] border border-[#2d3748]/20 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 md:p-12 text-center"
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
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-[#2d3748]">
              {error || "Failed to load pricing plans."}
            </p>
            <motion.button
              onClick={() => dispatch(fetchSubscriptionPlans())}
              className="mt-6 bg-[#3b82f6] hover:bg-[#2d3748] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}>
              Retry
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  }

  // Handle errors from Razorpay slice
  if (orderError || verificationError) {
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
            className="relative bg-[#f1f5f9] border border-[#2d3748]/20 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 md:p-12 text-center"
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
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Payment Error
            </h2>
            <p className="text-[#2d3748]">
              {orderError ||
                verificationError ||
                "An unknown payment error occurred."}
            </p>
            <motion.button
              onClick={() => dispatch(resetRazorpayState())} // Reset Razorpay state on retry
              className="mt-6 bg-[#3b82f6] hover:bg-[#2d3748] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}>
              Try Again
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {pricingTiers.map((tier: ApiPricingTier, index: number) => (
              <motion.div
                key={tier.uuid}
                className={`relative min-h-[28rem] bg-[#f1f5f9] border pt-10 border-[#2d3748]/20 rounded-2xl p-6 hover:border-[#3b82f6]/50 shadow-lg hover:shadow-blue-100 group ${
                  tier.is_popular === 1 ? "ring-2 ring-[#3b82f6]/50" : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}>
                {tier.is_popular === 1 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md">
                    MOST POPULAR
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  {/* Icons can be mapped based on tier.name or index if preferred */}
                  {tier.name === "Basic" && (
                    <Zap className="h-6 w-6 text-[#2563eb]" />
                  )}
                  {tier.name === "Pro" && (
                    <Sparkles className="h-6 w-6 text-emerald-600" />
                  )}
                  {tier.name === "Enterprises" && (
                    <Gem className="h-6 w-6 text-amber-600" />
                  )}
                  <h3 className="text-xl font-semibold text-[#111827]">
                    {tier.name}
                  </h3>
                </div>

                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-[#111827]">
                    ${parseFloat(tier.price).toFixed(2)}{" "}
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
                    if (parseFloat(tier.price) === 0) {
                      console.log("✅ You selected Free Plan!");
                      onClose();
                      dispatch(fetchProfileData());
                      router("/miner");
                    } else {
                      handleRazorpayPayment(tier.sort_order); // Pass the sort_order to find the plan's UUID
                    }
                  }}
                  disabled={isPaymentProcessing}
                  className="w-full bg-[#3b82f6] hover:bg-[#2d3748] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}>
                  {parseFloat(tier.price) === 0
                    ? "Select Free Plan"
                    : isPaymentProcessing
                    ? "Processing..."
                    : "Select Plan"}
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
