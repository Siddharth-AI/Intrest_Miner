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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {campaign.name}
                    </h2>
                    <div className="flex items-center space-x-4 text-blue-100 text-sm">
                      <span>ID: {campaign.id}</span>
                      <span>
                        {(campaign.objective || "").replace("OUTCOME_", "")}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${performanceColor}`}>
                        {performanceCategory}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Top metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Status
                  </h4>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {campaign.status}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Start Date
                  </h4>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDate(campaign.start_time)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Spend
                  </h4>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(
                      campaign.totalSpend || campaign.total_spend
                    )}
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ChartBarIcon className="mr-2 text-blue-600 h-5 w-5" />
                  Campaign Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {statsCards.map((card, idx) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`${card.bgColor} rounded-xl p-4 border border-gray-200`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center`}>
                            <card.icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-sm text-gray-600">
                            {card.title}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {card.value}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              {(campaign.ai_analysis || campaign.ai_recommendations) && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border-2 border-blue-200">
                  <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                    🤖 AI Performance Analysis
                  </h4>
                  {campaign.ai_analysis && (
                    <p className="text-sm text-gray-700 mb-3">
                      {campaign.ai_analysis}
                    </p>
                  )}
                  {campaign.ai_recommendations && (
                    <>
                      <h5 className="text-sm font-bold text-purple-900 mb-2">
                        💡 Recommendations
                      </h5>
                      <p className="text-sm text-gray-700">
                        {campaign.ai_recommendations}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Funnel / Efficiency */}
              {campaign.funnelEfficiency && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      Funnel Efficiency
                    </h4>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {campaign.funnelEfficiency}
                    </p>
                    <div className="text-sm text-gray-500 mt-2">
                      Conversion Rate:{" "}
                      {(campaign.conversionRate * 100 || 0).toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">
                      Rates
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-gray-500">
                          Add to Cart Rate
                        </div>
                        <div className="font-semibold">
                          {(campaign.addToCartRate * 100 || 0).toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Checkout Rate
                        </div>
                        <div className="font-semibold">
                          {(campaign.checkoutRate || 0).toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Purchase Rate
                        </div>
                        <div className="font-semibold">
                          {(campaign.purchaseRate || 0).toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Avg ROAS</div>
                        <div className="font-semibold">
                          {campaign.avgROAS || campaign.roas || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Stats */}
              {actionStats.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <BanknotesIcon className="mr-2 text-green-600 h-5 w-5" />
                    Conversion Actions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {actionStats.map((stat, idx) => (
                      <div
                        key={stat.title}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                            <stat.icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-sm text-gray-600">
                            {stat.title}
                          </div>
                        </div>
                        <div className="text-lg font-bold">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search + Table */}
              <div>
                <div className="flex items-center justify-between mb-3 gap-4">
                  <div className="flex items-center gap-3">
                    <TableCellsIcon className="h-5 w-5 text-purple-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Detailed breakdown
                      </h4>
                      <p className="text-sm text-gray-500">
                        Ad set and ad level insights
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Search ad set or ad name"
                        className="pl-10 pr-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          S.No
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Ad Set
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Ad Name
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                          Impressions
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                          Clicks
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                          Reach
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                          CTR
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                          Spend
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                          CPC
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                          CPP
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Objective
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Buying Type
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Action
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Action Value
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          Start Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                          End Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginated.length > 0 ? (
                        paginated.map((insight: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-4 text-sm">
                              {startIndex + idx + 1}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              {insight.adset_name}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              {insight.ad_name}
                            </td>
                            <td className="px-3 py-4 text-sm text-right">
                              {parseInt(
                                insight.impressions || 0
                              ).toLocaleString()}
                            </td>
                            <td className="px-3 py-4 text-sm text-right">
                              {parseInt(insight.clicks || 0).toLocaleString()}
                            </td>
                            <td className="px-3 py-4 text-sm text-right">
                              {parseInt(insight.reach || 0).toLocaleString()}
                            </td>
                            <td className="px-3 py-4 text-sm text-right">
                              {parseFloat(insight.ctr || 0).toFixed(2)}%
                            </td>
                            <td className="px-3 py-4 text-sm text-right">
                              {formatCurrency(parseFloat(insight.spend || 0))}
                            </td>
                            <td className="px-3 py-4 text-sm text-right">
                              {formatCurrency(parseFloat(insight.cpc || 0))}
                            </td>
                            <td className="px-3 py-4 text-sm text-right">
                              {insight.cpp
                                ? formatCurrency(parseFloat(insight.cpp))
                                : "N/A"}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              {(insight.objective || "").replace(
                                "OUTCOME_",
                                ""
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              {insight.buying_type || "N/A"}
                            </td>
                            <td className="px-3 py-4">
                              <div className="grid grid-cols-2 gap-1 text-xs min-w-[150px]">
                                <div className="flex gap-1">
                                  <span className="text-gray-500">Cart:</span>
                                  <span className="font-medium text-emerald-600">
                                    {getActionType(insight, "add_to_cart")}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <span className="text-gray-500">Purchase:</span>
                                  <span className="font-medium text-green-600">
                                    {getActionType(insight, "purchase")}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <span className="text-gray-500">Lead:</span>
                                  <span className="font-medium text-purple-600">
                                    {getActionType(insight, "lead")}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <span className="text-gray-500">Checkout:</span>
                                  <span className="font-medium text-blue-600">
                                    {getActionType(insight, "initiate_checkout")}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="grid grid-cols-2 gap-1 text-xs min-w-[150px]">
                                <div className="flex gap-1">
                                  <span className="text-gray-500">Cart:</span>
                                  <span className="font-medium text-emerald-600">
                                    {formatCurrency(getActionValue(insight, "add_to_cart"))}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <span className="text-gray-500">Purchase:</span>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(getActionValue(insight, "purchase"))}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <span className="text-gray-500">Lead:</span>
                                  <span className="font-medium text-purple-600">
                                    {formatCurrency(getActionValue(insight, "lead"))}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <span className="text-gray-500">Checkout:</span>
                                  <span className="font-medium text-blue-600">
                                    {formatCurrency(getActionValue(insight, "initiate_checkout"))}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm">
                              {formatDate(insight.date_start)}
                            </td>
                            <td className="px-3 py-4 text-sm">
                              {formatDate(insight.date_stop)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={16}
                            className="px-6 py-8 text-center text-sm text-gray-500">
                            {searchTerm
                              ? "No ad sets match your search criteria."
                              : "No detailed insights available for this campaign."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {endIndex} of{" "}
                      {filtered.length} results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border">
                        {" "}
                        <ChevronDoubleLeftIcon className="h-4 w-4" />{" "}
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border">
                        {" "}
                        <ChevronLeftIcon className="h-4 w-4" />{" "}
                      </button>
                      <span className="px-3">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border">
                        {" "}
                        <ChevronRightIcon className="h-4 w-4" />{" "}
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border">
                        {" "}
                        <ChevronDoubleRightIcon className="h-4 w-4" />{" "}
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
