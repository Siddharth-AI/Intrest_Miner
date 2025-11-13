import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  DocumentChartBarIcon,
  SparklesIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Portal from "../ui/Portal";

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  campaignCount: number;
}

export interface ExportOptions {
  includeCampaignDetails: boolean;
  includeAIAnalysis: boolean;
}

const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
  isOpen,
  onClose,
  onExport,
  campaignCount,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<ExportOptions>({
    includeCampaignDetails: true,
    includeAIAnalysis: true,
  });

  const handleExport = () => {
    if (
      !selectedOptions.includeCampaignDetails &&
      !selectedOptions.includeAIAnalysis
    ) {
      return; // At least one must be selected
    }
    onExport(selectedOptions);
    onClose();
  };

  const toggleOption = (option: keyof ExportOptions) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    Export Options
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-indigo-100 text-sm mt-1">
                  Select what to include in your export
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Campaign Count Info */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-700/30">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {campaignCount}
                    </span>{" "}
                    campaign{campaignCount !== 1 ? "s" : ""} ready to export
                  </p>
                </div>

                {/* Report Type Selection */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Report Types
                  </p>

                  {/* Option 1: Campaign Performance Details */}
                  <button
                    onClick={() => toggleOption("includeCampaignDetails")}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedOptions.includeCampaignDetails
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}>
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedOptions.includeCampaignDetails
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}>
                        {selectedOptions.includeCampaignDetails && (
                          <CheckIcon
                            className="h-3 w-3 text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <DocumentChartBarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Campaign Performance Details
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Complete campaign data with metrics, conversions, and
                          spend breakdown
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Option 2: AI Performance Analysis */}
                  <button
                    onClick={() => toggleOption("includeAIAnalysis")}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedOptions.includeAIAnalysis
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}>
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedOptions.includeAIAnalysis
                            ? "bg-purple-600 border-purple-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}>
                        {selectedOptions.includeAIAnalysis && (
                          <CheckIcon
                            className="h-3 w-3 text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <SparklesIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            AI Performance Analysis
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          ChatGPT-powered insights, recommendations, and
                          performance ratings
                        </p>
                        {selectedOptions.includeAIAnalysis && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400">
                            <SparklesIcon className="h-3 w-3" />
                            <span>AI analysis will be generated</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Warning if none selected */}
                {!selectedOptions.includeCampaignDetails &&
                  !selectedOptions.includeAIAnalysis && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/30 rounded-lg p-3">
                      <p className="text-xs text-yellow-800 dark:text-yellow-400">
                        ⚠️ Please select at least one report type to export
                      </p>
                    </div>
                  )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex items-center justify-between space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={
                    !selectedOptions.includeCampaignDetails &&
                    !selectedOptions.includeAIAnalysis
                  }
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    !selectedOptions.includeCampaignDetails &&
                    !selectedOptions.includeAIAnalysis
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                  }`}>
                  🚀 Generate Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default ExportOptionsModal;
