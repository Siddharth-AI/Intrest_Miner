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

// Redux imports
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { openPricingModal } from "../../store/features/pricingModalSlice";
import { useNavigate } from "react-router-dom";
import { fetchProfileData } from "../../store/features/profileSlice";
import { resetOpenAiState } from "../../store/features/openaiSlice";

const InterestGenerator = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    data: userProfile,
    loading,
    error,
  } = useAppSelector((state) => state.profile);
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessFormData | null>(
    null
  );

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

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(
      "hasSeenInterestMinerTutorial"
    );

    if (!hasSeenTutorial) {
      setShowTutorialPopup(true);
      localStorage.setItem("hasSeenInterestMinerTutorial", "true");
    } else {
      setShowTutorialButton(true);
    }
  }, []);

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
  };

  const handleOpenTutorial = () => {
    setShowTutorialPopup(true);
  };

  const handleCloseTutorialButton = () => {
    setShowTutorialButton(false);
  };

  return (
    <div className="relative pb-16 min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)] dark:from-gray-900 dark:to-gray-800">
      {/* Tutorial Pop-up (Full screen) */}
      <AnimatePresence>
        {showTutorialPopup && (
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
    </div>
  );
};

export default InterestGenerator;
