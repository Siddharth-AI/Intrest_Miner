"use client";

import { useState, useRef, useEffect } from "react";
import { GiMiner } from "react-icons/gi";
import {
  Pickaxe,
  Bell,
  User,
  Menu,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import NotificationModel from "../model/NotificationModel";
import ProfileModal from "@/components/model/ProfileModel";
import { Link, useNavigate } from "react-router-dom";
import PremiumMinerButton from "../ui/PremiumMinerButton";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { resetSearchState } from "../../../store/features/facebookSlice";
import { fetchProfileData } from "../../../store/features/profileSlice";
import { openPricingModal } from "../../../store/features/pricingModalSlice";

interface UserHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  onCollapseClick: () => void;
  sidebarCollapsed: boolean;
}

export default function UserHeader({
  onMenuClick,
  sidebarOpen,
  onCollapseClick,
  sidebarCollapsed,
}: UserHeaderProps) {
  const {
    data: userData,
    loading,
    error,
    updateSuccess,
  } = useAppSelector((state) => state.profile);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useNavigate();
  const bellRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const dispatch = useAppDispatch();

  // Check if mobile (using sm breakpoint: 640px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Dark mode toggle function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (!userData && !loading && !error) {
      dispatch(fetchProfileData());
    }
  }, [dispatch, userData, loading, error]);

  return (
    <>
      {/* Fixed header - Responsive positioning */}
      <header
        className={`fixed top-0 right-0 z-30 transition-all duration-300 ${
          sidebarCollapsed ? "sm:left-20" : "sm:left-72"
        } left-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16`}>
        <div className="flex items-center justify-between h-full px-4 sm:px-6">
          {/* Left Section: Collapse + Mobile Toggle + Welcome Message */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Collapse Button - Only show on desktop */}
            {!isMobile && (
              <motion.button
                onClick={onCollapseClick}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={
                  sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                }>
                {sidebarCollapsed ? (
                  <PanelLeft className="w-5 h-5" />
                ) : (
                  <PanelLeftClose className="w-5 h-5" />
                )}
              </motion.button>
            )}

            {/* Mobile Sidebar Toggle Button - Only show on mobile */}
            {isMobile && (
              <motion.button
                onClick={onMenuClick}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open sidebar">
                <Menu className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          {/* Right Section: Navigation */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle Button */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle theme">
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Notifications */}
            {/* <motion.button
              ref={bellRef}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </motion.button> */}

            {/* Profile - Hide on mobile since it's in sidebar */}
            {/* <motion.button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              ref={profileButtonRef}
              className="hidden sm:flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {userData?.email ? userData.email.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userData?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userData?.subscription_status === "active"
                    ? "Premium"
                    : "Free Trial"}
                </p>
              </div>
            </motion.button> */}
          </div>
        </div>

        {/* Profile Modal - Desktop only */}
        {/* {showProfileMenu && (
          <ProfileModal
            onClose={() => setShowProfileMenu(false)}
            isOpen={showProfileMenu}
            triggerRef={profileButtonRef}
          />
        )} */}

        {/* Notification Dropdown */}
        <NotificationModel
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          triggerRef={bellRef}
        />
      </header>
    </>
  );
}
