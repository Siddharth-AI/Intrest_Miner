// src/app/page.tsx (or Index.tsx)
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, BarChart3, Download } from "lucide-react";
import BusinessInfoForm from "@/components/BusinessInfoForm";
import InterestResults from "@/components/InterestResults";
import type { BusinessFormData } from "@/types/business";
import { motion } from "framer-motion";

// Redux imports
import { useAppSelector } from "../../store/hooks"; // Adjust path as needed

const InterestGenerator = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessFormData | null>(
    null
  );

  // Use isLoading from Redux store
  const { loading: isProcessing } = useAppSelector((state) => state.openai);

  const handleFormSubmit = async (data: BusinessFormData) => {
    setBusinessData(data);
    // Move to the next step immediately to show the loading state in InterestResults component
    setCurrentStep(2);
    // isProcessing will be true automatically when the generateInterests thunk is pending
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setBusinessData(null);
    // isProcessing state will be reset by resetOpenAiState action in InterestResults
  };

  return (
    <div className="relative pt-24 pb-16 min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <h1 className="text-5xl font-bold text-[#111827] mb-4 tracking-tight">
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
            <p className="text-xl text-[#2d3748] mb-8 max-w-3xl mx-auto">
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
                        : "border-[#2d3748]/30 text-[#2d3748]"
                    }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium transition-colors ${
                      currentStep >= step ? "text-[#111827]" : "text-[#2d3748]"
                    }`}>
                    {title}
                  </span>
                  {step < 4 && (
                    <div
                      className={`hidden sm:block ml-4 w-8 h-0.5 transition-colors ${
                        currentStep > step ? "bg-[#3b82f6]" : "bg-[#2d3748]/30"
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
            <Card className="bg-[#f1f5f9] border-[#2d3748]/20 shadow-blue-100 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-[#111827]">
                  Step 1: Gather Business Information
                </CardTitle>
                <CardDescription className="text-[#2d3748]">
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
              <Card className="bg-[#f1f5f9] border-[#2d3748]/20 shadow-2xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-[#111827]">
                    Interest Analysis
                  </CardTitle>
                  <CardDescription className="text-[#2d3748]">
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
                className="bg-[#f1f5f9] border-[#2d3748]/20 text-[#2d3748] hover:bg-[#3b82f6]/10 hover:text-[#111827] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                Start New Analysis
              </Button>
            </motion.div>
          </div>
        )}
      </div>
      <div className="-z-10 absolute top-[4.2rem] right-2 w-24 h-24 bg-gradient-to-b from-blue-500 to-purple-400 rounded-full opacity-30 animate-float"></div>
      <div
        className="-z-10 absolute bottom-4 right-[33rem] w-32 h-32 bg-gradient-to-r from-black to-purple-600 rounded-full opacity-20 animate-float"
        style={{ animationDelay: "2s" }}></div>

      <div className="-z-10 absolute top-[20rem] left-[20rem] w-40 h-40 bg-gradient-to-b from-purple-600 to-blue-500 rounded-full opacity-30 animate-float"></div>
      <div className="-z-10 absolute top-[20rem] right-[10rem] w-36 h-36 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full opacity-20 animate-float"></div>
    </div>
  );
};

export default InterestGenerator;
