/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
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
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchAdAccounts,
  fetchCampaigns,
  // fetchInsights,
  // fetchInsightsDebounced,
  setShowModal,
  setSelectedCampaignForModal,
  setSelectedAccount,
  clearAllData,
  invalidateInsightsCache,
  checkFacebookStatus,
} from "../../../store/features/facebookAdsSlice";
import { useNavigate } from "react-router-dom";
import HelpTooltip from "@/components/common/HelpTooltip";
import FloatingHelpButton from "@/components/common/FloatingHelpButton";
import BasicAnalyticsHelpModal from "@/components/modals/BasicAnalyticsHelpModal";
import CampaignModal from "@/components/model/CampaignModal";

const AnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useNavigate();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 NEW: Optimization tracking
  const [insightsRequested, setInsightsRequested] = useState(false);
  const accountChangeTimerRef = useRef<NodeJS.Timeout>();

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

  const {
    adAccounts,
    campaigns,
    overallTotals,
    selectedAccount,
    loadingTotals,
    loadingCampaigns,
    initialLoading,
    insightsLastUpdated,
  } = useAppSelector((state) => state.facebookAds);

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

  // 🔥 ENHANCED: Force fetch ad accounts when connected (includes page reload)
  useEffect(() => {
    if (hasFacebookConnection) {
      // Always fetch accounts if we don't have them
      if (adAccounts.length === 0) {
        console.log("🔄 Fetching ad accounts on page load...");
        dispatch(fetchAdAccounts());
      }
    }
  }, [dispatch, hasFacebookConnection, adAccounts.length]);

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

  // Load campaigns and insights when account is selected
  useEffect(() => {
    if (selectedAccount) {
      console.log(`🔄 Account selected: ${selectedAccount}`);
      // Always fetch campaigns (lightweight)
      dispatch(fetchCampaigns(selectedAccount));
      // Always fetch insights - let Redux handle caching
      // dispatch(fetchInsights(false)); // false means no force refresh
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
        // dispatch(fetchInsightsDebounced());
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

  // Formatting functions
  const formatCurrency = useCallback(
    (amount: number) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount),
    []
  );

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const getStatusColor = useCallback((status: string) => {
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
  }, []);

  const handleCampaignClick = useCallback(
    (campaign: any) => {
      if (!hasFacebookConnection) return;
      dispatch(setSelectedCampaignForModal(campaign));
      dispatch(setShowModal(true));
    },
    [dispatch, hasFacebookConnection]
  );

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
            // dispatch(fetchInsightsDebounced());
            setInsightsRequested(true);
          }
        }
      }, 300); // 300ms debounce for account changes
    },
    [dispatch, shouldLoadInsights, hasFacebookConnection]
  );

  const handleRefresh = useCallback(() => {
    if (hasFacebookConnection && selectedAccount) {
      console.log("🔄 Force refresh triggered");
      dispatch(fetchAdAccounts());
      dispatch(invalidateInsightsCache(selectedAccount));
      dispatch(fetchCampaigns(selectedAccount));
      // dispatch(fetchInsights(true)); // Force refresh
      toast({
        title: "Refreshing Data",
        description: "Fetching latest account information...",
      });
    }
  }, [selectedAccount, dispatch, toast, hasFacebookConnection]);

  // Filter and pagination logic
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];

    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.id.includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" ||
        campaign.status.toLowerCase() === statusFilter.toLowerCase();

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRangeStart, dateRangeEnd]);

  // Pagination handlers
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= paginationData.totalPages) {
        setCurrentPage(page);
      }
    },
    [paginationData.totalPages]
  );

  const handleFirstPage = useCallback(() => setCurrentPage(1), []);
  const handleLastPage = useCallback(
    () => setCurrentPage(paginationData.totalPages),
    [paginationData.totalPages]
  );
  const handlePrevPage = useCallback(
    () => setCurrentPage(Math.max(1, currentPage - 1)),
    [currentPage]
  );
  const handleNextPage = useCallback(
    () => setCurrentPage(Math.min(paginationData.totalPages, currentPage + 1)),
    [paginationData.totalPages, currentPage]
  );

  const getPageNumbers = useCallback(() => {
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
  }, [paginationData.totalPages, currentPage]);

  // Stats cards
  // const statsCards = useMemo(
  //   () => [
  //     {
  //       title: "Total Impressions",
  //       value: overallTotals?.impressions?.toLocaleString() || "0",
  //       icon: EyeIcon,
  //       color: "from-blue-500 to-blue-600",
  //       bgColor: "bg-blue-50 dark:bg-blue-900/20",
  //       textColor: "text-blue-600 dark:text-blue-400",
  //       change: "+12.5%",
  //       changeType: "up",
  //     },
  //     {
  //       title: "Total Clicks",
  //       value: overallTotals?.clicks?.toLocaleString() || "0",
  //       icon: CursorArrowRaysIcon,
  //       color: "from-emerald-500 to-emerald-600",
  //       bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
  //       textColor: "text-emerald-600 dark:text-emerald-400",
  //       change: "+8.3%",
  //       changeType: "up",
  //     },
  //     {
  //       title: "Total Reach",
  //       value: overallTotals?.reach?.toLocaleString() || "0",
  //       icon: UsersIcon,
  //       color: "from-purple-500 to-purple-600",
  //       bgColor: "bg-purple-50 dark:bg-purple-900/20",
  //       textColor: "text-purple-600 dark:text-purple-400",
  //       change: "+15.2%",
  //       changeType: "up",
  //     },
  //     {
  //       title: "Total Spend",
  //       value: overallTotals?.spend
  //         ? formatCurrency(overallTotals.spend)
  //         : "₹0",
  //       icon: CurrencyRupeeIcon,
  //       color: "from-orange-500 to-orange-600",
  //       bgColor: "bg-orange-50 dark:bg-orange-900/20",
  //       textColor: "text-orange-600 dark:text-orange-400",
  //       change: "+5.7%",
  //       changeType: "up",
  //     },
  //     {
  //       title: "Average CTR",
  //       value: overallTotals?.ctr ? `${overallTotals.ctr.toFixed(2)}%` : "0%",
  //       icon: ArrowTrendingUpIcon,
  //       color: "from-indigo-500 to-indigo-600",
  //       bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
  //       textColor: "text-indigo-600 dark:text-indigo-400",
  //       change: "+2.1%",
  //       changeType: "up",
  //     },
  //     {
  //       title: "Average CPC",
  //       value: overallTotals?.cpc ? formatCurrency(overallTotals.cpc) : "₹0",
  //       icon: CurrencyRupeeIcon,
  //       color: "from-pink-500 to-pink-600",
  //       bgColor: "bg-pink-50 dark:bg-pink-900/20",
  //       textColor: "text-pink-600 dark:text-pink-400",
  //       change: "-1.2%",
  //       changeType: "down",
  //     },
  //   ],
  //   [overallTotals, formatCurrency]
  // );

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (accountChangeTimerRef.current) {
        clearTimeout(accountChangeTimerRef.current);
      }
    };
  }, []);

  if (!hasFacebookConnection) {
    return (
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
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-20 text-blue-400/30 dark:text-blue-500/20">
            <ChartBarIcon className="w-8 h-8" />
          </motion.div>
          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-40 right-32 text-indigo-400/30 dark:text-indigo-500/20">
            <EyeIcon className="w-6 h-6" />
          </motion.div>
          <motion.div
            animate={{
              y: [0, -25, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-32 left-32 text-purple-400/30 dark:text-purple-500/20">
            <CursorArrowRaysIcon className="w-7 h-7" />
          </motion.div>
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute bottom-20 right-20 text-blue-400/30 dark:text-blue-500/20">
            <UsersIcon className="w-6 h-6" />
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
          className="relative z-10 text-center max-w-4xl mx-auto p-8">
          {/* Glass Card Container */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-10 relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-3xl"></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3">
                Connect Meta & Unlock Your Data 🚀
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
                View your complete campaign performance with real numbers that
                matter for your business growth.
              </motion.p>

              {/* What You'll See - Dashboard Overview */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {/* Total Impressions */}
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    390K+
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Total Impressions
                  </div>
                </div>

                {/* Total Clicks */}
                <div className="p-4 bg-green-50/50 dark:bg-green-900/20 rounded-xl border border-green-100/50 dark:border-green-800/30">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    2.5K
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Total Clicks
                  </div>
                </div>

                {/* Total Spend */}
                <div className="p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-xl border border-purple-100/50 dark:border-purple-800/30">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    ₹59K
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Total Spend
                  </div>
                </div>

                {/* Average CTR */}
                <div className="p-4 bg-orange-50/50 dark:bg-orange-900/20 rounded-xl border border-orange-100/50 dark:border-orange-800/30">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    1.49%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Average CTR
                  </div>
                </div>

                {/* Average CPC */}
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    ₹29
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Average CPC
                  </div>
                </div>

                {/* Total Reach */}
                <div className="p-4 bg-teal-50/50 dark:bg-teal-900/20 rounded-xl border border-teal-100/50 dark:border-teal-800/30">
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                    387K
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Total Reach
                  </div>
                </div>
              </motion.div>

              {/* Features You Get */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                  <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                      Complete Campaign Analytics
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      All campaigns, ad sets & individual ads data
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100/50 dark:border-green-800/30">
                  <div className="w-10 h-10 bg-green-500/10 dark:bg-green-400/10 rounded-lg flex items-center justify-center">
                    <EyeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                      Advanced Filtering & Search
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Filter by date, status, performance & more
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100/50 dark:border-purple-800/30">
                  <div className="w-10 h-10 bg-purple-500/10 dark:bg-purple-400/10 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                      Detailed Campaign Insights
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      CTR, CPC, conversions, lead costs & actions
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50/80 to-yellow-50/80 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-100/50 dark:border-orange-800/30">
                  <div className="w-10 h-10 bg-orange-500/10 dark:bg-orange-400/10 rounded-lg flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                      Multi-Account Management
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Switch between ad accounts seamlessly
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 20px 25px -5px rgba(99, 102, 241, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router("/meta-campaign")}
                className="group relative w-full px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Button shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

                {/* Button content */}
                <div className="relative flex items-center justify-center space-x-3">
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-lg">Connect & View My Data</span>
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

              {/* Security Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="mt-6 p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl border border-gray-200/50 dark:border-gray-600/30">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Read-Only Access
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      We only read your campaign data for analytics. Your ads,
                      budgets, and settings remain completely under your
                      control.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className=" mx-auto space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Meta Ads Analytics Dashboard
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
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={loadingTotals || loadingCampaigns}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2 disabled:opacity-50">
                  <ArrowPathIcon
                    className={`h-5 w-5 ${
                      loadingTotals || loadingCampaigns ? "animate-spin" : ""
                    }`}
                  />
                  <span>
                    {loadingTotals || loadingCampaigns
                      ? "Refreshing..."
                      : "Refresh"}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* 🔥 ENHANCED: Account selector with auto-selection indicator */}
          {adAccounts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Ad Account
                </label>
                {selectedAccount && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                    Auto-Selected
                  </span>
                )}
              </div>
              <select
                value={selectedAccount || ""}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loadingCampaigns}>
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
              {loadingCampaigns && (
                <p className="text-sm text-gray-500 mt-2">
                  Loading campaigns...
                </p>
              )}
            </div>
          )}

          {/* 🔥 ENHANCED: Proper loading states */}
          {selectedAccount ? (
            <>
              {/* Stats Cards */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statsCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${card.bgColor} backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-r ${card.color}`}>
                        <card.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span
                          className={`text-sm font-medium ${
                            card.changeType === "up"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}>
                          {card.change}
                        </span>
                        {card.changeType === "up" ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                        {card.title}
                      </p>
                      <p className={`text-2xl font-bold ${card.textColor}`}>
                        {loadingTotals ? "Loading..." : card.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div> */}

              {/* Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FunnelIcon className="mr-2 text-purple-600 h-5 w-5" />
                    Filter Campaigns
                  </h3>
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
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Clear All
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="archived">Archived</option>
                  </select>
                  <input
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Campaign Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <ChartBarIcon className="mr-2 text-indigo-600 h-5 w-5" />
                    Campaign Performance
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Click on any campaign to view detailed insights
                  </p>
                </div>

                {loadingCampaigns ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Loading campaigns...
                      </p>
                    </div>
                  </div>
                ) : paginationData.currentPageCampaigns.length > 0 ? (
                  <>
                    {/* Pagination Info */}
                    <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
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

                    {/* Table */}
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
                          {paginationData.currentPageCampaigns.map(
                            (campaign, index) => (
                              <motion.tr
                                key={campaign.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => handleCampaignClick(campaign)}
                                className="hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                                    {campaign.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    ID: {campaign.id}
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
                                  {formatDate(campaign.start_time)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {campaign.stop_time
                                    ? formatDate(campaign.stop_time)
                                    : "Ongoing"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {campaign.objective?.replace(
                                    "OUTCOME_",
                                    ""
                                  ) || "N/A"}
                                </td>
                              </motion.tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {paginationData.totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
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
                  </>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setDateRangeStart("");
                          setDateRangeEnd("");
                        }}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Clear Filters
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : adAccounts.length > 0 ? (
            // Show account selector when accounts are loaded but none selected
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select Ad Account
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please select an ad account to view analytics.
              </p>
            </div>
          ) : initialLoading ? (
            // Show loading when data is being fetched
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Loading Ad Accounts
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fetching your Meta ad accounts...
              </p>
            </div>
          ) : (
            // Show message when no accounts found
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Ad Accounts Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No ad accounts available. Please check your Meta Business
                connection.
              </p>
            </div>
          )}
        </motion.div>
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
      <CampaignModal />

      <BasicAnalyticsHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </>
  );
};

export default AnalyticsPage;
