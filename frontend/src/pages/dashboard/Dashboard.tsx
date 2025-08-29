// components/Dashboard.tsx
import React, { useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  EyeIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowUpRightIcon,
  SparklesIcon,
  BoltIcon,
  ClockIcon,
  TrophyIcon,
  UsersIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchAdAccounts,
  fetchCampaigns,
  fetchInsights,
  setSelectedAccount,
  setSelectedCampaign,
} from "../../../store/features/facebookAdsSlice";

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // Redux state
  const {
    adAccounts,
    campaigns,
    insights,
    aggregatedStats,
    selectedAccount,
    selectedCampaign,
    loading,
    lastUpdated,
    error,
  } = useAppSelector((state) => state.facebookAds);

  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Handle token from OAuth redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const token = hashParams.get("access_token");
      console.log(token, "dashboard token=>>>>>>>>>>>>>>>>>>>");
      if (token) {
        localStorage.setItem("FB_ACCESS_TOKEN", token);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        // Fetch accounts after token is saved
        dispatch(fetchAdAccounts());
      }
    } else {
      // Try to load accounts if token already exists
      const existingToken = localStorage.getItem("FB_ACCESS_TOKEN");
      if (existingToken && adAccounts.length === 0) {
        dispatch(fetchAdAccounts());
      }
    }
  }, [dispatch, adAccounts.length]);

  // Auto-fetch campaigns when selectedAccount changes
  useEffect(() => {
    if (selectedAccount && selectedAccount !== "") {
      console.log(
        "🔄 Dashboard: Fetching campaigns for account:",
        selectedAccount
      );
      dispatch(fetchCampaigns(selectedAccount));
    }
  }, [selectedAccount, dispatch]);

  // Auto-fetch insights when selectedAccount changes or campaigns are loaded
  useEffect(() => {
    if (selectedAccount && selectedAccount !== "" && campaigns.length > 0) {
      console.log(
        "🔄 Dashboard: Fetching insights for account:",
        selectedAccount
      );
      dispatch(fetchInsights());
    }
  }, [selectedAccount, campaigns.length, dispatch]);

  // Handle account selection with immediate data fetching
  const handleAccountChange = useCallback(
    (accountId: string) => {
      console.log("🔄 Dashboard: Account changed to:", accountId);
      dispatch(setSelectedAccount(accountId));
      // Clear previous campaign selection
      dispatch(setSelectedCampaign(""));

      // Show loading toast
      toast({
        title: "Loading Data",
        description: "Fetching campaigns and insights...",
      });
    },
    [dispatch, toast]
  );

  // Handle campaign selection
  const handleCampaignChange = useCallback(
    (campaignId: string) => {
      console.log("🔄 Dashboard: Campaign changed to:", campaignId);
      dispatch(setSelectedCampaign(campaignId));
    },
    [dispatch]
  );

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    if (selectedAccount) {
      dispatch(fetchCampaigns(selectedAccount)).then(() => {
        dispatch(fetchInsights());
      });
      toast({
        title: "Refreshing Data",
        description: "Updating campaigns and insights...",
      });
    } else if (adAccounts.length > 0) {
      dispatch(fetchAdAccounts());
    }
  }, [selectedAccount, adAccounts.length, dispatch, toast]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Theme detection
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Generate stats from live data
  const generateStats = () => {
    if (!aggregatedStats) {
      return [
        {
          name: "Connect Your Account",
          value: adAccounts.length > 0 ? "Connected" : "--",
          change:
            adAccounts.length > 0
              ? "Account ready"
              : "Connect Meta Ads to view data",
          changeType: adAccounts.length > 0 ? "increase" : "neutral",
          icon: EyeIcon,
          gradient: "from-blue-500 to-cyan-500",
          bgGradient:
            "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
        },
        {
          name: "Total Campaigns",
          value: campaigns.length.toString() || "0",
          change: loading
            ? "Loading..."
            : campaigns.length > 0
            ? "Campaigns loaded"
            : "No campaigns found",
          changeType: campaigns.length > 0 ? "increase" : "neutral",
          icon: ChartBarIcon,
          gradient: "from-emerald-500 to-green-500",
          bgGradient:
            "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
        },
        {
          name: "Active Campaigns",
          value: campaigns
            .filter((c) => c.status === "ACTIVE")
            .length.toString(),
          change: `${campaigns.length} total campaigns`,
          changeType:
            campaigns.filter((c) => c.status === "ACTIVE").length > 0
              ? "increase"
              : "neutral",
          icon: UserGroupIcon,
          gradient: "from-purple-500 to-pink-500",
          bgGradient:
            "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
        },
        {
          name: "Data Status",
          value:
            insights.length > 0 ? "Ready" : loading ? "Loading" : "No Data",
          change:
            insights.length > 0
              ? `${insights.length} insights available`
              : loading
              ? "Fetching insights..."
              : "Select account to load data",
          changeType:
            insights.length > 0 ? "increase" : loading ? "neutral" : "warning",
          icon: CalendarDaysIcon,
          gradient: "from-orange-500 to-yellow-500",
          bgGradient:
            "from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20",
        },
      ];
    }

    return [
      {
        name: "Total Spend",
        value: formatCurrency(aggregatedStats.totalSpend),
        change: "+12.5% from last period",
        changeType: "increase",
        icon: ChartBarIcon,
        gradient: "from-blue-500 to-cyan-500",
        bgGradient:
          "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      },
      {
        name: "Total Impressions",
        value: formatNumber(aggregatedStats.totalImpressions),
        change: "+8.3% improvement",
        changeType: "increase",
        icon: EyeIcon,
        gradient: "from-emerald-500 to-green-500",
        bgGradient:
          "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
      },
      {
        name: "Active Campaigns",
        value: campaigns.filter((c) => c.status === "ACTIVE").length.toString(),
        change: `${campaigns.length} total campaigns`,
        changeType: "increase",
        icon: UserGroupIcon,
        gradient: "from-purple-500 to-pink-500",
        bgGradient:
          "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      },
      {
        name: "Average CTR",
        value: `${(aggregatedStats.avgCTR * 100).toFixed(2)}%`,
        change: "+2.1% improvement",
        changeType: "increase",
        icon: ArrowTrendingUpIcon,
        gradient: "from-orange-500 to-yellow-500",
        bgGradient:
          "from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20",
      },
    ];
  };

  const stats = generateStats();

  const recentActivity = [
    {
      id: 1,
      action: aggregatedStats
        ? `Generated insights for ${campaigns.length} campaigns`
        : adAccounts.length > 0
        ? `Connected ${adAccounts.length} ad account(s)`
        : "Connect your Meta account to view activity",
      time: lastUpdated ? new Date(lastUpdated).toLocaleString("en-IN") : "N/A",
      status: "completed",
      icon: SparklesIcon,
    },
    {
      id: 2,
      action: aggregatedStats
        ? `Total spend: ${formatCurrency(aggregatedStats.totalSpend)}`
        : campaigns.length > 0
        ? `Found ${campaigns.length} campaigns`
        : "Campaign data will appear here",
      time: campaigns.length > 0 ? "Recently loaded" : "N/A",
      status: "improved",
      icon: TrophyIcon,
    },
    {
      id: 3,
      action: selectedAccount
        ? "Account selected - data syncing"
        : "Analytics dashboard ready for optimization",
      time: selectedAccount ? "Just now" : "2 days ago",
      status: selectedAccount ? "completed" : "pending",
      icon: BoltIcon,
    },
  ];

  const quickActions = [
    {
      title: "Generate New Interests",
      description:
        "Use AI to discover high-performing audience interests for your campaigns",
      icon: EyeIcon,
      gradient: "from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600",
      bgGradient:
        "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30",
      link: "/miner",
      buttonText: "Start Generating",
    },
    {
      title: "Campaign Analytics",
      description:
        "Connect your Meta accounts for deep campaign insights and optimization",
      icon: ChartBarIcon,
      gradient:
        "from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600",
      bgGradient:
        "from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30",
      link: "/analytics",
      buttonText: "View Analytics",
      badge: aggregatedStats ? "Live Data" : "Connect First",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Welcome Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Welcome back! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Here's an overview of your InterestMiner performance and Meta
                Ads data.
              </p>
            </div>
            <motion.div
              className="hidden md:flex md:gap-4 "
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}>
              <div className="flex flex-col gap-2">
                {/* Ad Account Selector */}
                {adAccounts.length > 0 && (
                  <Select
                    value={selectedAccount}
                    onValueChange={handleAccountChange}>
                    <SelectTrigger className="w-[250px] bg-white dark:bg-gray-800">
                      <UsersIcon className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select Ad Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {adAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{account.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {account.currency}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {/* Status and Refresh */}
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    {loading
                      ? "Loading..."
                      : lastUpdated
                      ? `Updated: ${new Date(lastUpdated).toLocaleTimeString(
                          "en-IN"
                        )}`
                      : "Connect to sync data"}
                  </span>
                </div>
                <Button
                  onClick={handleRefresh}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                  className="shrink-0">
                  <ArrowPathIcon
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((item, index) => (
            <motion.div
              key={item.name}
              className={`relative overflow-hidden bg-gradient-to-r ${item.bgGradient} rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}>
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}>
                    <item.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  {item.changeType === "increase" && (
                    <motion.div
                      className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}>
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                    </motion.div>
                  )}
                  {loading && item.name.includes("Data") && (
                    <motion.div
                      className="flex items-center space-x-1 text-blue-600 dark:text-blue-400"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}>
                      <ArrowPathIcon className="h-4 w-4" />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {item.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-medium ${
                        item.changeType === "increase"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : item.changeType === "warning"
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              className={`relative overflow-hidden bg-gradient-to-br ${action.bgGradient} rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 backdrop-blur-sm group hover:shadow-2xl transition-all duration-300`}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}>
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="flex items-center mb-6">
                  <motion.div
                    className={`w-14 h-14 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center mr-4 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 10 }}>
                    <action.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {action.title}
                    </h3>
                    {action.badge && (
                      <motion.span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
                          aggregatedStats
                            ? "bg-emerald-500 text-white"
                            : "bg-orange-500 text-white"
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.6 + index * 0.1,
                          type: "spring",
                        }}>
                        {action.badge}
                      </motion.span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 text-base leading-relaxed">
                  {action.description}
                </p>

                <Link to={action.link}>
                  <motion.button
                    className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${action.gradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group/btn`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}>
                    <span>{action.buttonText}</span>
                    <ArrowUpRightIcon className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-200" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Recent Activity */}
          <motion.div
            className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Recent Activity
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your latest campaign updates and data sync
                </p>
              </div>
              <motion.div
                className={`w-2 h-2 rounded-full ${
                  loading
                    ? "bg-blue-500"
                    : aggregatedStats
                    ? "bg-green-500"
                    : "bg-orange-500"
                }`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}>
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.status === "completed"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : activity.status === "improved"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    }`}
                    whileHover={{ scale: 1.1 }}>
                    <activity.icon className="w-5 h-5" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Account Usage */}
          <motion.div
            className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Account Overview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Meta Ads connection status and data
              </p>
            </div>

            <div className="space-y-6">
              {/* Enhanced Progress Bars */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Connected Accounts
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {adAccounts.length}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: adAccounts.length > 0 ? "100%" : "0%" }}
                      transition={{
                        duration: 1.5,
                        delay: 0.8,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full animate-pulse" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Active Campaigns
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {campaigns.filter((c) => c.status === "ACTIVE").length} /{" "}
                    {campaigns.length}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full shadow-sm"
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          campaigns.length > 0
                            ? `${
                                (campaigns.filter((c) => c.status === "ACTIVE")
                                  .length /
                                  campaigns.length) *
                                100
                              }%`
                            : "0%",
                      }}
                      transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-full animate-pulse" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Data Insights
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {insights.length}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      className={`h-3 rounded-full shadow-sm ${
                        insights.length > 0
                          ? "bg-gradient-to-r from-purple-500 to-pink-500"
                          : "bg-gradient-to-r from-gray-400 to-gray-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{
                        width: insights.length > 0 ? "100%" : "20%",
                      }}
                      transition={{
                        duration: 1.5,
                        delay: 1.2,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Connection Status Card */}
              <motion.div
                className={`p-6 bg-gradient-to-r ${
                  adAccounts.length > 0
                    ? "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                    : "from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20"
                } rounded-xl border ${
                  adAccounts.length > 0
                    ? "border-green-200 dark:border-green-800/30"
                    : "border-orange-200 dark:border-orange-800/30"
                }`}
                whileHover={{ scale: 1.02 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                      Meta Ads Status
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {adAccounts.length > 0
                        ? `${adAccounts.length} account(s) • ${campaigns.length} campaigns • ${insights.length} insights`
                        : "Not connected - Click to connect"}
                    </p>
                  </div>
                  <Link
                    to={
                      adAccounts.length > 0 ? "/analytics" : "/meta-campaign"
                    }>
                    <motion.button
                      className={`px-4 py-2 text-sm font-medium text-white bg-gradient-to-r ${
                        adAccounts.length > 0
                          ? "from-green-500 to-emerald-500"
                          : "from-orange-500 to-yellow-500"
                      } rounded-lg hover:shadow-lg transition-all duration-200`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}>
                      {adAccounts.length > 0 ? "View Analytics" : "Connect"}
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
