/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useCallback, useMemo, useState } from "react";
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
  CursorArrowRaysIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchAdAccounts,
  fetchCampaigns,
  fetchInsights,
  setSelectedAccount,
  setSelectedCampaign,
  fetchCampaignInsights,
  checkFacebookStatus,
} from "../../../store/features/facebookAdsSlice";
import {
  fetchOnboardingStatus,
  updateOnboardingStatus,
} from "../../../store/features/onboardingSlice";

import { useToast } from "../../hooks/use-toast";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import OnboardingModal from "../../components/modals/OnboardingModal";
import FloatingHelpButton from "@/components/common/FloatingHelpButton";
import DashboardHelpModal from "@/components/modals/DashboardHelpModal";
import HelpTooltip from "@/components/common/HelpTooltip";

// NEW - Use Facebook auth state instead of profile data
const TokenStatus: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const { facebookAuth } = useAppSelector((state) => state.facebookAds);

  if (!facebookAuth.isConnected || !facebookAuth.status?.facebook_token_valid) {
    return null;
  }

  const primaryConnection = facebookAuth.primaryConnection;
  if (!primaryConnection) return null;

  const tokenAge =
    (Date.now() - new Date(primaryConnection.fb_token_updated_at).getTime()) /
    1000;
  const remainingSeconds = primaryConnection.fb_token_expires_in - tokenAge;
  const daysLeft = Math.ceil(remainingSeconds / (24 * 60 * 60));
  const isExpiring = daysLeft <= 10 && daysLeft > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={` px-3 py-[14px] border rounded-2xl font-semibold shadow-lg transition-all duration-300  ${
        isExpiring
          ? isDarkMode
            ? "bg-amber-900/20 border-amber-700/50 text-amber-300"
            : "bg-amber-50 border-amber-200 text-amber-800"
          : isDarkMode
          ? "bg-green-900/20 border-green-700/50 text-green-300"
          : "bg-green-50 border-green-200 text-green-800"
      }`}>
      <div className="flex items-center gap-2 text-sm">
        <div
          className={`w-2 h-2 rounded-full ${
            isExpiring ? "bg-amber-400" : "bg-green-400"
          }`}
        />
        {isExpiring ? (
          <span>⚠️ Reconnect Facebook soon to avoid data interruption.</span>
        ) : (
          <span> Facebook connected</span>
        )}
      </div>
    </motion.div>
  );
};

