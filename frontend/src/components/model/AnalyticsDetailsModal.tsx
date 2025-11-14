/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Portal from "../ui/Portal";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchCampaignInsights } from "../../../store/features/facebookAdsSlice";

interface AnalyticsDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
}

const AnalyticsDetailsModal: React.FC<AnalyticsDetailsModalProps> = ({
  isOpen,
  onClose,
  campaign,
}) => {
  const dispatch = useAppDispatch();
  const { campaignInsights, loading } = useAppSelector(
    (state) => state.facebookAds
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  console.log(campaign, "=>>>>>>>>>>>>>>>>>>>>>>>>");

  // Helper formatting
  const formatCurrency = (value: number | string) => {
    const num =
      typeof value === "string" ? parseFloat(value) : Number(value || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPerformanceColor = (aiVerdict: string) => {
    if (!aiVerdict || aiVerdict === "N/A") return "bg-gray-100 text-gray-800";
    if (aiVerdict.includes("Excellent")) return "bg-green-100 text-green-800";
    if (aiVerdict.includes("Good")) return "bg-blue-100 text-blue-800";
    if (aiVerdict.includes("Average")) return "bg-yellow-100 text-yellow-800";
    if (aiVerdict.includes("Needs") || aiVerdict.includes("Poor"))
      return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-800";
  };

  // Derived values
  const performanceCategory =
    campaign?.ai_verdict || campaign?.verdict?.category || "Not Analyzed";
  const performanceColor = getPerformanceColor(performanceCategory);

  // Stats cards
  const statsCards = useMemo(() => {
    const totals = campaign?.totals || {
      impressions: campaign?.totalImpressions || 0,
      clicks: campaign?.totalClicks || 0,
      reach: campaign?.totalReach || 0,
      spend: campaign?.totalSpend || campaign?.total_spend || 0,
      ctr: campaign?.avgCTR || campaign?.avgCtr || campaign?.ctr || 0,
      cpc: campaign?.avgCPC || campaign?.cpc || 0,
    };

    return [
      {
        title: "Total Impressions",
        value: (totals.impressions || 0).toLocaleString(),
        icon: EyeIcon,
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
        textColor: "text-blue-600",
      },
      {
        title: "Total Clicks",
        value: (totals.clicks || 0).toLocaleString(),
        icon: CursorArrowRaysIcon,
        color: "from-emerald-500 to-emerald-600",
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-600",
      },
      {
        title: "Total Reach",
        value: (totals.reach || 0).toLocaleString(),
        icon: UsersIcon,
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50",
        textColor: "text-purple-600",
      },
      {
        title: "Total Spend",
        value: formatCurrency(totals.spend || 0),
        icon: CurrencyRupeeIcon,
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50",
        textColor: "text-orange-600",
      },
      {
        title: "Average CTR",
        value: `${(totals.ctr || 0).toFixed(2)}%`,
        icon: ArrowTrendingUpIcon,
        color: "from-indigo-500 to-indigo-600",
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-600",
      },
      {
        title: "Average CPC",
        value: formatCurrency(totals.cpc || 0),
        icon: CurrencyRupeeIcon,
        color: "from-pink-500 to-pink-600",
        bgColor: "bg-pink-50",
        textColor: "text-pink-600",
      },
    ];
  }, [campaign]);

  // Action stats from campaign.actions or campaign.totals.actions
  const actionStats = useMemo(() => {
    const actions =
      campaign?.actions || (campaign?.totals && campaign?.totals.actions) || {};

    return [
      {
        title: "Add to Cart",
        value: actions.add_to_cart || campaign?.totalAddToCart || 0,
        icon: ShoppingCartIcon,
        color: "bg-emerald-500",
      },
      {
        title: "Purchases",
        value: actions.purchase || campaign?.totalPurchases || 0,
        icon: BanknotesIcon,
        color: "bg-green-500",
      },
      {
        title: "Initiate Checkout",
        value:
          actions.initiate_checkout || campaign?.totalInitiateCheckout || 0,
        icon: ClockIcon,
        color: "bg-blue-500",
      },
      {
        title: "Add Payment Info",
        value: actions.add_payment_info || campaign?.totalAddPaymentInfo || 0,
        icon: CreditCardIcon,
        color: "bg-purple-500",
      },
    ];
  }, [campaign]);

  // Use API data from Redux store
  const processedData = useMemo(() => {
    if (!campaignInsights) {
      return { totals: null, insights: [] };
    }

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

    if (Array.isArray(campaignInsights)) {
      return {
        totals: null,
        insights: campaignInsights,
      };
    }

    return { totals: null, insights: [] };
  }, [campaignInsights]);

  const insights: any[] = processedData.insights;

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
  }, [campaign?.id]);

  // Fetch campaign insights when modal opens
  useEffect(() => {
    if (isOpen && campaign?.id) {
      dispatch(fetchCampaignInsights(campaign.id));
    }
  }, [isOpen, campaign?.id, dispatch]);

  // Filter + Pagination
  const filtered = insights.filter((ins: any) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      (ins.adset_name || "").toLowerCase().includes(s) ||
      (ins.ad_name || "").toLowerCase().includes(s) ||
      (ins.objective || "").toLowerCase().includes(s)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginated = filtered.slice(startIndex, endIndex);

  if (!isOpen || !campaign) return null;

  // Helpers to read action counts & values inside each insight
  const getActionType = (insight: any, actionType: string) => {
    if (!insight.actions) return 0;
    const a = insight.actions.find((x: any) => x.action_type === actionType);
    return a ? parseInt(a.value || 0) : 0;
  };

  const getActionValue = (insight: any, actionType: string) => {
    if (!insight.action_values) return 0;
    const a = insight.action_values.find(
      (x: any) => x.action_type === actionType
    );
    return a ? parseFloat(a.value || 0) : 0;
  };

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => onClose()}>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-6 py-5 flex-shrink-0 relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]"></div>
              </div>

              <div className="relative z-10 flex items-center justify-between">
                {/* Left: Campaign Info */}
                <div className="flex items-center space-x-4">
                  {/* Icon with animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                    <ChartBarIcon className="h-7 w-7 text-white" />
                  </motion.div>

                  {/* Campaign Details */}
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1 flex items-center space-x-2">
                      <span className="max-w-md truncate">{campaign.name}</span>
                      {/* Copy ID button */}
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(campaign.id)
                        }
                        className="p-1 hover:bg-white/20 rounded transition-colors group"
                        title="Copy Campaign ID">
                        <svg
                          className="w-4 h-4 text-white/70 group-hover:text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </h2>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-indigo-100">
                      {/* ID Badge */}
                      <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/20">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs font-medium">
                          {campaign.id}
                        </span>
                      </div>

                      {/* Objective Badge */}
                      <div className="flex items-center space-x-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/20">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                        <span className="text-xs font-medium">
                          {(campaign.objective || "").replace("OUTCOME_", "")}
                        </span>
                      </div>

                      {/* Performance Badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-lg ${performanceColor} backdrop-blur-sm border border-white/30`}>
                          <span
                            className={`w-2 h-2 rounded-full mr-1.5 ${
                              performanceCategory.includes("Excellent")
                                ? "bg-green-500"
                                : performanceCategory.includes("Good")
                                ? "bg-blue-500"
                                : performanceCategory.includes("Average")
                                ? "bg-yellow-500"
                                : performanceCategory.includes("Poor")
                                ? "bg-red-500"
                                : "bg-gray-500"
                            } animate-pulse`}></span>
                          {performanceCategory}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* 🔥 RIGHT: CLOSE BUTTON */}
                <motion.button
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  onClick={onClose}
                  className="group w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 hover:border-white/40 transition-all shadow-lg hover:shadow-xl"
                  title="Close (ESC)">
                  <svg
                    className="w-5 h-5 text-white/80 group-hover:text-white group-hover:rotate-90 transition-all duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Top metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl p-5 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.5),transparent)]"></div>
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Status</span>
                      </h4>
                      <div
                        className={`w-2.5 h-2.5 rounded-full shadow-lg ${
                          campaign.status === "ACTIVE"
                            ? "bg-green-500 animate-pulse shadow-green-500/50"
                            : campaign.status === "PAUSED"
                            ? "bg-yellow-500 shadow-yellow-500/50"
                            : "bg-gray-500 shadow-gray-500/50"
                        }`}></div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {campaign.status}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {campaign.status === "ACTIVE"
                        ? "🟢 Live now"
                        : campaign.status === "PAUSED"
                        ? "⏸️ Currently paused"
                        : "📦 Not active"}
                    </p>
                  </div>
                </motion.div>

                {/* Start Date Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-xl p-5 border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.5),transparent)]"></div>
                  </div>

                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Start Date</span>
                      </h4>
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                          📅
                        </span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {formatDate(campaign.start_time)}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      Campaign launch date
                    </p>
                  </div>
                </motion.div>

                {/* Total Spend Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.5),transparent)]"></div>
                  </div>

                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Total Spend</span>
                      </h4>
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          💰
                        </span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {formatCurrency(
                        campaign.totalSpend || campaign.total_spend
                      )}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Total ad investment
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Stats Cards */}
              <div>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    <span>Campaign Performance</span>
                  </h3>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                    {statsCards.length} metrics
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statsCards.map((card, idx) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        delay: idx * 0.05,
                        duration: 0.3,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                      {/* Shine effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent pointer-events-none"></div>

                      <div className="relative z-10">
                        {/* Icon and Value Row */}
                        <div className="flex items-start justify-between mb-3">
                          {/* Icon */}
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all`}>
                            <card.icon className="h-6 w-6 text-white" />
                          </div>

                          {/* Value */}
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {card.value}
                            </p>
                          </div>
                        </div>

                        {/* Title */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            {card.title}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              {(campaign.ai_analysis || campaign.ai_recommendations) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/50 dark:via-purple-950/50 dark:to-pink-950/50 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.5),transparent)]"></div>
                  </div>

                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-indigo-900 dark:text-indigo-100 flex items-center space-x-2">
                            <span>AI Performance Analysis</span>
                          </h4>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                            Smart insights from machine learning
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Analysis Content */}
                    {campaign.ai_analysis && (
                      <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 mb-4 border border-indigo-200/50 dark:border-indigo-800/50">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                              {campaign.ai_analysis}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {campaign.ai_recommendations && (
                      <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/50">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-purple-600 dark:text-purple-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                          </div>
                          <h5 className="text-sm font-bold text-purple-900 dark:text-purple-100">
                            💡 Smart Recommendations
                          </h5>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 ml-8">
                          {campaign.ai_recommendations}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Funnel / Efficiency - Enhanced with Dark Mode */}
              {campaign.funnelEfficiency && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Funnel Efficiency Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.5),transparent)]"></div>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-green-700 dark:text-green-300 uppercase tracking-wider flex items-center space-x-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                          <span>Funnel Efficiency</span>
                        </h4>
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                          <span className="text-lg">📈</span>
                        </div>
                      </div>

                      {/* Main Value */}
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {campaign.funnelEfficiency}
                      </p>

                      {/* Conversion Rate */}
                      <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg p-3 border border-green-200/50 dark:border-green-800/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                            Conversion Rate
                          </span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {(campaign.conversionRate * 100 || 0).toFixed(2)}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-2 w-full bg-green-200 dark:bg-green-900/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                campaign.conversionRate * 100 || 0,
                                100
                              )}%`,
                            }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Rates Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.5),transparent)]"></div>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center space-x-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          <span>Conversion Rates</span>
                        </h4>
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                          <span className="text-lg">📊</span>
                        </div>
                      </div>

                      {/* Grid of Rates */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Add to Cart Rate */}
                        <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-blue-600 dark:text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                              Add to Cart
                            </div>
                          </div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {(campaign.addToCartRate * 100 || 0).toFixed(2)}%
                          </div>
                        </div>

                        {/* Checkout Rate */}
                        <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/50 rounded flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-purple-600 dark:text-purple-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                              Checkout
                            </div>
                          </div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {(campaign.checkoutRate || 0).toFixed(2)}%
                          </div>
                        </div>

                        {/* Purchase Rate */}
                        <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-green-600 dark:text-green-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                              Purchase
                            </div>
                          </div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {(campaign.purchaseRate || 0).toFixed(2)}%
                          </div>
                        </div>

                        {/* Avg ROAS */}
                        <div className="bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/50 rounded flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-yellow-600 dark:text-yellow-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                              Avg ROAS
                            </div>
                          </div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {campaign.avgROAS || campaign.roas || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Action Stats */}
              {actionStats.length > 0 && (
                <div>
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-green-500/30">
                        <BanknotesIcon className="h-5 w-5 text-white" />
                      </div>
                      <span>Conversion Actions</span>
                    </h3>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                      {actionStats.length} actions
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {actionStats.map((stat, idx) => (
                      <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          delay: idx * 0.05,
                          duration: 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                        {/* Shine effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent pointer-events-none"></div>

                        <div className="relative z-10">
                          {/* Icon and Title */}
                          <div className="flex items-center space-x-3 mb-4">
                            <div
                              className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all`}>
                              <stat.icon className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex-1">
                              {stat.title}
                            </p>
                          </div>

                          {/* Value */}
                          <div className="flex items-end justify-between">
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search + Table */}
              <div>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <TableCellsIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        Detailed Breakdown
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ad set and ad level insights
                      </p>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[280px]">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <input
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search ad set or ad name..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                {/* Table Container */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    {/* Table Head */}
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                      <tr>
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          S.No
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Ad Set
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Ad Name
                        </th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Impressions
                        </th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Clicks
                        </th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Reach
                        </th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          CTR
                        </th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Spend
                        </th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          CPC
                        </th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          CPP
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Objective
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Buying Type
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Action
                        </th>

                        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          End Date
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {paginated.length > 0 ? (
                        paginated.map((insight: any, idx: number) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                              {startIndex + idx + 1}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {insight.adset_name}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {insight.ad_name}
                            </td>
                            <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                              {parseInt(
                                insight.impressions || 0
                              ).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                              {parseInt(insight.clicks || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                              {parseInt(insight.reach || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                              {parseFloat(insight.ctr || 0).toFixed(2)}%
                            </td>
                            <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                              {formatCurrency(parseFloat(insight.spend || 0))}
                            </td>
                            <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                              {formatCurrency(parseFloat(insight.cpc || 0))}
                            </td>
                            <td className="px-4 py-4 text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                              {insight.cpp
                                ? formatCurrency(parseFloat(insight.cpp))
                                : "N/A"}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {(insight.objective || "").replace(
                                "OUTCOME_",
                                ""
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {insight.buying_type || "N/A"}
                            </td>
                            <td className="px-4 py-4">
                              <div className="grid grid-cols-2 gap-2 text-xs min-w-[160px]">
                                <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Cart:
                                  </span>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {getActionType(insight, "add_to_cart")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Purchase:
                                  </span>
                                  <span className="font-semibold text-green-600 dark:text-green-400">
                                    {getActionType(insight, "purchase")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/30 px-2 py-1 rounded">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Lead:
                                  </span>
                                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                                    {getActionType(insight, "lead")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    Checkout:
                                  </span>
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {getActionType(
                                      insight,
                                      "initiate_checkout"
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {formatDate(insight.date_start)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                              {formatDate(insight.date_stop)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={16} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <TableCellsIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                              </div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {searchTerm
                                  ? "No results found"
                                  : "No data available"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {searchTerm
                                  ? "Try adjusting your search criteria"
                                  : "No detailed insights available for this campaign"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>{" "}
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-5 flex items-center justify-between flex-wrap gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Showing{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {startIndex + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {endIndex}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {filtered.length}
                      </span>{" "}
                      results
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="First page">
                        <ChevronDoubleLeftIcon className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Previous page">
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>

                      <span className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Next page">
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>

                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Last page">
                        <ChevronDoubleRightIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg">
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
};

export default AnalyticsDetailsModal;
