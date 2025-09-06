/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/model/AnalyticsModal.tsx
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
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  FireIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  TableCellsIcon,
  PlayIcon,
  PauseIcon,
  ArchiveBoxIcon,
  ClockIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setShowAnalyticsModal } from "../../../store/features/facebookAdsSlice";
import Portal from "../ui/Portal";
import AnalyticsDetailsModal from "./AnalyticsDetailsModal";

const AnalyticsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [objectiveFilter, setObjectiveFilter] = useState("all");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // 🔥 NEW: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8); // Fixed at 8 rows per page

  const {
    showAnalyticsModal,
    overallTotals,
    campaignAnalysis,
    topCampaign,
    stableCampaigns,
    underperforming,
    loadingTotals,
  } = useAppSelector((state) => state.facebookAds);

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

  const handleClose = () => {
    dispatch(setShowAnalyticsModal(false));
    setSelectedCategory("all");
    setSearchTerm("");
    setStatusFilter("all");
    setObjectiveFilter("all");
    setDateRangeStart("");
    setDateRangeEnd("");
    setCurrentPage(1); // 🔥 Reset pagination on close
  };

  const handleCampaignClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };

  const handleCloseCampaignDetails = () => {
    setShowCampaignDetails(false);
    setSelectedCampaign(null);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showAnalyticsModal) {
        event.preventDefault();
        event.stopPropagation();
        handleClose();
      }
    };

    if (showAnalyticsModal) {
      document.addEventListener("keydown", handleEscape, true);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape, true);
      document.body.style.overflow = "";
    };
  }, [showAnalyticsModal]);

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

  // Handle both single object and array cases
  const getCategoryData = () => {
    switch (selectedCategory) {
      case "top":
        if (Array.isArray(topCampaign)) {
          return topCampaign;
        } else if (topCampaign && typeof topCampaign === "object") {
          return [topCampaign];
        } else {
          return [];
        }
      case "stable":
        return Array.isArray(stableCampaigns) ? stableCampaigns : [];
      case "underperforming":
        return Array.isArray(underperforming) ? underperforming : [];
      default:
        return Array.isArray(campaignAnalysis) ? campaignAnalysis : [];
    }
  };

  // Filter campaigns based on search, status, objective, and date range
  const filteredCampaigns = useMemo(() => {
    const campaigns = getCategoryData();

    if (!campaigns || campaigns.length === 0) {
      return [];
    }

    return campaigns.filter((campaign: any) => {
      // Search filter
      const matchesSearch =
        campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.id?.includes(searchTerm);

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        campaign.status?.toLowerCase() === statusFilter.toLowerCase();

      // Objective filter
      const matchesObjective =
        objectiveFilter === "all" ||
        campaign.objective?.toLowerCase() === objectiveFilter.toLowerCase();

      // Date range filter
      let matchesDateRange = true;
      if (dateRangeStart && dateRangeEnd && campaign.start_time) {
        const campaignDate = new Date(campaign.start_time);
        const startDate = new Date(dateRangeStart);
        const endDate = new Date(dateRangeEnd);
        matchesDateRange = campaignDate >= startDate && campaignDate <= endDate;
      }

      return (
        matchesSearch && matchesStatus && matchesObjective && matchesDateRange
      );
    });
  }, [
    selectedCategory,
    searchTerm,
    statusFilter,
    objectiveFilter,
    dateRangeStart,
    dateRangeEnd,
    topCampaign,
    stableCampaigns,
    underperforming,
    campaignAnalysis,
  ]);

  // 🔥 NEW: Pagination logic
  const paginationData = useMemo(() => {
    const totalItems = filteredCampaigns.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentPageCampaigns = filteredCampaigns.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      currentPageCampaigns,
      startIndex,
      endIndex: Math.min(endIndex, totalItems),
    };
  }, [filteredCampaigns, currentPage, rowsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    searchTerm,
    statusFilter,
    objectiveFilter,
    dateRangeStart,
    dateRangeEnd,
  ]);

  // 🔥 NEW: Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFirstPage = () => setCurrentPage(1);
  const handleLastPage = () => setCurrentPage(paginationData.totalPages);
  const handlePrevPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const handleNextPage = () =>
    setCurrentPage(Math.min(paginationData.totalPages, currentPage + 1));

  // 🔥 NEW: Generate page numbers for pagination
  const getPageNumbers = () => {
    const { totalPages } = paginationData;
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Overall stats cards
  const statsCards = useMemo(() => {
    if (!overallTotals) return [];

    return [
      {
        title: "Total Impressions",
        value: overallTotals.impressions?.toLocaleString() || "0",
        icon: EyeIcon,
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400",
      },
      {
        title: "Total Clicks",
        value: overallTotals.clicks?.toLocaleString() || "0",
        icon: CursorArrowRaysIcon,
        color: "from-emerald-500 to-emerald-600",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        textColor: "text-emerald-600 dark:text-emerald-400",
      },
      {
        title: "Total Reach",
        value: overallTotals.reach?.toLocaleString() || "0",
        icon: UsersIcon,
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        textColor: "text-purple-600 dark:text-purple-400",
      },
      {
        title: "Total Spend",
        value: formatCurrency(overallTotals.spend || 0),
        icon: CurrencyRupeeIcon,
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        textColor: "text-orange-600 dark:text-orange-400",
      },
      {
        title: "Average CTR",
        value: `${(overallTotals.ctr || 0).toFixed(2)}%`,
        icon: ArrowTrendingUpIcon,
        color: "from-indigo-500 to-indigo-600",
        bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
        textColor: "text-indigo-600 dark:text-indigo-400",
      },
      {
        title: "Average CPC",
        value: formatCurrency(overallTotals.cpc || 0),
        icon: CurrencyRupeeIcon,
        color: "from-pink-500 to-pink-600",
        bgColor: "bg-pink-50 dark:bg-pink-900/20",
        textColor: "text-pink-600 dark:text-pink-400",
      },
    ];
  }, [overallTotals]);

  // Action stats
  const actionStats = useMemo(() => {
    if (!overallTotals?.actions) return [];

    return [
      {
        title: "Add to Cart",
        value: overallTotals.actions.add_to_cart || 0,
        icon: ShoppingCartIcon,
        color: "bg-emerald-500",
      },
      {
        title: "Purchases",
        value: overallTotals.actions.purchase || 0,
        icon: BanknotesIcon,
        color: "bg-green-500",
      },
      {
        title: "Initiate Checkout",
        value: overallTotals.actions.initiate_checkout || 0,
        icon: ClockIcon,
        color: "bg-blue-500",
      },
      {
        title: "Add Payment Info",
        value: overallTotals.actions.add_payment_info || 0,
        icon: CreditCardIcon,
        color: "bg-purple-500",
      },
    ];
  }, [overallTotals]);

  // Categories with proper counts
  const categories = [
    {
      id: "all",
      name: "All Campaigns",
      icon: TableCellsIcon,
      color: "text-gray-600 dark:text-gray-400",
      count: Array.isArray(campaignAnalysis) ? campaignAnalysis.length : 0,
    },
    {
      id: "top",
      name: "Top Campaigns",
      icon: FireIcon,
      color: "text-orange-600 dark:text-orange-400",
      count: Array.isArray(topCampaign)
        ? topCampaign.length
        : topCampaign && typeof topCampaign === "object"
        ? 1
        : 0,
    },
    {
      id: "stable",
      name: "Stable Campaigns",
      icon: ShieldCheckIcon,
      color: "text-green-600 dark:text-green-400",
      count: Array.isArray(stableCampaigns) ? stableCampaigns.length : 0,
    },
    {
      id: "underperforming",
      name: "Underperforming",
      icon: ExclamationTriangleIcon,
      color: "text-red-600 dark:text-red-400",
      count: Array.isArray(underperforming) ? underperforming.length : 0,
    },
  ];

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "sales/conversion":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "traffic/awareness":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "engagement":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "underperforming":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  if (!showAnalyticsModal) return null;

  return (
    <>
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
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}>
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Campaign Analytics
                      </h2>
                      <p className="text-indigo-100 text-sm">
                        Comprehensive insights into your Meta Ads performance
                      </p>
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {loadingTotals ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Loading analytics data...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-8">
                    {/* Overall Performance Stats */}
                    {statsCards.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <ChartBarIcon className="mr-2 text-indigo-600 h-5 w-5" />
                          Overall Performance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {statsCards.map((card, index) => (
                            <motion.div
                              key={card.title}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`${card.bgColor} backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4`}>
                              <div className="flex items-center justify-between mb-3">
                                <div
                                  className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}>
                                  <card.icon className="h-5 w-5 text-white" />
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                                  {card.title}
                                </p>
                                <p
                                  className={`text-xl font-bold ${card.textColor}`}>
                                  {card.value}
                                </p>
                              </div>
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
                              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
                              <div
                                className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                <stat.icon className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {stat.value}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {stat.title}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <FunnelIcon className="mr-2 text-purple-600 h-5 w-5" />
                        Campaign Categories
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`p-4 rounded-lg border transition-all ${
                              selectedCategory === category.id
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}>
                            <category.icon
                              className={`h-6 w-6 ${category.color} mx-auto mb-2`}
                            />
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {category.count} campaigns
                            </p>
                          </button>
                        ))}
                      </div>

                      {/* Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        {/* Search */}
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full"
                          />
                        </div>

                        {/* Status Filter */}
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="archived">Archived</option>
                        </select>

                        {/* Objective Filter */}
                        <select
                          value={objectiveFilter}
                          onChange={(e) => setObjectiveFilter(e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                          <option value="all">All Objectives</option>
                          <option value="outcome_sales">Sales</option>
                          <option value="outcome_traffic">Traffic</option>
                          <option value="outcome_engagement">Engagement</option>
                          <option value="outcome_awareness">Awareness</option>
                        </select>

                        {/* Date Range */}
                        <input
                          type="date"
                          value={dateRangeStart}
                          onChange={(e) => setDateRangeStart(e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Start Date"
                        />

                        <input
                          type="date"
                          value={dateRangeEnd}
                          onChange={(e) => setDateRangeEnd(e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="End Date"
                        />
                      </div>

                      {/* 🔥 NEW: Pagination Info */}
                      <div className="px-6 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            Showing {paginationData.startIndex + 1} to{" "}
                            {paginationData.endIndex} of{" "}
                            {paginationData.totalItems} campaigns
                          </span>
                          <span>
                            Page {currentPage} of {paginationData.totalPages}
                          </span>
                        </div>
                      </div>

                      {/* Campaign Table */}
                      {paginationData.currentPageCampaigns.length > 0 ? (
                        <div className="overflow-x-scroll bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-t-0">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Campaign
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Objective
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Impressions
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Clicks
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  CTR
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Spend
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Conversions
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Start Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {paginationData.currentPageCampaigns.map(
                                (campaign: any, index: number) => (
                                  <motion.tr
                                    key={campaign.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                    {/* Campaign Name */}
                                    <td className="px-4 py-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                                        {campaign.name}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        ID: {campaign.id}
                                      </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-4">
                                      <div className="flex items-center space-x-2">
                                        {getStatusIcon(campaign.status)}
                                        <span
                                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                            campaign.status
                                          )}`}>
                                          {campaign.status}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Objective */}
                                    <td className="px-4 py-4">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {campaign.objective?.replace(
                                          "OUTCOME_",
                                          ""
                                        ) || "N/A"}
                                      </div>
                                    </td>

                                    {/* Category */}
                                    <td className="px-4 py-4">
                                      <span
                                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(
                                          campaign.verdict?.category
                                        )}`}>
                                        {campaign.verdict?.category || "N/A"}
                                      </span>
                                    </td>

                                    {/* Impressions */}
                                    <td className="px-4 py-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {campaign.totals?.impressions?.toLocaleString() ||
                                          "0"}
                                      </div>
                                    </td>

                                    {/* Clicks */}
                                    <td className="px-4 py-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {campaign.totals?.clicks?.toLocaleString() ||
                                          "0"}
                                      </div>
                                    </td>

                                    {/* CTR */}
                                    <td className="px-4 py-4">
                                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        {(campaign.totals?.ctr || 0).toFixed(2)}
                                        %
                                      </div>
                                    </td>

                                    {/* Spend */}
                                    <td className="px-4 py-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(
                                          campaign.totals?.spend || 0
                                        )}
                                      </div>
                                    </td>

                                    {/* Conversions */}
                                    <td className="px-4 py-4">
                                      <div className="text-xs space-y-1">
                                        <div className="text-green-600">
                                          Purchase:{" "}
                                          {campaign.totals?.actions?.purchase ||
                                            0}
                                        </div>
                                        <div className="text-blue-600">
                                          Cart:{" "}
                                          {campaign.totals?.actions
                                            ?.add_to_cart || 0}
                                        </div>
                                      </div>
                                    </td>

                                    {/* Start Date */}
                                    <td className="px-4 py-4">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {formatDate(campaign.start_time)}
                                      </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-4">
                                      <button
                                        onClick={() =>
                                          handleCampaignClick(campaign)
                                        }
                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
                                        View Details
                                      </button>
                                    </td>
                                  </motion.tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-b-lg border border-gray-200 dark:border-gray-700 border-t-0">
                          <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Campaigns Found
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {searchTerm ||
                            statusFilter !== "all" ||
                            objectiveFilter !== "all" ||
                            dateRangeStart ||
                            dateRangeEnd
                              ? "No campaigns match your current filters."
                              : "No campaign data available for this category."}
                          </p>
                          {(searchTerm ||
                            statusFilter !== "all" ||
                            objectiveFilter !== "all" ||
                            dateRangeStart ||
                            dateRangeEnd) && (
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                setObjectiveFilter("all");
                                setDateRangeStart("");
                                setDateRangeEnd("");
                              }}
                              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                              Clear Filters
                            </button>
                          )}
                        </div>
                      )}

                      {/* 🔥 NEW: Pagination Controls */}
                      {paginationData.totalPages > 1 && (
                        <div className="px-6 py-4 border border-gray-200 dark:border-gray-700 border-t-0 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {/* First Page */}
                              <button
                                onClick={handleFirstPage}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg border transition-colors ${
                                  currentPage === 1
                                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}>
                                <ChevronDoubleLeftIcon className="h-4 w-4" />
                              </button>

                              {/* Previous Page */}
                              <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg border transition-colors ${
                                  currentPage === 1
                                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}>
                                <ChevronLeftIcon className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Page Numbers */}
                            <div className="flex items-center space-x-1">
                              {getPageNumbers().map((page, index) => (
                                <React.Fragment key={index}>
                                  {page === "..." ? (
                                    <span className="px-3 py-2 text-gray-500">
                                      ...
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handlePageChange(page as number)
                                      }
                                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        currentPage === page
                                          ? "bg-indigo-600 text-white"
                                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                      }`}>
                                      {page}
                                    </button>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>

                            <div className="flex items-center space-x-2">
                              {/* Next Page */}
                              <button
                                onClick={handleNextPage}
                                disabled={
                                  currentPage === paginationData.totalPages
                                }
                                className={`p-2 rounded-lg border transition-colors ${
                                  currentPage === paginationData.totalPages
                                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}>
                                <ChevronRightIcon className="h-4 w-4" />
                              </button>

                              {/* Last Page */}
                              <button
                                onClick={handleLastPage}
                                disabled={
                                  currentPage === paginationData.totalPages
                                }
                                className={`p-2 rounded-lg border transition-colors ${
                                  currentPage === paginationData.totalPages
                                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}>
                                <ChevronDoubleRightIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
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

      {/* Campaign Details Modal */}
      <AnalyticsDetailsModal
        isOpen={showCampaignDetails}
        onClose={handleCloseCampaignDetails}
        campaign={selectedCampaign}
      />
    </>
  );
};

export default AnalyticsModal;
