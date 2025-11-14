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
  StarIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import AnalyticsDetailsModal from "@/components/model/AnalyticsDetailsModal";
import { useNavigate } from "react-router-dom";
import { openPricingModal } from "../../../store/features/pricingModalSlice";
import HelpTooltip from "@/components/common/HelpTooltip";
import FloatingHelpButton from "@/components/common/FloatingHelpButton";
import AdvancedAnalyticsHelpModal from "@/components/modals/AdvancedAnalyticsHelpModal";
// Add these imports
import ExportOptionsModal, {
  ExportOptions,
} from "@/components/modals/ExportOptionsModal";
import {
  openExportModal,
  closeExportModal,
  fetchAdAccounts,
  setSelectedAccount,
  fetchCampaigns,
  checkFacebookStatus,
  clearCache,
  fetchInsightsDebounced,
} from "../../../store/features/facebookAdsSlice";
import { useToast } from "@/hooks/use-toast";
import { Download, RefreshCw } from "lucide-react";
import { CustomDropdown } from "@/components/common/CustomDropdown";

const AdvanceAnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const { toast } = useToast();
  const exportModal = useAppSelector((state) => state.facebookAds.exportModal);
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
  const [isAIRunning, setIsAIRunning] = useState(false);

  // Add this state for export loading
  const [isExporting, setIsExporting] = useState(false);

  const [insightsRequested, setInsightsRequested] = useState(false);
  // Add this state after your existing state declarations
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  // Add these selectors
  const {
    adAccounts,
    selectedAccount,
    dateFilter, // 🔥 ADD THIS
    customDateRange, // 🔥 ADD THIS
    insightsCache,
  } = useAppSelector((state) => state.facebookAds);

  // 🔥 Generate cache key
  const aiCacheKey = useMemo(() => {
    if (!selectedAccount) return null;
    return `${selectedAccount}_${dateFilter}_${
      customDateRange.since || "none"
    }_${customDateRange.until || "none"}_AI_ON`;
  }, [selectedAccount, dateFilter, customDateRange]);

  // 🔥 Check if we have valid cached data
  const hasValidCache = useMemo(() => {
    if (!aiCacheKey || !insightsCache[aiCacheKey]) {
      return false;
    }

    const cacheEntry = insightsCache[aiCacheKey];
    const ageMs = Date.now() - cacheEntry.timestamp;
    const CACHE_DURATION_MS = 12 * 60 * 60 * 1000;

    return ageMs < CACHE_DURATION_MS;
  }, [aiCacheKey, insightsCache]);

  useEffect(() => {
    if (!selectedAccount) return;

    console.log("🔍 AdvanceAnalytics mounted/updated");
    console.log("📊 Selected Account:", selectedAccount);
    console.log("🗝️ Cache Key:", aiCacheKey);
    console.log("💾 Has Valid Cache:", hasValidCache);

    // Reset request flag when account/filters change
    setInsightsRequested(false);
  }, [selectedAccount, dateFilter, customDateRange]);

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

  // Only run when component is mounted (page is active)
  useEffect(() => {
    if (selectedAccount) {
      console.log(`🔄 Account selected: ${selectedAccount}`);
      dispatch(fetchCampaigns(selectedAccount));
      // 🔥 Reset insights requested when account changes
      setInsightsRequested(false);
    }
  }, [selectedAccount, dispatch]);

  const shouldLoadInsights = useMemo(() => {
    return selectedAccount !== null; // ✅ Simple and works!
  }, [selectedAccount]);
  // 🔥 Reset insights requested when component mounts
  useEffect(() => {
    console.log(
      "📍 AdvanceAnalytics component mounted, resetting insights state"
    );
    setInsightsRequested(false);
  }, []); // Run only once on mount

  // 🔥 SIMPLIFIED: Use existing Redux loadingTotals state
  useEffect(() => {
    if (selectedAccount && !insightsRequested && !loadingTotals) {
      console.log("🔄 AdvanceAnalytics: Loading insights for", selectedAccount);

      // // Generate AI cache key
      // const aiCacheKey = `${selectedAccount}_${dateFilter}_${
      //   customDateRange.since || "none"
      // }_${customDateRange.until || "none"}_AI_ON`;
      // const hasAICache = insightsCache && insightsCache[aiCacheKey];

      console.log(
        "🔍 AI Cache check:",
        hasValidCache ? "✅ FOUND" : "❌ NOT FOUND"
      );

      if (!hasValidCache) {
        console.log("⚠️ No AI cache, running AI analysis...");

        // 🔥 Show toast for long-running AI
        toast({
          title: "🤖 AI Analysis Started",
          description:
            "This may take 30-60 seconds. Feel free to navigate away.",
          duration: 5000,
        });

        // Force AI run
        dispatch(
          fetchInsightsDebounced({
            forceRefresh: true,
            enableAI: true,
          })
        )
          .unwrap()
          .then(() => {
            console.log("✅ AI analysis completed!");
            toast({
              title: "✅ AI Analysis Complete",
              description: "Your campaign insights are ready!",
            });
          })
          .catch((error: any) => {
            console.error("❌ AI analysis failed:", error);
            toast({
              title: "❌ Analysis Failed",
              description: error?.message || "Please try again",
              variant: "destructive",
            });
          });
      } else {
        console.log("✅ Using existing AI cache...");
        // Use existing cache
        dispatch(
          fetchInsightsDebounced({
            forceRefresh: false,
            enableAI: true,
          })
        );
      }

      setInsightsRequested(true);
    }
  }, [
    selectedAccount,
    insightsRequested,
    loadingTotals,
    dispatch,
    dateFilter,
    customDateRange,
    hasValidCache,
    toast,
  ]);

  // 🔥 Reset when leaving page
  useEffect(() => {
    return () => {
      console.log("📍 Leaving AdvanceAnalytics - resetting insights state");
      setInsightsRequested(false);
    };
  }, []);
  // 🔥 Reset on unmount
  useEffect(() => {
    return () => {
      console.log("📍 AdvanceAnalytics unmounting");
      setInsightsRequested(false);
    };
  }, []);

  // 🔥 Reset when account changes
  useEffect(() => {
    setInsightsRequested(false);
  }, [selectedAccount]);

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
            dispatch(
              fetchInsightsDebounced({
                forceRefresh: false,
                enableAI: true, // 🔥 YES AI for analytics page
              })
            );
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

  // 🔥 ADD THIS: Detect AI running based on loading state
  useEffect(() => {
    // Assume AI is running if loading takes more than 2 seconds
    if (loadingTotals) {
      const timer = setTimeout(() => {
        setIsAIRunning(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsAIRunning(false);
    }
  }, [loadingTotals]);

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

  // 🔥 NEW: Force refresh handler - bypasses cache
  const handleForceRefresh = () => {
    if (!selectedAccount) {
      toast({
        title: "No Account Selected",
        description: "Please select an ad account first.",
        variant: "destructive",
      });
      return;
    }

    console.log("🔄 User triggered force refresh");

    // Dispatch with forceRefresh flag
    dispatch(
      fetchInsightsDebounced({
        forceRefresh: true,
        enableAI: true,
      })
    );

    toast({
      title: "Refreshing Data",
      description:
        "Fetching fresh insights from Meta and running AI analysis...",
    });
  };

  // 🔥 NEW: Clear all cache handler
  const handleClearAllCache = () => {
    dispatch(clearCache("all"));

    toast({
      title: "Cache Cleared",
      description:
        "All cached insights have been cleared. Fresh data will be fetched on next load.",
    });

    console.log("🗑️ User cleared all cache");
  };

  // 🔥 NEW: Clear current account cache
  const handleClearAccountCache = () => {
    if (!selectedAccount) {
      toast({
        title: "No Account Selected",
        description: "Please select an ad account first.",
        variant: "destructive",
      });
      return;
    }

    dispatch(clearCache(selectedAccount));

    toast({
      title: "Account Cache Cleared",
      description: `Cache cleared for current account. Fresh data will be fetched on next load.`,
    });

    console.log(`🗑️ User cleared cache for account: ${selectedAccount}`);
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

  const getFilteredCampaigns = () => {
    return filteredCampaigns;
  };

  // const handleExportData = async (options: ExportOptions) => {
  //   try {
  //     setIsExporting(true);
  //     console.log("🚀 ========== EXPORT STARTED ==========");
  //     console.log("📋 Export options:", options);

  //     if (!selectedAccount) {
  //       console.error("❌ No ad account selected");
  //       toast({
  //         title: "Error",
  //         description: "Please select an ad account first.",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     const filteredCampaigns = getFilteredCampaigns();
  //     console.log(`📊 Filtered campaigns count: ${filteredCampaigns.length}`);
  //     console.log(
  //       "📊 Campaign Analysis available:",
  //       campaignAnalysis?.length || 0
  //     );
  //     toast({
  //       title: "Analyzing",
  //       description: `Analyzing all campaign it may take some time!`,
  //       variant: "info",
  //     });

  //     if (filteredCampaigns.length === 0) {
  //       console.error("❌ No campaigns to export");
  //       toast({
  //         title: "Error",
  //         description: "No campaigns available to export.",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     console.log("🔄 Starting campaign data mapping...");

  //     // 🔥 Map campaigns with full data from Redux
  //     const campaignsToExport = filteredCampaigns.map(
  //       (campaign: any, index: number) => {
  //         console.log(
  //           `\n--- Campaign ${index + 1}/${filteredCampaigns.length}: ${
  //             campaign.name
  //           } ---`
  //         );

  //         // Find matching campaign WITH insights and AI/verdict data
  //         const fullCampaignData = campaignAnalysis?.find(
  //           (c: any) => c.id === campaign.id
  //         );

  //         if (!fullCampaignData) {
  //           console.warn(`⚠️ No full data for campaign: ${campaign.name}`);
  //           return {
  //             id: campaign.id,
  //             name: campaign.name,
  //             status: campaign.status,
  //             objective: campaign.objective,
  //             start_time: campaign.start_time,
  //             stop_time: campaign.stop_time,
  //           };
  //         }

  //         // Check data availability - STRICT checks!
  //         const hasAIVerdict =
  //           fullCampaignData.ai_verdict !== undefined &&
  //           fullCampaignData.ai_verdict !== null &&
  //           fullCampaignData.ai_verdict !== "";

  //         const hasRuleVerdict =
  //           fullCampaignData.verdict !== undefined &&
  //           fullCampaignData.verdict !== null;

  //         const hasMetrics = !!fullCampaignData.totals;

  //         console.log("  ✅ Full data found!");
  //         console.log("  📊 Has Metrics:", hasMetrics);
  //         console.log("  🤖 Has AI Verdict:", hasAIVerdict);
  //         console.log("  📋 Has Rule Verdict:", hasRuleVerdict);

  //         // Log actual values for debugging
  //         if (hasAIVerdict) {
  //           console.log("  🤖 AI Verdict value:", fullCampaignData.ai_verdict);
  //         }

  //         if (hasRuleVerdict) {
  //           console.log("  📋 Rule Verdict value:", fullCampaignData.verdict);
  //         }

  //         // Build export object
  //         const campaignData = fullCampaignData as any;
  //         const exportData: any = {
  //           id: campaignData.id,
  //           name: campaignData.name,
  //           status: campaignData.status,
  //           objective: campaignData.objective,
  //           start_time: campaignData.start_time,
  //           stop_time: campaignData.stop_time,
  //           daily_budget: campaignData.daily_budget,
  //           lifetime_budget: campaignData.lifetime_budget,

  //           // Include ALL totals/metrics
  //           totals: campaignData.totals,

  //           // Include KPI fields from totals if available
  //           totalSpend: campaignData.totals?.spend || 0,
  //           totalImpressions: campaignData.totals?.impressions || 0,
  //           totalClicks: campaignData.totals?.clicks || 0,
  //           totalReach: campaignData.totals?.reach || 0,
  //           avgCTR: campaignData.totals?.ctr || 0,
  //           avgCPM: campaignData.totals?.cpm || 0,
  //           avgCPC: campaignData.totals?.cpc || 0,
  //           totalPurchases: campaignData.totals?.actions?.purchase || 0,
  //           totalAddToCart: campaignData.totals?.actions?.add_to_cart || 0,
  //           totalConversions: campaignData.totals?.total_conversions || 0,
  //         };

  //         // 🔥 Add AI verdict if truly available
  //         if (hasAIVerdict) {
  //           console.log("  ✅ Adding AI verdict to export");
  //           exportData.aiverdict = campaignData.ai_verdict;
  //           exportData.aianalysis =
  //             campaignData.ai_analysis || "No analysis available";
  //           exportData.airecommendations =
  //             campaignData.ai_recommendations || "No recommendations available";
  //           console.log("  📤 AI Verdict exported:", exportData.aiverdict);
  //         }
  //         // 🔥 FALLBACK: Use rule-based verdict
  //         else if (hasRuleVerdict) {
  //           console.log("  ✅ Using rule verdict as AI verdict for export");

  //           const verdictCategory = campaignData.verdict?.category || "unknown";
  //           const verdictDescription =
  //             campaignData.verdict?.description || "Performance level: unknown";

  //           exportData.aiverdict = verdictDescription;
  //           exportData.aianalysis = `Rule-based analysis: This campaign is classified as "${verdictCategory}". ${verdictDescription}. Based on current metrics, this campaign requires attention.`;
  //           exportData.airecommendations = `Review campaign ${
  //             verdictCategory === "underperforming" ? "urgently" : "regularly"
  //           } and consider optimization strategies such as adjusting targeting, creative, or budget allocation.`;

  //           console.log("  📤 Rule Verdict exported:", exportData.aiverdict);
  //         } else {
  //           console.warn("  ⚠️ NO VERDICT DATA AVAILABLE!");
  //           console.warn(
  //             "  🔍 Available keys:",
  //             Object.keys(campaignData).join(", ")
  //           );

  //           // Fallback for no verdict
  //           exportData.aiverdict = "No verdict available";
  //           exportData.aianalysis = "Insufficient data for analysis";
  //           exportData.airecommendations =
  //             "Ensure campaign has sufficient data and is properly configured";
  //         }

  //         // Include verdict object for backend reference
  //         if (hasRuleVerdict) {
  //           exportData.verdict = campaignData.verdict;
  //         }

  //         return exportData;
  //       }
  //     );

  //     // Summary logs
  //     const campaignsWithMetrics = campaignsToExport.filter((c) => c.totals);
  //     const campaignsWithVerdict = campaignsToExport.filter(
  //       (c) => c.aiverdict && c.aiverdict !== "No verdict available"
  //     );

  //     console.log("\n📊 ========== EXPORT SUMMARY ==========");
  //     console.log(`  Total campaigns: ${campaignsToExport.length}`);
  //     console.log(`  With metrics: ${campaignsWithMetrics.length}`);
  //     console.log(`  With verdict: ${campaignsWithVerdict.length}`);
  //     console.log("======================================\n");

  //     // Build payload
  //     const exportPayload = {
  //       campaigns: campaignsToExport,
  //       adAccountId: selectedAccount,
  //       adAccountName:
  //         adAccounts.find((acc) => acc.id === selectedAccount)?.name ||
  //         selectedAccount,
  //       date_start: dateRangeStart || undefined,
  //       date_stop: dateRangeEnd || undefined,
  //       exportOptions: options,
  //     };
  //     toast({
  //       title: "Generating",
  //       description: `Generating Excel file it may take some time!`,
  //       variant: "info",
  //     });
  //     console.log("📤 Sending export request to backend...");
  //     console.log("  Account:", exportPayload.adAccountName);
  //     console.log("  Campaigns:", exportPayload.campaigns.length);
  //     console.log("  Options:", exportPayload.exportOptions);

  //     const response = await fetch(
  //       `${
  //         import.meta.env.VITE_INTEREST_MINER_API_URL
  //       }/api/export-filtered-campaigns`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //         body: JSON.stringify(exportPayload),
  //       }
  //     );

  //     console.log("📥 Response status:", response.status);

  //     if (!response.ok) {
  //       let errorMessage = "Export failed";
  //       const contentType = response.headers.get("content-type");

  //       if (contentType && contentType.includes("application/json")) {
  //         try {
  //           const errorData = await response.json();
  //           errorMessage = errorData.error || errorMessage;
  //           console.error("❌ Backend error (JSON):", errorData);
  //         } catch (e) {
  //           console.error("Failed to parse error response:", e);
  //         }
  //       } else {
  //         const text = await response.text();
  //         console.error("❌ Backend error (HTML):", text.substring(0, 500));
  //         errorMessage = `Server error (${response.status})`;
  //       }

  //       throw new Error(errorMessage);
  //     }

  //     // Download the file
  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.style.display = "none";
  //     a.href = url;

  //     const contentDisposition = response.headers.get("Content-Disposition");
  //     const filename = contentDisposition
  //       ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
  //       : `MetaAdsExport_${new Date().toISOString().split("T")[0]}.xlsx`;

  //     a.download = filename;
  //     document.body.appendChild(a);
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //     document.body.removeChild(a);

  //     console.log("✅ Export successful! File:", filename);
  //     console.log("🚀 ========== EXPORT COMPLETE ==========\n");

  //     toast({
  //       title: "Success",
  //       description: `Successfully exported ${filteredCampaigns.length} campaigns!`,
  //     });
  //   } catch (error: any) {
  //     console.error("❌ ========== EXPORT FAILED ==========");
  //     console.error("Error:", error);
  //     console.error("Stack:", error.stack);

  //     toast({
  //       title: "Export Failed",
  //       description: error.message || "An unexpected error occurred",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsExporting(false);
  //     dispatch(closeExportModal());
  //   }
  // };

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
          {/* Background Decorations */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated gradient orbs */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-400/30 dark:bg-blue-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-400/30 dark:bg-purple-500/20 rounded-full blur-3xl"
            />

            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                className="absolute w-2 h-2 bg-blue-500/20 dark:bg-blue-400/30 rounded-full"
              />
            ))}
          </div>

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
            <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-10 relative overflow-hidden">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-3xl"></div>

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 1, delay: 0.3 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl mb-6">
                  <svg
                    className="w-10 h-10 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                  Connect Meta & Access Premium Analytics
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
                  Your premium subscription is active! Connect Meta to unlock
                  advanced campaign analytics and AI-powered insights.
                </motion.p>

                {/* Features Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {[
                    {
                      icon: "📊",
                      title: "Advanced Analytics",
                      desc: "Deep campaign insights",
                    },
                    {
                      icon: "🤖",
                      title: "AI Recommendations",
                      desc: "Smart optimization tips",
                    },
                    {
                      icon: "📈",
                      title: "Real-time Data",
                      desc: "Live performance tracking",
                    },
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + idx * 0.1 }}
                      whileHover={{ y: -5, scale: 1.05 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-5 border border-blue-200 dark:border-blue-800/50">
                      <div className="text-3xl mb-2">{feature.icon}</div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {feature.desc}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Connect Facebook Button */}
                <motion.button
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow:
                      "0 20px 25px -5px rgba(59, 130, 246, 0.4), 0 10px 10px -5px rgba(59, 130, 246, 0.2)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router("/meta-campaign")}
                  className="group relative w-full max-w-md mx-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

                  <div className="relative flex items-center justify-center space-x-3">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-lg">Connect Meta Account</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-xl">
                      →
                    </motion.div>
                  </div>
                </motion.button>

                {/* Help Text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                  Secure connection via Meta OAuth - Your data is encrypted
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // if (hasValidCache) {
  //   return (
  //     <AnimatePresence>
  //       <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
  //         ✅ Showing cached AI analysis. Cache expires in{" "}
  //         {(() => {
  //           if (!aiCacheKey || !insightsCache[aiCacheKey]) return "0";
  //           const cacheEntry = insightsCache[aiCacheKey];
  //           const ageMs = Date.now() - cacheEntry.timestamp;
  //           const remainingHours = 12 - ageMs / (60 * 60 * 1000);
  //           return remainingHours.toFixed(1);
  //         })()}{" "}
  //         hours.
  //       </div>
  //     </AnimatePresence>
  //   );
  // }

  return (
    <>
      <AnimatePresence>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className=" mx-auto space-y-6 py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl p-6 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Advanced Campaign Analytics
                  </h1>
                  <div className="flex items-center space-x-4">
                    <p className="text-indigo-100">
                      Comprehensive insights into your Meta Ads performance
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Account Selector - No gap, rounded bottom */}
            {hasFacebookConnection && (
              <div className="bg-white dark:bg-gray-800 rounded-b-xl p-6 shadow-sm relative">
                {/* Shimmer overlay when loading */}
                {adAccounts.length === 0 && (
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent"></div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                  {adAccounts.length === 0 ? (
                    // Skeleton Loading State
                    <div className="space-y-2 flex-1">
                      {/* Skeleton label */}
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </div>

                      {/* Skeleton dropdown */}
                      <div className="relative">
                        <div className="w-full h-14 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl animate-pulse"></div>

                        {/* Spinner overlay */}
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                          <svg
                            className="animate-spin h-4 w-4 text-gray-500 dark:text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Fetching accounts...
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Real Custom Dropdown
                    <div className="flex-1">
                      <CustomDropdown
                        label="Ad Account"
                        options={adAccounts.map((acc) => ({
                          id: acc.id,
                          name: acc.name,
                        }))}
                        value={selectedAccount}
                        onChange={handleAccountChange}
                        placeholder="Select an ad account"
                        isDarkMode={isDarkMode}
                        colorScheme="purple"
                      />

                      {!selectedAccount && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            Please select an ad account to view analytics
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {loadingTotals ? (
                <div className="space-y-6">
                  {/* Clean Loading Message */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Analyzing Your Campaigns
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Please wait while we process your data...
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Shimmer Skeleton Cards - Premium Version */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                        <div className="space-y-4">
                          {/* Icon + Badge */}
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse"></div>
                            <div className="w-20 h-7 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full animate-pulse"></div>
                          </div>

                          {/* Text lines */}
                          <div className="space-y-3">
                            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-2/3 animate-pulse"></div>
                            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1/2 animate-pulse"></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Shimmer Skeleton Table - Premium Version */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden relative">
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    <div className="p-6 space-y-6">
                      {/* Table Header */}
                      <div className="flex items-center justify-between">
                        <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-48 animate-pulse"></div>
                        <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 animate-pulse"></div>
                      </div>

                      {/* Table Rows */}
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <div key={i} className="flex items-center space-x-4">
                            {/* Checkbox */}
                            <div className="w-5 h-5 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>

                            {/* Campaign Name */}
                            <div
                              className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"
                              style={{
                                width: `${Math.random() * 40 + 30}%`,
                              }}></div>

                            {/* Metrics */}
                            <div className="flex-1 flex justify-end space-x-4">
                              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-16 animate-pulse"></div>
                              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-20 animate-pulse"></div>
                              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-20 animate-pulse"></div>
                              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-24 animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination skeleton */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 animate-pulse"></div>
                        <div className="flex space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <>
                  <div className="space-y-8">
                    {/* Overall Performance Stats */}
                    {statsCards.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <ChartBarIcon className="mr-2 text-indigo-600 h-5 w-5" />
                          Overall Performance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {statsCards.map((card, index) => (
                            <motion.div
                              key={card.title} // 🔥 Stable key
                              layoutId={`stat-card-${card.title}`} // 🔥 Prevents flicker
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: index * 0.05,
                                duration: 0.3,
                                ease: "easeOut",
                                layout: { duration: 0.3 }, // 🔥 Smooth layout changes
                              }}
                              className={`${card.bgColor} backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer group relative overflow-hidden`}>
                              {/* 🔥 Subtle gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                              <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                  <motion.div
                                    layoutId={`icon-${card.title}`} // 🔥 Smooth icon transitions
                                    className={`p-3 rounded-lg bg-gradient-to-br ${card.color} shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                                    <card.icon className="h-6 w-6 text-white" />
                                  </motion.div>
                                </div>

                                <div>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2 uppercase tracking-wide">
                                    {card.title}
                                  </p>
                                  <motion.p
                                    layoutId={`value-${card.title}`} // 🔥 Smooth value transitions
                                    className={`text-3xl font-bold ${card.textColor}`}>
                                    {card.value}
                                  </motion.p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Stats */}
                    {actionStats.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <BanknotesIcon className="mr-2 text-green-600 h-5 w-5" />
                          Conversion Actions
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {actionStats.map((stat, index) => (
                            <motion.div
                              key={stat.title}
                              layoutId={`action-stat-${stat.title}`} // 🔥 Prevents flicker
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                delay: index * 0.05,
                                duration: 0.3,
                                ease: "easeOut",
                                layout: { duration: 0.3 }, // 🔥 Smooth layout changes
                              }}
                              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden">
                              {/* 🔥 Subtle gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                              {/* 🔥 Animated shine effect on hover */}
                              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>

                              <div className="relative z-10">
                                {/* Icon */}
                                <motion.div
                                  layoutId={`action-icon-${stat.title}`} // 🔥 Smooth icon transitions
                                  className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                                  <stat.icon className="h-5 w-5 text-white" />
                                </motion.div>

                                {/* Value */}
                                <motion.p
                                  layoutId={`action-value-${stat.title}`} // 🔥 Smooth value transitions
                                  className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                  {stat.value}
                                </motion.p>

                                {/* Title */}
                                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-medium">
                                  {stat.title}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* 🔥 NEW: Categories with your existing styling */}
                    <div className="mb-8">
                      {/* Campaign Categories */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <FunnelIcon className="mr-2 text-purple-600 h-5 w-5" />
                          Campaign Categories
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          {categories.map((category, index) => (
                            <motion.button
                              key={category.id}
                              layoutId={`category-${category.id}`}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                delay: index * 0.05,
                                duration: 0.3,
                                ease: "easeOut",
                              }}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedCategory(category.id)}
                              className={`p-4 rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden group ${
                                selectedCategory === category.id
                                  ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 shadow-indigo-200 dark:shadow-indigo-900/50"
                                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700"
                              }`}>
                              {/* Shine effect */}
                              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>

                              <div className="relative z-10">
                                {/* Icon */}
                                <div
                                  className={`h-8 w-8 mx-auto mb-2 transition-transform duration-300 ${
                                    selectedCategory === category.id
                                      ? "scale-110"
                                      : "group-hover:scale-110"
                                  }`}>
                                  <category.icon
                                    className={`h-8 w-8 ${category.color}`}
                                  />
                                </div>

                                {/* Name */}
                                <p
                                  className={`text-sm font-semibold mb-1 transition-colors ${
                                    selectedCategory === category.id
                                      ? "text-indigo-700 dark:text-indigo-300"
                                      : "text-gray-900 dark:text-white"
                                  }`}>
                                  {category.name}
                                </p>

                                {/* Count Badge */}
                                <div
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                    selectedCategory === category.id
                                      ? "bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200"
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                  }`}>
                                  {category.count}{" "}
                                  {category.count === 1
                                    ? "campaign"
                                    : "campaigns"}
                                </div>

                                {/* Selected indicator */}
                                {selectedCategory === category.id && (
                                  <motion.div
                                    layoutId="selected-category-indicator"
                                    className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 30,
                                    }}>
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </motion.div>
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Filters Section - Enhanced */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                            Filters
                          </h4>
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
                              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center transition-colors group">
                              <XMarkIcon className="h-3 w-3 mr-1 group-hover:rotate-90 transition-transform" />
                              Clear all
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                          {/* Search - Enhanced */}
                          <div className="relative lg:col-span-2">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors" />
                            <input
                              type="text"
                              placeholder="Search campaigns..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 w-full placeholder:text-gray-400 transition-all shadow-sm focus:shadow-md"
                            />
                            {searchTerm && (
                              <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Status Filter - Enhanced */}
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 transition-all shadow-sm focus:shadow-md appearance-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500">
                            <option value="all">📊 All Status</option>
                            <option value="active">✅ Active</option>
                            <option value="paused">⏸️ Paused</option>
                            <option value="archived">📦 Archived</option>
                          </select>

                          {/* Objective Filter - Enhanced */}
                          <select
                            value={objectiveFilter}
                            onChange={(e) => setObjectiveFilter(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 transition-all shadow-sm focus:shadow-md appearance-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500">
                            <option value="all">🎯 All Objectives</option>
                            <option value="outcome_leads">🎯 Leads</option>
                            <option value="outcome_awareness">
                              📢 Awareness
                            </option>
                            <option value="outcome_engagement">
                              💬 Engagement
                            </option>
                            <option value="outcome_sales">💰 Sales</option>
                          </select>

                          {/* Date Range - Enhanced */}
                          <div className="relative">
                            <input
                              type="date"
                              value={dateRangeStart}
                              onChange={(e) =>
                                setDateRangeStart(e.target.value)
                              }
                              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 w-full transition-all shadow-sm focus:shadow-md hover:border-gray-400 dark:hover:border-gray-500"
                              placeholder="Start Date"
                            />
                          </div>

                          <div className="relative">
                            <input
                              type="date"
                              value={dateRangeEnd}
                              onChange={(e) => setDateRangeEnd(e.target.value)}
                              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 w-full transition-all shadow-sm focus:shadow-md hover:border-gray-400 dark:hover:border-gray-500"
                              placeholder="End Date"
                            />
                          </div>
                        </div>

                        {/* Active Filters Display */}
                        {(searchTerm ||
                          statusFilter !== "all" ||
                          objectiveFilter !== "all" ||
                          dateRangeStart ||
                          dateRangeEnd) && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Active filters:
                              </span>
                              {searchTerm && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                                  Search: "{searchTerm}"
                                  <button
                                    onClick={() => setSearchTerm("")}
                                    className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100">
                                    <XMarkIcon className="h-3 w-3" />
                                  </button>
                                </span>
                              )}
                              {statusFilter !== "all" && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                                  Status: {statusFilter}
                                  <button
                                    onClick={() => setStatusFilter("all")}
                                    className="ml-1 hover:text-green-900 dark:hover:text-green-100">
                                    <XMarkIcon className="h-3 w-3" />
                                  </button>
                                </span>
                              )}
                              {objectiveFilter !== "all" && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                                  Objective:{" "}
                                  {objectiveFilter.replace("outcome_", "")}
                                  <button
                                    onClick={() => setObjectiveFilter("all")}
                                    className="ml-1 hover:text-purple-900 dark:hover:text-purple-100">
                                    <XMarkIcon className="h-3 w-3" />
                                  </button>
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Pagination Info Bar */}
                      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-t-xl px-6 py-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          {/* Left: Stats */}
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {paginationData.totalItems} Campaigns
                              </span>
                            </div>
                            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Showing{" "}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {paginationData.startIndex + 1}-
                                {paginationData.endIndex}
                              </span>
                            </span>
                          </div>

                          {/* Right: Page & Export */}
                          <div className="flex items-center space-x-3">
                            {/* Page indicator */}
                            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Page{" "}
                                <span className="text-indigo-600 dark:text-indigo-400">
                                  {currentPage}
                                </span>{" "}
                                of {paginationData.totalPages}
                              </span>
                            </div>

                            {/* Export button */}
                            {/* <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => dispatch(openExportModal())}
                              disabled={
                                loading || filteredCampaigns.length === 0
                              }
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">
                              <Download className="h-4 w-4" />
                              <span>Export</span>
                              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                {filteredCampaigns.length}
                              </span>
                            </motion.button> */}
                          </div>
                        </div>
                      </div>

                      {/* Campaign Table - Enhanced */}
                      {paginationData.currentPageCampaigns.length > 0 ? (
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 border-x border-b border-gray-200 dark:border-gray-700 shadow-md">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 sticky top-0 z-10">
                              <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                  Campaign
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                  Objective
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                  Category
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                  Impressions
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                  Clicks
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                  CTR
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                  Spend
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                  Conversions
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
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
                                    transition={{
                                      delay: index * 0.02,
                                      duration: 0.3,
                                    }}
                                    onClick={() =>
                                      handleCampaignClick(campaign)
                                    }
                                    className="cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-750 transition-all duration-200 group">
                                    {/* Campaign Name */}
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                          {campaign.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "C"}
                                        </div>
                                        <div>
                                          <div className="text-sm font-semibold text-gray-900 dark:text-white max-w-xs truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {campaign.name}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                                            <svg
                                              className="w-3 h-3"
                                              fill="currentColor"
                                              viewBox="0 0 20 20">
                                              <path
                                                fillRule="evenodd"
                                                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                            <span>{campaign.id}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-2">
                                        {getStatusIcon(campaign.status)}
                                        <span
                                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                            campaign.status
                                          )}`}>
                                          {campaign.status}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Objective */}
                                    <td className="px-6 py-4">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {campaign.objective?.replace(
                                          "OUTCOME_",
                                          ""
                                        ) || "N/A"}
                                      </div>
                                    </td>

                                    {/* Category */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span
                                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${(() => {
                                          const verdict =
                                            campaign.ai_verdict ||
                                            campaign.verdict?.category ||
                                            "Not Analyzed";
                                          if (verdict.includes("Excellent"))
                                            return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300";
                                          if (
                                            verdict.includes("Good") ||
                                            verdict.includes("Stable")
                                          )
                                            return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300";
                                          if (
                                            verdict.includes("Average") ||
                                            verdict.includes("Moderate")
                                          )
                                            return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-300";
                                          if (
                                            verdict.includes("Needs") ||
                                            verdict.includes("Underperforming")
                                          )
                                            return "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900/30 dark:to-orange-800/30 dark:text-orange-300";
                                          if (verdict.includes("Poor"))
                                            return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-300";
                                          return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300";
                                        })()}`}>
                                        {campaign.ai_verdict ||
                                          campaign.verdict?.category ||
                                          "Not Analyzed"}
                                      </span>
                                    </td>

                                    {/* Impressions */}
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-2">
                                        <svg
                                          className="w-4 h-4 text-gray-400"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                          />
                                        </svg>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                          {campaign.totals?.impressions?.toLocaleString() ||
                                            "0"}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Clicks */}
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-2">
                                        <svg
                                          className="w-4 h-4 text-gray-400"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                                          />
                                        </svg>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                          {campaign.totals?.clicks?.toLocaleString() ||
                                            "0"}
                                        </span>
                                      </div>
                                    </td>

                                    {/* CTR */}
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-2">
                                        <div
                                          className={`w-2 h-2 rounded-full ${
                                            (campaign.totals?.ctr || 0) > 2
                                              ? "bg-green-500"
                                              : (campaign.totals?.ctr || 0) > 1
                                              ? "bg-yellow-500"
                                              : "bg-red-500"
                                          }`}></div>
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                          {(campaign.totals?.ctr || 0).toFixed(
                                            2
                                          )}
                                          %
                                        </span>
                                      </div>
                                    </td>

                                    {/* Spend */}
                                    <td className="px-6 py-4">
                                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(
                                          campaign.totals?.spend || 0
                                        )}
                                      </div>
                                    </td>

                                    {/* Conversions */}
                                    <td className="px-6 py-4">
                                      <div className="space-y-1">
                                        <div className="flex items-center space-x-2 text-xs">
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                          <span className="text-green-700 dark:text-green-400 font-medium">
                                            {campaign.totals?.actions
                                              ?.purchase || 0}{" "}
                                            purchases
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs">
                                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                          <span className="text-blue-700 dark:text-blue-400 font-medium">
                                            {campaign.totals?.actions
                                              ?.add_to_cart || 0}{" "}
                                            carts
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs">
                                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                          <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                                            {campaign.totals?.actions?.lead ||
                                              campaign.totals?.total_leads ||
                                              0}{" "}
                                            leads
                                          </span>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Start Date */}
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-2">
                                        <svg
                                          className="w-4 h-4 text-gray-400"
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
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                          {formatDate(campaign.start_time)}
                                        </span>
                                      </div>
                                    </td>
                                  </motion.tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        // Enhanced Empty State
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-xl shadow-md">
                          <div className="text-center py-16 px-6">
                            {/* Animated Icon */}
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                              }}
                              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-6 shadow-lg">
                              <TableCellsIcon className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                            </motion.div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                              No Campaigns Found
                            </h3>

                            {/* Description */}
                            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                              {searchTerm ||
                              statusFilter !== "all" ||
                              objectiveFilter !== "all" ||
                              dateRangeStart ||
                              dateRangeEnd
                                ? "Your current filters didn't match any campaigns. Try adjusting them to see more results."
                                : "No campaign data available for this category yet. Start by creating your first campaign."}
                            </p>

                            {/* Action Button */}
                            {(searchTerm ||
                              statusFilter !== "all" ||
                              objectiveFilter !== "all" ||
                              dateRangeStart ||
                              dateRangeEnd) && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSearchTerm("");
                                  setStatusFilter("all");
                                  setObjectiveFilter("all");
                                  setDateRangeStart("");
                                  setDateRangeEnd("");
                                }}
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
                                <XMarkIcon className="h-5 w-5" />
                                <span>Clear All Filters</span>
                              </motion.button>
                            )}

                            {/* Optional: Suggestions */}
                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                Suggestions:
                              </p>
                              <div className="flex flex-wrap justify-center gap-2">
                                <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                                  Try different keywords
                                </span>
                                <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                                  Remove date filters
                                </span>
                                <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                                  Select different category
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Enhanced Pagination Controls */}
                      {paginationData.totalPages > 1 && (
                        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-xl px-6 py-4 shadow-md">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Left: First & Previous */}
                            <div className="flex items-center space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleFirstPage}
                                disabled={currentPage === 1}
                                className={`p-2.5 rounded-lg border-2 transition-all shadow-sm ${
                                  currentPage === 1
                                    ? "border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                                    : "border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                                }`}>
                                <ChevronDoubleLeftIcon className="h-4 w-4" />
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`p-2.5 rounded-lg border-2 transition-all shadow-sm ${
                                  currentPage === 1
                                    ? "border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                                    : "border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                                }`}>
                                <ChevronLeftIcon className="h-4 w-4" />
                              </motion.button>
                            </div>

                            {/* Center: Page Numbers */}
                            <div className="flex items-center space-x-1">
                              {getPageNumbers().map((page, index) => (
                                <div key={index}>
                                  {page === "..." ? (
                                    <span className="px-3 py-2 text-gray-400 dark:text-gray-500 font-medium">
                                      - - -
                                    </span>
                                  ) : (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() =>
                                        handlePageChange(page as number)
                                      }
                                      className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm relative overflow-hidden ${
                                        currentPage === page
                                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50 scale-110"
                                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:shadow-md"
                                      }`}>
                                      {currentPage === page && (
                                        <motion.div
                                          layoutId="active-page"
                                          className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"
                                          transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30,
                                          }}
                                        />
                                      )}
                                      <span className="relative z-10">
                                        {page}
                                      </span>
                                    </motion.button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Right: Next & Last */}
                            <div className="flex items-center space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNextPage}
                                disabled={
                                  currentPage === paginationData.totalPages
                                }
                                className={`p-2.5 rounded-lg border-2 transition-all shadow-sm ${
                                  currentPage === paginationData.totalPages
                                    ? "border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                                    : "border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                                }`}>
                                <ChevronRightIcon className="h-4 w-4" />
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLastPage}
                                disabled={
                                  currentPage === paginationData.totalPages
                                }
                                className={`p-2.5 rounded-lg border-2 transition-all shadow-sm ${
                                  currentPage === paginationData.totalPages
                                    ? "border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                                    : "border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                                }`}>
                                <ChevronDoubleRightIcon className="h-4 w-4" />
                              </motion.button>
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
            />
            {/* <ExportOptionsModal
              isOpen={exportModal.isOpen}
              onClose={() => dispatch(closeExportModal())}
              onExport={handleExportData}
              campaignCount={filteredCampaigns.length}
            /> */}
          </div>
        </div>
      </AnimatePresence>
    </>
  );
};

export default AdvanceAnalyticsPage;
