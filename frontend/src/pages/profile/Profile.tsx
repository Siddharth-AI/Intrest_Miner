/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
  ChevronRight,
  Sparkles,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../store/hooks"; // Adjusted import path
import {
  fetchProfileData,
  resetUpdateStatus,
} from "../../../store/features/profileSlice"; // Adjusted import path
import { openPricingModal } from "../../../store/features/pricingModalSlice";
import {
  fetchSearchAiHistory, // Import the new thunk
  SearchHistoryAiItem, // Import the new interface
} from "../../../store/features/openAiSearchHistorySlice"; // Path to your OpenAI business search slice
import { FaMoneyBill, FaMoneyBillWave } from "react-icons/fa";
import {
  fetchSearchHistory,
  SearchHistoryItem,
} from "../../../store/features/facebookSearchHistorySlice";

// Define TypeScript interfaces
// UserProfileData is imported from profileSlice.ts
interface ActivityItem {
  id: string; // Changed to string to accommodate both types
  action: string;
  timestamp: string; // This will be the formatted date string
  rawTimestamp: string; // To store the original timestamp for sorting
  type: "search" | "export" | "ai_search" | "other"; // Added ai_search type
}

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useNavigate();

  // Accessing the openai business search slice from Redux
  const {
    data: openaiBusinessHistory,
    loading: openaiLoading,
    error: openaiError,
  } = useAppSelector((state) => state.aiSearchHistory);

  // Get data from Redux store for user profile
  const {
    data: userData,
    loading,
    error,
    updateSuccess,
  } = useAppSelector((state) => state.profile);
  const {
    data: facebookSearchHistory,
    loading: facebookLoading,
    error: facebookError,
  } = useAppSelector((state) => state.facebookSearchHistory);

  console.log(facebookSearchHistory, "fb now =>>>>>>>>>>");
  console.log(openaiBusinessHistory, "open ai now====>");

  // State to hold the merged and formatted activities
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  // If update was successful, refetch profile data to show latest info
  useEffect(() => {
    if (updateSuccess) {
      dispatch(fetchProfileData());
      dispatch(resetUpdateStatus()); // Reset update success status
    }
  }, [updateSuccess, dispatch]);

  // Fetch all necessary data on component mount
  useEffect(() => {
    dispatch(fetchProfileData());
    dispatch(fetchSearchAiHistory()); // Ensure this is dispatched
    dispatch(fetchSearchHistory()); // Ensure this is dispatched
  }, [dispatch]); // Added dispatch to dependency array for consistency

  // Function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Set hours, minutes, seconds, milliseconds to 0 for accurate date comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Today";
    } else if (date.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      // Format as "Jan 24, 2025"
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateString));
    }
  };

  // Effect to merge and sort activities when data changes
  useEffect(() => {
    if (openaiBusinessHistory || facebookSearchHistory) {
      // Map OpenAI business history to ActivityItem
      const openaiActivities: ActivityItem[] = openaiBusinessHistory.map(
        (item: SearchHistoryAiItem) => ({
          id: item.id,
          // Use optional chaining or a fallback for productName to prevent "undefined"
          action: `Premium Search for "${item.productName}"`,
          timestamp: formatDate(item.created_at),
          rawTimestamp: item.created_at, // Store raw timestamp for sorting
          type: "ai_search",
        })
      );
      const facebookActivities: ActivityItem[] = facebookSearchHistory.map(
        (item: SearchHistoryItem) => ({
          id: item.id,
          // Use optional chaining or a fallback for productName to prevent "undefined"
          action: `Miner Search for "${item.search_text}"`,
          timestamp: formatDate(item.created_at),
          rawTimestamp: item.created_at, // Store raw timestamp for sorting
          type: "ai_search",
        })
      );

      // Concatenate both arrays
      const allActivities = [...facebookActivities, ...openaiActivities];

      // Sort by rawTimestamp in descending order
      allActivities.sort(
        (a, b) =>
          new Date(b.rawTimestamp).getTime() -
          new Date(a.rawTimestamp).getTime()
      );

      // Take the top 5 recent activities
      setRecentActivities(allActivities.slice(0, 4)); // Changed back to 5 as per original request
    }
  }, [openaiBusinessHistory, facebookSearchHistory]);

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
    router("/profile-update"); // Navigate to the new profile update page
  };

  const handleNotificationSettings = (): void => {
    router("/notification-settings");
  };

  const handleBillingHistory = (): void => {
    router("/billing-history");
  };

  const handleUpgradePlan = (): void => {
    dispatch(openPricingModal());
  };

  const getActivityBorderColor = (type: ActivityItem["type"]): string => {
    switch (type) {
      case "search":
        return "border-[#3b82f6]"; // Blue for Facebook search
      case "ai_search":
        return "border-purple-500"; // Purple for AI search
      case "export":
        return "border-green-500";
      default:
        return "border-[#2563eb]";
    }
  };

  return (
    <div className=" pt-32 pb-20 min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)] font-inter p-4">
      {" "}
      {/* Reduced overall padding */}
      <div className="max-w-6xl mx-auto">
        {" "}
        {/* Reduced max-width */}
        {/* Page Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-extrabold text-[#111827] mb-2">
            My Profile
          </h1>{" "}
          {/* Reduced font size */}
          <p className="text-lg text-[#2d3748] max-w-xl mx-auto">
            {" "}
            {/* Reduced font size, max-width */}
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
              <div className="w-12 h-12 border-4 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-12 h-12 border-4 border-[#2563eb]/30 border-t-[#2563eb] rounded-full animate-spin"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "1.5s",
                }}></div>
            </div>
            <p className="text-[#2d3748] mt-3 font-medium text-sm">
              {" "}
              {/* Smaller text */}
              Loading your profile...
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            className="bg-red-500/20 border border-red-400/30 text-red-800 px-4 py-3 rounded-xl max-w-lg mx-auto shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <p className="flex items-center gap-2 font-medium text-sm">
              {" "}
              {/* Smaller text */}
              <Shield className="h-4 w-4 text-red-600" /> {/* Smaller icon */}
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs bg-red-500/30 hover:bg-red-500/50 transition-all duration-200 px-3 py-1.5 rounded-lg text-red-800">
              {" "}
              {/* Smaller button */}
              Try again
            </button>
          </motion.div>
        ) : (
          userData && (
            <motion.div
              className="grid gap-6 lg:grid-cols-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}>
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                {" "}
                {/* Reduced space-y */}
                {/* Profile Card */}
                <motion.div
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl transform transition-all duration-300 hover:shadow-2xl"
                  transition={{ duration: 0.2 }}>
                  {/* Profile Header */}
                  <div className="relative">
                    {/* Profile Background */}
                    <div
                      className="h-28"
                      style={{
                        background: `linear-gradient(135deg, #2d3748 0%, #3b82f6 100%)`,
                      }}></div>

                    {/* Profile Avatar */}
                    <div className="absolute -bottom-12 left-6">
                      {" "}
                      {/* Adjusted position */}
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-full blur-sm"></div>
                        <div className="relative bg-white p-3 rounded-full border-3 border-gray-200 shadow-md">
                          {" "}
                          {/* Reduced padding, border, shadow */}
                          <User className="h-16 w-16 text-[#2d3748]" />{" "}
                          {/* Reduced icon size */}
                        </div>
                      </div>
                    </div>

                    {/* Premium Badge */}
                    <div className="absolute top-3 right-3">
                      {" "}
                      {/* Adjusted position */}
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                        {" "}
                        {/* Reduced padding, gap, shadow */}
                        <Sparkles className="h-4 w-4 text-white" />{" "}
                        {/* Reduced icon size */}
                        <span className="text-white font-semibold text-sm">
                          {" "}
                          {/* Reduced font size */}
                          {userData.plan_details.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Content */}
                  <div className="pt-16 pb-6 px-6">
                    {" "}
                    {/* Reduced padding */}
                    <h2 className="text-3xl font-extrabold text-[#111827]">
                      {" "}
                      {/* Reduced font size */}
                      {userData.name}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1 text-[#2d3748] text-base">
                      {" "}
                      {/* Reduced gap, font size */}
                      <Mail className="h-4 w-4" /> {/* Reduced icon size */}
                      <span>{userData.email}</span>
                    </div>
                    {/* Profile Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                      {" "}
                      {/* Reduced gap, margin-top */}
                      <motion.div
                        className="bg-[#e0f2fe] rounded-lg p-3 border border-blue-100 shadow-sm"
                        whileHover={{
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        transition={{ duration: 0.2 }}>
                        <p className="text-[#2d3748] text-xs">Member Since</p>{" "}
                        {/* Reduced font size */}
                        <div className="flex items-center gap-1.5 mt-1">
                          {" "}
                          {/* Reduced gap, margin-top */}
                          <Calendar className="h-4 w-4 text-[#3b82f6]" />{" "}
                          {/* Reduced icon size */}
                          <p className="font-semibold text-[#111827] text-sm">
                            {" "}
                            {/* Reduced font size */}
                            {new Date(userData.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                      <motion.div
                        className="bg-[#e0f2fe] rounded-lg p-3 border border-blue-100 shadow-sm"
                        whileHover={{
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        transition={{ duration: 0.2 }}>
                        <p className="text-[#2d3748] text-xs">
                          Searches Remaining
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Download className="h-4 w-4 text-green-600" />
                          <p className="font-semibold text-[#111827] text-sm">
                            {userData.searches_remaining || 0}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
                {/* Subscription Details */}
                <motion.div
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl transform transition-all duration-300 hover:shadow-2xl"
                  transition={{ duration: 0.2 }}>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                    {" "}
                    {/* Reduced margin-bottom, padding-bottom */}
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {" "}
                      {/* Reduced font size, gap */}
                      <Award className="h-5 w-5 text-amber-600" />{" "}
                      {/* Reduced icon size */}
                      {userData.subscription_status === "active" ? (
                        <span className="text-[#111827]">
                          Your Current Plan :{" "}
                          <span className="text-amber-600">
                            {userData.plan_details.name}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#111827]">
                          Your Don't Have Any Active Plan
                        </span>
                      )}
                    </h3>
                    {userData.subscription_status !== "active" && (
                      <motion.button
                        onClick={handleUpgradePlan}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all duration-300"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                        whileTap={{ scale: 0.95 }}>
                        Plans
                      </motion.button>
                    )}
                  </div>

                  {userData.subscription_status === "active" && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {" "}
                      {/* Reduced gap */}
                      <div>
                        <h4 className="text-[#2d3748] font-semibold text-base mb-3">
                          {" "}
                          {/* Reduced font size, margin-bottom */}
                          Plan Features
                        </h4>
                        <ul className="space-y-2">
                          {" "}
                          {/* Reduced space-y */}
                          {/* Ensure features is an array before mapping */}
                          {(Array.isArray(userData.plan_details.features)
                            ? userData.plan_details.features
                            : []
                          ).map((feature: string, index: number) => (
                            <motion.li
                              key={index}
                              className="flex items-center gap-2 text-[#2d3748] text-sm"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.1,
                              }}>
                              <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 flex-shrink-0">
                                {" "}
                                {/* Reduced size */}
                                <svg
                                  className="h-3 w-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 Sand 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              {feature}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] rounded-xl p-5 border border-blue-100 shadow-md">
                        {" "}
                        {/* Reduced padding, rounded, shadow */}
                        <div className="flex justify-between items-center mb-3">
                          {" "}
                          {/* Reduced margin-bottom */}
                          <h4 className="font-bold text-[#111827] text-base">
                            {" "}
                            {/* Reduced font size */}
                            Billing Information
                          </h4>
                          <CreditCard className="h-5 w-5 text-[#2d3748]" />{" "}
                          {/* Reduced icon size */}
                        </div>
                        <p className="text-[#2d3748] text-sm mb-1.5">
                          {" "}
                          {/* Reduced font size, margin-bottom */}
                          Next billing date:
                        </p>
                        <p className="font-semibold text-[#111827] text-lg">
                          {" "}
                          {/* Reduced font size */}
                          {new Date(userData.end_date).toLocaleDateString()}
                        </p>
                        <motion.button
                          onClick={handleBillingHistory}
                          className="mt-4 w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}>
                          Billing History
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Right Column - Actions & Settings */}
              <div className="space-y-6">
                {" "}
                {/* Reduced space-y */}
                {/* Quick Actions */}
                <motion.div
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xl transform transition-all duration-300 hover:shadow-2xl"
                  transition={{ duration: 0.2 }}>
                  <h3 className="text-xl font-bold mb-5 text-[#111827]">
                    {" "}
                    {/* Reduced font size, margin-bottom */}
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    {" "}
                    {/* Reduced space-y */}
                    <motion.button
                      onClick={handleAccountSettings}
                      className="w-full flex items-center justify-between bg-[#e0f2fe] hover:bg-[#cce8ff] transition-all duration-200 px-5 py-3.5 rounded-xl border border-blue-100 group shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-2.5">
                        <div className="bg-[#2563eb]/20 p-2.5 rounded-lg text-[#2563eb] flex-shrink-0">
                          <Settings className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-[#111827] text-base">
                          Account Settings
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#2d3748] group-hover:text-[#111827] transition-colors" />
                    </motion.button>
                    <motion.button
                      onClick={handleViewSearchHistory}
                      className="w-full flex items-center justify-between bg-[#e0f2fe] hover:bg-[#cce8ff] transition-all duration-200 px-5 py-3.5 rounded-xl border border-blue-100 group shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-2.5">
                        {" "}
                        {/* Reduced gap */}
                        <div className="bg-[#3b82f6]/20 p-2.5 rounded-lg text-[#3b82f6] flex-shrink-0">
                          {" "}
                          {/* Reduced padding, rounded */}
                          <History className="h-5 w-5" />{" "}
                          {/* Reduced icon size */}
                        </div>
                        <span className="font-medium text-[#111827] text-base">
                          {" "}
                          {/* Reduced font size */}
                          Search History
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#2d3748] group-hover:text-[#111827] transition-colors" />{" "}
                      {/* Reduced icon size */}
                    </motion.button>
                    <motion.button
                      onClick={handleBillingHistory}
                      className="w-full flex items-center justify-between bg-[#e0f2fe] hover:bg-[#cce8ff] transition-all duration-200 px-5 py-3.5 rounded-xl border border-blue-100 group shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-2.5">
                        <div className="bg-[#2563eb]/20 p-2.5 rounded-lg text-[#2563eb] flex-shrink-0">
                          <FaMoneyBillWave className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-[#111827] text-base">
                          Billing History
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#2d3748] group-hover:text-[#111827] transition-colors" />
                    </motion.button>
                    <motion.button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 px-5 py-3.5 rounded-xl border border-red-500/20 group shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      <div className="flex items-center gap-2.5">
                        <div className="bg-red-500/20 p-2.5 rounded-lg text-red-600 flex-shrink-0">
                          <LogOut className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-red-700 text-base">
                          Logout
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-red-600 group-hover:text-red-700 transition-colors" />
                    </motion.button>
                  </div>
                </motion.div>
                {/* Recent Activity */}
                <motion.div
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xl transform transition-all duration-300 hover:shadow-2xl"
                  transition={{ duration: 0.2 }}>
                  <h3 className="text-xl font-bold mb-4 text-[#111827]">
                    {" "}
                    {/* Reduced font size, margin-bottom */}
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {" "}
                    {/* Reduced space-y */}
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        className={`border-l-4 ${getActivityBorderColor(
                          activity.type
                        )} pl-3.5 py-1.5 rounded-md`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}>
                        <p className="font-semibold text-[#111827] text-sm">
                          {" "}
                          {/* Reduced font size */}
                          {activity.action}
                        </p>
                        <p className="text-xs text-[#2d3748]">
                          {" "}
                          {/* Reduced font size */}
                          {activity.timestamp}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <motion.button
                    onClick={() => router("/search-history")}
                    className="mt-5 w-full bg-[#e0f2fe] hover:bg-[#cce8ff] transition-all duration-200 py-2.5 rounded-xl text-sm font-semibold text-[#2d3748] shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    View All Activity
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )
        )}
        <div className="overflow-hidden">
          <div className="-z-10 absolute top-[4.2rem] right-2 w-24 h-24 bg-gradient-to-b from-blue-500 to-purple-400 rounded-full opacity-30 animate-float"></div>
          <div
            className="-z-10 absolute bottom-4 right-[33rem] w-32 h-32 bg-gradient-to-r from-black to-purple-600 rounded-full opacity-20 animate-float"
            style={{ animationDelay: "2s" }}></div>
          <div className="-z-10 absolute -bottom-48 left-24 w-48 h-48 bg-gradient-to-t from-purple-500 to-blue-300 rounded-full opacity-30 animate-float"></div>
          <div className="-z-10 absolute top-48 left-60 w-48 h-48 bg-gradient-to-t from-purple-500 to-blue-600 rounded-full opacity-70 animate-float"></div>
          <div className="-z-10 absolute top-[20rem] left-[20rem] w-40 h-40 bg-gradient-to-b from-purple-600 to-blue-500 rounded-full opacity-30 animate-float"></div>
          <div className="-z-10 absolute top-[20rem] right-[10rem] w-36 h-36 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full opacity-20 animate-float"></div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
