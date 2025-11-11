"use client";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Redux Imports
import {
  searchFacebookInterests,
  resetSearchState,
  setCurrentPage,
  setSelectedRows,
  toggleRowSelection,
} from "../../../store/features/facebookSlice";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
// Add these imports
import MinerHelpModal from "../../components/modals/MinerHelpModal";

import {
  saveFacebookSearchHistory,
  resetSaveSearchHistoryState,
} from "../../../store/features/facebookSearchHistorySlice";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  Download,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchProfileData } from "../../../store/features/profileSlice";
import FloatingHelpButton from "@/components/common/FloatingHelpButton";
import HelpTooltip from "@/components/common/HelpTooltip";

interface Message {
  type: "success" | "error";
  text: string;
}

export default function MinerApp() {
  const dispatch = useAppDispatch();
  const {
    interests: results,
    totalResults: resultCount,
    status,
    error,
    selectedRows,
    currentPage,
  } = useAppSelector((state) => state.facebook);
  // Add this state for help modal
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const [showHelpTooltip, setShowHelpTooltip] = useState(true);
  const {
    savingSearchHistory,
    saveSearchHistoryError,
    saveSearchHistorySuccess,
  } = useAppSelector((state) => state.facebookSearchHistory);

  // Theme detection
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [itemsPerPage] = useState<number>(15);

  const router = useNavigate();
  const searchTermRef = useRef<HTMLInputElement>(null);

  const isLoading = status === "loading";
  const hasSearched = status === "succeeded" || status === "failed";

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

  useEffect(() => {
    dispatch(fetchProfileData());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router("/login");
    }
  }, [router]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchTermRef.current?.value || "";
    if (!query.trim()) {
      dispatch(resetSearchState());
      if (searchTermRef.current) {
        searchTermRef.current.value = "";
      }
      toast({
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    const saveResultAction = await dispatch(
      saveFacebookSearchHistory({ search_text: query })
    );

    if (saveFacebookSearchHistory.fulfilled.match(saveResultAction)) {
      console.log("Search history stored successfully via Redux thunk.");
    } else if (saveFacebookSearchHistory.rejected.match(saveResultAction)) {
      toast({
        description:
          (saveResultAction.payload as string) ||
          "Failed to save search history.",
        variant: "destructive",
      });
    }

    dispatch(searchFacebookInterests({ query, limit: 1000 }));
  };

  const handleClearSelection = () => {
    dispatch(setSelectedRows([]));
  };

  const handleSelectRow = (id: string) => {
    dispatch(toggleRowSelection(id));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allIds = e.target.checked ? results.map((row) => row.id) : [];
    dispatch(setSelectedRows(allIds));
  };

  const handleExport = () => {
    const selectedItems = results.filter((item) =>
      selectedRows.includes(item.id)
    );
    if (selectedItems.length === 0) {
      setMessage({
        type: "error",
        text: "Please select at least one item to export",
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    const headers = [
      "Name",
      "Audience Size Lower",
      "Audience Size Upper",
      "Path",
      "Topic",
    ];
    const rows = selectedItems.map((item) => [
      `"${item.name}"`,
      item.audience_size_lower_bound,
      item.audience_size_upper_bound,
      `"${item.path?.join(" > ") || ""}"`,
      `"${item.topic || ""}"`,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${searchTermRef.current?.value || "selected_interests"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage({
      type: "success",
      text: `${selectedItems.length} items exported successfully`,
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const totalPages = Math.ceil(resultCount / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < totalPages) {
      dispatch(setCurrentPage(currentPage + 1));
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      dispatch(setCurrentPage(currentPage - 1));
    }
  };
  const firstPage = () => dispatch(setCurrentPage(1));
  const lastPage = () => dispatch(setCurrentPage(totalPages));

  function formatAudienceSize(number: number): string {
    if (number >= 1_000_000_000) {
      return (number / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    } else if (number >= 1_000_000) {
      return (number / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    } else if (number >= 1_000) {
      return (number / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    } else {
      return number.toString();
    }
  }

  const EmptyState = ({ type }: { type: string }) => {
    const isInitialLoad = type === "initial";
    const message = isInitialLoad
      ? "Ready to discover amazing ad interests? Start your first search!"
      : "No data found. Try a different search term.";

    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="relative mb-8">
          <motion.div
            className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.4, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
            <motion.div
              className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
              <p className="text-gray-700 dark:text-gray-300 text-center font-medium leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="text-center max-w-md px-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isInitialLoad
              ? "Welcome to InterestMiner! 🚀"
              : "Oops! Nothing found 🔍"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {isInitialLoad
              ? "Use our AI-powered search to discover highly targeted Facebook ad interests that will boost your campaign performance."
              : "Try using different keywords, check your spelling, or explore broader terms to find relevant interests."}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Interest Discovery
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Discover high-performing audience interests with precision
              targeting
            </p>
          </motion.div>

          {/* Message Display */}
          <AnimatePresence>
            {message && (
              <motion.div
                className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-3 ${
                  message.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}>
                {message.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <p className="font-medium">{message.text}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Form */}
          <motion.form
            onSubmit={handleSearch}
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  ref={searchTermRef}
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  placeholder="Search for interests... (e.g. fitness, cooking, travel)"
                />
              </div>
              <motion.button
                type="submit"
                disabled={isLoading || savingSearchHistory}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>
                {isLoading ? "Searching..." : "Search"}
              </motion.button>
            </div>
          </motion.form>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}>
            {[
              {
                label: "Total Results",
                value: resultCount.toLocaleString(),
                icon: Target,
                gradient: "from-blue-500 to-cyan-500",
                bg: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
              },
              {
                label: "Selected Items",
                value: selectedRows.length.toString(),
                icon: Users,
                gradient: "from-purple-500 to-pink-500",
                bg: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
              },
              {
                label: "Current Page",
                value: `${currentPage} of ${totalPages || 1}`,
                icon: TrendingUp,
                gradient: "from-emerald-500 to-green-500",
                bg: "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className={`relative overflow-hidden bg-gradient-to-br ${stat.bg} rounded-xl p-4 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 group`}
                whileHover={{ scale: 1.02, y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <motion.div
                      className={`w-8 h-8 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center shadow-lg`}
                      whileHover={{ rotate: 5, scale: 1.1 }}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-400 text-xl font-medium">
                      {stat.label}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Results Section */}
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12">
              <div className="flex items-center justify-center">
                <motion.div
                  className="w-8 h-8 border-2 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="ml-3 text-gray-600 dark:text-gray-400 font-medium">
                  Searching...
                </span>
              </div>
            </div>
          ) : !hasSearched ? (
            <EmptyState type="initial" />
          ) : results.length === 0 ? (
            <EmptyState type="no-results" />
          ) : (
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}>
              {/* Table Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        results.length > 0 &&
                        selectedRows.length === results.length
                      }
                      className="w-4 h-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Select All Results
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleClearSelection}
                      className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium">
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ${
                      selectedRows.includes(item.id)
                        ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                        : ""
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}>
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                        className="w-4 h-4 text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          Audience:{" "}
                          {formatAudienceSize(
                            item.audience_size_lower_bound
                          )} -{" "}
                          {formatAudienceSize(item.audience_size_upper_bound)}
                        </div>
                      </div>
                      <motion.button
                        onClick={() => handleSelectRow(item.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedRows.includes(item.id)
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}>
                        {selectedRows.includes(item.id) ? "Selected" : "Select"}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Pagination */}
          {results.length > 0 && (
            <motion.div
              className="mt-8 flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}>
              <div className="flex items-center gap-2">
                {[
                  {
                    onClick: firstPage,
                    disabled: currentPage === 1,
                    icon: ChevronsLeft,
                  },
                  {
                    onClick: prevPage,
                    disabled: currentPage === 1,
                    icon: ChevronLeft,
                  },
                ].map((btn, idx) => (
                  <motion.button
                    key={idx}
                    onClick={btn.onClick}
                    disabled={btn.disabled}
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    whileHover={{ scale: btn.disabled ? 1 : 1.05 }}
                    whileTap={{ scale: btn.disabled ? 1 : 0.98 }}>
                    <btn.icon
                      size={18}
                      className="text-gray-600 dark:text-gray-300"
                    />
                  </motion.button>
                ))}
              </div>

              <div className="text-center">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Page {currentPage} of {totalPages}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {resultCount.toLocaleString()} total results
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[
                  {
                    onClick: nextPage,
                    disabled: currentPage === totalPages,
                    icon: ChevronRight,
                  },
                  {
                    onClick: lastPage,
                    disabled: currentPage === totalPages,
                    icon: ChevronsRight,
                  },
                ].map((btn, idx) => (
                  <motion.button
                    key={idx}
                    onClick={btn.onClick}
                    disabled={btn.disabled}
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                    whileHover={{ scale: btn.disabled ? 1 : 1.05 }}
                    whileTap={{ scale: btn.disabled ? 1 : 0.98 }}>
                    <btn.icon
                      size={18}
                      className="text-gray-600 dark:text-gray-300"
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Selected Items Preview */}
          <AnimatePresence>
            {selectedRows.length > 0 && (
              <motion.div
                className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Selected Items ({selectedRows.length})
                  </h3>
                  <div className="flex items-center gap-6">
                    {selectedRows.length > 0 && (
                      <motion.button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-500 dark:to-green-500 hover:from-emerald-700 hover:to-green-700 dark:hover:from-emerald-600 dark:hover:to-green-600 text-white text-sm rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}>
                        <Download className="w-4 h-4" />
                        Export ({selectedRows.length})
                      </motion.button>
                    )}
                    <button
                      onClick={handleClearSelection}
                      className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {results
                    .filter((item) => selectedRows.includes(item.id))
                    .map((item) => (
                      <motion.div
                        key={item.id}
                        className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 gap-2 shadow-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        layout>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                          {item.name}
                        </span>
                        <button
                          onClick={() => handleSelectRow(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <HelpTooltip
          show={showHelpTooltip}
          message="How it works"
          onClose={() => setShowHelpTooltip(false)}
        />
        <FloatingHelpButton
          onClick={() => setIsHelpModalOpen(true)}
          help="Miner Help"
        />
      </div>

      <MinerHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </>
  );
}
