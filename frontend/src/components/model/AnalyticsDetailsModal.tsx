/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/model/CampaignDetailsModal.tsx
import React, { useEffect, useMemo, useState } from "react";
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
  ClockIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  PlayIcon,
  PauseIcon,
  ArchiveBoxIcon,
  SparklesIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import Portal from "../ui/Portal";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchCampaignInsights } from "../../../store/features/facebookAdsSlice";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Delete,
  DeleteIcon,
} from "lucide-react";

interface CampaignDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  category: string;
}

const AnalyticsDetailsModal: React.FC<CampaignDetailsModalProps> = ({
  isOpen,
  onClose,
  campaign,
  category,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  console.log(category, "category=>>>>>>>>>>>>>>>>>>>>>>>");
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("spend");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isUnderperformer, setIsUnderperformer] = useState(false);

  // 🔥 NEW: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8); // Fixed at 8 rows per page

  const {
    showModal,
    underperforming,
    selectedCampaignForModal,
    campaignInsights,
    loading,
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

  useEffect(() => {
    if (!campaign || !underperforming) return;

    const found = underperforming.some((item) => item.id === campaign.id);

    setIsUnderperformer(found);
  }, [campaign, underperforming]);

  console.log(campaign, "->>>>>>>my campaignInsights");
  console.log(underperforming, "=>>>>>underformaing");

  // Fetch campaign insights when modal opens
  useEffect(() => {
    if (isOpen && campaign?.id) {
      dispatch(fetchCampaignInsights(campaign.id));
    }
  }, [isOpen, campaign?.id, dispatch]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape, true);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape, true);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return <PlayIcon className="h-5 w-5 text-emerald-600" />;
      case "PAUSED":
        return <PauseIcon className="h-5 w-5 text-yellow-600" />;
      case "ARCHIVED":
        return <ArchiveBoxIcon className="h-5 w-5 text-gray-600" />;
      default:
        return <XMarkIcon className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
    }
  };

  // 🔥 ENHANCED: Updated category icon function for new categories
  const getCategoryIcon = (category: string) => {
    // Handle new verdict categories
    if (category?.includes("champion") || category?.includes("superstar")) {
      return <TrophyIcon className="h-5 w-5 text-yellow-600" />;
    }
    if (category?.includes("magnet") || category?.includes("stellar")) {
      return <MagnifyingGlassIcon className="h-5 w-5 text-purple-600" />;
    }
    if (category?.includes("solid") || category?.includes("steady")) {
      return <ShieldCheckIcon className="h-5 w-5 text-blue-600" />;
    }
    if (category?.includes("building") || category?.includes("developing")) {
      return <SparklesIcon className="h-5 w-5 text-green-600" />;
    }
    if (category?.includes("struggling") || category?.includes("weak")) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
    }

    // Original categories
    switch (category) {
      case "sales/conversion":
        return <TrophyIcon className="h-5 w-5 text-green-600" />;
      case "traffic/awareness":
        return <FireIcon className="h-5 w-5 text-blue-600" />;
      case "engagement":
        return <SparklesIcon className="h-5 w-5 text-purple-600" />;
      case "underperforming":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  // 🔥 ENHANCED: Updated category color function for new categories
  const getCategoryColor = (category: string) => {
    // Handle new verdict categories with color coding
    if (
      category?.includes("champion") ||
      category?.includes("superstar") ||
      category?.includes("magnet")
    ) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
    }
    if (
      category?.includes("solid") ||
      category?.includes("steady") ||
      category?.includes("performer")
    ) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    }
    if (
      category?.includes("building") ||
      category?.includes("developing") ||
      category?.includes("emerging")
    ) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
    }
    if (
      category?.includes("struggling") ||
      category?.includes("weak") ||
      category?.includes("underperforming")
    ) {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
    }

    // Original categories
    switch (category) {
      case "sales/conversion":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
      case "traffic/awareness":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "engagement":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "underperforming":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  // Process campaign insights data
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

  // 🔥 NEW: Pagination logic
  const paginationData = useMemo(() => {
    const totalItems = filteredInsights.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentPageInsights = filteredInsights.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      currentPageInsights,
      startIndex,
      endIndex: Math.min(endIndex, totalItems),
    };
  }, [filteredInsights, currentPage, rowsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

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

  // Extract action values for specific actions
  const getActionType = (insight: any, actionType: string) => {
    console.log("insight===>>>", insight);
    if (!insight.actions) return "0";
    const action = insight.actions.find(
      (a: any) => a.action_type === actionType
    );
    console.log(action, "====>action");
    return action ? parseFloat(action.value) : "0";
  };

  const getActionValue = (insight: any, actionType: string) => {
    console.log("insight===>>>", insight);
    if (!insight.cost_per_action_type) return "₹0";
    const action = insight.cost_per_action_type.find(
      (a: any) => a.action_type === actionType
    );
    console.log(action, "====>action");
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
      {
        title: "Total Lead",
        value: `${totals.total_leads || 0}`,
        icon: ArrowTrendingUpIcon,
        color: "from-indigo-500 to-indigo-600",
        bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
        textColor: "text-indigo-600 dark:text-indigo-400",
      },
      {
        title: "Average Lead Cost",
        value: formatCurrency(totals.average_lead_cost || 0),
        icon: CurrencyRupeeIcon,
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        textColor: "text-orange-600 dark:text-orange-400",
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
      {
        title: "Lead Cost",
        value: totals?.cost_per_action_type.lead?.toFixed(2) || 0,
        icon: BanknotesIcon,
        color: "bg-green-500",
      },
    ];
  }, [processedData.totals]);

  if (!isOpen || !campaign) return null;

  // 🔥 ENHANCED: Added leads and score to performance metrics
  const performanceMetrics = [
    {
      title: "Impressions",
      value: campaign.totals?.impressions?.toLocaleString() || "0",
      icon: EyeIcon,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Clicks",
      value: campaign.totals?.clicks?.toLocaleString() || "0",
      icon: CursorArrowRaysIcon,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      title: "Reach",
      value: campaign.totals?.reach?.toLocaleString() || "0",
      icon: UsersIcon,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      title: "Total Spend",
      value: formatCurrency(campaign.totals?.spend || 0),
      icon: CurrencyRupeeIcon,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      title: "CTR",
      value: `${(campaign.totals?.ctr || 0).toFixed(2)}%`,
      icon: ArrowTrendingUpIcon,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      borderColor: "border-indigo-200 dark:border-indigo-800",
    },
    {
      title: "CPC",
      value: formatCurrency(campaign.totals?.cpc || 0),
      icon: CurrencyRupeeIcon,
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
      borderColor: "border-pink-200 dark:border-pink-800",
    },
    {
      title: "CPP",
      value: campaign.totals?.cpp ? formatCurrency(campaign.totals.cpp) : "N/A",
      icon: BanknotesIcon,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
      borderColor: "border-cyan-200 dark:border-cyan-800",
    },
    // 🔥 NEW: Add performance score if available
    ...(campaign.score
      ? [
          {
            title: "Performance Score",
            value: campaign.score.toFixed(1),
            icon: StarIcon,
            color: "text-yellow-600 dark:text-yellow-400",
            bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
            borderColor: "border-yellow-200 dark:border-yellow-800",
          },
        ]
      : []),
  ];

  // 🔥 ENHANCED: Added leads to conversion metrics
  const conversionMetrics = [
    {
      title: "Add to Cart",
      value: campaign.totals?.actions?.add_to_cart || 0,
      icon: ShoppingCartIcon,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500",
    },
    {
      title: "Purchases",
      value: campaign.totals?.actions?.purchase || 0,
      icon: BanknotesIcon,
      color: "text-green-600",
      bgColor: "bg-green-500",
    },
    {
      title: "Initiate Checkout",
      value: campaign.totals?.actions?.initiate_checkout || 0,
      icon: ClockIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-500",
    },
    {
      title: "Add Payment Info",
      value: campaign.totals?.actions?.add_payment_info || 0,
      icon: CreditCardIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-500",
    },
    // 🔥 NEW: Add leads conversion metric
    {
      title: "Leads",
      value:
        campaign.totals?.actions?.lead || campaign.totals?.total_leads || 0,
      icon: StarIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500",
    },
  ];

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}>
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 px-6 py-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Campaign Details
                    </h2>
                    <p className="text-indigo-100 text-sm">
                      Comprehensive campaign performance analysis
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Campaign Info Header */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {campaign.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full font-mono">
                        ID: {campaign.id}
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          campaign.status
                        )}`}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-2">{campaign.status}</span>
                      </span>
                      {campaign.verdict?.category && (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(
                            campaign.verdict.category
                          )}`}>
                          {getCategoryIcon(campaign.verdict.category)}
                          <span className="ml-2 capitalize">
                            {campaign.verdict.category
                              .replace("/", " & ")
                              .replace("_", " ")}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Objective
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {campaign.objective?.replace("OUTCOME_", "") || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 🔥 NEW: Lead Performance Highlight (if applicable) */}
              {(campaign.totals?.actions?.lead !== 0 ||
                campaign.totals?.total_leads !== 0) && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <StarIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-green-900 dark:text-green-100">
                          Lead Generation Performance
                        </h4>
                        <p className="text-green-700 dark:text-green-300 text-sm">
                          Total leads generated and cost efficiency
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                        {campaign.totals?.actions?.lead ||
                          campaign.totals?.total_leads ||
                          0}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        {campaign.totals?.average_lead_cost && (
                          <>
                            Avg:{" "}
                            {formatCurrency(campaign.totals.average_lead_cost)}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Metrics Grid */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ChartBarIcon className="mr-2 text-indigo-600 h-5 w-5" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {performanceMetrics.map((metric, index) => (
                    <motion.div
                      key={metric.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${metric.bgColor} border ${metric.borderColor} rounded-xl p-4`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                          <metric.icon className={`h-5 w-5 ${metric.color}`} />
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                          {metric.title}
                        </p>
                        <p className={`text-xl font-bold ${metric.color}`}>
                          {metric.value}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Conversion Actions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BanknotesIcon className="mr-2 text-green-600 h-5 w-5" />
                  Conversion Actions
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {conversionMetrics.map((metric, index) => (
                    <motion.div
                      key={metric.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
                      <div
                        className={`w-10 h-10 ${metric.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <metric.icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {metric.value}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {metric.title}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Campaign Timeline */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <CalendarDaysIcon className="mr-2 text-blue-600 h-5 w-5" />
                  Campaign Timeline
                </h4>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Start Date
                      </div>
                      <div className="text-lg text-gray-900 dark:text-white">
                        {formatDate(campaign.start_time)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        End Date
                      </div>
                      <div className="text-lg text-gray-900 dark:text-white">
                        {campaign.stop_time
                          ? formatDate(campaign.stop_time)
                          : "Ongoing"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Analysis & Recommendations */}
              {campaign.verdict && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <LightBulbIcon className="mr-2 text-yellow-600 h-5 w-5" />
                    AI Analysis & Recommendations
                  </h4>
                  <div className="space-y-4">
                    {/* Reason */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <InformationCircleIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Performance Analysis
                          </h5>
                          <div className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                            {campaign.verdict.reason
                              .replace(/\*\*(.*?)\*\*/g, "$1")
                              .split("\n")
                              .map((line: string, index: number) => (
                                <p key={index} className="mb-2 last:mb-0">
                                  {line.trim()}
                                </p>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <CheckCircleIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                            Recommended Action
                          </h5>
                          <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
                            {campaign.verdict.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isUnderperformer && (
                      <div className="bg-green-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-red-500 rounded-lg">
                            <Delete className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                              Recommended Action
                            </h5>
                            <p className="text-red-800 dark:text-red-200 text-sm leading-relaxed">
                              🗑️ End this campaign or completely rework
                              strategy.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 🔥 NEW: Additional Lead Information (if available) */}
              {(campaign.totals?.total_lead_value !== 0 ||
                campaign.totals?.average_lead_cost !== 0) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <StarIcon className="mr-2 text-yellow-600 h-5 w-5" />
                    Lead Generation Insights
                  </h4>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {campaign.totals?.total_lead_value && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Total Lead Value
                          </div>
                          <div className="text-lg text-gray-900 dark:text-white font-semibold">
                            {formatCurrency(campaign.totals.total_lead_value)}
                          </div>
                        </div>
                      )}
                      {campaign.totals?.average_lead_cost && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Average Lead Cost
                          </div>
                          <div className="text-lg text-gray-900 dark:text-white font-semibold">
                            {formatCurrency(campaign.totals.average_lead_cost)}
                          </div>
                        </div>
                      )}
                      {(campaign.totals?.actions?.lead ||
                        campaign.totals?.total_leads) && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Total Leads
                          </div>
                          <div className="text-lg text-gray-900 dark:text-white font-semibold">
                            {campaign.totals?.actions?.lead ||
                              campaign.totals?.total_leads ||
                              0}
                          </div>
                        </div>
                      )}
                    </div>
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
                      <option value="spend-desc">Spend (High to Low)</option>
                      <option value="spend-asc">Spend (Low to High)</option>
                      <option value="impressions-desc">
                        Impressions (High to Low)
                      </option>
                      <option value="clicks-desc">Clicks (High to Low)</option>
                      <option value="ctr-desc">CTR (High to Low)</option>
                    </select>
                  </div>
                </div>

                {/* 🔥 NEW: Pagination Info */}
                <div className="px-6 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      Showing {paginationData.startIndex + 1} to{" "}
                      {paginationData.endIndex} of {paginationData.totalItems}{" "}
                      insights
                    </span>
                    <span>
                      Page {currentPage} of {paginationData.totalPages}
                    </span>
                  </div>
                </div>

                {paginationData.currentPageInsights.length > 0 ? (
                  <div className="overflow-x-scroll bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-t-0">
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
                            Action
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Action Value
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
                        {paginationData.currentPageInsights.map(
                          (insight: any, index: number) => (
                            <motion.tr
                              key={`${insight.adset_id}-${insight.ad_id}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                              {/* S.No */}
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {paginationData.startIndex + index + 1}
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
                                  {parseInt(insight.clicks).toLocaleString()}
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
                                  {formatCurrency(parseFloat(insight.spend))}
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
                                    ? formatCurrency(parseFloat(insight.cpp))
                                    : "N/A"}
                                </div>
                              </td>

                              {/* Objective */}
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {insight.objective?.replace("OUTCOME_", "") ||
                                    "N/A"}
                                </div>
                              </td>

                              {/* Buying Type */}
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {insight.buying_type || "N/A"}
                                </div>
                              </td>

                              {/* Action type */}
                              <td className="px-4 py-4">
                                <div className="grid grid-cols-2 gap-2 text-xs min-w-[200px]">
                                  <div className="flex gap-2">
                                    <span className="text-gray-500 block">
                                      Add to Cart:
                                    </span>
                                    <span className="font-medium text-emerald-600">
                                      {getActionType(insight, "add_to_cart")}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="text-gray-500 block">
                                      Purchase:
                                    </span>
                                    <span className="font-medium text-green-600">
                                      {getActionType(insight, "purchase")}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="text-gray-500 block">
                                      Checkout:
                                    </span>
                                    <span className="font-medium text-blue-600">
                                      {getActionType(
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
                                      {getActionType(
                                        insight,
                                        "add_payment_info"
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="text-gray-500 block">
                                      Lead:
                                    </span>
                                    <span className="font-medium text-purple-600">
                                      {getActionType(insight, "lead")}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Action value */}
                              <td className="px-4 py-4">
                                <div className="grid grid-cols-2 gap-2 text-xs min-w-[200px]">
                                  <div className="flex gap-2">
                                    <span className="text-gray-500 block">
                                      Add to Cart:
                                    </span>
                                    <span className="font-medium text-emerald-600">
                                      {getActionValue(insight, "add_to_cart")}
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
                                  <div className="flex gap-2">
                                    <span className="text-gray-500 block">
                                      Lead:
                                    </span>
                                    <span className="font-medium text-purple-600">
                                      {getActionValue(insight, "lead")}
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
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-b-lg border border-gray-200 dark:border-gray-700 border-t-0">
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
                                onClick={() => handlePageChange(page as number)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white"
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
                          disabled={currentPage === paginationData.totalPages}
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
                          disabled={currentPage === paginationData.totalPages}
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

              {/* Additional Campaign Info */}
              {(campaign.daily_budget ||
                campaign.source_campaign_id !== "0") && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <InformationCircleIcon className="mr-2 text-gray-600 h-5 w-5" />
                    Additional Information
                  </h4>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {campaign.daily_budget && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Daily Budget
                          </div>
                          <div className="text-lg text-gray-900 dark:text-white">
                            {formatCurrency(
                              parseInt(campaign.daily_budget) / 100
                            )}
                          </div>
                        </div>
                      )}
                      {campaign.source_campaign_id !== "0" && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Source Campaign ID
                          </div>
                          <div className="text-lg text-gray-900 dark:text-white font-mono">
                            {campaign.source_campaign_id}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
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
