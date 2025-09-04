"use client";

// components/modals/CampaignModal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Target,
  Play,
  DollarSign,
  Users,
  BarChart3,
  RefreshCw,
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setShowModal,
  fetchCampaignInsights,
} from "../../../store/features/facebookAdsSlice";
import Portal from "@/components/ui/Portal"; // Import the Portal component

// Chart colors
const CHART_COLORS = {
  tertiary: "#F59E0B",
  secondary: "#10B981",
  purple: "#8B5CF6",
};

const CampaignModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    showModal,
    selectedCampaignForModal,
    campaignInsights,
    dateFilter,
    customDateRange,
    loading,
  } = useAppSelector((state) => state.facebookAds);

  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Handle body scroll lock when modal is open/closed
  React.useEffect(() => {
    if (showModal) {
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
  }, [showModal]);

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
    dispatch(setShowModal(false));
  };

  // Handle Escape key to close modal
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showModal]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        className:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: <Play className="h-3 w-3 mr-1" />,
      },
      paused: {
        className:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: <Play className="h-3 w-3 mr-1" />,
      },
      deleted: {
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
        icon: <X className="h-3 w-3 mr-1" />,
      },
    };

    const config =
      statusConfig[status.toLowerCase() as keyof typeof statusConfig] ||
      statusConfig.paused;

    return (
      <Badge className={config.className}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return new Intl.NumberFormat("en-IN").format(num);
  };

  if (!selectedCampaignForModal) return null;

  return (
    <Portal>
      <AnimatePresence>
        {showModal && (
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
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white line-clamp-1">
                      {selectedCampaignForModal.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      Detailed insights and performance metrics
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
                  {/* Campaign Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          Objective
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCampaignForModal.objective?.replace(
                          "OUTCOME_",
                          ""
                        ) || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3 mb-2">
                        <Play className="h-5 w-5 text-emerald-600" />
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          Status
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(selectedCampaignForModal.status)}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="h-5 w-5 text-amber-600" />
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          Daily Budget
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCampaignForModal.daily_budget
                          ? formatCurrency(
                              Number.parseInt(
                                selectedCampaignForModal.daily_budget
                              ) / 100
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Ad Sets Performance */}
                  {campaignInsights.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                          Ad Sets Performance
                        </h3>
                        <Badge variant="secondary">
                          {campaignInsights.length} ad sets
                        </Badge>
                      </div>

                      <div className="overflow-x-auto bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-200 dark:border-gray-700">
                              <TableHead className="font-semibold">
                                Ad Set
                              </TableHead>
                              <TableHead className="font-semibold">
                                Ad Name
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                Impressions
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                Clicks
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                Spend
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                CTR
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                CPC
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                CPP
                              </TableHead>
                              <TableHead className="font-semibold text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {campaignInsights.map((insight, index) => (
                              <TableRow
                                key={index}
                                className="border-gray-200 dark:border-gray-700">
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                      <Users className="h-3 w-3 text-purple-600" />
                                    </div>
                                    <span className="truncate max-w-[150px]">
                                      {insight.adset_name}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="truncate max-w-[150px]">
                                  {insight.ad_name}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatNumber(
                                    Number.parseInt(insight.impressions || "0")
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatNumber(
                                    Number.parseInt(insight.clicks || "0")
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                                  {formatCurrency(
                                    Number.parseFloat(insight.spend || "0")
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div
                                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                      Number.parseFloat(insight.ctr || "0") > 1
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    }`}>
                                    {Number.parseFloat(insight.ctr).toFixed(2)}%
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(
                                    Number.parseFloat(insight.cpc || "0")
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {(() => {
                                    const purchases =
                                      insight.actions?.find(
                                        (action) =>
                                          action.action_type === "purchase"
                                      )?.value || "0";
                                    const spend = Number.parseFloat(
                                      insight.spend || "0"
                                    );
                                    const purchaseCount =
                                      Number.parseInt(purchases);
                                    const cpp =
                                      purchaseCount > 0
                                        ? spend / purchaseCount
                                        : 0;
                                    return formatCurrency(cpp);
                                  })()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="space-y-1 text-xs">
                                    {insight.actions?.map(
                                      (action, actionIndex) => {
                                        if (
                                          [
                                            "add_to_cart",
                                            "purchase",
                                            "initiate_checkout",
                                            "add_payment_info",
                                          ].includes(action.action_type)
                                        ) {
                                          return (
                                            <div
                                              key={actionIndex}
                                              className="flex justify-between items-center">
                                              <span className="text-gray-500 dark:text-gray-400 capitalize">
                                                {action.action_type.replace(
                                                  /_/g,
                                                  " "
                                                )}
                                                :
                                              </span>
                                              <span className="font-medium ml-2">
                                                {Number.parseInt(
                                                  action.value || "0"
                                                ).toLocaleString()}
                                              </span>
                                            </div>
                                          );
                                        }
                                        return null;
                                      }
                                    )}
                                    {(!insight.actions ||
                                      !insight.actions.some((action) =>
                                        [
                                          "add_to_cart",
                                          "purchase",
                                          "initiate_checkout",
                                          "add_payment_info",
                                        ].includes(action.action_type)
                                      )) && (
                                      <span className="text-gray-400 italic">
                                        No actions
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Performance Chart for Campaign */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                          Performance Breakdown
                        </h4>
                        <div className="h-64 sm:h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={campaignInsights.map((insight) => ({
                                name:
                                  insight.adset_name.length > 12
                                    ? insight.adset_name.substring(0, 12) +
                                      "..."
                                    : insight.adset_name,
                                fullName: insight.adset_name,
                                spend: Number.parseFloat(insight.spend || "0"),
                                clicks: Number.parseInt(insight.clicks || "0"),
                                impressions:
                                  Number.parseInt(insight.impressions || "0") /
                                  1000,
                                ctr:
                                  Number.parseFloat(insight.ctr || "0") * 100,
                              }))}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 40,
                              }}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="opacity-30"
                              />
                              <XAxis
                                dataKey="name"
                                className="text-xs"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis className="text-xs" />
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
                                formatter={(value, name) => {
                                  if (name === "Spend (₹)")
                                    return [
                                      formatCurrency(Number(value)),
                                      name,
                                    ];
                                  if (name === "Impressions (K)")
                                    return [
                                      formatNumber(Number(value) * 1000),
                                      "Impressions",
                                    ];
                                  if (name === "CTR (%)")
                                    return [
                                      `${Number(value).toFixed(2)}%`,
                                      "CTR",
                                    ];
                                  return [formatNumber(Number(value)), name];
                                }}
                                labelFormatter={(label) => {
                                  const adSet = campaignInsights.find(
                                    (insight) =>
                                      insight.adset_name.startsWith(
                                        label.replace("...", "")
                                      )
                                  );
                                  return adSet ? adSet.adset_name : label;
                                }}
                              />
                              <Legend />
                              <Bar
                                dataKey="spend"
                                fill={CHART_COLORS.tertiary}
                                name="Spend (₹)"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="clicks"
                                fill={CHART_COLORS.secondary}
                                name="Clicks"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="ctr"
                                fill={CHART_COLORS.purple}
                                name="CTR (%)"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <BarChart3 className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Performance Data
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4 mx-auto">
                        No insights available for this campaign in the selected
                        time period.
                      </p>
                      <Button
                        onClick={() =>
                          dispatch(
                            fetchCampaignInsights(selectedCampaignForModal.id)
                          )
                        }
                        disabled={loading}
                        variant="outline">
                        {loading ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Retry
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default CampaignModal;
