import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import {
  Home,
  Search,
  BarChart3,
  Download,
  Settings,
  Link as LinkIcon,
  User,
  Brain,
  History,
  LogOut,
  X,
  TrendingUp,
} from "lucide-react";

import { clearAllData } from "../../../store/features/facebookAdsSlice";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { resetSearchState } from "../../../store/features/facebookSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { GiMiner } from "react-icons/gi";
import { FaMoneyBillWave } from "react-icons/fa";
import { logout } from "../../../store/features/loginSlice";
import Portal from "../ui/Portal";
import { fetchProfileData } from "../../../store/features/profileSlice";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isCollapsed }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const router = useNavigate();
  const {
    data: userData,
    loading,
    error,
    updateSuccess,
  } = useAppSelector((state) => state.profile);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    dispatch(fetchProfileData());
  }, [dispatch]);
  // Check if mobile (using sm breakpoint: 640px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle body scroll lock ONLY on mobile when sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px"; // Prevent layout shift
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isMobile, isOpen]);

  // Listen for theme changes
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

  // Handle click outside user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Skip click outside logic when sidebar is collapsed to avoid conflicts with Portal
      if (isCollapsed && !isMobile) {
        return;
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu, isCollapsed, isMobile]);

  useEffect(() => {
    if (showUserMenu && isCollapsed && !isMobile) {
      // Auto close after 5 seconds for collapsed mode
      const timer = setTimeout(() => {
        setShowUserMenu(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showUserMenu, isCollapsed, isMobile]);

  const handleLogout = () => {
    // Clear authentication token
    localStorage.clear();

    // Clear Facebook data and token
    dispatch(clearAllData());

    // Reset other states if needed
    dispatch(resetSearchState());

    // Logout user
    dispatch(logout());

    // Navigate to home
    router("/");
    setShowUserMenu(false);
  };

  const navigationItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/dashboard",
      active: location.pathname === "/dashboard",
    },
    {
      name: "Miner Generator",
      icon: GiMiner,
      path: "/miner",
      active: location.pathname === "/miner",
    },
    {
      name: "Premium Generator",
      icon: Brain,
      path: "/permium-miner",
      active: location.pathname === "/permium-miner",
    },
    {
      name: "Basic Analytics",
      icon: BarChart3,
      path: "/analytics",
      active: location.pathname === "/analytics",
      badge: "New",
    },
    {
      name: "Advance Analytics",
      icon: TrendingUp,
      path: "/advance-analytics",
      active: location.pathname === "/advance-analytics",
      badge: "Pro",
    },
  ];

  const metaIntegration = [
    {
      name: "Connect Meta",
      icon: LinkIcon,
      path: "/meta-campaign",
      active: location.pathname === "/meta-campaign",
    },
  ];

  // const accountItems = [
  //   {
  //     name: "Profile",
  //     icon: User,
  //     path: "/profile",
  //     active: location.pathname === "/profile",
  //   },
  //   {
  //     name: "Account Settings",
  //     icon: Settings,
  //     path: "/profile-update",
  //     active: location.pathname === "/profile-update",
  //   },
  //   {
  //     name: "Search History",
  //     icon: History,
  //     path: "/search-history",
  //     active: location.pathname === "/search-history",
  //   },
  // ];

  const userMenuItems = [
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/profile-update", icon: Settings, label: "Account Settings" },
    { to: "/search-history", icon: History, label: "Search History" },
    { to: "/billing-history", icon: FaMoneyBillWave, label: "Billing History" },
  ];

  const handleNavClick = () => {
    if (isMobile) {
      onToggle(); // Close sidebar on mobile after navigation
    }
  };

  // On mobile, use overlay pattern. On desktop, use collapse pattern
  const sidebarWidth = isMobile
    ? isOpen
      ? "translate-x-0"
      : "-translate-x-full"
    : isCollapsed
    ? "w-20"
    : "w-72";

  return (
    <>
      {/* Mobile Backdrop Overlay - Only show on mobile */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar - Responsive behavior */}
      <motion.aside
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 ${
          isMobile ? `w-80 transform ${sidebarWidth}` : sidebarWidth
        } flex flex-col overflow-hidden`}
        initial={false}
        animate={isMobile ? {} : { width: isCollapsed ? 80 : 288 }}>
        {/* Header */}
        <div
          className={`flex-shrink-0 ${
            isCollapsed && !isMobile ? "px-4" : "px-6"
          } py-4 border-b border-gray-200 dark:border-gray-700`}>
          <Link
            to="/dashboard"
            className="flex items-center space-x-3"
            onClick={() => {
              dispatch(resetSearchState());
              handleNavClick();
            }}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GiMiner className="w-5 h-5 text-white" />
            </div>
            {(!isCollapsed || isMobile) && (
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  InterestMiner
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI-Powered Marketing
                </p>
              </div>
            )}
          </Link>

          {/* Mobile Close Button - Only show on mobile */}
          {isMobile && (
            <button
              onClick={onToggle}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Main Navigation */}
          <div className={`${isCollapsed && !isMobile ? "px-2" : "px-6"}`}>
            {(!isCollapsed || isMobile) && (
              <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Navigation
              </h2>
            )}
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center ${
                    isCollapsed && !isMobile ? "justify-center px-2" : "px-3"
                  } py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title={isCollapsed && !isMobile ? item.name : undefined}>
                  <item.icon
                    className={`${
                      isCollapsed && !isMobile ? "w-5 h-5" : "w-5 h-5 mr-3"
                    }`}
                  />
                  {(!isCollapsed || isMobile) && (
                    <>
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Meta Integration */}
          <div className={`${isCollapsed && !isMobile ? "px-2" : "px-6"}`}>
            {(!isCollapsed || isMobile) && (
              <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Meta Integration
              </h2>
            )}
            <nav className="space-y-1">
              {metaIntegration.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center ${
                    isCollapsed && !isMobile ? "justify-center px-2" : "px-3"
                  } py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title={isCollapsed && !isMobile ? item.name : undefined}>
                  <item.icon
                    className={`${
                      isCollapsed && !isMobile ? "w-5 h-5" : "w-5 h-5 mr-3"
                    }`}
                  />
                  {(!isCollapsed || isMobile) && <span>{item.name}</span>}
                </Link>
              ))}
            </nav>
          </div>

          {/* Account */}
          {/* <div className={`${isCollapsed && !isMobile ? "px-2" : "px-6"}`}>
            {(!isCollapsed || isMobile) && (
              <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Account
              </h2>
            )}
            <nav className="space-y-1">
              {accountItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center ${
                    isCollapsed && !isMobile ? "justify-center px-2" : "px-3"
                  } py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title={isCollapsed && !isMobile ? item.name : undefined}>
                  <item.icon
                    className={`${
                      isCollapsed && !isMobile ? "w-5 h-5" : "w-5 h-5 mr-3"
                    }`}
                  />
                  {(!isCollapsed || isMobile) && <span>{item.name}</span>}
                </Link>
              ))}
            </nav>
          </div> */}
        </div>

        {/* Enhanced Footer - User Info with Settings Dropdown */}
        {userData && (
          <div
            className={`flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 relative ${
              isCollapsed && !isMobile ? "px-2" : ""
            }`}
            ref={userMenuRef}>
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center ${
                isCollapsed && !isMobile ? "justify-center" : "space-x-3"
              } p-2 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left`}
              title={
                isCollapsed && !isMobile
                  ? userData.email?.split("@")[0] || "User"
                  : undefined
              }>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {userData.email ? userData.email.charAt(0).toUpperCase() : "U"}
              </div>
              {(!isCollapsed || isMobile) && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {userData.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {userData.subscription_status === "active"
                        ? "Premium"
                        : "Free Trial"}
                    </p>
                  </div>
                  <Settings className="w-6 h-6 text-gray-400 flex-shrink-0 group-hover:animate-spin" />
                </>
              )}
            </motion.button>

            {showUserMenu &&
              (isCollapsed && !isMobile ? (
                // Render as a floating panel outside of sidebar
                <Portal>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="fixed left-20 bottom-8 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-[60]" // left-20 matches collapsed width, w-64 gives enough space
                    style={{ pointerEvents: "all" }}>
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => {
                          setShowUserMenu(false);
                          handleNavClick();
                        }}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </motion.div>
                </Portal>
              ) : (
                // Default dropdown inside sidebar for normal mode/mobile
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-4 right-4 bottom-[5.3rem] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        setShowUserMenu(false);
                        handleNavClick();
                      }}
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </motion.div>
              ))}
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;