// Facebook Connection Banner Component
const FacebookConnectionBanner: React.FC<{
  isDarkMode: boolean;
  onConnect: () => void;
}> = ({ isDarkMode, onConnect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl p-6 mb-8 border-l-4 ${
        isDarkMode
          ? "bg-slate-800/50 border-l-yellow-500 border border-slate-700/50"
          : "bg-yellow-50/80 border-l-yellow-500 border border-yellow-200/50"
      }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div
            className={`p-2 rounded-lg ${
              isDarkMode ? "bg-yellow-500/20" : "bg-yellow-200/60"
            }`}>
            <svg
              className="w-6 h-6 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <div>
            <h3
              className={`text-xl font-bold mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
              Dashboard Features Disabled
            </h3>
            <p
              className={`${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              } mb-3`}>
              You're seeing zeros and "pending" status because your Meta
              Business account isn't connected yet.
              <span className="font-semibold text-yellow-500">
                {" "}
                Connect now to see your real campaign data and unlock all
                dashboard features!
              </span>
            </p>
          </div>
        </div>

        <motion.button
          onClick={onConnect}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap">
          Connect Facebook
        </motion.button>
      </div>
    </motion.div>
  );
};

// StatCard Component - Simple animations only
const StatCard: React.FC<any> = ({ card, isDarkMode, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`group rounded-3xl p-6 min-w-[240px] border backdrop-blur-xl relative overflow-hidden cursor-pointer transition-all duration-300 hover:transform hover:scale-105`}
      style={{
        background: isDarkMode
          ? `linear-gradient(145deg, rgba(30,38,52,0.95) 0%, rgba(20,25,35,0.9) 100%)`
          : `linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)`,
        borderColor: isDarkMode
          ? "rgba(59,130,246,0.2)"
          : "rgba(59,130,246,0.15)",
      }}>
      <div
        className={`w-14 h-14 flex items-center justify-center rounded-2xl mb-4 shadow-lg transition-all duration-300 ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/30"
            : "bg-gradient-to-br from-white to-gray-50 border border-gray-200/50"
        }`}>
        <card.icon
          className={`w-7 h-7 transition-colors duration-300 ${
            isDarkMode ? "text-blue-400" : "text-blue-600"
          }`}
        />
      </div>

      <div className={`text-3xl font-bold mb-2 ${card.valueColor}`}>
        {card.value}
      </div>

      <div
        className={`text-lg font-semibold mb-2 ${
          isDarkMode ? "text-gray-100" : "text-gray-800"
        }`}>
        {card.title}
      </div>

      <div
        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
        {card.description}
      </div>
    </motion.div>
  );
};

// QuickActionCard Component - Simple animations only
const QuickActionCard: React.FC<any> = ({ action, isDarkMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className={`group rounded-3xl p-8 border relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:transform hover:-translate-y-2`}
      style={{
        background: isDarkMode
          ? `linear-gradient(145deg, rgba(30,38,52,0.9) 0%, rgba(20,25,35,0.95) 100%)`
          : `linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)`,
        borderColor: isDarkMode
          ? "rgba(59,130,246,0.2)"
          : "rgba(59,130,246,0.15)",
      }}>
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`p-3 rounded-xl ${
            isDarkMode
              ? "bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/20"
              : "bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-200"
          }`}>
          <action.icon className={`w-6 h-6 ${action.iconColor}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
              {action.title}
            </h3>
            {action.badge && (
              <span
                className={`${action.badgeColor} text-xs px-3 py-1 rounded-full font-semibold`}>
                {action.badge}
              </span>
            )}
          </div>
          <p
            className={`text-sm leading-relaxed ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}>
            {action.description}
          </p>
        </div>
      </div>

      <Link to={action.link}>
        <button
          className={`group/btn w-full flex items-center justify-center gap-2 ${action.btnColor} text-white font-bold px-6 py-4 rounded-2xl shadow-lg text-base transition-all duration-300 hover:shadow-xl`}>
          <span className="relative z-10">{action.btnText}</span>
          <ArrowRightIcon className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
      </Link>
    </motion.div>
  );
};

// ProgressBar Component - NO blinking animations
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
        initial={{ width: 0 }}
        animate={{ width: `${clampedPercent}%` }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        className={`h-3 rounded-full ${
          isDarkMode
            ? "bg-gradient-to-r from-blue-500 to-cyan-400"
            : "bg-gradient-to-r from-blue-500 to-cyan-400"
        }`}></motion.div>
    </div>
  );
};

// Add this CustomDropdown component after all your imports
interface CustomDropdownProps {
  label: string;
  options: Array<{ id: string; name: string }>;
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  isDarkMode: boolean;
  colorScheme: "blue" | "purple";
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  isDarkMode,
  colorScheme,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  const colors = {
    blue: {
      dot: "bg-blue-500",
      border: isDarkMode
        ? "border-slate-600/50 hover:border-blue-500/50"
        : "border-gray-300/50 hover:border-blue-400/50",
      hover: isDarkMode ? "hover:bg-slate-700/70" : "hover:bg-blue-50",
    },
    purple: {
      dot: "bg-purple-500",
      border: isDarkMode
        ? "border-slate-600/50 hover:border-purple-500/50"
        : "border-gray-300/50 hover:border-purple-400/50",
      hover: isDarkMode ? "hover:bg-slate-700/70" : "hover:bg-purple-50",
    },
  };

  // UPDATED: Removed all scroll listeners, only keep click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            value ? "bg-green-500 animate-pulse" : "bg-gray-400"
          }`}
        />
        <label
          className={`text-sm font-semibold tracking-wide ${
            isDarkMode ? "text-gray-200" : "text-gray-700"
          }`}>
          {label}
        </label>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`w-full h-14 rounded-xl shadow-md backdrop-blur-xl border-2 transition-all duration-300 font-medium px-4 flex items-center justify-between ${
            isDarkMode
              ? `bg-slate-800/80 text-gray-100 ${colors[colorScheme].border} hover:bg-slate-700/80`
              : `bg-white/90 text-gray-800 ${colors[colorScheme].border} hover:bg-white`
          } ${isOpen ? "ring-2 ring-offset-2 ring-offset-transparent" : ""}`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${
                value ? colors[colorScheme].dot : "bg-gray-400"
              }`}
            />
            <span className={selectedOption ? "" : "text-gray-500"}>
              {selectedOption ? selectedOption.name : placeholder}
            </span>
          </div>

          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`absolute z-50 w-full mt-2 rounded-xl backdrop-blur-xl shadow-2xl border overflow-hidden ${
                isDarkMode
                  ? "bg-slate-800/95 text-gray-100 border-slate-700"
                  : "bg-white/95 text-gray-900 border-gray-200"
              }`}>
              <div ref={menuRef} className="max-h-64 overflow-y-auto">
                {options.length === 0 ? (
                  <div className="py-8 px-4 text-center text-gray-500">
                    No options available
                  </div>
                ) : (
                  options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect(option.id)}
                      className={`w-full py-3.5 px-4 cursor-pointer transition-colors duration-200 flex items-center gap-3 text-left ${
                        colors[colorScheme].hover
                      } ${
                        option.id === value
                          ? isDarkMode
                            ? "bg-slate-700/50"
                            : "bg-gray-100"
                          : ""
                      }`}>
                      <div
                        className={`w-2 h-2 rounded-full ${colors[colorScheme].dot}`}
                      />
                      <span className="font-medium flex-1">{option.name}</span>

                      {option.id === value && (
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>

              <div
                className={`py-2 px-4 text-xs font-medium border-t ${
                  isDarkMode
                    ? "text-gray-400 border-slate-700"
                    : "text-gray-500 border-gray-200"
                }`}>
                {options.length} option{options.length !== 1 ? "s" : ""}{" "}
                available
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(true);

  // Get profile data from Redux
  const { data: profileData } = useAppSelector((state) => state.profile);

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
    facebookAuth,
  } = useAppSelector((state) => state.facebookAds);
  const { hasSeenOnboarding, loading: onboardingLoading } = useAppSelector(
    (state) => state.onboarding
  );

  // Local state
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [hasFetchedOnboarding, setHasFetchedOnboarding] = useState(false);

  // Fetch onboarding status when component mounts
  useEffect(() => {
    if (!hasFetchedOnboarding) {
      console.log("Dashboard: Fetching onboarding status...");
      dispatch(fetchOnboardingStatus());
      setHasFetchedOnboarding(true);
    }
  }, [dispatch, hasFetchedOnboarding]);

  // Show onboarding modal based on backend data
  useEffect(() => {
    console.log("Dashboard onboarding check:", {
      onboardingLoading,
      hasSeenOnboarding,
    });

    // Wait for data to load
    if (onboardingLoading) {
      console.log("Still loading onboarding data...");
      return;
    }

    // Check if user has seen onboarding
    if (!hasSeenOnboarding) {
      console.log("User has not seen onboarding, showing modal");
      setShowOnboardingModal(true);
    } else {
      console.log("User has already seen onboarding");
      setShowOnboardingModal(false);
    }
  }, [hasSeenOnboarding, onboardingLoading]);

  // Handle onboarding completion
  const handleCompleteOnboarding = useCallback(() => {
    console.log("Dashboard: Completing onboarding and updating backend");
    setShowOnboardingModal(false);

    // Update backend
    dispatch(updateOnboardingStatus({ hasSeenOnboarding: true }));
  }, [dispatch]);

  // Theme state - NO animated theme detection
  const [isDarkMode, setIsDarkMode] = React.useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  useEffect(() => {
    const authToken = localStorage.getItem("token");
    if (authToken) {
      // 🔥 NEW: Check Facebook status
      dispatch(checkFacebookStatus());
    }
  }, [dispatch]);

  // Show tooltip on mount
  useEffect(() => {
    setShowHelpTooltip(true);
  }, []);
  // Simple theme detection without animation
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Facebook connection check
  // NEW - Use Facebook auth state
  const isConnected =
    facebookAuth.isConnected && facebookAuth.status?.facebook_token_valid;
  console.log(isConnected, "isconnected=>>>>>>>>>>>>");
  const hasFacebookConnection = isConnected;

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Check if user has seen onboarding
  // useEffect(() => {
  //   const hasSeenOnboarding = localStorage.getItem(
  //     "interestMinerOnboardingCompleted"
  //   );
  //   if (!hasSeenOnboarding) {
  //     setShowOnboarding(true);
  //   }
  // }, []);

  const router = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem("token");
    if (authToken && hasFacebookConnection && adAccounts.length === 0) {
      console.log("🔄 Fetching ad accounts...");
      dispatch(fetchAdAccounts());
    }
  }, [dispatch, hasFacebookConnection, adAccounts.length]);

  useEffect(() => {
    if (adAccounts.length > 0 && !selectedAccount) {
      dispatch(setSelectedAccount(adAccounts[0].id));
      toast({
        title: "Account Auto-Selected",
        description: `Automatically selected: ${adAccounts[0].name}`,
      });
    }
  }, [adAccounts, selectedAccount, dispatch, toast]);

  useEffect(() => {
    if (selectedAccount) {
      dispatch(fetchCampaigns(selectedAccount));
    }
  }, [selectedAccount, dispatch]);

  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaign && selectedAccount) {
      dispatch(setSelectedCampaign(campaigns[0].id));
      toast({
        title: "Campaign Auto-Selected",
        description: `Automatically selected: ${campaigns[0].name}`,
      });
    }
  }, [campaigns, selectedCampaign, selectedAccount, dispatch, toast]);

  useEffect(() => {
    if (selectedCampaign) {
      dispatch(fetchCampaignInsights(selectedCampaign));
    }
  }, [selectedCampaign, dispatch]);

  useEffect(() => {
    if (selectedAccount && campaigns.length > 0) {
      dispatch(fetchInsights({ forceRefresh: false, enableAI: false }));
    }
  }, [selectedAccount, campaigns.length, dispatch]);

  // All your existing handlers remain the same...
  const handleAccountChange = useCallback(
    (accountId: string) => {
      dispatch(setSelectedAccount(accountId));
      if (accountId && hasFacebookConnection) {
        dispatch(fetchCampaigns(accountId));
        dispatch(fetchInsights({ forceRefresh: false, enableAI: false }));
      }
      toast({
        title: "Loading Data",
        description: "Fetching campaigns and insights...",
      });
    },
    [dispatch, hasFacebookConnection, toast]
  );

  const handleCampaignChange = useCallback(
    (campaignId: string) => {
      if (!hasFacebookConnection) return;
      dispatch(setSelectedCampaign(campaignId));
      if (campaignId) {
        dispatch(fetchCampaignInsights(campaignId));
      }
    },
    [dispatch, hasFacebookConnection]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (selectedAccount) {
        await dispatch(fetchCampaigns(selectedAccount)).unwrap();
        await dispatch(
          fetchInsights({ forceRefresh: false, enableAI: false })
        ).unwrap();

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

  // All your existing data calculations remain the same...
  const dashboardStats = useMemo(
    () => ({
      connectedAccounts: adAccounts.length,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === "ACTIVE").length,
      dataInsights: campaignInsightstotal.length,
    }),
    [adAccounts.length, campaigns, campaignInsightstotal.length]
  );

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
      <OnboardingModal
        isOpen={showOnboardingModal && !onboardingLoading}
        onClose={handleCompleteOnboarding}
      />

      <div className="relative">
        <div
          className={`min-h-screen transition-all duration-300 ${themeConfig.background} ${themeConfig.text}`}>
          <div className="min-h-screen p-6">
            {!hasFacebookConnection ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`relative overflow-hidden rounded-2xl p-6 mb-8 ${
                    isDarkMode
                      ? "bg-slate-800/50 border-b-blue-500 border border-slate-700/50"
                      : "bg-white border border-b-blue-500/30 border-gray-200/50"
                  }`}>
                  <div className="flex justify-center mb-6">
                    <div className="text-center">
                      <h1
                        className={`text-4xl font-black tracking-tight mb-2 bg-gradient-to-r ${
                          isDarkMode
                            ? "from-blue-400 via-purple-400 to-cyan-400"
                            : "from-blue-600 via-purple-600 to-cyan-600"
                        } bg-clip-text text-transparent`}>
                        Welcome back!
                      </h1>

                      <p
                        className={`text-lg ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        } max-w-2xl leading-relaxed`}>
                        Your comprehensive dashboard for Meta Ads optimization
                        and AI-powered audience insights.
                      </p>
                    </div>
                  </div>
                </motion.div>
                <FacebookConnectionBanner
                  isDarkMode={isDarkMode}
                  onConnect={() => router("/meta-campaign")}
                />
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`relative overflow-hidden rounded-2xl p-6 mb-8 ${
                    isDarkMode
                      ? "bg-slate-800/50 border-b-blue-500 border border-slate-700/50"
                      : "bg-white border border-b-blue-500/30 border-gray-200/50"
                  }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1
                        className={`text-4xl font-black tracking-tight mb-2 bg-gradient-to-r ${
                          isDarkMode
                            ? "from-blue-400 via-purple-400 to-cyan-400"
                            : "from-blue-600 via-purple-600 to-cyan-600"
                        } bg-clip-text text-transparent`}>
                        Welcome back! 👋
                      </h1>

                      <p
                        className={`text-lg ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        } max-w-2xl leading-relaxed`}>
                        Your comprehensive dashboard for Meta Ads optimization
                        and AI-powered audience insights.
                      </p>
                    </div>

                    <div className="flex gap-4 items-center">
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 ${
                          isDarkMode
                            ? "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 text-blue-400 hover:bg-slate-700/50"
                            : "bg-white/80 backdrop-blur-xl border border-gray-200/50 text-blue-600 hover:bg-white"
                        }`}>
                        <ArrowPathIcon
                          className={`w-5 h-5 ${
                            isRefreshing ? "animate-spin" : ""
                          }`}
                        />
                        {isRefreshing ? "Refreshing..." : "Refresh Data"}
                      </button>
                      <TokenStatus isDarkMode={isDarkMode} />
                    </div>
                  </div>
                </motion.div>
                {/* Selectors */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`relative rounded-2xl p-6 mb-8 ${
                    isDarkMode
                      ? "bg-slate-800/50 border-b-blue-500 border border-slate-700/50"
                      : "bg-white border border-b-blue-500/30 border-gray-200/50"
                  }`}>
                  {/* Content */}
                  <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ad Account Selector */}
                    {adAccounts.length > 0 && (
                      <CustomDropdown
                        label="Ad Account"
                        options={adAccounts.map((acc) => ({
                          id: acc.id,
                          name: acc.name,
                        }))}
                        value={selectedAccount}
                        onChange={handleAccountChange}
                        placeholder="Choose an ad account"
                        isDarkMode={isDarkMode}
                        colorScheme="blue"
                      />
                    )}

                    {/* Campaign Selector */}
                    {campaigns.length > 0 && (
                      <CustomDropdown
                        label="Campaign"
                        options={campaigns.map((c) => ({
                          id: c.id,
                          name: c.name,
                        }))}
                        value={selectedCampaign}
                        onChange={handleCampaignChange}
                        placeholder="Choose a campaign"
                        isDarkMode={isDarkMode}
                        colorScheme="purple"
                      />
                    )}
                  </div>
                </motion.div>
              </>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, index) => (
                <StatCard
                  key={card.title}
                  card={card}
                  isDarkMode={isDarkMode}
                  index={index}
                />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.title}
                  action={action}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div
                className={`rounded-3xl p-8 backdrop-blur-xl border transition-all duration-300 ${themeConfig.cardBg} ${themeConfig.border} ${themeConfig.shadow}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`p-2 rounded-xl ${
                      isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                    }`}>
                    <ClockIcon
                      className={`w-5 h-5 ${
                        isDarkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                  </div>
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
                    <div
                      key={index}
                      className={`flex items-start gap-4 p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                        isDarkMode
                          ? "bg-slate-800/30 hover:bg-slate-800/50"
                          : "bg-gray-50/50 hover:bg-gray-100/50"
                      }`}>
                      <div
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
                      </div>

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
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Overview */}
              <div
                className={`rounded-3xl p-8 backdrop-blur-xl border transition-all duration-300 ${themeConfig.cardBg} ${themeConfig.border} ${themeConfig.shadow}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`p-2 rounded-xl ${
                      isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
                    }`}>
                    <UserGroupIcon
                      className={`w-5 h-5 ${
                        isDarkMode ? "text-purple-400" : "text-purple-600"
                      }`}
                    />
                  </div>
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
                      <span className="font-bold text-lg">
                        {dashboardStats.connectedAccounts}
                      </span>
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
                      <span className="font-bold text-lg">
                        {dashboardStats.activeCampaigns} /{" "}
                        {dashboardStats.totalCampaigns}
                      </span>
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
                      <span className="font-bold text-lg">
                        {dashboardStats.dataInsights}
                      </span>
                    </div>
                    <ProgressBar
                      percent={Math.min(dashboardStats.dataInsights, 20) * 5}
                      isDarkMode={isDarkMode}
                      delay={0.4}
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200/10 flex items-center justify-between">
                  <Link to="/analytics">
                    <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
                      View Full Analytics
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <HelpTooltip
          show={showHelpTooltip}
          message="How it works"
          onClose={() => setShowHelpTooltip(false)}
        />
        <FloatingHelpButton
          onClick={() => setIsHelpModalOpen(true)}
          help="Dashboard Help"
        />
      </div>

      {/* Add these components at the end, just before the closing </div> */}

      <DashboardHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </>
  );
};

export default Dashboard;
