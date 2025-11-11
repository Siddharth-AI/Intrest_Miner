"use client";

import React, { useState, useEffect } from "react";
import { X, Zap, Sparkles, Gem, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchProfileData } from "../../../store/features/profileSlice";
import {
  fetchSubscriptionPlans,
  ApiPricingTier,
} from "../../../store/features/subscriptionPlansSlice";
import CheckoutModal from "./CheckoutModal"; // Adjust path as needed
import Portal from "../ui/Portal";
import {
  resetRazorpayState, // Add this import
} from "../../../store/features/razorpaySlice";
interface PricingModelProps {
  onClose: () => void;
}

export default function PricingModel({ onClose }: PricingModelProps) {
  const router = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] =
    useState<ApiPricingTier | null>(null);

  const dispatch = useAppDispatch();

  // Select data from the Redux store
  const {
    data: pricingTiers,
    status,
    error,
  } = useAppSelector((state) => state.subscriptionPlans);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";

    if (status === "idle") {
      dispatch(fetchSubscriptionPlans());
    }
    // Reset Razorpay state when pricing modal opens
    dispatch(resetRazorpayState());

    return () => {
      document.body.style.overflow = "";
      dispatch(resetRazorpayState());
    };
  }, [dispatch, status]);

  // Handle plan selection - show checkout modal
  const handlePlanSelection = (plan: ApiPricingTier) => {
    if (parseFloat(plan.price) === 0) {
      console.log("✅ You selected Free Plan!");
      onClose();
      dispatch(fetchProfileData());
      router("/miner");
    } else {
      // Show checkout modal with selected plan
      setSelectedPlanForCheckout(plan);
      setShowCheckoutModal(true);
    }
  };

  // Handle checkout modal close
  const handleCheckoutClose = () => {
    setShowCheckoutModal(false);
    setSelectedPlanForCheckout(null);
    dispatch(resetRazorpayState());
  };

  const handleMainModalClose = () => {
    // Clear state before closing main modal
    dispatch(resetRazorpayState());
    onClose();
  };

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      handleMainModalClose();
    }
  }

  if (!mounted) return null;

  if (status === "loading") {
    return (
      <Portal>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl">Loading plans...</div>
        </div>
      </Portal>
    );
  }

  if (status === "failed") {
    return (
      <Portal>
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleBackdropClick}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}>
          <div className="bg-white rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p className="text-gray-600 mb-4">
              {error || "Failed to load pricing plans."}
            </p>
            <button
              onClick={() => dispatch(fetchSubscriptionPlans())}
              className="bg-blue-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold">
              Retry
            </button>
          </div>
        </motion.div>
      </Portal>
    );
  }

  return (
    <>
      <Portal>
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40"
          onClick={handleBackdropClick}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}>
          <div className="bg-white rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Choose Your Pricing Plan
              </h2>
              <button
                onClick={handleMainModalClose}
                className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingTiers.map((tier: ApiPricingTier) => (
                <div
                  key={tier.id}
                  className={`relative bg-white border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg flex flex-col ${
                    tier.is_popular === 1
                      ? "border-blue-500 shadow-lg"
                      : "border-gray-200"
                  }`}>
                  {" "}
                  {/* Added flex flex-col here */}
                  {tier.is_popular === 1 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    {tier.name === "Basic" && (
                      <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    )}
                    {tier.name === "Pro" && (
                      <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    )}
                    {tier.name === "Enterprises" && (
                      <Gem className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    )}

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {tier.name}
                    </h3>

                    <div className="text-3xl font-bold text-gray-900 mb-4">
                      ${parseFloat(tier.price).toFixed(2)}
                      <span className="text-lg text-gray-600">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {" "}
                    {/* Added flex-grow here */}
                    {tier.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanSelection(tier)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-auto">
                    {" "}
                    {/* Added mt-auto here */}
                    {parseFloat(tier.price) === 0
                      ? "Select Free Plan"
                      : "Select Plan"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Portal>
      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={handleMainModalClose}
        backclick={handleCheckoutClose}
        selectedPlan={selectedPlanForCheckout}
      />
    </>
  );
}
