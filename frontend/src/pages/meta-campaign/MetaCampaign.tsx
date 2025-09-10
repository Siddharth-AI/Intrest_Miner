/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Facebook,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Eye,
  MousePointer,
  RefreshCw,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const { toast } = useToast();

  // Facebook OAuth configuration
  const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID; // Your Facebook App ID
  const REDIRECT_URI = window.location.origin + "/dashboard";
  const SCOPES = "ads_management,ads_read,business_management";

  // **SIMPLIFIED: Just check if token exists**
  useEffect(() => {
    const existingToken = localStorage.getItem("FB_ACCESS_TOKEN");
    if (existingToken) {
      console.log("✅ Found existing token, user is connected");
      setIsConnected(true);
    }
  }, []);

  const connectMetaAccount = async () => {
    console.log("🔗 Starting Facebook connection...");
    setIsConnecting(true);

    try {
      const fbAuthUrl =
        `https://www.facebook.com/v19.0/dialog/oauth?` +
        `client_id=${FB_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `scope=${SCOPES}&` +
        `response_type=token&` +
        `state=dashboard`;

      console.log("🌐 Redirecting to Facebook OAuth:", fbAuthUrl);
      window.location.href = fbAuthUrl;
    } catch (error) {
      console.error("❌ Meta connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Meta Business Account",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)] dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Campaign Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your Meta Business Account to unlock powerful campaign
              insights and AI-powered optimization recommendations.
            </p>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                viewBox="0 0 24 24"
                fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Campaign Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Connect your Meta Business Account to unlock powerful campaign
              insights and AI-powered optimization recommendations.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Connect Your Meta Business Account
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Securely connect your Facebook and Instagram ad accounts to start
              analyzing your campaign performance
            </p>

            <button
              onClick={connectMetaAccount}
              disabled={isConnecting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook className="w-5 h-5 mr-2" />
                  Connect Meta Business Account
                </>
              )}
            </button>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}>
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Real-time Sync
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Auto-sync campaign data every 4 hours
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}>
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
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
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Deep Insights
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered performance analysis
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}>
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Smart Recommendations
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Actionable optimization suggestions
                </p>
              </motion.div>
            </div>

            <motion.div
              className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}>
              <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="w-4 h-4 mr-2"
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
                Your data is secure. We only access campaign performance metrics
                and never modify your ads or settings without your explicit
                permission.
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Connected state - enhanced with animations, Card component, and professional UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)] dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}>
        <Card className="bg-white dark:bg-gray-800 shadow-xl border-0 overflow-hidden">
          <CardHeader className="text-center pt-8">
            <motion.div
              className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, repeat: 1, ease: "easeInOut" }}>
                <Facebook className="w-12 h-12 text-green-600 dark:text-green-400" />
              </motion.div>
            </motion.div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🎉 Facebook Connected Successfully!
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
              Your Facebook account is connected and data is synced. Redirecting
              to analytics...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Button
              asChild
              className="mt-4 px-6 py-3 text-base font-medium rounded-lg shadow-sm transition-all hover:shadow-md"
              variant="default">
              <Link to="/analytics">Go to Analytics Dashboard →</Link>
            </Button>
            <motion.p
              className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Syncing data in the background...
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MetaCampaign;
