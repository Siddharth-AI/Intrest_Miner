/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  EyeIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  BoltIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  motion,
  useAnimation,
  Variants,
  AnimatePresence,
  useInView,
} from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchAdAccounts,
  fetchCampaigns,
  fetchInsights,
  setSelectedAccount,
  setSelectedCampaign,
  fetchCampaignInsights,
} from "../../../store/features/facebookAdsSlice";
import { useToast } from "../../hooks/use-toast";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Enhanced Animation Variants
const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const cardHover = {
  rest: {
    y: 0,
    scale: 1,
    rotateX: 0,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  },
  hover: {
    y: -8,
    scale: 1.02,
    rotateX: 2,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const glowAnimation = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.1, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Enhanced StatCard Component
const StatCard: React.FC<any> = ({ card, isDarkMode, index }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardHover}
      className={`group rounded-3xl p-6 min-w-[240px] border backdrop-blur-xl relative overflow-hidden cursor-pointer transition-all duration-300`}
      style={{
        background: isDarkMode
          ? `linear-gradient(145deg, rgba(30,38,52,0.95) 0%, rgba(20,25,35,0.9) 100%)`
          : `linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)`,
        borderColor: isDarkMode
          ? "rgba(59,130,246,0.2)"
          : "rgba(59,130,246,0.15)",
      }}>
      {/* Animated background gradient */}
      <motion.div
        variants={glowAnimation}
        initial="initial"
        animate={isInView ? "animate" : "initial"}
        className={`absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl ${
          isDarkMode
            ? "bg-gradient-to-br from-blue-500/30 to-cyan-500/20"
            : "bg-gradient-to-br from-blue-300/40 to-cyan-300/30"
        }`}
      />

      {/* Icon container with enhanced styling */}
      <motion.div
        whileHover={{
          scale: 1.1,
          rotate: 5,
          transition: { duration: 0.2 },
        }}
        className={`w-14 h-14 flex items-center justify-center rounded-2xl mb-4 shadow-lg transition-all duration-300 ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/30 group-hover:from-blue-600/20 group-hover:to-cyan-600/20"
            : "bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 group-hover:from-blue-50 group-hover:to-cyan-50"
        }`}>
        <card.icon
          className={`w-7 h-7 transition-colors duration-300 ${
            isDarkMode
              ? "text-blue-400 group-hover:text-blue-300"
              : "text-blue-600 group-hover:text-blue-700"
          }`}
        />
      </motion.div>

      {/* Animated value counter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
        className={`text-3xl font-bold mb-2 ${card.valueColor}`}>
        {card.value}
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: index * 0.1 + 0.4 }}
        className={`text-lg font-semibold mb-2 ${
          isDarkMode ? "text-gray-100" : "text-gray-800"
        }`}>
        {card.title}
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: index * 0.1 + 0.5 }}
        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
        {card.description}
      </motion.div>

      {/* Subtle shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full"
        whileHover={{
          translateX: "200%",
          transition: { duration: 0.6 },
        }}
      />
    </motion.div>
  );
};

// Enhanced QuickActionCard Component
const QuickActionCard: React.FC<any> = ({ action, isDarkMode }) => {
  return (
    <motion.div
      whileHover={{
        y: -10,
        rotateX: 5,
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.98 }}
      className={`group rounded-3xl p-8 border relative overflow-hidden backdrop-blur-xl transition-all duration-300`}
      style={{
        background: isDarkMode
          ? `linear-gradient(145deg, rgba(30,38,52,0.9) 0%, rgba(20,25,35,0.95) 100%)`
          : `linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)`,
        borderColor: isDarkMode
          ? "rgba(59,130,246,0.2)"
          : "rgba(59,130,246,0.15)",
      }}>
      {/* Dynamic background pattern */}
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
          transition: { duration: 8, repeat: Infinity, ease: "linear" },
        }}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="flex items-start gap-4 mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}>
        <motion.div
          whileHover={{
            rotate: 10,
            scale: 1.1,
            transition: { duration: 0.2 },
          }}
          className={`p-3 rounded-xl ${
            isDarkMode
              ? "bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/20"
              : "bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-200"
          }`}>
          <action.icon className={`w-6 h-6 ${action.iconColor}`} />
        </motion.div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
              {action.title}
            </h3>
            <AnimatePresence>
              {action.badge && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={`${action.badgeColor} text-xs px-3 py-1 rounded-full font-semibold`}>
                  {action.badge}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <p
            className={`text-sm leading-relaxed ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}>
            {action.description}
          </p>
        </div>
      </motion.div>

      <Link to={action.link}>
        <motion.button
          whileHover={{
            scale: 1.02,
            boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)",
          }}
          whileTap={{ scale: 0.98 }}
          className={`group/btn w-full flex items-center justify-center gap-2 ${action.btnColor} text-white font-bold px-6 py-4 rounded-2xl shadow-lg text-base transition-all duration-300 relative overflow-hidden`}
          aria-label={action.title}>
          {/* Button shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full"
            whileHover={{
              translateX: "200%",
              transition: { duration: 0.6 },
            }}
          />

          <span className="relative z-10">{action.btnText}</span>
          <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
            <ArrowRightIcon className="w-5 h-5 relative z-10" />
          </motion.div>
        </motion.button>
      </Link>
    </motion.div>
  );
};

// Enhanced ProgressBar Component
const ProgressBar: React.FC<{
  percent: number;
  isDarkMode: boolean;
  delay?: number;
}> = ({ percent, isDarkMode, delay = 0 }) => {
  const clampedPercent = Math.max(0, Math.min(100, percent));

  return (
    <div
      className={`w-full rounded-full h-3 mb-4 shadow-inner ${
        isDarkMode ? "bg-slate-800/50" : "bg-gray-100"
      }`}>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: `${clampedPercent}%`,
          opacity: 1,
        }}
        transition={{
          duration: 1,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className={`h-3 rounded-full relative overflow-hidden ${
          isDarkMode
            ? "bg-gradient-to-r from-blue-500 to-cyan-400"
            : "bg-gradient-to-r from-blue-500 to-cyan-400"
        }`}>
        {/* Animated shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
          animate={{
            translateX: ["-100%", "200%"],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay + 1,
            },
          }}
        />
      </motion.div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const controls = useAnimation();

  const {
    adAccounts,
    campaigns,
    campaignInsights,
    campaignInsightstotal,
    aggregatedStats,
    selectedAccount,
    selectedCampaign,
    loading,
    lastUpdated,
  } = useAppSelector((state) => state.facebookAds);

  const [isDarkMode, setIsDarkMode] = React.useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );
  const token = localStorage.getItem("FB_ACCESS_TOKEN");
  const hasToken = Boolean(token);

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const router = useNavigate();

  // Theme synchronization with enhanced detection
  useEffect(() => {
    const classList = document.documentElement.classList;
    setIsDarkMode(classList.contains("dark"));

    const observer = new MutationObserver(() =>
      setIsDarkMode(classList.contains("dark"))
    );

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // 🔥 ENHANCED OAuth logic with auto-fetch
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const token = hashParams.get("access_token");
      if (token) {
        localStorage.setItem("FB_ACCESS_TOKEN", token);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        dispatch(fetchAdAccounts());

        // Success animation
        controls.start({
          scale: [1, 1.05, 1],
          transition: { duration: 0.5 },
        });
      }
    } else {
      // 🔥 AUTO-FETCH: Automatically fetch ad accounts if token exists
      const existingToken = localStorage.getItem("FB_ACCESS_TOKEN");
      if (existingToken && adAccounts.length === 0) {
        dispatch(fetchAdAccounts());
      }
    }
  }, [dispatch, adAccounts.length, controls]);

  // 🔥 AUTO-SELECT: First ad account when accounts are loaded
  useEffect(() => {
    if (adAccounts.length > 0 && !selectedAccount) {
      dispatch(setSelectedAccount(adAccounts[0].id));
      toast({
        title: "Account Auto-Selected",
        description: `Automatically selected: ${adAccounts[0].name}`,
      });
    }
  }, [adAccounts, selectedAccount, dispatch, toast]);

  // 🔥 AUTO-FETCH: Campaigns when account is selected
  useEffect(() => {
    if (selectedAccount) {
      dispatch(fetchCampaigns(selectedAccount));
    }
  }, [selectedAccount, dispatch]);

  // 🔥 AUTO-SELECT: First campaign when campaigns are loaded
  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaign && selectedAccount) {
      dispatch(setSelectedCampaign(campaigns[0].id));
      toast({
        title: "Campaign Auto-Selected",
        description: `Automatically selected: ${campaigns[0].name}`,
      });
    }
  }, [campaigns, selectedCampaign, selectedAccount, dispatch, toast]);

  // 🔥 AUTO-FETCH: Campaign insights when campaign is selected
  useEffect(() => {
    if (selectedCampaign) {
      dispatch(fetchCampaignInsights(selectedCampaign));
    }
  }, [selectedCampaign, dispatch]);

  // 🔥 AUTO-FETCH: Overall insights when account and campaigns are ready
  useEffect(() => {
    if (selectedAccount && campaigns.length > 0) {
      dispatch(fetchInsights());
    }
  }, [selectedAccount, campaigns.length, dispatch]);

  // Enhanced callbacks
  const handleAccountChange = useCallback(
    (accountId: string) => {
      dispatch(setSelectedAccount(accountId));
      dispatch(setSelectedCampaign(""));
      toast({
        title: "Loading Data",
        description: "Fetching campaigns and insights...",
      });
    },
    [dispatch, toast]
  );

  const handleCampaignChange = useCallback(
    (campaignId: string) => {
      dispatch(setSelectedCampaign(campaignId));
      if (campaignId) {
        dispatch(fetchCampaignInsights(campaignId));
      }
    },
    [dispatch]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (selectedAccount) {
        await dispatch(fetchCampaigns(selectedAccount)).unwrap();
        await dispatch(fetchInsights()).unwrap();

        toast({
          title: "Data Refreshed",
          description: "Campaigns and insights updated successfully!",
        });
      } else if (adAccounts.length > 0) {
        await dispatch(fetchAdAccounts()).unwrap();
      }
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [selectedAccount, adAccounts.length, dispatch, toast]);

  // Memoized calculations
  const dashboardStats = useMemo(
    () => ({
      connectedAccounts: adAccounts.length,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === "ACTIVE").length,
      dataInsights: campaignInsightstotal.length,
    }),
    [adAccounts.length, campaigns, campaignInsightstotal.length]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  // Enhanced theme configuration
  const themeConfig = useMemo(
    () => ({
      background: isDarkMode
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
      text: isDarkMode ? "text-gray-100" : "text-gray-900",
      cardBg: isDarkMode
        ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50"
        : "bg-gradient-to-br from-white/80 to-gray-50/80",
      border: isDarkMode ? "border-slate-700/50" : "border-gray-200/50",
      shadow: isDarkMode
        ? "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        : "shadow-[0_8px_32px_rgba(59,130,246,0.08)]",
    }),
    [isDarkMode]
  );

  // Enhanced stat cards configuration
  const statCards = useMemo(
    () => [
      {
        icon: EyeIcon,
        title: "Account Status",
        value: dashboardStats.connectedAccounts > 0 ? "Connected" : "Pending",
        description:
          dashboardStats.connectedAccounts > 0
            ? `${dashboardStats.connectedAccounts} account(s) connected`
            : "Connect Meta Ads to view data",
        valueColor: isDarkMode
          ? dashboardStats.connectedAccounts > 0
            ? "text-emerald-400"
            : "text-amber-400"
          : dashboardStats.connectedAccounts > 0
          ? "text-emerald-600"
          : "text-amber-600",
      },
      {
        icon: ChartBarIcon,
        title: "Total Campaigns",
        value: dashboardStats.totalCampaigns.toString(),
        description: loading
          ? "Loading campaigns..."
          : dashboardStats.totalCampaigns > 0
          ? "Campaigns discovered"
          : "No campaigns found",
        valueColor: isDarkMode ? "text-blue-400" : "text-blue-600",
      },
      {
        icon: ArrowTrendingUpIcon,
        title: "Active Campaigns",
        value: dashboardStats.activeCampaigns.toString(),
        description: `${
          dashboardStats.totalCampaigns - dashboardStats.activeCampaigns
        } inactive`,
        valueColor: isDarkMode ? "text-purple-400" : "text-purple-600",
      },
      {
        icon: SparklesIcon,
        title: "Insights Available",
        value:
          dashboardStats.dataInsights > 0
            ? dashboardStats.dataInsights.toString()
            : "None",
        description:
          dashboardStats.dataInsights > 0
            ? "Data points ready"
            : loading
            ? "Loading insights..."
            : "Select campaign for insights",
        valueColor: isDarkMode ? "text-cyan-400" : "text-cyan-600",
      },
    ],
    [dashboardStats, isDarkMode, loading]
  );

  // Enhanced quick actions
  const quickActions = useMemo(
    () => [
      {
        icon: SparklesIcon,
        title: "AI Interest Discovery",
        description:
          "Leverage artificial intelligence to uncover high-performing audience interests and optimize your targeting strategy with data-driven insights.",
        btnText: "Start Discovery",
        btnColor:
          "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
        link: "/miner",
        iconColor: isDarkMode ? "text-blue-400" : "text-blue-600",
      },
      {
        icon: ChartBarIcon,
        title: "Advanced Analytics",
        description:
          "Dive deep into your campaign performance with comprehensive analytics, real-time insights, and actionable recommendations.",
        btnText: "View Analytics",
        btnColor:
          "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
        link: "/analytics",
        badge: !aggregatedStats ? "Connect Required" : undefined,
        badgeColor: isDarkMode
          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
          : "bg-amber-100 text-amber-700 border border-amber-200",
        iconColor: isDarkMode ? "text-emerald-400" : "text-emerald-600",
      },
    ],
    [aggregatedStats, isDarkMode]
  );

  // Enhanced recent activity
  const recentActivity = useMemo(
    () => [
      {
        icon: <ArrowPathIcon className="w-5 h-5 text-emerald-500" />,
        label: dashboardStats.connectedAccounts
          ? `Successfully connected ${
              dashboardStats.connectedAccounts
            } ad account${dashboardStats.connectedAccounts > 1 ? "s" : ""}`
          : "Meta Ads integration ready - connect your account to begin",
        time: lastUpdated
          ? new Date(lastUpdated).toLocaleString("en-IN")
          : "Pending",
        status: dashboardStats.connectedAccounts > 0 ? "success" : "pending",
      },
      {
        icon: <ChartBarIcon className="w-5 h-5 text-blue-500" />,
        label: dashboardStats.totalCampaigns
          ? `Discovered ${dashboardStats.totalCampaigns} campaigns (${dashboardStats.activeCampaigns} active)`
          : "Campaign data will automatically sync once connected",
        time: dashboardStats.totalCampaigns
          ? "Recently synced"
          : "Awaiting connection",
        status: dashboardStats.totalCampaigns > 0 ? "success" : "pending",
      },
      {
        icon: <BoltIcon className="w-5 h-5 text-amber-500" />,
        label: selectedAccount
          ? "Real-time data synchronization active"
          : "Platform optimized and ready for high-performance analytics",
        time: selectedAccount ? "Active now" : "Always ready",
        status: "active",
      },
    ],
    [dashboardStats, lastUpdated, selectedAccount]
  );

  return (
    <>
      <div className="relative">
        {!hasToken && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-96 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Login Required
              </h2>
              <p className="text-gray-600 mb-6">
                To view your campaign data, please log in with your Meta
                account.
              </p>
              <button
                onClick={() => router("/meta-campaign")}
                className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold shadow-lg hover:bg-purple-700 transition-all duration-200">
                Go to Meta Login
              </button>
            </div>
          </div>
        )}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={`min-h-screen transition-all duration-500 ${themeConfig.background} ${themeConfig.text}`}>
          {/* Enhanced background effects */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-5 ${
                isDarkMode ? "bg-blue-500" : "bg-blue-300"
              } blur-3xl`}
            />
            <motion.div
              animate={{
                x: [0, -150, 0],
                y: [0, 100, 0],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
              className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 ${
                isDarkMode ? "bg-purple-500" : "bg-purple-300"
              } blur-3xl`}
            />
          </div>

          <div
            className={`${
              !hasToken
                ? "blur-sm pointer-events-none p-6"
                : "min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6"
            }`}>
            {/* Enhanced Header */}
            <motion.div variants={fadeInUp} className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`text-4xl font-black tracking-tight mb-2 bg-gradient-to-r ${
                      isDarkMode
                        ? "from-blue-400 via-purple-400 to-cyan-400"
                        : "from-blue-600 via-purple-600 to-cyan-600"
                    } bg-clip-text text-transparent`}>
                    Welcome back!
                    <motion.span
                      animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                      className="inline-block ml-2">
                      👋
                    </motion.span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={`text-lg ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    } max-w-2xl leading-relaxed`}>
                    Your comprehensive dashboard for Meta Ads optimization and
                    AI-powered audience insights.
                  </motion.p>
                </div>

                {/* Enhanced refresh button */}
                <motion.button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 ${
                    isDarkMode
                      ? "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 text-blue-400 hover:bg-slate-700/50"
                      : "bg-white/80 backdrop-blur-xl border border-gray-200/50 text-blue-600 hover:bg-white"
                  }`}>
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                    transition={{
                      duration: 1,
                      repeat: isRefreshing ? Infinity : 0,
                      ease: "linear",
                    }}>
                    <ArrowPathIcon className="w-5 h-5" />
                  </motion.div>
                  {isRefreshing ? "Refreshing..." : "Refresh Data"}
                </motion.button>
              </div>

              {/* Enhanced selectors */}
              <div className="flex gap-4 items-center">
                <AnimatePresence>
                  {adAccounts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}>
                      <Select
                        value={selectedAccount}
                        onValueChange={handleAccountChange}>
                        <SelectTrigger
                          className={`w-[280px] h-12 rounded-2xl shadow-lg backdrop-blur-xl border transition-all duration-300 ${
                            isDarkMode
                              ? "bg-slate-800/50 text-gray-100 border-slate-700/50 hover:bg-slate-700/50"
                              : "bg-white/80 text-gray-700 border-gray-200/50 hover:bg-white"
                          }`}>
                          <span className="font-medium">
                            {adAccounts.find(
                              (acc) => acc.id === selectedAccount
                            )?.name || "Select Ad Account"}
                          </span>
                        </SelectTrigger>
                        <SelectContent
                          className={`rounded-2xl backdrop-blur-xl ${
                            isDarkMode
                              ? "bg-slate-800/95 text-gray-100"
                              : "bg-white/95 text-gray-900"
                          }`}>
                          {adAccounts.map((acc) => (
                            <SelectItem
                              key={acc.id}
                              value={acc.id}
                              className="py-3">
                              {acc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {campaigns.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}>
                      <Select
                        value={selectedCampaign}
                        onValueChange={handleCampaignChange}>
                        <SelectTrigger
                          className={`w-[280px] h-12 rounded-2xl shadow-lg backdrop-blur-xl border transition-all duration-300 ${
                            isDarkMode
                              ? "bg-slate-800/50 text-gray-100 border-slate-700/50 hover:bg-slate-700/50"
                              : "bg-white/80 text-gray-700 border-gray-200/50 hover:bg-white"
                          }`}>
                          <span className="font-medium">
                            {campaigns.find((c) => c.id === selectedCampaign)
                              ?.name || "Select Campaign"}
                          </span>
                        </SelectTrigger>
                        <SelectContent
                          className={`rounded-2xl backdrop-blur-xl ${
                            isDarkMode
                              ? "bg-slate-800/95 text-gray-100"
                              : "bg-white/95 text-gray-900"
                          }`}>
                          {campaigns.map((c) => (
                            <SelectItem
                              key={c.id}
                              value={c.id}
                              className="py-3">
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Enhanced Stats Grid */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, index) => (
                <StatCard
                  key={card.title}
                  card={card}
                  isDarkMode={isDarkMode}
                  index={index}
                />
              ))}
            </motion.div>

            {/* Enhanced Quick Actions */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.title}
                  action={action}
                  isDarkMode={isDarkMode}
                />
              ))}
            </motion.div>

            {/* Enhanced Main Content Grid */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Recent Activity */}
              <motion.div
                whileHover={{ y: -4 }}
                className={`rounded-3xl p-8 backdrop-blur-xl border transition-all duration-300 ${themeConfig.cardBg} ${themeConfig.border} ${themeConfig.shadow}`}>
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className={`p-2 rounded-xl ${
                      isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                    }`}>
                    <ClockIcon
                      className={`w-5 h-5 ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                  </motion.div>
                  <h2 className="text-xl font-bold">Recent Activity</h2>
                </div>

                <p
                  className={`text-sm mb-6 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                  Latest updates from your Meta Ads integration
                </p>

                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start gap-4 p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                        isDarkMode
                          ? "bg-slate-800/30 hover:bg-slate-800/50"
                          : "bg-gray-50/50 hover:bg-gray-100/50"
                      }`}>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`p-2 rounded-xl ${
                          activity.status === "success"
                            ? isDarkMode
                              ? "bg-emerald-500/20"
                              : "bg-emerald-100"
                            : activity.status === "pending"
                            ? isDarkMode
                              ? "bg-amber-500/20"
                              : "bg-amber-100"
                            : isDarkMode
                            ? "bg-blue-500/20"
                            : "bg-blue-100"
                        }`}>
                        {activity.icon}
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium mb-1 ${
                            isDarkMode ? "text-gray-200" : "text-gray-800"
                          }`}>
                          {activity.label}
                        </p>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Enhanced Account Overview */}
              <motion.div
                whileHover={{ y: -4 }}
                className={`rounded-3xl p-8 backdrop-blur-xl border transition-all duration-300 ${themeConfig.cardBg} ${themeConfig.border} ${themeConfig.shadow}`}>
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`p-2 rounded-xl ${
                      isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
                    }`}>
                    <UserGroupIcon
                      className={`w-5 h-5 ${
                        isDarkMode ? "text-purple-400" : "text-purple-600"
                      }`}
                    />
                  </motion.div>
                  <h2 className="text-xl font-bold">Account Overview</h2>
                </div>

                <p
                  className={`text-sm mb-8 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                  Meta Ads integration status and performance metrics
                </p>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                        Connected Accounts
                      </span>
                      <motion.span
                        key={dashboardStats.connectedAccounts}
                        initial={{ scale: 1.2, color: "#10b981" }}
                        animate={{ scale: 1, color: "inherit" }}
                        className="font-bold text-lg">
                        {dashboardStats.connectedAccounts}
                      </motion.span>
                    </div>
                    <ProgressBar
                      percent={
                        (dashboardStats.connectedAccounts / Math.max(1, 3)) *
                        100
                      }
                      isDarkMode={isDarkMode}
                      delay={0}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                        Active Campaigns
                      </span>
                      <motion.span
                        key={dashboardStats.activeCampaigns}
                        initial={{ scale: 1.2, color: "#8b5cf6" }}
                        animate={{ scale: 1, color: "inherit" }}
                        className="font-bold text-lg">
                        {dashboardStats.activeCampaigns} /{" "}
                        {dashboardStats.totalCampaigns}
                      </motion.span>
                    </div>
                    <ProgressBar
                      percent={
                        dashboardStats.totalCampaigns > 0
                          ? (dashboardStats.activeCampaigns /
                              dashboardStats.totalCampaigns) *
                            100
                          : 0
                      }
                      isDarkMode={isDarkMode}
                      delay={0.2}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}>
                        Available Insights
                      </span>
                      <motion.span
                        key={dashboardStats.dataInsights}
                        initial={{ scale: 1.2, color: "#06b6d4" }}
                        animate={{ scale: 1, color: "inherit" }}
                        className="font-bold text-lg">
                        {dashboardStats.dataInsights}
                      </motion.span>
                    </div>
                    <ProgressBar
                      percent={Math.min(dashboardStats.dataInsights, 20) * 5}
                      isDarkMode={isDarkMode}
                      delay={0.4}
                    />
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 pt-6 border-t border-gray-200/10 flex items-center justify-between">
                  <Link to="/analytics">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300">
                      View Full Analytics
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Dashboard;
