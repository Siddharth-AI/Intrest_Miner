"use client";

import React, { useEffect } from "react";
import {
  X,
  Sparkles,
  Target,
  BarChart3,
  Download,
  Crown,
  Lightbulb,
  TrendingUp,
  FileText,
  Zap,
  CheckCircle,
  Users,
  MapPin,
  Mail,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "../ui/Portal";

interface PremiumMinerHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumMinerHelpModal: React.FC<PremiumMinerHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const workflowSteps = [
    {
      step: "1",
      title: "Business Information",
      description: "Fill out detailed form about your business",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
    },
    {
      step: "2",
      title: "AI Analysis",
      description: "Our AI analyzes your data and market trends",
      icon: Sparkles,
      color: "from-purple-500 to-purple-600",
    },
    {
      step: "3",
      title: "Meta API Integration",
      description: "Fetch real-time data from Facebook's servers",
      icon: BarChart3,
      color: "from-green-500 to-green-600",
    },
    {
      step: "4",
      title: "Premium Results",
      description: "Get top 15 guaranteed high-converting interests",
      icon: Download,
      color: "from-orange-500 to-orange-600",
    },
  ];

  const formFields = [
    {
      field: "Product/Business Name",
      icon: Building2,
      description: "Your exact product or business name",
      example: "e.g., Organic Skincare Products, Digital Marketing Agency",
      required: true,
    },
    {
      field: "Category",
      icon: Target,
      description: "Business industry or sector",
      example: "e.g., Beauty, Technology, E-commerce, Healthcare",
      required: true,
    },
    {
      field: "Product/Business Description",
      icon: FileText,
      description: "Detailed description of what you offer",
      example:
        "e.g., Natural skincare line for sensitive skin with organic ingredients",
      required: true,
    },
    {
      field: "Location",
      icon: MapPin,
      description: "Target geographic area",
      example: "e.g., United States, India, Europe, Worldwide",
      required: true,
    },
    {
      field: "Promotion Goal",
      icon: TrendingUp,
      description: "Primary advertising objective",
      example: "e.g., Sales Conversion, Brand Awareness, Lead Generation",
      required: true,
    },
    {
      field: "Target Audience",
      icon: Users,
      description: "Ideal customer demographics and interests",
      example: "e.g., Women 25-40, interested in natural beauty, eco-conscious",
      required: true,
    },
    {
      field: "Contact Email",
      icon: Mail,
      description: "Email for results delivery and updates",
      example: "e.g., your-email@business.com",
      required: true,
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <Crown className="w-8 h-8 text-yellow-300" />
                <h2 className="text-2xl font-bold">Premium Miner Guide</h2>
              </div>
              <p className="text-purple-100">
                AI-powered Facebook interest discovery with guaranteed
                high-converting results
              </p>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {/* How Premium Miner Works */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-600" />
                  How Premium Miner Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {workflowSteps.map((item, index) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
                      <div
                        className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                        {item.step}
                      </div>
                      <item.icon className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Required Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Required Information
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  The more detailed and specific information you provide, the
                  better our AI can find high-converting interests tailored to
                  your business.
                </p>

                <div className="space-y-4">
                  {formFields.map((field, index) => (
                    <motion.div
                      key={field.field}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <field.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                            {field.field}
                          </h4>
                          {field.required && (
                            <span className="text-red-500 text-xs font-bold">
                              *
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {field.description}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 italic">
                          {field.example}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Premium Miner Best Practices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-600" />
                  Premium Miner Best Practices
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700/30">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      For Best Results
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                      <li>• Be specific with your business description</li>
                      <li>• Include your target audience demographics</li>
                      <li>• Mention your main promotion goals</li>
                      <li>• Add geographic targeting details</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700/30">
                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Pro Tips
                    </h4>
                    <ul className="space-y-2 text-sm text-green-600 dark:text-green-400">
                      <li>• Use detailed product/service descriptions</li>
                      <li>• Include competitor information if available</li>
                      <li>• Specify budget ranges for better targeting</li>
                      <li>• Mention seasonal or trending factors</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Results You Get */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700/30">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  What You Get
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Complete results dashboard with AI relevance scores
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Real-time audience sizes from Facebook's API
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Interest IDs and categories for immediate use
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Performance indicators and recommendations
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Export functionality for Facebook Ads Manager
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Top 15 guaranteed high-converting interests
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 flex-shrink-0">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ready to find your perfect audience interests?
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-sm font-medium">
                  Start Premium Discovery!
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
};

export default PremiumMinerHelpModal;
