"use client";

import React from "react";
import {
  X,
  SparklesIcon,
  ChartBarIcon,
  TrophyIcon,
  ShieldCheckIcon,
  AlertTriangle,
  Target,
  TrendingUp,
  Users,
  Search,
  Filter,
  Eye,
  Zap,
  CheckCircle,
  Crown,
  BarChart3,
  Flame,
  StarIcon,
  MousePointer2,
  Table,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "../ui/Portal";
import { FireIcon } from "@heroicons/react/24/outline";

interface AdvancedAnalyticsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedAnalyticsHelpModal: React.FC<AdvancedAnalyticsHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const workflowSteps = [
    {
      step: "1",
      title: "AI Data Analysis",
      description: "AI analyzes all your campaign data automatically",
      icon: SparklesIcon,
      color: "from-purple-500 to-purple-600",
    },
    {
      step: "2",
      title: "Smart Categorization",
      description:
        "Campaigns sorted into Excellent, Stable, Moderate, Struggling",
      icon: Target,
      color: "from-blue-500 to-blue-600",
    },
    {
      step: "3",
      title: "Advanced Filtering",
      description: "Filter by category, status, objective, date ranges",
      icon: Filter,
      color: "from-green-500 to-green-600",
    },
    {
      step: "4",
      title: "Deep Campaign Insights",
      description:
        "Click any campaign for detailed AI analysis & recommendations",
      icon: Eye,
      color: "from-orange-500 to-orange-600",
    },
  ];

  const campaignCategories = [
    {
      icon: TrophyIcon,
      title: "Excellent Campaigns",
      description:
        "High-performing campaigns with excellent ROI, strong CTR, and optimal conversion rates. These are your top performers.",
      color: "from-yellow-500 to-orange-500",
      badge: "Top Performers",
    },
    {
      icon: ShieldCheckIcon,
      title: "Stable Campaigns",
      description:
        "Consistent performing campaigns with steady results. Good baseline performance with room for optimization.",
      color: "from-green-500 to-emerald-500",
      badge: "Reliable",
    },
    {
      icon: BarChart3,
      title: "Moderate Campaigns",
      description:
        "Average performing campaigns that need attention. Mixed results with potential for improvement through optimization.",
      color: "from-blue-500 to-indigo-500",
      badge: "Needs Work",
    },
    {
      icon: AlertTriangle,
      title: "Struggling Campaigns",
      description:
        "Underperforming campaigns requiring immediate action. High costs, low conversions, or poor engagement rates.",
      color: "from-red-500 to-red-600",
      badge: "Action Required",
    },
  ];

  const keyFeatures = [
    {
      icon: SparklesIcon,
      title: "AI Performance Analysis",
      description:
        "Get intelligent insights and recommendations for each campaign based on performance data and industry benchmarks.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: ChartBarIcon,
      title: "Campaign Categories",
      description:
        "Automatically categorized campaigns (Excellent, Stable, Moderate, Struggling) for quick performance assessment.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Performance Metrics",
      description:
        "Comprehensive metrics including CTR, CPC, ROAS, conversion tracking, and detailed spending analysis.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Table,
      title: "Advanced Data Table",
      description:
        "Sortable, filterable table with pagination showing all campaign details, conversions, and performance indicators.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Search,
      title: "Multi-Filter System",
      description:
        "Filter campaigns by category, status, objective, date ranges, and search by campaign name for precise analysis.",
      color: "from-teal-500 to-teal-600",
    },
    {
      icon: MousePointer2,
      title: "Campaign Deep Dive",
      description:
        "Click any campaign to access detailed insights, AI recommendations, and actionable optimization suggestions.",
      color: "from-pink-500 to-pink-600",
    },
  ];

  const advancedFeatures = [
    "AI-powered campaign performance analysis with smart recommendations",
    "Automatic campaign categorization (Excellent, Stable, Moderate, Struggling)",
    "Real-time performance metrics with conversion tracking",
    "Advanced filtering by multiple criteria (category, status, objective, dates)",
    "Detailed campaign insights modal with optimization suggestions",
    "Comprehensive data table with sorting and pagination",
    "Performance trends and comparison analytics",
    "Cost optimization recommendations based on AI analysis",
  ];

  const proTips = [
    "Use category filters to quickly identify your best and worst performing campaigns",
    "Click on any campaign row to get detailed AI analysis and recommendations",
    "Use date range filters to analyze seasonal performance trends",
    "Focus on 'Struggling' campaigns first for immediate optimization opportunities",
    "Export 'Excellent' campaign data to replicate successful strategies",
    "Use search functionality to quickly find specific campaigns by name",
    "Monitor the overall performance dashboard for high-level insights",
    "Set up regular reviews of campaign categories to track improvements",
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <Crown className="w-8 h-8 text-yellow-300" />
                <h2 className="text-2xl font-bold">Advanced Analytics Guide</h2>
              </div>
              <p className="text-purple-100">
                Master AI-powered campaign analysis with smart categorization
                and advanced insights
              </p>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {/* How Advanced Analytics Works */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-purple-600" />
                  How Advanced Analytics Works
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

              {/* Campaign Categories */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  AI Campaign Categories
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaignCategories.map((category, index) => (
                    <motion.div
                      key={category.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="relative p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                      <div className="absolute top-3 right-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${category.color} text-white font-medium`}>
                          {category.badge}
                        </span>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <category.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-2">
                            {category.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Advanced Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
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

              {/* Advanced Features List */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2 text-purple-600" />
                  What You Get
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {advancedFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-700/30">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Pro Tips */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-600" />
                  Pro Tips for Advanced Analytics
                </h3>
                <div className="space-y-3">
                  {proTips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.6 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-700/30">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {tip}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Power User Section */}
              <div className="bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700/30">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <FireIcon className="w-5 h-5 mr-2 text-orange-600" />
                  Master Advanced Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        AI Campaign Intelligence
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Smart Performance Categories
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Advanced Filtering & Search
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Detailed Campaign Analysis
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Optimization Recommendations
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        Performance Trend Analysis
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-700/30">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    <strong className="text-purple-600 dark:text-purple-400">
                      Advanced Analytics
                    </strong>{" "}
                    gives you the power to make data-driven decisions with AI
                    insights, smart categorization, and comprehensive campaign
                    analysis.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 flex-shrink-0">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ready to master your campaign performance?
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors text-sm font-medium">
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

export default AdvancedAnalyticsHelpModal;
