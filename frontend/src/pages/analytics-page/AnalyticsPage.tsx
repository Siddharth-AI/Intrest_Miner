/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  MousePointer,
  Target,
  Search,
  Filter,
  RefreshCw,
  Zap,
  AlertCircle,
  Play,
  Pause,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchAdAccounts,
  fetchCampaigns,
  fetchInsights,
  setSelectedAccount,
  setDateFilter,
  setCustomDateRange,
  setSearchTerm,
  setStatusFilter,
  setShowModal,
  setSelectedCampaignForModal,
  fetchCampaignInsights,
  resetFilters,
  clearError,
  setShowAnalyticsModal,
  setAnalysisResults,
  clearAllData,
} from "../../../store/features/facebookAdsSlice";
import {
  analyzeAllCampaigns,
  getHistoricalTrend,
  predictFuturePerformance,
} from "../../lib/analyticsService";
import CampaignModal from "../../components/model/CampaignModal";
import AnalyticsModal from "../../components/model/AnalyticsModal";

// Chart colors
const CHART_COLORS = {
  primary: "#3B82F6",
  secondary: "#10B981",
  tertiary: "#F59E0B",
  quaternary: "#EF4444",
  purple: "#8B5CF6",
};

const AnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
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
    error,
    lastUpdated,
  } = useAppSelector((state) => state.facebookAds);

  const [showCustomDatePicker, setShowCustomDatePicker] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);

  // Check if user is connected
  useEffect(() => {
    const token = localStorage.getItem("FB_ACCESS_TOKEN");
    setIsConnected(!!token);
    if (token && adAccounts.length === 0) {
      dispatch(fetchAdAccounts());
    }
  }, [dispatch, adAccounts.length]);

  // Fetch campaigns when account is selected
  useEffect(() => {
    if (selectedAccount && isConnected) {
      dispatch(fetchCampaigns(selectedAccount));
    }
  }, [selectedAccount, dispatch, isConnected]);

  // Fetch insights when campaigns are loaded or filters change
  useEffect(() => {
    if (selectedAccount && campaigns.length > 0 && isConnected) {
      dispatch(fetchInsights());
    }
  }, [
    selectedAccount,
    campaigns.length,
    dateFilter,
    customDateRange,
    dispatch,
    isConnected,
  ]);

  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;

    // If not using 'maximum' date filter, only show campaigns that have insights
    if (dateFilter !== "maximum") {
      const campaignsWithInsights = new Set(
        insights.map((insight) => insight.campaign_id)
      );
      filtered = filtered.filter((campaign) =>
        campaignsWithInsights.has(campaign.id)
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((campaign) =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (campaign) =>
          campaign.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return filtered;
  }, [campaigns, insights, searchTerm, statusFilter, dateFilter]);

  // Calculate campaign stats
  const campaignStats = useMemo(() => {
    console.log("Filtered Campaigns:", filteredCampaigns);

    return filteredCampaigns.map((campaign) => {
      const campaignInsights = insights.filter(
        (insight) => insight.campaign_id === campaign.id
      );

      const totalSpend = campaignInsights.reduce(
        (acc, insight) => acc + Number.parseFloat(insight.spend || "0"),
        0
      );
      const daily_budget = campaign.daily_budget;
      const totalClicks = campaignInsights.reduce(
        (acc, insight) => acc + Number.parseInt(insight.clicks || "0"),
        0
      );
      const totalImpressions = campaignInsights.reduce(
        (acc, insight) => acc + Number.parseInt(insight.impressions || "0"),
        0
      );
      const totalReach = campaignInsights.reduce(
        (acc, insight) => acc + Number.parseInt(insight.reach || "0"),
        0
      );

      const totalPurchases = campaignInsights.reduce((acc, insight) => {
        const purchases =
          insight.actions?.find((action) => action.action_type === "purchase")
            ?.value || "0";
        return acc + Number.parseInt(purchases);
      }, 0);

      const totalPurchaseValue = campaignInsights.reduce((acc, insight) => {
        const purchaseValue =
          insight.action_values?.find(
            (action) => action.action_type === "purchase"
          )?.value || "0";
        return acc + Number.parseFloat(purchaseValue);
      }, 0);

      const ctr =
        totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
      const roas = totalSpend > 0 ? totalPurchaseValue / totalSpend : 0;

      return {
        ...campaign,
        totalSpend,
        totalClicks,
        totalImpressions,
        totalReach,
        totalPurchases,
        totalPurchaseValue,
        ctr,
        cpc,
        roas,
        daily_budget,
        hasInsights: campaignInsights.length > 0,
      };
    });
  }, [filteredCampaigns, insights]);

  const handleConnect = () => {
    const clientId = "1573085653269421";
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent(
      "ads_management,ads_read,business_management,pages_read_engagement,pages_manage_metadata,pages_read_user_content,pages_manage_ads,pages_manage_posts,pages_messaging,read_insights"
    );

    const facebookAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=token`;

    window.location.href = facebookAuthUrl;
  };

  const handleDisconnect = () => {
    dispatch(clearAllData());
    setIsConnected(false);
  };

  // Handle Facebook OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get("access_token");

    if (accessToken) {
      localStorage.setItem("FB_ACCESS_TOKEN", accessToken);
      setIsConnected(true);
      dispatch(fetchAdAccounts());
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [dispatch]);

  const handleAnalyze = () => {
    if (campaigns.length === 0 || insights.length === 0) {
      return;
    }

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
  };

  const handleCampaignClick = (campaign: any) => {
    dispatch(setSelectedCampaignForModal(campaign));
    dispatch(fetchCampaignInsights(campaign.id));
    dispatch(setShowModal(true));
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        className:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: <Play className="h-3 w-3 mr-1" />,
      },
      paused: {
        className:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: <Pause className="h-3 w-3 mr-1" />,
      },
      deleted: {
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
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

  // Chart data preparation
  const chartData = useMemo(() => {
    return campaignStats
      .filter((campaign) => campaign.hasInsights)
      .slice(0, 10)
      .map((campaign) => ({
        name:
          campaign.name.length > 15
            ? campaign.name.substring(0, 15) + "..."
            : campaign.name,
        fullName: campaign.name,
        spend: campaign.totalSpend,
        clicks: campaign.totalClicks,
        impressions: campaign.totalImpressions / 1000, // Convert to thousands
        ctr: campaign.ctr,
        roas: campaign.roas,
      }));
  }, [campaignStats]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
            <BarChart3 className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Facebook Ads Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Connect your Facebook account to view detailed analytics and
            insights for your ad campaigns.
          </p>
          <Button
            onClick={handleConnect}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
            <Users className="h-5 w-5 mr-2" />
            Connect Facebook Account
          </Button>
        </motion.div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your Facebook Ads data...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Facebook Ads Analytics
                </h1>
                {lastUpdated && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(fetchInsights())}
                disabled={loading || !selectedAccount}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 dark:text-red-400">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(clearError())}
              className="ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select
                value={selectedAccount}
                onValueChange={(value) => dispatch(setSelectedAccount(value))}>
                <SelectTrigger className="bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Select Ad Account" />
                </SelectTrigger>
                <SelectContent>
                  {adAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select
                value={dateFilter}
                onValueChange={(value) => {
                  dispatch(setDateFilter(value));
                  if (value === "custom") {
                    setShowCustomDatePicker(true);
                  } else {
                    setShowCustomDatePicker(false);
                  }
                }}>
                <SelectTrigger className="bg-white dark:bg-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maximum">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_quarter">This Quarter</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showCustomDatePicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-4">
              <div className="flex-1">
                <Input
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
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex-1">
                <Input
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
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                className="pl-10 bg-white dark:bg-gray-800"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => dispatch(setStatusFilter(value))}>
                <SelectTrigger className="w-40 bg-white dark:bg-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => dispatch(resetFilters())}
                className="bg-white dark:bg-gray-800">
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={
                  loading || campaigns.length === 0 || insights.length === 0
                }
                className="bg-purple-600 hover:bg-purple-700 text-white">
                <Zap className="h-4 w-4 mr-2" />
                Analyze
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {aggregatedStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Total Spend
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(aggregatedStats.totalSpend)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        Total Clicks
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(aggregatedStats.totalClicks)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <MousePointer className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Impressions
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatNumber(aggregatedStats.totalImpressions)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}>
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        Avg CTR
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {aggregatedStats.avgCTR.toFixed(2)}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Campaign Performance
                  </CardTitle>
                  <CardDescription>
                    Spend and clicks comparison across campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis
                          dataKey="name"
                          className="text-xs"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value, name) => {
                            if (name === "Spend (₹)")
                              return [formatCurrency(Number(value)), name];
                            if (name === "Impressions (K)")
                              return [
                                formatNumber(Number(value) * 1000),
                                "Impressions",
                              ];
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
                          fill={CHART_COLORS.primary}
                          name="Spend (₹)"
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    CTR vs ROAS
                  </CardTitle>
                  <CardDescription>
                    Click-through rate and return on ad spend
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis
                          dataKey="name"
                          className="text-xs"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value, name) => {
                            if (name === "CTR (%)")
                              return [`${Number(value).toFixed(2)}%`, "CTR"];
                            if (name === "ROAS")
                              return [`${Number(value).toFixed(2)}x`, "ROAS"];
                            return [Number(value).toFixed(2), name];
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
                          dataKey="ctr"
                          fill={CHART_COLORS.tertiary}
                          name="CTR (%)"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="roas"
                          fill={CHART_COLORS.purple}
                          name="ROAS"
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

        {/* Campaigns Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Campaigns
                  </CardTitle>
                  <CardDescription>
                    {filteredCampaigns.length} campaigns found
                    {dateFilter !== "maximum" &&
                      " (showing only campaigns with insights)"}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {filteredCampaigns.length} campaigns
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCampaigns.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Objective</TableHead>
                        <TableHead className="text-left">
                          daily_budget
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaignStats.map((campaign, index) => {
                        console.log("Rendering campaign:", campaign);
                        return (
                          <motion.tr
                            key={campaign.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            onClick={() => handleCampaignClick(campaign)}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                  <Target className="h-3 w-3 text-purple-600" />
                                </div>
                                <span className="truncate max-w-[200px]">
                                  {campaign.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(campaign.status)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {campaign.objective?.replace("OUTCOME_", "") ||
                                  "N/A"}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-left font-medium">
                              {campaign.daily_budget}
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Target className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Campaigns Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mx-auto">
                    {campaigns.length === 0
                      ? "No campaigns available for the selected account."
                      : "No campaigns match your current filters."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <CampaignModal />
      <AnalyticsModal />
    </div>
  );
};

export default AnalyticsPage;
