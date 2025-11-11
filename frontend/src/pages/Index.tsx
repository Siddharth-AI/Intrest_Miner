"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, BarChart3, Download, X } from "lucide-react";
import BusinessInfoForm from "@/components/forms/BusinessInfoForm";
import InterestResults from "@/components/common/InterestResults";
import type { BusinessFormData } from "@/types/business";
import { motion, AnimatePresence } from "framer-motion";
import PremiumMinerHelpModal from "../components/modals/PremiumMinerHelpModal";
import FloatingHelpButton from "../components/common/FloatingHelpButton";
// Redux imports
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { openPricingModal } from "../../store/features/pricingModalSlice";
import { useNavigate } from "react-router-dom";
import { fetchProfileData } from "../../store/features/profileSlice";
import { resetOpenAiState } from "../../store/features/openaiSlice";
import {
  fetchOnboardingStatus,
  updateOnboardingStatus,
} from "../../store/features/onboardingSlice";

// Add these imports at the top
import {
  Crown,
  ChartBarIcon,
  EyeIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import HelpTooltip from "@/components/common/HelpTooltip";
import Portal from "@/components/ui/Portal";

const InterestGenerator = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // Get onboarding status from Redux store
  const { hasSeenInterestMinerTutorial, loading: onboardingLoading } =
    useAppSelector((state) => state.onboarding);

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const [showHelpTooltip, setShowHelpTooltip] = useState(true);
  const {
    data: userProfile,
    loading,
    error,
  } = useAppSelector((state) => state.profile);
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessFormData | null>(
    null
  );

  const hasActiveSubscription = userProfile?.subscription_status === "active";

  const { data: openAiData } = useAppSelector((state) => state.openAi);

  // Theme detection - ONLY ADDITION
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    dispatch(fetchOnboardingStatus());
  }, [dispatch]);

  useEffect(() => {
    if (!businessData && openAiData && openAiData.businessInfo) {
      console.log("Restoring business data from persisted state");
      setBusinessData(openAiData.businessInfo);
      setCurrentStep(2);
    }
  }, [businessData, openAiData]);

  const [showTutorialPopup, setShowTutorialPopup] = useState(false);
  const [showTutorialButton, setShowTutorialButton] = useState(false);
  const { loading: isProcessing } = useAppSelector((state) => state.openAi);

  console.log(businessData, "testing data check>>>>>>>>>>>>>>>");

  // Show tutorial based on backend data
  useEffect(() => {
    if (onboardingLoading) return; // Wait for data to load

    if (!hasSeenInterestMinerTutorial) {
      setShowTutorialPopup(true);
    } else {
      setShowTutorialButton(true);
    }
  }, [hasSeenInterestMinerTutorial, onboardingLoading]);

  const handleFormSubmit = async (data: BusinessFormData) => {
    setBusinessData(data);
    setCurrentStep(2);
  };

  const resetWorkflow = () => {
    dispatch(fetchProfileData());
    if (userProfile && userProfile.subscription_status === "active") {
      console.log(
        "ProtectedRoutes: Subscription is active. Granting access to premium content."
      );
      setCurrentStep(1);
      setBusinessData(null);
      dispatch(resetOpenAiState());
    } else if (userProfile) {
      console.log(
        `ProtectedRoutes: Subscription status is '${userProfile.subscription_status}'. Redirecting to dashboard.`
      );
      dispatch(openPricingModal());
      navigate("/miner", { replace: true });
    }
  };

  const handleCloseTutorial = () => {
    setShowTutorialPopup(false);
    setShowTutorialButton(true);

    // Update backend
    dispatch(updateOnboardingStatus({ hasSeenInterestMinerTutorial: true }));
  };

  const handleOpenTutorial = () => {
    setShowTutorialPopup(true);
  };

  const handleCloseTutorialButton = () => {
    setShowTutorialButton(false);
  };

  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/10 dark:bg-purple-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-20 text-purple-400/30 dark:text-purple-500/20">
            <Crown className="w-8 h-8" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-40 right-32 text-pink-400/30 dark:text-pink-500/20">
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
          }}
          className="relative z-10 text-center max-w-5xl mx-auto p-8">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 dark:from-purple-400/10 dark:to-orange-400/10 rounded-3xl"></div>

            <div className="relative z-10">
              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent mb-3">
                Unlock Premium Interest Mining 💎
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                Get top 50 guaranteed high-converting interests hand-picked by
                AI from thousands of possibilities.
              </motion.p>

              {/* Premium vs Standard Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-500/10 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">
                      Standard Miner
                    </h3>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start space-x-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Keyword-based discovery</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Hundreds of general suggestions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Manual filtering required</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Basic relevance scoring</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-700/30 relative">
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    PREMIUM
                  </div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300">
                      Premium Miner
                    </h3>
                  </div>
                  <ul className="space-y-3 text-sm text-purple-600 dark:text-purple-400">
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>AI analyzes thousands of interests</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>Top 15 guaranteed high-converters</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>Performance & competition analysis</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>Business-specific optimization</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Premium Features */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700/30">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    15
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Top Interests
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl border border-pink-200 dark:border-pink-700/30">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">
                    95%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Relevance Score
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-700/30">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    10K+
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Analyzed
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700/30">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    AI
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Powered
                  </div>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(168, 85, 247, 0.4), 0 10px 10px -5px rgba(168, 85, 247, 0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => dispatch(openPricingModal())}
                className="group relative w-full px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

                <div className="relative flex items-center justify-center space-x-3">
                  <Crown className="w-5 h-5" />
                  <span className="text-lg">Upgrade to Premium</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="ml-1">
                    →
                  </motion.div>
                </div>
              </motion.button>

              {/* Bottom Benefits */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mt-6 p-4 bg-gradient-to-r from-purple-50/50 to-orange-50/50 dark:from-purple-900/20 dark:to-orange-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/30">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Premium Interest Mining
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Skip the guesswork. Get top 50 guaranteed high-converting
                      interests tailored to your business.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative pb-16 min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)] dark:from-gray-900 dark:to-gray-800">
      {/* Tutorial Pop-up (Full screen) */}
      <AnimatePresence>
        {showTutorialPopup && !onboardingLoading && (
          <Portal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl h-auto aspect-video">
                <button
                  onClick={handleCloseTutorial}
                  className="absolute top-1 right-1 bg-blue-500/20 text-white hover:bg-blue-700 hover:text-red-500 z-10">
                  <X size={24} />
                </button>
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/FwOTs4UxQS4?si=ghEcv5GvYblvyDiL"
                  title="InterestMiner Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"></iframe>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Persistent Tutorial Button (Side Pop-up) */}
      <AnimatePresence>
        {showTutorialButton && !showTutorialPopup && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-[5.5rem] right-0 z-40">
            <div className="relative">
              <button
                onClick={handleOpenTutorial}
                className="bg-[#3b82f6] hover:bg-[#2d3748] text-[#f1f5f9] shadow-lg flex items-center p-3 pr-10 sm:pr-20 rounded-tl-lg rounded-bl-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="mr-3">Watch Tutorial</span>
              </button>
              <button
                onClick={handleCloseTutorialButton}
                className="absolute top-1/2 -translate-y-1/2 right-2 text-[#f1f5f9] hover:text-gray-200 p-2 rounded-full hover:bg-blue-700">
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <h1 className="text-5xl font-bold text-[#111827] dark:text-white mb-4 tracking-tight">
              <span
                className=""
                style={{
                  background: `linear-gradient(135deg, hsl(221.2, 83.2%, 53.3%) 0%, hsl(262.1, 83.3%, 57.8%) 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                InterestMiner
              </span>
            </h1>
            <p className="text-xl text-[#2d3748] dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              4-Step Automated Workflow to Generate High-Performing Meta Ad
              Interests
            </p>

            {/* Step Indicators */}
            <div className="flex justify-center flex-wrap gap-5 items-center space-x-4 mb-5 md:mb-12">
              {[
                { step: 1, title: "Business Info", icon: Target },
                { step: 2, title: "AI Analysis", icon: Sparkles },
                { step: 3, title: "Meta API", icon: BarChart3 },
                { step: 4, title: "Export Results", icon: Download },
              ].map(({ step, title, icon: Icon }, index) => (
                <motion.div
                  key={step}
                  className="flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}>
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      currentStep >= step
                        ? "bg-[#3b82f6] border-[#3b82f6] text-white shadow-lg"
                        : "border-[#2d3748]/30 text-[#2d3748] dark:border-gray-600 dark:text-gray-400"
                    }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium transition-colors ${
                      currentStep >= step
                        ? "text-[#111827] dark:text-white"
                        : "text-[#2d3748] dark:text-gray-400"
                    }`}>
                    {title}
                  </span>
                  {step < 4 && (
                    <div
                      className={`hidden sm:block ml-4 w-8 h-0.5 transition-colors ${
                        currentStep > step
                          ? "bg-[#3b82f6]"
                          : "bg-[#2d3748]/30 dark:bg-gray-600"
                      }`}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <Card className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-700 shadow-blue-100 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-[#111827] dark:text-white">
                  Step 1: Gather Business Information
                </CardTitle>
                <CardDescription className="text-[#2d3748] dark:text-gray-300">
                  Tell us about your business to generate targeted interest
                  suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusinessInfoForm
                  onSubmit={handleFormSubmit}
                  isLoading={isProcessing}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 2 && businessData && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}>
              <Card className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-700 shadow-2xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-[#111827] dark:text-white">
                    Interest Analysis
                  </CardTitle>
                  <CardDescription className="text-[#2d3748] dark:text-gray-300">
                    Analyzing Meta ad interests for {businessData.productName}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <InterestResults businessData={businessData} />

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}>
              <Button
                onClick={resetWorkflow}
                variant="outline"
                className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-700 text-[#2d3748] dark:text-gray-300 hover:bg-[#3b82f6]/10 hover:text-[#111827] dark:hover:text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                Start New Analysis
              </Button>
            </motion.div>
          </div>
        )}
      </div>
      <div className="overflow-hidden">
        <div className="-z-10 absolute top-[4.2rem] right-2 w-24 h-24 bg-gradient-to-b from-blue-500 to-purple-400 rounded-full opacity-30 animate-float"></div>
        <div
          className="-z-10 absolute bottom-4 right-[33rem] w-32 h-32 bg-gradient-to-r from-black to-purple-600 rounded-full opacity-20 animate-float"
          style={{ animationDelay: "2s" }}></div>

        <div className="-z-10 absolute top-[20rem] left-[20rem] w-40 h-40 bg-gradient-to-b from-purple-600 to-blue-500 rounded-full opacity-30 animate-float"></div>
        <div className="-z-10 absolute top-[20rem] right-[10rem] w-36 h-36 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full opacity-20 animate-float"></div>
      </div>
      <HelpTooltip
        show={showHelpTooltip}
        message="How it works"
        onClose={() => setShowHelpTooltip(false)}
      />

      <FloatingHelpButton
        onClick={() => setIsHelpModalOpen(true)}
        help="Premium Miner Help"
      />

      <PremiumMinerHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default InterestGenerator;
