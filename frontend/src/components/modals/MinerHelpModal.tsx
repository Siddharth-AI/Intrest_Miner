"use client";

import React, { useEffect } from "react";
import {
  X,
  Search,
  Download,
  Sparkles,
  Target,
  BarChart3,
  Crown,
  Lightbulb,
  TrendingUp,
  FileText,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "../ui/Portal";

interface MinerHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MinerHelpModal: React.FC<MinerHelpModalProps> = ({ isOpen, onClose }) => {
  const features = [
    {
      icon: Search,
      title: "AI-Powered Keyword Discovery",
      description:
        "Simply enter your product or service keywords and let our AI find the most relevant Facebook ad interests for your campaigns.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Target,
      title: "Precision Targeting",
      description:
        "Get highly targeted audience interests that are proven to perform well in Facebook advertising campaigns.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: BarChart3,
      title: "Performance Metrics",
      description:
        "Each interest comes with audience size and relevance scores to help you make informed targeting decisions.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Download,
      title: "CSV Export",
      description:
        "Export your discovered interests as CSV files for easy import into Facebook Ads Manager or other tools.",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const howToUse = [
    {
      step: "1",
      title: "Enter Keywords",
      description:
        "Type your product, service, or niche keywords in the search box",
      icon: Lightbulb,
    },
    {
      step: "2",
      title: "AI Processing",
      description: "Our AI analyzes and finds relevant Facebook ad interests",
      icon: Sparkles,
    },
    {
      step: "3",
      title: "Review Results",
      description: "Browse through suggested interests with audience size data",
      icon: TrendingUp,
    },
    {
      step: "4",
      title: "Export Data",
      description: "Download your selected interests as CSV for campaign use",
      icon: FileText,
    },
  ];
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <AnimatePresence>
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold mb-2">Miner Generator Guide</h2>
              <p className="text-indigo-100">
                Learn how to discover high-performing Facebook ad interests
              </p>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {/* How It Works Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-indigo-600" />
                  How It Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {howToUse.map((item, index) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                      <item.icon className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Features Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Key Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tips Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Pro Tips
                </h3>
                <div className="space-y-3">
                  {[
                    "Use specific product names or service keywords for better results",
                    "Try variations of your keywords (plural, synonyms, related terms)",
                    "Check the audience size to ensure your targeting isn't too narrow or broad",
                    "Export results to CSV for easy import into Facebook Ads Manager",
                    "Combine multiple related interests for more precise targeting",
                  ].map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{tip}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Premium Note */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <Crown className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Want Guaranteed High-Performance Keywords?
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      For top-tier, guaranteed high-converting keywords with
                      advanced filtering and premium insights, upgrade to our{" "}
                      <strong>Premium Generator</strong> for professional-grade
                      results.
                    </p>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-yellow-700 font-medium">
                        Premium features unlock exclusive high-performance data
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex-shrink-0">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Ready to find your perfect audience interests?
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                  Start Mining!
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
};

export default MinerHelpModal;
