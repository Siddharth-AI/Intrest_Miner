/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Eye, MousePointer, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
// ADD: Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchProfileData } from "../../../store/features/profileSlice";
import { FaFacebook } from "react-icons/fa";
import {
  ArrowRightIcon,
  ChartBarIcon,
  ClockIcon,
  HomeIcon,
  LinkSlashIcon,
} from "@heroicons/react/24/outline";
import {
  clearAllData,
  // 🔥 NEW: Add Facebook auth imports
  checkFacebookStatus,
  initiateFacebookLogin,
  unlinkFacebookAccount,
} from "../../../store/features/facebookAdsSlice";

interface MetaAccount {
  id: string;
  account_id: string;
  account_name: string;
  business_id: string | null;
  ad_account_ids: string[];
  is_active: boolean;
  last_sync_at: string | null;
}

interface Campaign {
  id: string;
  campaign_id: string;
  campaign_name: string;
  account_id: string;
  status: string;
  objective: string | null;
  daily_budget: number | null;
  lifetime_budget: number | null;
  insights: any;
  last_synced_at: string;
}

const MetaCampaign: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useNavigate();
  const { data: profileData, loading: profileLoading } = useAppSelector(
    (state) => state.profile
  );

  // Theme detection
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  const handleDisconnect = async () => {
    console.log("🔗 Disconnecting Facebook...");
    setIsConnecting(true);

    try {
      // Get the primary connection ID to disconnect
      const primaryConnectionId = facebookAuth.primaryConnection?.id;

      // Pass the connection ID to disconnect specific connection
      await dispatch(unlinkFacebookAccount(primaryConnectionId)).unwrap();

      toast({
        title: "Facebook Disconnected",
        description: "Your Facebook account has been disconnected successfully",
      });

      // Clear data and refresh
      dispatch(clearAllData());
      router("/dashboard");
      console.log("✅ Facebook disconnected, user still logged into website");
    } catch (error: any) {
      console.error("❌ Facebook disconnect error:", error);
      toast({
        title: "Disconnect Failed",
        description: `Failed to disconnect Facebook: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  // NEW - Check both profile and Facebook status
  useEffect(() => {
    const authToken = localStorage.getItem("token");
    if (authToken) {
      dispatch(fetchProfileData());
      // 🔥 NEW: Check Facebook status
      dispatch(checkFacebookStatus());
    }
    setIsLoading(false);
  }, [dispatch]);

  // NEW - Use Facebook auth state
  const { facebookAuth } = useAppSelector((state) => state.facebookAds);
  const isConnected =
    facebookAuth.isConnected && facebookAuth.status?.facebook_token_valid;

  // NEW - Use Redux action
  const connectMetaAccount = async () => {
    console.log("🔗 Starting Facebook connection...");
    setIsConnecting(true);

    try {
      await dispatch(initiateFacebookLogin()).unwrap();
      // Redirect happens in the action
    } catch (error: any) {
      console.error("❌ Meta connection error:", error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect to Meta Business Account: ${error}`,
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  // Loading state for profile data
  if (profileLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            Loading Facebook connection status...
          </p>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 p-6 flex items-center justify-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/10 dark:bg-indigo-600/5 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          className="max-w-5xl w-full relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}>
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
            {/* Success gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5 dark:from-green-400/10 dark:via-blue-400/10 dark:to-purple-400/10"></div>

            <CardHeader className="text-center pt-10 pb-6 relative">
              {/* Animated success icon */}
              <motion.div
                className="relative mx-auto mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  type: "spring",
                  bounce: 0.4,
                }}>
                {/* Success circle with gradient */}
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center relative shadow-2xl">
                  {/* Inner glow */}
                  <div className="absolute inset-2 bg-white/20 rounded-full"></div>

                  {/* Facebook logo */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}>
                    <FaFacebook className="w-12 h-12 text-white relative z-10" />
                  </motion.div>

                  {/* Success checkmark overlay */}
                  <motion.div
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.8, type: "spring" }}>
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                </div>

                {/* Animated rings */}
                <motion.div
                  className="absolute inset-0 border-4 border-green-300 rounded-full"
                  animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 border-4 border-blue-300 rounded-full"
                  animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5,
                    ease: "easeOut",
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-3">
                  🎉 Connection Successful!
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed px-4">
                  Your Facebook account is now connected and synchronized.
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {" "}
                    Ready to unlock powerful insights!
                  </span>
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="text-center pb-10 px-8">
              {/* Connection details */}
              <motion.div
                className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl border border-blue-100 dark:border-slate-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ✓
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Authenticated
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ⚡
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Data Synced
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    🚀
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Ready to Go
                  </div>
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                className=" flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}>
                {/* Primary CTA - Analytics Button */}

                <Link
                  to="/analytics"
                  className="flex flex-1 items-center justify-center gap-2 py-3 px-4 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 border-0 z-50">
                  <ChartBarIcon className="w-5 h-5" />
                  Launch Analytics
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>

                {/* Secondary actions in a row */}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDisconnect}
                  disabled={isConnecting}
                  className="flex py-3 px-4 rounded-xl border-2 flex-1 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed z-50">
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      <span>Disconnecting...</span>
                    </>
                  ) : (
                    <>
                      <LinkSlashIcon className="h-4 w-4" />
                      <span>Disconnect</span>
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Sync status */}
              <motion.div
                className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-100 dark:border-green-800/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}>
                <div className="flex items-center justify-center gap-3 text-sm">
                  <RefreshCw className="w-4 h-4 text-green-600 dark:text-green-400 animate-spin" />
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    Real-time synchronization active
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Your campaigns and insights are being updated automatically
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 p-6 relative overflow-hidden">
      {/* Enhanced background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/10 dark:bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/10 dark:bg-purple-600/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-200/5 dark:bg-indigo-600/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden relative">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-400/10 dark:via-indigo-400/10 dark:to-purple-400/10"></div>

            <CardContent className="text-center p-12 relative">
              {/* Main Facebook icon */}
              <motion.div
                className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-2xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}>
                <FaFacebook className="w-12 h-12 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
                  Connect Your Meta Business Account
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                  Securely connect your Meta Business Account to unlock
                  insights, track performance, and boost results with AI-powered
                  recommendations.
                </p>

                <motion.button
                  onClick={connectMetaAccount}
                  disabled={isConnecting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl shadow-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed border-0">
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FaFacebook className="w-6 h-6 mr-3" />
                      Connect Meta Business Account
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Enhanced Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <motion.div
                  className="text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                    Real-time Sync
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Auto-sync campaign data every 4 hours with intelligent
                    caching for optimal performance
                  </p>
                </motion.div>

                <motion.div
                  className="text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Eye className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                    Deep Insights
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    AI-powered performance analysis with actionable
                    recommendations and trend predictions
                  </p>
                </motion.div>

                <motion.div
                  className="text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}>
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <MousePointer className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                    Smart Recommendations
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Intelligent optimization suggestions based on machine
                    learning algorithms
                  </p>
                </motion.div>
              </div>

              {/* Security notice */}
              <motion.div
                className="mt-12 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl border border-green-100 dark:border-green-800/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}>
                <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <svg
                    className="w-5 h-5 mr-3 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="font-semibold text-green-700 dark:text-green-300">
                    Enterprise-Grade Security
                  </span>
                </div>
                <p className="text-center text-gray-600 dark:text-gray-400 leading-relaxed">
                  Your data is protected with bank-level encryption. We only
                  access campaign performance metrics and never modify your ads
                  or settings without your explicit permission.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MetaCampaign;
