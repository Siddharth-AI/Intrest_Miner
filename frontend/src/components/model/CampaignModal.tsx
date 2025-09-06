/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/model/CampaignModal.tsx
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  PlayIcon,
  PauseIcon,
  ArchiveBoxIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  BanknotesIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setShowModal,
  fetchCampaignInsights,
} from "../../../store/features/facebookAdsSlice";
import Portal from "../ui/Portal";

const CampaignModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("spend");
  const [sortOrder, setSortOrder] = useState("desc");

  const { showModal, selectedCampaignForModal, campaignInsights, loading } =
    useAppSelector((state) => state.facebookAds);

  // Theme detection
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Fetch campaign insights when modal opens
  useEffect(() => {
    if (showModal && selectedCampaignForModal?.id) {
      dispatch(fetchCampaignInsights(selectedCampaignForModal.id));
    }
  }, [showModal, selectedCampaignForModal?.id, dispatch]);

  const handleClose = () => {
    dispatch(setShowModal(false));
    setSearchTerm("");
    setSortBy("spend");
    setSortOrder("desc");
  };

  // Handle escape key and prevent event bubbling
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showModal) {
        event.preventDefault();
        event.stopPropagation();
        handleClose();
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape, true);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape, true);
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return <PlayIcon className="h-4 w-4 text-emerald-600" />;
      case "PAUSED":
        return <PauseIcon className="h-4 w-4 text-yellow-600" />;
      case "ARCHIVED":
        return <ArchiveBoxIcon className="h-4 w-4 text-gray-600" />;
      default:
        return <XMarkIcon className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    }
  };

  // Process campaign insights data - FIXED TYPE ISSUES
  const processedData = useMemo(() => {
    // Check if campaignInsights is the full response object or just array
    if (!campaignInsights) {
      return { totals: null, insights: [] };
    }

    // If campaignInsights is the full response object (with totals and insights properties)
    if (
      typeof campaignInsights === "object" &&
      "totals" in campaignInsights &&
      "insights" in campaignInsights
    ) {
      return {
        totals: campaignInsights.totals as any,
        insights: (campaignInsights as any).insights || [],
      };
    }

    // If campaignInsights is just an array (fallback)
    if (Array.isArray(campaignInsights)) {
      return {
        totals: null,
        insights: campaignInsights,
      };
    }

    return { totals: null, insights: [] };
  }, [campaignInsights]);

  // Filter and sort insights
  const filteredInsights = useMemo(() => {
    if (!processedData.insights || !Array.isArray(processedData.insights))
      return [];

    const filtered = processedData.insights.filter(
      (insight: any) =>
        insight.adset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.ad_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort insights
    filtered.sort((a: any, b: any) => {
      const aVal = parseFloat(a[sortBy] || "0");
      const bVal = parseFloat(b[sortBy] || "0");
      return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }, [processedData.insights, searchTerm, sortBy, sortOrder]);

  // Extract action values for specific actions
  const getActionValue = (insight: any, actionType: string) => {
    if (!insight.action_values) return "₹0";
    const action = insight.action_values.find(
      (a: any) => a.action_type === actionType
    );
    return action ? formatCurrency(parseFloat(action.value)) : "₹0";
  };

  // Stats cards for campaign totals
  const statsCards = useMemo(() => {
    if (!processedData.totals) return [];

    const totals = processedData.totals as any;

    return [
      {
        title: "Total Impressions",
        value: totals.impressions?.toLocaleString() || "0",
        icon: EyeIcon,
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400",
      },
      {
        title: "Total Clicks",
        value: totals.clicks?.toLocaleString() || "0",
        icon: CursorArrowRaysIcon,
        color: "from-emerald-500 to-emerald-600",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        textColor: "text-emerald-600 dark:text-emerald-400",
      },
      {
        title: "Total Reach",
        value: totals.reach?.toLocaleString() || "0",
        icon: UsersIcon,
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        textColor: "text-purple-600 dark:text-purple-400",
      },
      {
        title: "Total Spend",
        value: formatCurrency(totals.spend || 0),
        icon: CurrencyRupeeIcon,
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        textColor: "text-orange-600 dark:text-orange-400",
      },
      {
        title: "Average CTR",
        value: `${(totals.ctr || 0).toFixed(2)}%`,
        icon: ArrowTrendingUpIcon,
        color: "from-indigo-500 to-indigo-600",
        bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
        textColor: "text-indigo-600 dark:text-indigo-400",
      },
      {
        title: "Average CPC",
        value: formatCurrency(totals.cpc || 0),
        icon: CurrencyRupeeIcon,
        color: "from-pink-500 to-pink-600",
        bgColor: "bg-pink-50 dark:bg-pink-900/20",
        textColor: "text-pink-600 dark:text-pink-400",
      },
    ];
  }, [processedData.totals]);

  // Action stats cards
  const actionStats = useMemo(() => {
    const totals = processedData.totals as any;
    if (!totals?.actions) return [];

    return [
      {
        title: "Add to Cart",
        value: totals.actions.add_to_cart || 0,
        icon: ShoppingCartIcon,
        color: "bg-emerald-500",
      },
      {
        title: "Purchases",
        value: totals.actions.purchase || 0,
        icon: BanknotesIcon,
        color: "bg-green-500",
      },
      {
        title: "Initiate Checkout",
        value: totals.actions.initiate_checkout || 0,
        icon: ClockIcon,
        color: "bg-blue-500",
      },
      {
        title: "Add Payment Info",
        value: totals.actions.add_payment_info || 0,
        icon: CreditCardIcon,
        color: "bg-purple-500",
      },
    ];
  }, [processedData.totals]);

  if (!showModal) return null;

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}>
            {/* Header - FIXED */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedCampaignForModal?.name || "Campaign Details"}
                    </h2>
                    <div className="flex items-center space-x-4 text-blue-100 text-sm">
                      <span>ID: {selectedCampaignForModal?.id}</span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(selectedCampaignForModal?.status || "")}
                        <span>{selectedCampaignForModal?.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClose();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content - FIXED SCROLL */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Loading campaign insights...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-8">
                  {/* Campaign Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Objective
                      </h4>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedCampaignForModal?.objective?.replace(
                          "OUTCOME_",
                          ""
                        ) || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Status
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            selectedCampaignForModal?.status || ""
                          )}`}>
                          {selectedCampaignForModal?.status}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Daily Budget
                      </h4>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedCampaignForModal?.daily_budget
                          ? formatCurrency(
                              Number.parseInt(
                                selectedCampaignForModal.daily_budget
                              ) / 100
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  {statsCards.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <ChartBarIcon className="mr-2 text-blue-600 h-5 w-5" />
                        Campaign Performance
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {statsCards.map((card, index) => (
                          <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`${card.bgColor} flex items-center justify-between backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6`}>
                            <div className="flex items-center justify-between gap-3">
                              <div
                                className={`w-7 h-7 bg-gradient-to-r ${card.color} flex items-center justify-center rounded-lg`}>
                                <card.icon className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-lg text-gray-600 dark:text-gray-400">
                                {card.title}
                              </p>
                            </div>

                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {card.value}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Stats */}
                  {actionStats.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <BanknotesIcon className="mr-2 text-green-600 h-5 w-5" />
                        Conversion Actions
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {actionStats.map((stat, index) => (
                          <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center flex items-center justify-between">
                            <div className="flex items-center justify-between gap-3">
                              <div
                                className={`w-7 h-7 ${stat.color} flex items-center justify-center rounded-lg`}>
                                <stat.icon className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-lg text-gray-600 dark:text-gray-400">
                                {stat.title}
                              </p>
                            </div>

                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {stat.value}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ad Insights Table */}
                  <div>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <TableCellsIcon className="mr-2 text-purple-600 h-5 w-5" />
                          Ad Set Performance
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Detailed breakdown by ad set and individual ads
                        </p>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        {/* Search */}
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search ad sets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
                          />
                        </div>

                        {/* Sort */}
                        <select
                          value={`${sortBy}-${sortOrder}`}
                          onChange={(e) => {
                            const [field, order] = e.target.value.split("-");
                            setSortBy(field);
                            setSortOrder(order);
                          }}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="spend-desc">
                            Spend (High to Low)
                          </option>
                          <option value="spend-asc">Spend (Low to High)</option>
                          <option value="impressions-desc">
                            Impressions (High to Low)
                          </option>
                          <option value="clicks-desc">
                            Clicks (High to Low)
                          </option>
                          <option value="ctr-desc">CTR (High to Low)</option>
                        </select>
                      </div>
                    </div>

                    {filteredInsights.length > 0 ? (
                      <div className="overflow-x-scroll bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                            <tr>
                              <th className="min-w-[30px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                S.No
                              </th>
                              <th className="min-w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Ad Set
                              </th>
                              <th className="min-w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Ad Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Impressions
                              </th>
                              <th className="min-w-[90px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Clicks
                              </th>
                              <th className="min-w-[90px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Reach
                              </th>
                              <th className="min-w-[90px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                CTR
                              </th>
                              <th className="min-w-[90px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Spend
                              </th>
                              <th className="min-w-[90px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                CPC
                              </th>
                              <th className="min-w-[90px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                CPP
                              </th>
                              <th className="min-w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Objective
                              </th>
                              <th className="min-w-[100px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Buying Type
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Action Values
                              </th>
                              <th className="min-w-[150px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Start Date
                              </th>
                              <th className="min-w-[150px] px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                End Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredInsights.map(
                              (insight: any, index: number) => (
                                <motion.tr
                                  key={`${insight.adset_id}-${insight.ad_id}-${index}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                  {/* Sno */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {index + 1}
                                    </div>
                                  </td>
                                  {/* Ad Set */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {insight.adset_name}
                                    </div>
                                  </td>

                                  {/* Ad Name */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      {insight.ad_name}
                                    </div>
                                  </td>

                                  {/* Impressions */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {parseInt(
                                        insight.impressions
                                      ).toLocaleString()}
                                    </div>
                                  </td>

                                  {/* Clicks */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {parseInt(
                                        insight.clicks
                                      ).toLocaleString()}
                                    </div>
                                  </td>

                                  {/* Reach */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {parseInt(insight.reach).toLocaleString()}
                                    </div>
                                  </td>

                                  {/* CTR */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                      {parseFloat(insight.ctr).toFixed(2)}%
                                    </div>
                                  </td>

                                  {/* Spend */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {formatCurrency(
                                        parseFloat(insight.spend)
                                      )}
                                    </div>
                                  </td>

                                  {/* CPC */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      {formatCurrency(parseFloat(insight.cpc))}
                                    </div>
                                  </td>

                                  {/* CPP */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      {insight.cpp
                                        ? formatCurrency(
                                            parseFloat(insight.cpp)
                                          )
                                        : "N/A"}
                                    </div>
                                  </td>

                                  {/* Objective */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      {insight.objective?.replace(
                                        "OUTCOME_",
                                        ""
                                      ) || "N/A"}
                                    </div>
                                  </td>

                                  {/* Buying Type */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      {insight.buying_type || "N/A"}
                                    </div>
                                  </td>

                                  {/* Action Values */}
                                  <td className="px-4 py-4">
                                    <div className="grid grid-cols-2 gap-2 text-xs min-w-[200px]">
                                      <div className="flex gap-2">
                                        <span className="text-gray-500 block">
                                          Add to Cart:
                                        </span>
                                        <span className="font-medium text-emerald-600">
                                          {getActionValue(
                                            insight,
                                            "add_to_cart"
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        <span className="text-gray-500 block">
                                          Purchase:
                                        </span>
                                        <span className="font-medium text-green-600">
                                          {getActionValue(insight, "purchase")}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        <span className="text-gray-500 block">
                                          Checkout:
                                        </span>
                                        <span className="font-medium text-blue-600">
                                          {getActionValue(
                                            insight,
                                            "initiate_checkout"
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        <span className="text-gray-500 block">
                                          Payment:
                                        </span>
                                        <span className="font-medium text-purple-600">
                                          {getActionValue(
                                            insight,
                                            "add_payment_info"
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  {/* Start Date */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      {insight.date_start
                                        ? new Date(
                                            insight.date_start
                                          ).toLocaleDateString("en-IN")
                                        : "N/A"}
                                    </div>
                                  </td>

                                  {/* End Date */}
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      {insight.date_stop
                                        ? new Date(
                                            insight.date_stop
                                          ).toLocaleDateString("en-IN")
                                        : "Ongoing"}
                                    </div>
                                  </td>
                                </motion.tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Ad Insights Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {searchTerm
                            ? "No ad sets match your search criteria."
                            : "No detailed insights available for this campaign."}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Clear Search
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};

export default CampaignModal;
