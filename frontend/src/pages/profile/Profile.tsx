/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
import { useNavigate } from "react-router-dom";
import {
  User,
  History,
  LogOut,
  Shield,
  CreditCard,
  Calendar,
  Mail,
  Settings,
  Award,
  Clock,
  ChevronRight,
  Bell,
  Sparkles,
  Search,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";

// Define TypeScript interfaces
interface UserData {
  name: string;
  email: string;
  joinDate: string;
  plan: string;
  searchCount: number;
  exportCount: number;
  lastLogin: string;
  planFeatures: string[];
}

interface ActivityItem {
  id: number;
  action: string;
  timestamp: string;
  type: "search" | "export" | "other";
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useNavigate();

  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockUserData: UserData = {
          name: "John Doe",
          email: "john.doe@example.com",
          joinDate: "January 15, 2023",
          plan: "Premium",
          searchCount: 128,
          exportCount: 47,
          lastLogin: "Today at 9:45 AM",
          planFeatures: [
            "Unlimited searches",
            "Advanced analytics",
            "CSV export",
            "API access",
          ],
        };

        setUserData(mockUserData);
        setError(null);
      } catch (err: any) {
        setError("Failed to load user data. Please try again later.");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    console.log("Tokens removed from localStorage");
    router("/");
  };

  const handleViewSearchHistory = (): void => {
    router("/search-history");
  };

  const handleAccountSettings = (): void => {
    router("/settings");
  };

  const handleNotificationSettings = (): void => {
    router("/notification-settings");
  };

  const handleManageBilling = (): void => {
    router("/billing");
  };

  const handleUpgradePlan = (): void => {
    router("/upgrade");
  };

  const handleViewAllActivity = (): void => {
    router("/activity");
  };

  const recentActivities: ActivityItem[] = [
    {
      id: 1,
      action: 'Search for "Digital Marketing"',
      timestamp: "Today at 10:23 AM",
      type: "search",
    },
    {
      id: 2,
      action: "Exported 12 interests",
      timestamp: "Yesterday at 3:45 PM",
      type: "export",
    },
    {
      id: 3,
      action: 'Search for "Fitness Enthusiasts"',
      timestamp: "Jan 24, 2024",
      type: "search",
    },
  ];

  const getActivityBorderColor = (type: ActivityItem["type"]): string => {
    switch (type) {
      case "search":
        return "border-[#3b82f6]";
      case "export":
        return "border-green-500";
      default:
        return "border-[#2563eb]";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(59,131,246,0.11)]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <h1 className="text-4xl font-bold text-[#111827] mb-4">My Profile</h1>
          <p className="text-xl text-[#2d3748] max-w-2xl mx-auto">
            Manage your account settings and view your activity
          </p>
        </motion.div>

        {loading ? (
          <motion.div
            className="flex flex-col justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}>
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-[#2563eb]/30 border-t-[#2563eb] rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}></div>
            </div>
            <p className="text-[#2d3748] mt-4 font-medium">
              Loading your profile...
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            className="bg-red-500/20 border border-red-400/30 text-red-800 px-6 py-4 rounded-2xl max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <p className="flex items-center gap-2 font-medium">
              <Shield className="h-5 w-5 text-red-600" />
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm bg-red-500/30 hover:bg-red-500/50 transition-all duration-200 px-4 py-2 rounded-lg">
              Try again
            </button>
          </motion.div>
        ) : (
          userData && (
            <motion.div
              className="grid gap-8 lg:grid-cols-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}>
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Profile Card */}
                <motion.div
                  className="bg-[#f1f5f9] rounded-2xl border border-[#2d3748]/20 overflow-hidden shadow-lg"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}>
                  {/* Profile Header */}
                  <div className="relative">
                    {/* Profile Background */}
                    <div
                      className="h-32"
                      style={{
                        background: `linear-gradient(135deg, #2d3748 0%, #3b82f6 100%)`,
                      }}></div>

                    {/* Profile Avatar */}
                    <div className="absolute -bottom-12 left-8">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-full blur-sm"></div>
                        <div className="relative bg-[#f1f5f9] p-4 rounded-full border-4 border-[#2d3748]/20">
                          <User className="h-16 w-16 text-[#2d3748]" />
                        </div>
                      </div>
                    </div>

                    {/* Premium Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Sparkles className="h-4 w-4 text-white" />
                        <span className="text-white font-semibold text-sm">
                          {userData.plan}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Content */}
                  <div className="pt-16 pb-6 px-8">
                    <h2 className="text-3xl font-bold text-[#111827]">
                      {userData.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-[#2d3748]">
                      <Mail className="h-4 w-4" />
                      <span>{userData.email}</span>
                    </div>

                    {/* Profile Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                      <motion.div
                        className="bg-[#3b82f6]/5 rounded-xl p-4 border border-[#2d3748]/10"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}>
                        <p className="text-[#2d3748] text-sm">Member Since</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-[#3b82f6]" />
                          <p className="font-medium text-[#111827]">
                            {userData.joinDate}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="bg-[#3b82f6]/5 rounded-xl p-4 border border-[#2d3748]/10"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}>
                        <p className="text-[#2d3748] text-sm">Searches</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Search className="h-4 w-4 text-[#2563eb]" />
                          <p className="font-medium text-[#111827]">
                            {userData.searchCount}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="bg-[#3b82f6]/5 rounded-xl p-4 border border-[#2d3748]/10"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}>
                        <p className="text-[#2d3748] text-sm">Exports</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Download className="h-4 w-4 text-green-600" />
                          <p className="font-medium text-[#111827]">
                            {userData.exportCount}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        className="bg-[#3b82f6]/5 rounded-xl p-4 border border-[#2d3748]/10"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}>
                        <p className="text-[#2d3748] text-sm">Last Login</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <p className="font-medium text-[#111827]">
                            {userData.lastLogin}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Subscription Details */}
                <motion.div
                  className="bg-[#f1f5f9] rounded-2xl border border-[#2d3748]/20 p-8 shadow-lg"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      <span className="text-[#111827]">
                        Your {userData.plan} Plan
                      </span>
                    </h3>
                    <motion.button
                      onClick={handleUpgradePlan}
                      className="bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium text-[#2d3748]"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}>
                      Upgrade Plan
                    </motion.button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[#2d3748] font-medium mb-3">
                        Plan Features
                      </h4>
                      <ul className="space-y-2">
                        {userData.planFeatures.map((feature, index) => (
                          <motion.li
                            key={index}
                            className="flex items-center gap-2 text-[#2d3748]"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}>
                            <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
                              <svg
                                className="h-3 w-3"
                                fill="currentColor"
                                viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-[#3b82f6]/20 to-[#2563eb]/20 rounded-xl p-6 border border-[#2d3748]/10">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-[#111827]">
                          Billing Information
                        </h4>
                        <CreditCard className="h-5 w-5 text-[#2d3748]" />
                      </div>
                      <p className="text-[#2d3748] text-sm mb-1">
                        Next billing date:
                      </p>
                      <p className="font-medium text-[#111827]">
                        February 15, 2024
                      </p>
                      <motion.button
                        onClick={handleManageBilling}
                        className="mt-4 w-full bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-all duration-200 py-2 rounded-lg text-sm text-[#2d3748]"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}>
                        Manage Billing
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Actions & Settings */}
              <div className="space-y-8">
                {/* Quick Actions */}
                <motion.div
                  className="bg-[#f1f5f9] rounded-2xl border border-[#2d3748]/20 p-6 shadow-lg"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}>
                  <h3 className="text-xl font-semibold mb-6 text-[#111827]">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <motion.button
                      onClick={handleViewSearchHistory}
                      className="w-full flex items-center justify-between bg-[#3b82f6]/5 hover:bg-[#3b82f6]/10 transition-all duration-200 px-5 py-4 rounded-xl border border-[#2d3748]/10 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-3">
                        <div className="bg-[#3b82f6]/20 p-2 rounded-lg text-[#3b82f6]">
                          <History className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-[#111827]">
                          View Search History
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#2d3748] group-hover:text-[#111827] transition-colors" />
                    </motion.button>

                    <motion.button
                      onClick={handleAccountSettings}
                      className="w-full flex items-center justify-between bg-[#3b82f6]/5 hover:bg-[#3b82f6]/10 transition-all duration-200 px-5 py-4 rounded-xl border border-[#2d3748]/10 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-3">
                        <div className="bg-[#2563eb]/20 p-2 rounded-lg text-[#2563eb]">
                          <Settings className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-[#111827]">
                          Account Settings
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#2d3748] group-hover:text-[#111827] transition-colors" />
                    </motion.button>

                    <motion.button
                      onClick={handleNotificationSettings}
                      className="w-full flex items-center justify-between bg-[#3b82f6]/5 hover:bg-[#3b82f6]/10 transition-all duration-200 px-5 py-4 rounded-xl border border-[#2d3748]/10 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-500/20 p-2 rounded-lg text-amber-600">
                          <Bell className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-[#111827]">
                          Notification Settings
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#2d3748] group-hover:text-[#111827] transition-colors" />
                    </motion.button>

                    <motion.button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 px-5 py-4 rounded-xl border border-red-500/20 group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-3">
                        <div className="bg-red-500/20 p-2 rounded-lg text-red-600">
                          <LogOut className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-red-700">Logout</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-red-600 group-hover:text-red-700 transition-colors" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  className="bg-[#f1f5f9] rounded-2xl border border-[#2d3748]/20 p-6 shadow-lg"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}>
                  <h3 className="text-xl font-semibold mb-4 text-[#111827]">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        className={`border-l-2 ${getActivityBorderColor(
                          activity.type
                        )} pl-4 py-1`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}>
                        <p className="font-medium text-[#111827]">
                          {activity.action}
                        </p>
                        <p className="text-sm text-[#2d3748]">
                          {activity.timestamp}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    onClick={handleViewAllActivity}
                    className="mt-4 w-full bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-all duration-200 py-2 rounded-lg text-sm text-[#2d3748]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    View All Activity
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
};

export default Profile;
