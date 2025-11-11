/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
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
  TrophyIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import AnalyticsDetailsModal from "@/components/model/AnalyticsDetailsModal";
import { useNavigate } from "react-router-dom";
import { openPricingModal } from "../../../store/features/pricingModalSlice";
import HelpTooltip from "@/components/common/HelpTooltip";
import FloatingHelpButton from "@/components/common/FloatingHelpButton";
import AdvancedAnalyticsHelpModal from "@/components/modals/AdvancedAnalyticsHelpModal";
// Add these imports
import {
  fetchAdAccounts,
  setSelectedAccount,
  fetchCampaigns,
  fetchInsights,
  fetchInsightsDebounced,
  checkFacebookStatus,
} from "../../../store/features/facebookAdsSlice";
import { useToast } from "@/hooks/use-toast";

const AdvanceAnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [objectiveFilter, setObjectiveFilter] = useState("all");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const accountChangeTimerRef = useRef<NodeJS.Timeout>();

  const [insightsRequested, setInsightsRequested] = useState(false);
  // Add this state after your existing state declarations
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  // Add these selectors
  const { adAccounts, selectedAccount } = useAppSelector(
    (state) => state.facebookAds
  );

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(true);
  const router = useNavigate();
  // 🔥 NEW: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8); // Fixed at 8 rows per page
  const {
    data: userProfile,
    loading,
    error,
  } = useAppSelector((state) => state.profile);
  const {
    overallTotals,
    campaignAnalysis,
    excellentCampaigns,
    stableCampaigns,
    moderateCampaigns,
    underperforming,
    topCampaign,
    loadingTotals,
    insightsLastUpdated,
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

  // check facebook status token
  useEffect(() => {
    const authToken = localStorage.getItem("token");
    if (authToken) {
      // 🔥 NEW: Check Facebook status
      dispatch(checkFacebookStatus());
    }
  }, [dispatch]);

  // NEW - Use Facebook auth state
  const { facebookAuth } = useAppSelector((state) => state.facebookAds);
  const hasFacebookConnection =
    facebookAuth.isConnected && facebookAuth.status?.facebook_token_valid;
  const hasActiveSubscription = userProfile?.subscription_status === "active";

  // Add these useEffects after your existing ones
  useEffect(() => {
    if (adAccounts.length === 0 && hasFacebookConnection) {
      dispatch(fetchAdAccounts());
    }
  }, [dispatch, adAccounts.length, hasFacebookConnection]);

  // 🔥 ENHANCED: Auto-select first account with toast notification
  useEffect(() => {
    if (adAccounts.length > 0 && !selectedAccount) {
      console.log("✅ Auto-selecting first account...");
      dispatch(setSelectedAccount(adAccounts[0].id));
      toast({
        title: "Account Auto-Selected",
        description: `Automatically selected ${adAccounts[0].name}`,
      });
    }
  }, [adAccounts, selectedAccount, dispatch, toast]);

  useEffect(() => {
    if (selectedAccount) {
      console.log(`🔄 Account selected: ${selectedAccount}`);
      // Always fetch campaigns (lightweight)
      dispatch(fetchCampaigns(selectedAccount));
      // Always fetch insights - let Redux handle caching
      dispatch(fetchInsights(false)); // false means no force refresh
    }
  }, [selectedAccount, dispatch]);

  // Smart insights loading
  const shouldLoadInsights = useMemo(() => {
    if (!selectedAccount) return false;

    const lastUpdated = insightsLastUpdated[selectedAccount];
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    return !lastUpdated || lastUpdated < fiveMinutesAgo;
  }, [selectedAccount, insightsLastUpdated]);

  // Load campaigns immediately, insights smartly
  useEffect(() => {
    if (selectedAccount) {
      // Always fetch campaigns (lightweight)
      dispatch(fetchCampaigns(selectedAccount));

      // Only fetch insights if needed and not already requested
      if (shouldLoadInsights && !insightsRequested && !loadingTotals) {
        console.log(`🔄 Loading insights for account: ${selectedAccount}`);
        dispatch(fetchInsightsDebounced());
        setInsightsRequested(true);
      }
    }
  }, [
    selectedAccount,
    shouldLoadInsights,
    insightsRequested,
    loadingTotals,
    dispatch,
  ]);
  // Add this function after your existing functions (around line 150-200)
  const handleAccountChange = useCallback(
    (accountId: string) => {
      // Clear any existing timer
      if (accountChangeTimerRef.current) {
        clearTimeout(accountChangeTimerRef.current);
      }

      // Set new account immediately for UI responsiveness
      dispatch(setSelectedAccount(accountId));
      setCurrentPage(1);
      setInsightsRequested(false);

      // Debounce insights fetching
      accountChangeTimerRef.current = setTimeout(() => {
        if (accountId && hasFacebookConnection) {
          dispatch(fetchCampaigns(accountId));

          // Only fetch insights if needed
          if (shouldLoadInsights) {
            dispatch(fetchInsightsDebounced());
            setInsightsRequested(true);
          }
        }
      }, 300); // 300ms debounce for account changes
    },
    [dispatch, shouldLoadInsights, hasFacebookConnection]
  );

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

  // 🔥 NEW: Get campaign data based on selected category
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
      case "excellent":
        return Array.isArray(excellentCampaigns) ? excellentCampaigns : [];
      case "stable":
        return Array.isArray(stableCampaigns) ? stableCampaigns : [];
      case "moderate":
        return Array.isArray(moderateCampaigns) ? moderateCampaigns : [];
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
    excellentCampaigns,
    stableCampaigns,
    moderateCampaigns,
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

  useEffect(() => {
    return () => {
      if (accountChangeTimerRef.current) {
        clearTimeout(accountChangeTimerRef.current);
      }
    };
  }, []);

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

  // Overall stats cards with your existing animation
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
        title: "Total Leads",
        value: overallTotals.total_leads?.toString() || "0",
        icon: StarIcon,
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        textColor: "text-green-600 dark:text-green-400",
      },
    ];
  }, [overallTotals]);

  // Action stats with your existing styling
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
      {
        title: "Leads",
        value: overallTotals.actions.lead || 0,
        icon: StarIcon,
        color: "bg-yellow-500",
      },
    ];
  }, [overallTotals]);

  // 🔥 NEW: Categories with proper counts
  const categories = [
    {
      id: "all",
      name: "All Campaigns",
      icon: TableCellsIcon,
      color: "text-gray-600 dark:text-gray-400",
      count: Array.isArray(campaignAnalysis) ? campaignAnalysis.length : 0,
    },

    {
      id: "excellent",
      name: "Excellent",
      icon: FireIcon,
      color: "text-green-600 dark:text-green-400",
      count: Array.isArray(excellentCampaigns) ? excellentCampaigns.length : 0,
    },
    {
      id: "stable",
      name: "Stable",
      icon: ShieldCheckIcon,
      color: "text-blue-600 dark:text-blue-400",
      count: Array.isArray(stableCampaigns) ? stableCampaigns.length : 0,
    },
    {
      id: "moderate",
      name: "Moderate",
      icon: SparklesIcon,
      color: "text-yellow-600 dark:text-yellow-400",
      count: Array.isArray(moderateCampaigns) ? moderateCampaigns.length : 0,
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
    // 🔥 NEW: Handle new verdict categories
    if (
      category?.includes("champion") ||
      category?.includes("magnet") ||
      category?.includes("superstar")
    ) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    }
    if (
      category?.includes("solid") ||
      category?.includes("steady") ||
      category?.includes("performer")
    ) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    }
    if (
      category?.includes("building") ||
      category?.includes("developing") ||
      category?.includes("emerging")
    ) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    }
    if (category?.includes("struggling") || category?.includes("weak")) {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  const handleCampaignClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };

  const handleCloseCampaignDetails = () => {
    setShowCampaignDetails(false);
    setSelectedCampaign(null);
  };

  if (!hasActiveSubscription) {
    return (
      <AnimatePresence>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/10 dark:bg-purple-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          {/* Floating Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-20 text-purple-400/30 dark:text-purple-500/20">
              <ChartBarIcon className="w-8 h-8" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute top-40 right-32 text-pink-400/30 dark:text-pink-500/20">
              <SparklesIcon className="w-6 h-6" />
            </motion.div>
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
            }}
            className="relative z-10 text-center max-w-5xl mx-auto p-8">
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 dark:from-purple-400/10 dark:to-orange-400/10 rounded-3xl"></div>

              <div className="relative z-10">
                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-orange-600 to-pink-600 dark:from-purple-400 dark:via-orange-400 dark:to-pink-400 bg-clip-text text-transparent mb-3">
                  Unlock Advanced Analytics
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                  Upgrade to get AI-powered insights, smart campaign
                  categorization, and advanced performance analysis.
                </motion.p>

                {/* Basic vs Advanced Analytics Comparison */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-500/10 rounded-xl flex items-center justify-center">
                        <ChartBarIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">
                        Basic Analytics
                      </h3>
                    </div>

                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start space-x-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>Basic campaign overview</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>Standard metrics (CTR, CPC, Spend)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>Simple filtering options</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>Manual analysis required</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-700/30 relative">
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      PREMIUM
                    </div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24">
                          <path d="M12 2L13.09 8.26L20 9.27L13.09 10.28L12 16.54L10.91 10.28L4 9.27L10.91 8.26L12 2Z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300">
                        Advanced Analytics
                      </h3>
                    </div>

                    <ul className="space-y-3 text-sm text-purple-600 dark:text-purple-400">
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-500 mt-1">✓</span>
                        <span>AI campaign analysis & recommendations</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-500 mt-1">✓</span>
                        <span>Smart campaign categories</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-500 mt-1">✓</span>
                        <span>Individual campaign deep insights</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-purple-500 mt-1">✓</span>
                        <span>Advanced filtering & optimization tips</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>

                {/* Advanced Analytics Data Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700/30">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      1.8M+
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Total Impressions
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700/30">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                      45.4K
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Total Clicks
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-700/30">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                      ₹41K
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Total Spend
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700/30">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      2.50%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Average CTR
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl border border-pink-200 dark:border-pink-700/30">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">
                      171
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Conversion Actions
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl border border-indigo-200 dark:border-indigo-700/30">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      1.6M
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Total Reach
                    </div>
                  </div>
                </motion.div>

                {/* Advanced Analytics Features */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100/50 dark:border-purple-800/30">
                    <div className="w-10 h-10 bg-purple-500/10 dark:bg-purple-400/10 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        AI Performance Analysis
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Smart recommendations & cost optimization
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100/50 dark:border-green-800/30">
                    <div className="w-10 h-10 bg-green-500/10 dark:bg-green-400/10 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        Smart Campaign Categories
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Excellent, Stable, Moderate, Struggling
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50/80 to-yellow-50/80 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-100/50 dark:border-orange-800/30">
                    <div className="w-10 h-10 bg-orange-500/10 dark:bg-orange-400/10 rounded-lg flex items-center justify-center">
                      <EyeIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        Individual Campaign Insights
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Detailed breakdown with CTR, CPC & conversions
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                    <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        Advanced Filtering
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Search by date, status & performance metrics
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow:
                      "0 20px 25px -5px rgba(168, 85, 247, 0.4), 0 10px 10px -5px rgba(168, 85, 247, 0.2)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => dispatch(openPricingModal())}
                  className="group relative w-full px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

                  <div className="relative flex items-center justify-center space-x-3">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M12 2L13.09 8.26L20 9.27L13.09 10.28L12 16.54L10.91 10.28L4 9.27L10.91 8.26L12 2Z" />
                    </svg>
                    <span className="text-lg">Upgrade to Premium</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="ml-1">
                      →
                    </motion.div>
                  </div>
                </motion.button>

                {/* Premium Benefits */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="mt-6 p-4 bg-gradient-to-r from-purple-50/50 to-orange-50/50 dark:from-purple-900/20 dark:to-orange-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/30">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L13.09 8.26L20 9.27L13.09 10.28L12 16.54L10.91 10.28L4 9.27L10.91 8.26L12 2Z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Advanced Analytics Suite
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        View all campaigns, AI insights, performance categories,
                        and detailed campaign breakdowns with conversion data.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // If user has active subscription but no Facebook connection
  if (!hasFacebookConnection) {
    return (
      <AnimatePresence>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center relative overflow-hidden">
          {/* Same background and floating elements as above */}

          {/* Main Content for Facebook Connection */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
            }}
            className="relative z-10 text-center max-w-4xl mx-auto p-8">
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-3xl"></div>

              <div className="relative z-10">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-3">
                  Connect Meta & Access Premium Analytics 🚀
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                  Your premium subscription is active! Connect Meta to unlock
                  advanced campaign analytics and AI-powered insights.
                </motion.p>

                {/* Same premium features preview as above */}

                {/* Connect Facebook Button */}
                <motion.button
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow:
                      "0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router("/meta-campaign")}
                  className="group relative w-full px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

                  <div className="relative flex items-center justify-center space-x-3">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-lg">Connect Meta Account</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="ml-1">
                      →
                    </motion.div>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <>
      <AnimatePresence>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className=" mx-auto space-y-6 py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Advanced Campaign Analytics
                  </h1>
                  <div className="flex items-center space-x-4">
                    <p className="text-indigo-100">
                      Comprehensive insights into your Meta Ads performance
                    </p>
                    {loadingTotals && (
                      <div className="text-xs bg-white/20 px-2 py-1 rounded-full text-indigo-100">
                        Loading insights...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Add this Account Selector after your filters and before the analytics dashboard */}
            {hasFacebookConnection && (
              <div className="mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Select Ad Account
                  </h3>
                  {adAccounts.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 dark:text-gray-400">
                        Fetching your Meta ad accounts...
                      </p>
                    </div>
                  ) : (
                    <select
                      value={selectedAccount || ""}
                      onChange={(e) => handleAccountChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="">Select an account</option>
                      {adAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} (ID: {account.id})
                          {insightsLastUpdated[account.id] &&
                            ` - Updated: ${new Date(
                              insightsLastUpdated[account.id]
                            ).toLocaleTimeString()}`}
                        </option>
                      ))}
                    </select>
                  )}
                  {!selectedAccount && adAccounts.length > 0 && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Please select an ad account to view analytics.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
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
                <>
                  <div className="space-y-8">
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
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

                    {/* 🔥 NEW: Categories with your existing styling */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <FunnelIcon className="mr-2 text-purple-600 h-5 w-5" />
                        Campaign Categories
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
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

                      {/* Filters - using your existing grid layout */}
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
                          <option value="outcome_leads">Leads</option>
                          <option value="outcome_awareness">Awareness</option>
                          <option value="outcome_engagement">Engagement</option>
                          <option value="outcome_sales">Sales</option>
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
                                    onClick={() =>
                                      handleCampaignClick(campaign)
                                    }
                                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
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
                                        <div className="text-yellow-600">
                                          Lead:{" "}
                                          {campaign.totals?.actions?.lead ||
                                            campaign.totals?.total_leads ||
                                            0}
                                        </div>
                                      </div>
                                    </td>

                                    {/* Start Date */}
                                    <td className="px-4 py-4">
                                      <div className="text-sm text-gray-900 dark:text-white">
                                        {formatDate(campaign.start_time)}
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
                                <div key={index}>
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
                                </div>
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
                </>
              )}
              <HelpTooltip
                show={showHelpTooltip}
                message="How it works"
                onClose={() => setShowHelpTooltip(false)}
              />
              <FloatingHelpButton
                onClick={() => setIsHelpModalOpen(true)}
                help="Basic analytics Help"
              />
            </div>
            <AdvancedAnalyticsHelpModal
              isOpen={isHelpModalOpen}
              onClose={() => setIsHelpModalOpen(false)}
            />

            {/* Campaign Details Modal */}
            <AnalyticsDetailsModal
              isOpen={showCampaignDetails}
              onClose={handleCloseCampaignDetails}
              campaign={selectedCampaign}
              category={selectedCategory}
            />
          </div>
        </div>
      </AnimatePresence>
    </>
  );
};

export default AdvanceAnalyticsPage;
