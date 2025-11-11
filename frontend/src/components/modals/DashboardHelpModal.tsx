"use client";

import React, { useEffect } from "react";
import {
  X,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Settings,
  Eye,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "../ui/Portal";

interface DashboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardHelpModal: React.FC<DashboardHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const features = [
    {
      icon: BarChart3,
      title: "Campaign Analytics",
      description:
        "View real-time performance metrics including impressions, clicks, CTR, and conversions for all your Meta campaigns.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Target,
      title: "Audience Insights",
      description:
        "Discover high-performing audience interests and demographics to optimize your targeting strategy.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: TrendingUp,
      title: "Performance Tracking",
      description:
        "Monitor spend, ROI, and campaign performance with interactive charts and detailed breakdowns.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Users,
      title: "Account Management",
      description:
        "Switch between multiple ad accounts and manage your Meta Business integrations seamlessly.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Settings,
      title: "Campaign Controls",
      description:
        "Filter campaigns by status, date ranges, and performance metrics to focus on what matters most.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Eye,
      title: "Quick Actions",
      description:
        "Access detailed campaign views, edit settings, and perform bulk operations with one-click actions.",
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  const quickTips = [
    "Use the account selector to switch between different Meta Business accounts",
    "Filter campaigns by status (Active, Paused, etc.) for better organization",
    "Click on any campaign to view detailed performance insights",
    "Check the token status indicator to ensure your Meta connection is active",
    "Use the date picker to analyze performance across different time periods",
  ];
  // Prevent background scroll when modal is open
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
            {/* Header - Fixed */}
            <div className="relative p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold mb-2">Dashboard Guide</h2>
              <p className="text-blue-100">
                Everything you need to know about your InterestMiner dashboard
              </p>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 flex-1 overflow-y-auto">
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
                      transition={{ delay: index * 0.1 }}
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

              {/* Quick Tips Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Quick Tips
                </h3>
                <div className="space-y-3">
                  {quickTips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{tip}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Integration Status */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Meta Integration Status
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Your dashboard shows real-time data from your connected Meta
                  Business accounts. Make sure your connection is active for the
                  latest campaign performance.
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-700 font-medium">
                    Connected and syncing data
                  </span>
                </div>
              </div>
            </div>

            {/* Footer - Fixed at Bottom */}
            <div className="px-6 py-4 bg-gray-50 border-t flex-shrink-0">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Need more help? Check our documentation
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                  Got it!
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal>
  );
};

export default DashboardHelpModal;
