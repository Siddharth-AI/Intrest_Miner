"use client";

import React from "react";
import {
  X,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Search,
  Filter,
  Calendar,
  Lightbulb,
  Eye,
  Zap,
  CheckCircle,
  RefreshCw,
  Crown,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "../ui/Portal";

interface BasicAnalyticsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BasicAnalyticsHelpModal: React.FC<BasicAnalyticsHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const workflowSteps = [
    {
      step: "1",
      title: "Select Ad Account",
      description: "Choose from your connected Meta ad accounts",
      icon: Target,
      color: "from-blue-500 to-blue-600",
    },
    {
      step: "2",
      title: "View Campaign Data",
      description: "See all campaigns with key metrics and insights",
      icon: BarChart3,
      color: "from-purple-500 to-purple-600",
    },
    {
      step: "3",
      title: "Filter & Search",
      description: "Use filters and search to find specific campaigns",
      icon: Search,
      color: "from-green-500 to-green-600",
    },
    {
      step: "4",
      title: "Analyze Performance",
      description: "Review metrics and track campaign success",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
    },
  ];

  const keyFeatures = [
    {
      icon: BarChart3,
      title: "Campaign Overview",
      description:
        "View all your Meta campaigns with essential metrics like impressions, clicks, reach, and spend in one organized dashboard.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Target,
      title: "Performance Metrics",
      description:
        "Track key performance indicators including CTR, CPC, conversions, and total spend across all your campaigns.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Search,
      title: "Search & Filter",
      description:
        "Find specific campaigns quickly using search functionality and filter by status, date ranges, and objectives.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Calendar,
      title: "Date Range Analysis",
      description:
        "Analyze campaign performance over custom date ranges to identify trends and optimize timing strategies.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Eye,
      title: "Campaign Details",
      description:
        "Click on any campaign to view basic insights including campaign status, dates, and objectives.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: RefreshCw,
      title: "Real-time Data",
      description:
        "Get up-to-date campaign information with real-time synchronization from your Meta Ads Manager.",
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  const basicFeatures = [
    "Campaign impressions and reach tracking",
    "Click-through rates (CTR) and cost-per-click (CPC)",
    "Campaign status monitoring (Active, Paused)",
    "Start and end date tracking",
    "Basic objective categorization",
    "Real-time spend tracking",
  ];

  const proTips = [
    "Use the search bar to quickly find campaigns by name",
    "Filter by campaign status to focus on active campaigns",
    "Set custom date ranges to analyze performance trends",
    "Use the account selector for multiple ad accounts",
    "Refresh data regularly to get latest information",
    "Click on campaigns to view basic details",
  ];

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
            <div className="relative p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-8 h-8 text-blue-200" />
                <h2 className="text-2xl font-bold">Basic Analytics Guide</h2>
              </div>
              <p className="text-blue-100">
                Learn how to analyze your Meta campaign performance and track
                key metrics
              </p>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {/* How Basic Analytics Works */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  How Basic Analytics Works
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
                      <item.icon className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
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

              {/* Key Features Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Key Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                      <div
                        className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Basic Analytics Features */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Basic Analytics Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {basicFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-700/30">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Pro Tips Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                  Pro Tips
                </h3>
                <div className="space-y-3">
                  {proTips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-700/30">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {tip}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Upgrade to Advanced Analytics */}
              <div className="bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700/30">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-purple-600" />
                  Want More Advanced Features?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        AI Campaign Analysis
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Smart Performance Recommendations
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Campaign Categories (Excellent, Struggling)
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Deep Campaign Insights
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Advanced Filtering & Search
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Performance Optimization Tips
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-700/30">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    <strong className="text-purple-600 dark:text-purple-400">
                      Upgrade to Advanced Analytics
                    </strong>{" "}
                    for AI-powered insights, campaign recommendations, and
                    high-performance analytics that help you optimize your Meta
                    ads like a pro.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 flex-shrink-0">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ready to analyze your campaign performance?
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors text-sm font-medium">
                  Start Analyzing!
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
};

export default BasicAnalyticsHelpModal;
