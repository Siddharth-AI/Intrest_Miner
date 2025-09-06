/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/AnalyticsPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  FunnelIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  LinkSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchAdAccounts,
  fetchCampaigns,
  fetchInsights,
  setShowAnalyticsModal,
  setShowModal,
  setSelectedCampaignForModal,
  setSelectedAccount,
  clearAllData,
} from "../../../store/features/facebookAdsSlice";
import { useNavigate } from "react-router-dom";

const AnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");

  const {
    adAccounts,
    campaigns, // This will be from fetchCampaigns API
    overallTotals, // This will be from fetchInsights API
    selectedAccount,
    loadingTotals, // Loading for the cards (fetchInsights)
    loadingCampaigns, // Loading for campaigns table (fetchCampaigns)
    initialLoading,
  } = useAppSelector((state) => state.facebookAds);
  const token = localStorage.getItem("FB_ACCESS_TOKEN");
  const hasToken = Boolean(token);
  const router = useNavigate();
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

  // Fetch ad accounts on mount and select first one by default
  useEffect(() => {
    if (adAccounts.length === 0) {
      dispatch(fetchAdAccounts());
    }
  }, [dispatch, adAccounts.length]);

  // Auto-select first account when accounts are loaded
  useEffect(() => {
    if (adAccounts.length > 0 && !selectedAccount) {
      dispatch(setSelectedAccount(adAccounts[0].id));
    }
  }, [adAccounts, selectedAccount, dispatch]);

  // Fetch campaigns and insights when account is selected
  useEffect(() => {
    if (selectedAccount) {
      // Fetch campaigns list quickly (for table)
      dispatch(fetchCampaigns(selectedAccount));
      // Fetch insights data separately (for cards - takes longer)
      dispatch(fetchInsights());
    }
  }, [selectedAccount, dispatch]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAnalyzeClick = () => {
    dispatch(setShowAnalyticsModal(true));
  };

  const handleCampaignClick = (campaign: any) => {
    dispatch(setSelectedCampaignForModal(campaign));
    dispatch(setShowModal(true));
  };

  const handleAccountChange = (accountId: string) => {
    dispatch(setSelectedAccount(accountId));
  };

  const handleRefresh = () => {
    if (selectedAccount) {
      dispatch(fetchCampaigns(selectedAccount));
      dispatch(fetchInsights());
    }
  };

  const handleDisconnect = () => {
    dispatch(clearAllData());
  };

  // Filter campaigns locally based on search, status, and date range
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];

    return campaigns.filter((campaign) => {
      // Search filter
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.id.includes(searchTerm);

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        campaign.status.toLowerCase() === statusFilter.toLowerCase();

      // Date range filter
      let matchesDateRange = true;
      if (dateRangeStart && dateRangeEnd && campaign.start_time) {
        const campaignDate = new Date(campaign.start_time);
        const startDate = new Date(dateRangeStart);
        const endDate = new Date(dateRangeEnd);
        matchesDateRange = campaignDate >= startDate && campaignDate <= endDate;
      }

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [campaigns, searchTerm, statusFilter, dateRangeStart, dateRangeEnd]);

  const statsCards = [
    {
      title: "Total Impressions",
      value: overallTotals?.impressions?.toLocaleString() || "0",
      icon: EyeIcon,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      change: "+12.5%",
      changeType: "up",
    },
    {
      title: "Total Clicks",
      value: overallTotals?.clicks?.toLocaleString() || "0",
      icon: CursorArrowRaysIcon,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      change: "+8.3%",
      changeType: "up",
    },
    {
      title: "Total Reach",
      value: overallTotals?.reach?.toLocaleString() || "0",
      icon: UsersIcon,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      change: "+15.2%",
      changeType: "up",
    },
    {
      title: "Total Spend",
      value: overallTotals?.spend ? formatCurrency(overallTotals.spend) : "₹0",
      icon: CurrencyRupeeIcon,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      change: "+5.7%",
      changeType: "up",
    },
    {
      title: "Average CTR",
      value: overallTotals?.ctr ? `${overallTotals.ctr.toFixed(2)}%` : "0%",
      icon: ArrowTrendingUpIcon,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      textColor: "text-indigo-600 dark:text-indigo-400",
      change: "+2.1%",
      changeType: "up",
    },
    {
      title: "Average CPC",
      value: overallTotals?.cpc ? formatCurrency(overallTotals.cpc) : "₹0",
      icon: CurrencyRupeeIcon,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
      textColor: "text-pink-600 dark:text-pink-400",
      change: "-1.2%",
      changeType: "down",
    },
  ];

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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading analytics data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {!hasToken && (
        <div className="absolute top-[29rem] left-1/2 -translate-x-1/2 -translate-y-96 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              To view your campaign data, please log in with your Meta account.
            </p>
            <button
              onClick={() => router("/meta-campaign")}
              className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold shadow-lg hover:bg-purple-700 transition-all duration-200">
              Go to Meta Login
            </button>
          </div>
        </div>
      )}

      <div
        className={`${
          !hasToken
            ? "blur-sm pointer-events-none p-6"
            : "min-h-screen bg-gray-50 dark:bg-gray-900"
        }`}>
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <ChartBarIcon className="mr-3 text-blue-600 h-8 w-8" />
                  Campaign Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Comprehensive insights into your Meta Ads performance
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Account Selector */}
                <select
                  value={selectedAccount}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]">
                  <option value="">Select Ad Account</option>
                  {adAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnalyzeClick}
                    disabled={!selectedAccount}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    Analyze
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRefresh}
                    disabled={
                      !selectedAccount || (loadingTotals && loadingCampaigns)
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <ArrowPathIcon
                      className={`mr-2 h-4 w-4 ${
                        loadingTotals || loadingCampaigns ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDisconnect}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center">
                    <LinkSlashIcon className="mr-2 h-4 w-4" />
                    Disconnect
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedAccount ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12">
              <ChartBarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Account Selected
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please select an ad account to view analytics.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8">
                {/* Stats Grid - Show loading only here when fetchInsights is loading */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {statsCards.map((card, index) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`${card.bgColor} backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative`}>
                      {loadingTotals && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Loading...
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`p-3 rounded-lg bg-gradient-to-r ${card.color}`}>
                          <card.icon className="h-6 w-6 text-white" />
                        </div>
                        <div
                          className={`flex items-center text-sm font-medium ${
                            card.changeType === "up"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}>
                          {card.changeType === "up" ? (
                            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowTrendingUpIcon className="h-4 w-4 mr-1 rotate-180" />
                          )}
                          {card.change}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                          {card.title}
                        </p>
                        <p className={`text-2xl font-bold ${card.textColor}`}>
                          {card.value}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Campaign Performance Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <FunnelIcon className="mr-2 text-blue-600 h-5 w-5" />
                          Campaign Management
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          Click on any campaign to view detailed insights
                        </p>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        {/* Search */}
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
                          />
                        </div>

                        {/* Status Filter */}
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="archived">Archived</option>
                        </select>

                        {/* Date Range */}
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={dateRangeStart}
                            onChange={(e) => setDateRangeStart(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Start Date"
                          />
                          <input
                            type="date"
                            value={dateRangeEnd}
                            onChange={(e) => setDateRangeEnd(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="End Date"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {loadingCampaigns ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Loading campaigns...
                        </p>
                      </div>
                    ) : filteredCampaigns?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Campaign Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Start Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                End Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Objective
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredCampaigns.map((campaign, index) => (
                              <motion.tr
                                key={campaign.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleCampaignClick(campaign)}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mr-3">
                                      <ChartBarIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {campaign.name}
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        ID: {campaign.id}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                      campaign.status
                                    )}`}>
                                    {campaign.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  <div className="flex items-center">
                                    <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-1" />
                                    {formatDate(campaign.start_time)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  <div className="flex items-center">
                                    <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                                    {formatDate(campaign.stop_time)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    {campaign.objective?.replace(
                                      "OUTCOME_",
                                      ""
                                    ) || "N/A"}
                                  </span>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No Campaigns Found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {searchTerm ||
                          statusFilter !== "all" ||
                          dateRangeStart ||
                          dateRangeEnd
                            ? "No campaigns match your current filters."
                            : "No campaign data available for the selected account."}
                        </p>
                        {(searchTerm ||
                          statusFilter !== "all" ||
                          dateRangeStart ||
                          dateRangeEnd) && (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setStatusFilter("all");
                              setDateRangeStart("");
                              setDateRangeEnd("");
                            }}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Clear Filters
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
