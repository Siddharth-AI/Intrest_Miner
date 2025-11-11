/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Tag,
  X,
  Shield,
  Clock,
  Users,
  Zap,
  Sparkles,
  Gem,
  CreditCard,
  ArrowLeft, // Add this
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchProfileData } from "../../../store/features/profileSlice";
import {
  fetchSubscriptionPlans,
  ApiPricingTier,
} from "../../../store/features/subscriptionPlansSlice";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  resetRazorpayState,
  validateCoupon,
  clearAppliedCoupon,
  clearCouponError,
} from "../../../store/features/razorpaySlice";
import Portal from "../ui/Portal";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  backclick: () => void;
  selectedPlan: ApiPricingTier | null;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  backclick,
}) => {
  const dispatch = useAppDispatch();

  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const {
    orderLoading,
    orderError,
    orderData,
    verificationLoading,
    verificationError,
    verificationSuccess,
    validationLoading,
    validationError,
    appliedCoupon,
  } = useAppSelector((state) => state.razorpay);

  const isProcessing = orderLoading || verificationLoading || validationLoading;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      dispatch(resetRazorpayState());
      setShowCouponInput(false);
      setCouponCode("");
    }
  }, [isOpen, dispatch]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Get plan icon
  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "Basic":
        return <Zap className="w-6 h-6 text-blue-500" />;
      case "Pro":
        return <Sparkles className="w-6 h-6 text-blue-500" />;
      case "Enterprises":
        return <Gem className="w-6 h-6 text-blue-500" />;
      default:
        return <Shield className="w-6 h-6 text-blue-500" />;
    }
  };

  // Handle coupon validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedPlan) return;

    dispatch(clearCouponError());
    const result = await dispatch(
      validateCoupon({
        coupon_code: couponCode.trim().toUpperCase(),
        plan_id: selectedPlan.id,
      })
    );

    if (validateCoupon.fulfilled.match(result)) {
      setShowCouponInput(false);
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    dispatch(clearAppliedCoupon());
    setCouponCode("");
    setShowCouponInput(false);
  };

  // Calculate final pricing
  const originalPrice = selectedPlan ? parseFloat(selectedPlan.price) : 0;
  const discountAmount = appliedCoupon
    ? appliedCoupon.pricing.discount_amount
    : 0;
  const finalPrice = appliedCoupon
    ? appliedCoupon.pricing.final_amount
    : originalPrice;

  // Handle payment processing
  const handlePayment = async () => {
    if (!selectedPlan) return;

    const requestData: any = {
      plan_id: selectedPlan.id,
    };

    // Add coupon if applied
    if (appliedCoupon) {
      requestData.coupon_code = appliedCoupon.coupon.code;
    }

    dispatch(createRazorpayOrder(requestData));
  };

  // Handle Razorpay checkout
  useEffect(() => {
    const initiateRazorpayCheckout = async () => {
      if (orderData && !orderError && !orderLoading) {
        const scriptLoaded = await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

        if (!scriptLoaded || !window.Razorpay) return;

        const razorpay = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "Interest Miner",
          description: `Subscription for ${orderData.plan.name}${
            orderData.coupon_applied
              ? ` (Coupon: ${orderData.coupon_applied.code})`
              : ""
          }`,
          order_id: orderData.order.id,
          handler: async function (response: any) {
            dispatch(
              verifyRazorpayPayment({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                payment_uuid: orderData.payment_uuid,
                plan_id: orderData.plan.id,
                auto_renew: 1,
              })
            );
          },
          prefill: {
            name: "Interest Miner User",
            email: "user@example.com",
          },
          theme: {
            color: "#3b82f6",
          },
        });

        razorpay.on("payment.failed", (response: any) => {
          console.error("Razorpay payment failed:", response.error);
        });

        razorpay.open();
      }
    };

    initiateRazorpayCheckout();
  }, [orderData, orderError, orderLoading, dispatch]);

  // Handle payment success
  useEffect(() => {
    if (verificationSuccess) {
      dispatch(fetchProfileData());
      onClose();
      dispatch(resetRazorpayState());
    }
  }, [verificationSuccess, dispatch, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onClose();
    }
  };

  if (!isOpen || !selectedPlan) return null;

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}>
          <motion.div
            className="bg-white rounded-2xl w-full max-w-6xl min-h-[85vh] max-h-[90vh] overflow-hidden shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <button
                  onClick={backclick}
                  disabled={isProcessing}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed mr-2">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <CreditCard className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Complete Purchase
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Left Side - Plan Details */}
                <div className="space-y-4">
                  {/* Plan Information */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getPlanIcon(selectedPlan.name)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {selectedPlan.name} Plan
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {selectedPlan.description}
                        </p>

                        {/* Price Display */}
                        <div className="mt-3">
                          {appliedCoupon && discountAmount > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl font-bold text-green-600">
                                  ${finalPrice.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ${originalPrice.toFixed(2)}
                                </span>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                                  Save ${discountAmount.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-green-600">
                                <Tag className="w-3 h-3" />
                                <span>
                                  Coupon "{appliedCoupon.coupon.code}" applied
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xl font-bold text-gray-900">
                              ${originalPrice.toFixed(2)}
                              <span className="text-sm text-gray-600 font-normal">
                                /month
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                      What's Included
                    </h4>
                    <ul className="space-y-2">
                      {selectedPlan.features
                        .slice(0, 4)
                        .map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Plan Benefits */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                      Plan Benefits
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">
                          {selectedPlan.duration_days} days
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">
                          {selectedPlan.search_limit} searches
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">Secure</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">Instant</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Order Summary & Payment */}
                <div className="space-y-4">
                  {/* Order Summary */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Order Summary
                    </h4>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{selectedPlan.name} Plan (Monthly)</span>
                        <span>${originalPrice.toFixed(2)}</span>
                      </div>

                      {appliedCoupon && discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount ({appliedCoupon.coupon.code})</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-semibold text-gray-900">
                          <span>Total</span>
                          <span>${finalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Section */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Coupon Code
                    </h4>

                    {!appliedCoupon && !showCouponInput && (
                      <button
                        onClick={() => setShowCouponInput(true)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-2">
                        <Tag className="w-4 h-4" />
                        <span>Have a coupon code?</span>
                      </button>
                    )}

                    {showCouponInput && !appliedCoupon && (
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) =>
                              setCouponCode(e.target.value.toUpperCase())
                            }
                            placeholder="Enter coupon code"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center font-mono text-sm"
                            disabled={validationLoading}
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={!couponCode.trim() || validationLoading}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm">
                            {validationLoading ? "..." : "Apply"}
                          </button>
                        </div>

                        {validationError && (
                          <p className="text-red-600 text-xs">
                            {validationError}
                          </p>
                        )}

                        <button
                          onClick={() => {
                            setShowCouponInput(false);
                            setCouponCode("");
                            dispatch(clearCouponError());
                          }}
                          className="text-gray-500 hover:text-gray-700 text-xs">
                          Cancel
                        </button>
                      </div>
                    )}

                    {appliedCoupon && (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-800 text-sm font-medium">
                            "{appliedCoupon.coupon.code}" applied
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Payment Button */}
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isProcessing
                      ? "Processing..."
                      : `Pay $${finalPrice.toFixed(2)}`}
                  </button>

                  {/* Error Display */}
                  {(orderError || verificationError) && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">
                        {orderError || verificationError}
                      </p>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-blue-900 text-sm">
                          Secure Payment
                        </h5>
                        <p className="text-blue-700 text-xs mt-1">
                          Your payment is encrypted and secure.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};

export default CheckoutModal;
