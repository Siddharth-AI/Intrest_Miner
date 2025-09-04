"use client";

// src/components/model/AnalyticsModal.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setShowAnalyticsModal } from "../../../store/features/facebookAdsSlice";
import {
  TrendingUp,
  Zap,
  BarChart,
  CheckCircle,
  AlertTriangle,
  X,
  Target,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import Portal from "@/components/ui/Portal";

const AnalyticsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showAnalyticsModal, analysis } = useAppSelector(
    (state) => state.facebookAds
  );

  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Handle body scroll lock when modal is open/closed
  React.useEffect(() => {
    if (showAnalyticsModal) {
      // Get scrollbar width to prevent layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Prevent body scroll and hide scrollbar
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // Also prevent scroll on html element for better compatibility
      document.documentElement.style.overflow = "hidden";
    } else {
      // Restore body scroll
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.documentElement.style.overflow = "";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.documentElement.style.overflow = "";
    };
  }, [showAnalyticsModal]);

  // Theme detection
  React.useEffect(() => {
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

  const closeModal = () => {
    dispatch(setShowAnalyticsModal(false));
  };

  // Handle Escape key to close modal
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showAnalyticsModal) {
        closeModal();
      }
    };

    if (showAnalyticsModal) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showAnalyticsModal]);

  // Early return if modal should not be shown or no data
  if (!showAnalyticsModal || !analysis || !analysis.campaignAnalyses.length) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const performanceData = [
    {
      name: "Top Performers",
      value: analysis.campaignAnalyses.filter(
        (c) => c.status === "Top Performer"
      ).length,
      color: "#22C55E",
    },
    {
      name: "Stable",
      value: analysis.campaignAnalyses.filter((c) => c.status === "Stable")
        .length,
      color: "#6B7280",
    },
    {
      name: "Underperformers",
      value: analysis.campaignAnalyses.filter(
        (c) => c.status === "Underperformer"
      ).length,
      color: "#EF4444",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "top performer": {
        className:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      stable: {
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
        icon: <Activity className="h-3 w-3 mr-1" />,
      },
      underperformer: {
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
      },
    };

    const config =
      statusConfig[status.toLowerCase() as keyof typeof statusConfig] ||
      statusConfig.stable;

    return (
      <Badge className={config.className}>
        {config.icon}
        {status}
      </Badge>
    );
  };

  return (
    <Portal>
      <AnimatePresence>
        {showAnalyticsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
            style={{
              pointerEvents: "auto",
              zIndex: 10000,
            }}
            onClick={closeModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col"
              onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Campaign Performance Analysis
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      An overview of your campaign performance with future
                      predictions
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full w-10 h-10 flex-shrink-0">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                <div className="space-y-6">
                  {/* Performance Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          Top Performers
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {performanceData.find(
                          (d) => d.name === "Top Performers"
                        )?.value || 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="h-5 w-5 text-gray-600" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Stable Campaigns
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {performanceData.find((d) => d.name === "Stable")
                          ?.value || 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                          Underperformers
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {performanceData.find(
                          (d) => d.name === "Underperformers"
                        )?.value || 0}
                      </p>
                    </div>
                  </div>

                  {/* Campaign Analysis Table */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        Campaign Breakdown
                      </h3>
                      <Badge variant="secondary">
                        {analysis.campaignAnalyses.length} campaigns
                      </Badge>
                    </div>

                    <div className="overflow-x-auto bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-200 dark:border-gray-700">
                            <TableHead className="font-semibold">
                              Campaign Name
                            </TableHead>
                            <TableHead className="font-semibold">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold">
                              Recommendation
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysis.campaignAnalyses.map((campaign, index) => (
                            <motion.tr
                              key={campaign.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="border-gray-200 dark:border-gray-700">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                    <Target className="h-3 w-3 text-purple-600" />
                                  </div>
                                  <span className="truncate max-w-[200px]">
                                    {campaign.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(campaign.status)}
                              </TableCell>
                              <TableCell className="text-gray-600 dark:text-gray-400 max-w-[300px]">
                                {campaign.recommendation}
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Performance Distribution and Future Predictions */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Performance Distribution Chart */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}>
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                          <BarChart className="h-5 w-5 text-purple-500" />
                          Performance Distribution
                        </h4>
                        <div style={{ width: "100%", height: 250 }}>
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie
                                data={performanceData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                label={({ value, percent }) =>
                                  value > 0
                                    ? `${(percent * 100).toFixed(0)}%`
                                    : ""
                                }>
                                {performanceData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: isDarkMode
                                    ? "#374151"
                                    : "#ffffff",
                                  border: isDarkMode
                                    ? "1px solid #4B5563"
                                    : "1px solid #E5E7EB",
                                  borderRadius: "12px",
                                  boxShadow:
                                    "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                }}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </motion.div>

                    {/* Future Predictions */}
                    {analysis.futurePrediction && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                          <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Future Predictions
                          </h4>
                          <div className="space-y-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
                              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                                Predicted Spend
                              </p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(
                                  analysis.futurePrediction.predictedSpend
                                )}
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
                              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                                Predicted Clicks
                              </p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {analysis.futurePrediction.predictedClicks.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-4">
                              <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                                Recommendation
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {analysis.futurePrediction.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default AnalyticsModal;
