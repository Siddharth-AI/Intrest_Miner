/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/analytics-page/AnalyticsPage.tsx

import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Eye,
  MousePointer,
  Calendar,
  Play,
  Pause,
  BarChart3,
  RefreshCw,
  Filter,
  X,
  ExternalLink,
  Zap,
  Target,
  Users,
  TrendingDown,
  AlertTriangle,
  Search,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchAdAccounts,
  fetchCampaigns,
  fetchInsights,
  fetchCampaignInsights,
  setSelectedAccount,
  setDateFilter,
  setCustomDateRange,
  setSearchTerm,
  setStatusFilter,
  setShowModal,
  setShowCustomDatePicker,
  setSelectedCampaignForModal,
  setShowAnalyticsModal,
  setAnalysisResults,
} from "../../../store/features/facebookAdsSlice";
import CampaignModal from "@/components/model/CampaignModal";
import AnalyticsModal from "@/components/model/AnalyticsModal";
import {
  analyzeAllCampaigns,
  getHistoricalTrend,
  predictFuturePerformance,
} from "../../lib/analyticsService";

const dateFilterOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_7d", label: "Last 7 Days" },
  { value: "last_14d", label: "Last 14 Days" },
  { value: "last_30d", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_90d", label: "Last 3 Months" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "last_quarter", label: "Last Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "maximum", label: "All Time" },
  { value: "custom", label: "Custom Range" },
];

const CHART_COLORS = {
  primary: "#3B82F6",
  secondary: "#10B981",
  tertiary: "#F59E0B",
  quaternary: "#EF4444",
  success: "#22C55E",
  warning: "#F97316",
  purple: "#8B5CF6",
  pink: "#EC4899",
};

const AnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const {
    adAccounts,
    campaigns,
    insights,
    aggregatedStats,
    selectedAccount,
    dateFilter,
    customDateRange,
    searchTerm,
    statusFilter,
    loading,
    initialLoading,
    showCustomDatePicker,
    error,
    lastUpdated,
  } = useAppSelector((state) => state.facebookAds);

  const [isDarkMode, setIsDarkMode] = React.useState(false);

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

  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.objective?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (campaign) =>
          campaign.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return filtered;
  }, [campaigns, searchTerm, statusFilter]);

  useEffect(() => {
    dispatch(fetchAdAccounts());
  }, [dispatch]);

  useEffect(() => {
    if (selectedAccount) {
      dispatch(fetchCampaigns(selectedAccount));
    }
  }, [selectedAccount, dispatch]);

  useEffect(() => {
    if (selectedAccount) {
      dispatch(fetchInsights());
    }
  }, [selectedAccount, dateFilter, customDateRange, dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      // Assuming you have a `clearError` action
      // dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  const handleAccountChange = (accountId: string) => {
    dispatch(setSelectedAccount(accountId));
  };

  const handleDateFilterChange = (newDateFilter: string) => {
    dispatch(setDateFilter(newDateFilter));
  };

  const applyCustomDateRange = () => {
    if (!customDateRange.since || !customDateRange.until) {
      toast({
        title: "Invalid Date Range",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(customDateRange.since) > new Date(customDateRange.until)) {
      toast({
        title: "Invalid Date Range",
        description: "Start date must be before end date.",
        variant: "destructive",
      });
      return;
    }

    dispatch(setShowCustomDatePicker(false));
    dispatch(fetchInsights());
  };

  const openCampaignModal = (campaign: any) => {
    dispatch(setSelectedCampaignForModal(campaign));
    dispatch(fetchCampaignInsights(campaign.id));
    dispatch(setShowModal(true));
  };

  const runAnalysis = () => {
    if (campaigns.length > 0 && insights.length > 0) {
      const campaignAnalyses = analyzeAllCampaigns(campaigns, insights);
      const historicalTrend = getHistoricalTrend(insights);
      const futurePrediction = predictFuturePerformance(historicalTrend);

      dispatch(
        setAnalysisResults({
          campaignAnalyses,
          historicalTrend,
          futurePrediction,
        })
      );

      dispatch(setShowAnalyticsModal(true));

      toast({
        title: "Analysis Complete",
        description: "Your campaign performance analysis is ready.",
      });
    } else {
      toast({
        title: "Not Enough Data",
        description:
          "We need more campaign and insight data to run an analysis.",
        variant: "destructive",
      });
    }
  };

  const getAccessToken = () => localStorage.getItem("FB_ACCESS_TOKEN");

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        className:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: <Play className="h-3 w-3 mr-1" />,
      },
      paused: {
        className:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: <Pause className="h-3 w-3 mr-1" />,
      },
      deleted: {
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800",
        icon: <X className="h-3 w-3 mr-1" />,
      },
    };

    const config =
      statusConfig[status.toLowerCase() as keyof typeof statusConfig] ||
      statusConfig.paused;

    return (
      <Badge className={config.className}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const prepareChartData = () => {
    const campaignData = campaigns
      .map((campaign) => {
        const campaignInsights = insights.filter(
          (insight) => insight.campaign_id === campaign.id
        );
        const totalSpend = campaignInsights.reduce(
          (acc, insight) => acc + parseFloat(insight.spend || "0"),
          0
        );
        const totalClicks = campaignInsights.reduce(
          (acc, insight) => acc + parseInt(insight.clicks || "0"),
          0
        );
        const totalImpressions = campaignInsights.reduce(
          (acc, insight) => acc + parseInt(insight.impressions || "0"),
          0
        );

        return {
          name:
            campaign.name.length > 15
              ? campaign.name.substring(0, 15) + "..."
              : campaign.name,
          fullName: campaign.name,
          spend: totalSpend,
          clicks: totalClicks,
          impressions: totalImpressions,
          ctr: totalClicks > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        };
      })
      .filter(
        (data) => data.spend > 0 || data.clicks > 0 || data.impressions > 0
      )
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10);

    return campaignData;
  };

  const prepareSpendOverTime = () => {
    const dateGroups: {
      [key: string]: { spend: number; clicks: number; impressions: number };
    } = {};

    insights.forEach((insight) => {
      const date = insight.date_start;
      if (!dateGroups[date]) {
        dateGroups[date] = { spend: 0, clicks: 0, impressions: 0 };
      }
      dateGroups[date].spend += parseFloat(insight.spend || "0");
      dateGroups[date].clicks += parseInt(insight.clicks || "0");
      dateGroups[date].impressions += parseInt(insight.impressions || "0");
    });

    return Object.entries(dateGroups)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        fullDate: date,
        ...data,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
      }))
      .sort(
        (a, b) =>
          new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
      )
      .slice(-30);
  };

  const chartData = prepareChartData();
  const spendOverTimeData = prepareSpendOverTime();

  const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
  }: {
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    action?: React.ReactNode;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs mb-4">
        {description}
      </p>
      {action}
    </motion.div>
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto shadow">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Loading Analytics
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Connecting to Meta Ads...
          </p>
        </div>
      </div>
    );
  }

  if (!getAccessToken()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <EmptyState
            icon={AlertTriangle}
            title="Connect Your Meta Account"
            description="To view Facebook Ads analytics, you need to connect your Meta Business account first."
            action={
              <Button
                onClick={() => (window.location.href = "/meta-campaign")}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow px-6 py-2">
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Meta Account
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (adAccounts.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <EmptyState
            icon={Users}
            title="No Ad Accounts Found"
            description="We couldn't find any ad accounts associated with your Meta Business account."
            action={
              <Button
                onClick={() => dispatch(fetchAdAccounts())}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow px-6 py-2">
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry Connection
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500/10 dark:bg-blue-700/10 rounded-2xl flex items-center justify-center shadow">
              <BarChart3 className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Meta Ads Analytics
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg mt-1">
                Comprehensive insights into your Facebook & Instagram campaigns
                {lastUpdated && (
                  <span className="block text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Last updated:{" "}
                    {new Date(lastUpdated).toLocaleString("en-IN")}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col flex-wrap sm:flex-row gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
            <Select value={dateFilter} onValueChange={handleDateFilterChange}>
              <SelectTrigger className="w-full sm:w-56 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-300 shadow transition focus:ring-2 focus:ring-blue-400">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                {dateFilterOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="flex items-center px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-100 dark:focus:bg-blue-900/40 cursor-pointer rounded transition">
                    <span className="ml-8 font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {dateFilter === "custom" && (
              <Popover
                open={showCustomDatePicker}
                onOpenChange={(open) =>
                  dispatch(setShowCustomDatePicker(open))
                }>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 rounded-lg shadow-sm">
                    <CalendarDays className="h-5 w-5 text-blue-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Custom Date Range
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select your preferred date range
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="start-date"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Start Date
                        </Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={customDateRange.since}
                          onChange={(e) =>
                            dispatch(
                              setCustomDateRange({
                                ...customDateRange,
                                since: e.target.value,
                              })
                            )
                          }
                          className="border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="end-date"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          End Date
                        </Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={customDateRange.until}
                          onChange={(e) =>
                            dispatch(
                              setCustomDateRange({
                                ...customDateRange,
                                until: e.target.value,
                              })
                            )
                          }
                          className="border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={applyCustomDateRange}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition duration-200 rounded-lg">
                        Apply Range
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => dispatch(setShowCustomDatePicker(false))}
                        className="flex-1 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 rounded-lg">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <Select value={selectedAccount} onValueChange={handleAccountChange}>
              <SelectTrigger className="w-full sm:w-72 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow hover:border-blue-500 dark:hover:border-blue-300 focus:ring-2 focus:ring-blue-400">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                <SelectValue placeholder="Select Ad Account" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl">
                {adAccounts.map((account) => (
                  <SelectItem
                    key={account.id}
                    value={account.id}
                    className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-100 dark:focus:bg-blue-900/40 cursor-pointer rounded flex items-center justify-between">
                    <span className=" ml-8 font-medium text-gray-900 dark:text-gray-100">
                      {account.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="ml-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500">
                      {account.currency}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => dispatch(fetchAdAccounts())}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg px-6 py-2 transition active:scale-95">
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-5 w-5 mr-2" />
              )}
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              onClick={runAnalysis}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg px-6 py-2 transition active:scale-95">
              <Zap className="h-5 w-5 mr-2" />
              Analyze Performance
            </Button>
          </div>
        </motion.div>

        {aggregatedStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Total Spend",
                value: formatCurrency(aggregatedStats.totalSpend),
                icon: DollarSign,
                gradient: "from-blue-500 to-blue-600",
                bgGradient:
                  "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
                change: "+12.5%",
                changeType: "positive" as const,
                delay: 0.1,
              },
              {
                title: "Total Impressions",
                value: formatNumber(aggregatedStats.totalImpressions),
                icon: Eye,
                gradient: "from-emerald-500 to-emerald-600",
                bgGradient:
                  "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20",
                change: "+8.3%",
                changeType: "positive" as const,
                delay: 0.2,
              },
              {
                title: "Total Clicks",
                value: formatNumber(aggregatedStats.totalClicks),
                icon: MousePointer,
                gradient: "from-purple-500 to-purple-600",
                bgGradient:
                  "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
                change: "+15.7%",
                changeType: "positive" as const,
                delay: 0.3,
              },
              {
                title: "Average CTR",
                value: `${(aggregatedStats.avgCTR * 100).toFixed(2)}%`,
                icon: TrendingUp,
                gradient: "from-amber-500 to-amber-600",
                bgGradient:
                  "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20",
                change: "+2.1%",
                changeType: "positive" as const,
                delay: 0.4,
              },
            ].map((stat) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay }}>
                <Card
                  className={`bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
                          {stat.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stat.value}
                          </span>
                          <span
                            className={`flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                              stat.changeType === "positive"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                            {stat.changeType === "positive" ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`p-4 bg-gradient-to-br ${stat.gradient} rounded-xl shadow`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-2xl p-8 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Data Available
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-base">
                We couldn't find any performance data for this ad account or
                selected time period.
                <br />
                This may happen if no campaigns were active, data hasn't synced
                yet, or the selected dates are too recent.
                <br />
                Try refreshing or choose a different date range.
              </p>
            </div>
            <Button
              onClick={() => dispatch(fetchInsights())}
              disabled={loading}
              variant="outline"
              className="border-2 border-blue-300 dark:border-blue-700 px-6 py-3 rounded-lg font-semibold shadow">
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-5 w-5 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        ) : null}

        {chartData.length > 0 && spendOverTimeData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}>
              <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    Performance Over Time
                  </CardTitle>
                  <CardDescription>
                    Track your spend and engagement trends
                    {dateFilter === "custom" &&
                      customDateRange.since &&
                      customDateRange.until &&
                      ` (${customDateRange.since} to ${customDateRange.until})`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={spendOverTimeData}>
                        <defs>
                          <linearGradient
                            id="spendGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1">
                            <stop
                              offset="5%"
                              stopColor={CHART_COLORS.primary}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={CHART_COLORS.primary}
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="clicksGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1">
                            <stop
                              offset="5%"
                              stopColor={CHART_COLORS.secondary}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={CHART_COLORS.secondary}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                            border: isDarkMode
                              ? "1px solid #4B5563"
                              : "1px solid #E5E7EB",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value, name) => {
                            if (name === "spend")
                              return [formatCurrency(Number(value)), "Spend"];
                            if (name === "clicks")
                              return [formatNumber(Number(value)), "Clicks"];
                            return [formatNumber(Number(value)), name];
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="spend"
                          stroke={CHART_COLORS.primary}
                          fillOpacity={1}
                          fill="url(#spendGradient)"
                          name="Spend (â‚¹)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="clicks"
                          stroke={CHART_COLORS.secondary}
                          fillOpacity={1}
                          fill="url(#clicksGradient)"
                          name="Clicks"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}>
              <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-purple-600" />
                    </div>
                    Top Campaigns
                  </CardTitle>
                  <CardDescription>
                    Compare performance across campaigns (Filtered Data)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis
                          dataKey="name"
                          className="text-xs"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDarkMode ? "#374151" : "#ffffff",
                            border: isDarkMode
                              ? "1px solid #4B5563"
                              : "1px solid #E5E7EB",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value, name) => {
                            if (name === "Spend (â‚¹)")
                              return [formatCurrency(Number(value)), name];
                            return [formatNumber(Number(value)), name];
                          }}
                          labelFormatter={(label) => {
                            const campaign = chartData.find(
                              (c) => c.name === label
                            );
                            return campaign ? campaign.fullName : label;
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="spend"
                          fill={CHART_COLORS.tertiary}
                          name="Spend (â‚¹)"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="clicks"
                          fill={CHART_COLORS.secondary}
                          name="Clicks"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}>
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-emerald-600" />
                    </div>
                    Campaigns Overview
                  </CardTitle>
                  <CardDescription>
                    {campaigns.length} campaigns â€¢ {filteredCampaigns.length}{" "}
                    shown â€¢ {insights.length} insights
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                      className="pl-10 w-full sm:w-64 bg-gray-50 dark:bg-gray-700"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => dispatch(setStatusFilter(value))}>
                    <SelectTrigger className="w-full sm:w-32 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 shadow">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredCampaigns.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-gray-800">
                        <TableHead className="font-semibold">
                          Campaign Name
                        </TableHead>
                        <TableHead className="font-semibold">
                          Objective
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">
                          Daily Budget
                        </TableHead>
                        <TableHead className="font-semibold">
                          Start Date
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredCampaigns.map((campaign, index) => (
                          <motion.tr
                            key={campaign.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-100 dark:border-gray-800 transition-colors duration-200"
                            onClick={() => openCampaignModal(campaign)}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                  <Target className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {campaign.name}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    ID: {campaign.id.slice(-8)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-medium">
                                {campaign.objective?.replace("OUTCOME_", "") ||
                                  "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(campaign.status)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {campaign.daily_budget
                                ? formatCurrency(
                                    parseInt(campaign.daily_budget) / 100
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {new Date(campaign.start_time).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCampaignModal(campaign);
                                }}
                                className="hover:bg-blue-100 dark:hover:bg-blue-900/30">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              ) : campaigns.length > 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={Search}
                    title="No Matching Campaigns"
                    description="No campaigns match your current filters."
                    action={
                      <Button
                        onClick={() => {
                          dispatch(setSearchTerm(""));
                          dispatch(setStatusFilter("all"));
                        }}
                        variant="outline"
                        className="rounded-md border-blue-300 dark:border-blue-700 shadow px-6 py-2">
                        Clear Filters
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="p-8">
                  <EmptyState
                    icon={Target}
                    title="No Campaigns Found"
                    description="This ad account doesn't have any campaigns yet."
                    action={
                      <Button
                        onClick={() =>
                          selectedAccount &&
                          dispatch(fetchCampaigns(selectedAccount))
                        }
                        disabled={loading}
                        variant="outline"
                        className="rounded-md border-blue-300 dark:border-blue-700 shadow px-6 py-2">
                        {loading ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Refresh Campaigns
                      </Button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <CampaignModal />
        <AnalyticsModal />
      </div>
    </div>
  );
};

export default AnalyticsPage;
