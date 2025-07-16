"use client";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Redux Imports // Adjust path to your store
import {
  searchFacebookInterests,
  resetSearchState,
  setCurrentPage,
  setSelectedRows,
  toggleRowSelection,
} from "../../../store/features/facebookSearchSlice"; // Adjust path to your slice
import { useAppSelector, useAppDispatch } from "../../../store/hooks"; // Adjust path to your hooks
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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  type: "success" | "error";
  text: string;
}

export default function Dashboard() {
  // Redux state - now includes selectedRows and currentPage
  const dispatch = useAppDispatch();
  const {
    interests: results,
    totalResults: resultCount,
    status,
    error,
    selectedRows,
    currentPage,
  } = useAppSelector((state) => state.facebookSearch);

  // REMOVED useState for selectedRows and currentPage

  // Local state for UI messages
  const [message, setMessage] = useState<Message | null>(null);
  const [itemsPerPage] = useState<number>(10);

  const router = useNavigate();
  const searchTermRef = useRef<HTMLInputElement>(null);

  const isLoading = status === "loading";
  const hasSearched = status === "succeeded" || status === "failed";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router("/login");
    }
  }, [router]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchTermRef.current?.value || "";
    if (!query.trim()) {
      dispatch(resetSearchState()); // This now resets everything in Redux
      if (searchTermRef.current) {
        searchTermRef.current.value = "";
      }
      toast({
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }
    dispatch(searchFacebookInterests({ query, limit: 1000 }));
  };

  // UPDATED: Handlers now dispatch Redux actions
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
    // This logic remains the same as it reads from the Redux state
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

  // UPDATED: Pagination handlers now dispatch Redux actions
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

  // This function can stay as it is
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
        className="flex flex-col items-center justify-center py-12 md:py-16 px-4 md:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className="relative mb-8">
          <motion.div
            className="absolute -inset-4 bg-gradient-to-r from-[#3b82f6]/20 to-[#2563eb]/20 rounded-full blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <div className="relative bg-[#f1f5f9] rounded-2xl p-6 md:p-8 border border-[#2d3748]/20 shadow-lg">
            <svg
              className="h-12 md:h-16 w-12 md:w-16 text-[#3b82f6] mx-auto mb-4"
              viewBox="0 0 24 24"
              fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
              <circle cx="8.5" cy="10.5" r="1.5" />
              <circle cx="15.5" cy="10.5" r="1.5" />
              <path d="M12 16c-1.1 0-2-.9-2 0h4c0 1.1-.9 2-2 2z" />
            </svg>
            <div className="bg-gradient-to-r from-[#3b82f6]/20 to-[#2563eb]/20 rounded-xl p-3 md:p-4 border border-[#3b82f6]/30">
              <p className="text-[#2d3748] text-center font-medium text-sm md:text-base">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="text-center max-w-md px-4">
          <h3 className="text-lg md:text-xl font-semibold text-[#111827] mb-2">
            {isInitialLoad
              ? "Welcome to InterestMiner! 🚀"
              : "Oops! Nothing found 🔍"}
          </h3>
          <p className="text-[#2d3748] leading-relaxed text-sm md:text-base">
            {isInitialLoad
              ? "Use our AI-powered search to discover highly targeted Facebook ad interests that will boost your campaign performance."
              : "Try using different keywords, check your spelling, or explore broader terms to find relevant interests."}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)]">
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-6 md:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-2 md:mb-4">
              AI-Powered Interest Discovery
            </h1>
          </motion.div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              {/* Message display */}
              {message && (
                <motion.div
                  className={`mb-4 md:mb-6 px-4 md:px-6 py-3 md:py-4 rounded-2xl flex items-center gap-2 md:gap-3 border ${
                    message.type === "success"
                      ? "bg-green-500/20 border-green-400/30 text-green-800"
                      : "bg-red-500/20 border-red-400/30 text-red-800"
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}>
                  {message.type === "success" ? (
                    <div className="h-5 md:h-6 w-5 md:w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs md:text-sm font-bold">
                      ✓
                    </div>
                  ) : (
                    <AlertCircle className="h-5 md:h-6 w-5 md:w-6 text-red-600" />
                  )}
                  <p className="font-medium text-sm md:text-base">
                    {message.text}
                  </p>
                </motion.div>
              )}

              {/* Enhanced Search Bar */}
              <motion.form
                onSubmit={handleSearch}
                className="mb-4 md:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}>
                <div className="relative">
                  <div className="bg-[#f1f5f9] border border-[#2d3748]/10 rounded-2xl p-1 md:p-2 flex gap-2 md:gap-3 shadow-sm shadow-blue-200">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none">
                        <Search
                          size={16}
                          className="md:w-5 md:h-5 text-[#2d3748]"
                        />
                      </div>
                      <input
                        ref={searchTermRef}
                        type="text"
                        className="w-full bg-transparent border-none text-[#111827] placeholder-[#2d3748] rounded-xl py-2 md:py-4 pl-10 md:pl-12 pr-2 md:pr-4 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50"
                        placeholder="Search for interests..."
                      />
                    </div>
                    <motion.button
                      type="submit"
                      className="bg-[#3b82f6] hover:bg-[#2d3748] text-white px-4 md:px-8 py-2 md:py-4 rounded-xl flex items-center gap-1 md:gap-2 font-semibold transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      <span className="hidden sm:inline">Search</span>
                      <Search className="sm:hidden h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.form>

              {/* Stats Cards */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-4 mb-6 md:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}>
                <motion.div className="bg-[#f1f5f9] rounded-2xl p-4 md:p-6 border border-[#2d3748]/20 shadow-lg transition-all duration-300 shadow-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#2d3748] text-xs md:text-sm">
                        Total Results
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-[#111827]">
                        {resultCount.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-[#3b82f6]/20 rounded-full p-2 md:p-3">
                      <Target className="h-5 md:h-6 w-5 md:w-6 text-[#3b82f6]" />
                    </div>
                  </div>
                </motion.div>
                <motion.div className="bg-[#f1f5f9] rounded-2xl p-4 md:p-6 border border-[#2d3748]/20 shadow-lg transition-all duration-300 shadow-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#2d3748] text-xs md:text-sm">
                        Selected Items
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-[#111827]">
                        {selectedRows.length}
                      </p>
                    </div>
                    <div className="bg-[#2563eb]/20 rounded-full p-2 md:p-3">
                      <Users className="h-5 md:h-6 w-5 md:w-6 text-[#2563eb]" />
                    </div>
                  </div>
                </motion.div>
                <motion.div className="bg-[#f1f5f9] rounded-2xl p-4 md:p-6 border border-[#2d3748]/20 shadow-lg transition-all duration-300 shadow-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#2d3748] text-xs md:text-sm">
                        Current Page
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-[#111827]">
                        {currentPage} of {totalPages || 1}
                      </p>
                    </div>
                    <div className="bg-[#1d4ed8]/20 rounded-full p-2 md:p-3">
                      <TrendingUp className="h-5 md:h-6 w-5 md:w-6 text-[#1d4ed8]" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Table/Results Section */}
              {isLoading ? (
                <motion.div
                  className="flex justify-center items-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}>
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b82f6]"></div>
                </motion.div>
              ) : !hasSearched ? (
                <EmptyState type="initial" />
              ) : results.length === 0 ? (
                <EmptyState type="no-results" />
              ) : (
                <motion.div
                  className="bg-white rounded-lg border border-[#2d3748]/20 overflow-hidden shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}>
                  {/* Table header */}
                  <div className="p-3 md:p-4 bg-[#3b82f6]">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          results.length > 0 &&
                          selectedRows.length === results.length
                        }
                        className="h-5 w-5 rounded border-gray-300 focus:ring-[#3b82f6]"
                      />
                      <span className="ml-1 text-2xl md:text-base font-semibold text-[#111827]">
                        Select All
                      </span>
                      <button
                        onClick={handleClearSelection}
                        className="ml-auto text-sm md:text-base text-black font-semibold hover:text-white flex items-center gap-1">
                        <X size={16} className="md:w-5 md:h-5" />
                        <span className="hidden sm:inline">Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Table rows */}
                  <div className="">
                    {currentItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className={`p-3 md:p-4 border-b border-[#2d3748]/10 hover:bg-[#3b82f6]/5 transition-colors flex items-center gap-4 ${
                          selectedRows.includes(item.id)
                            ? "bg-[#3b82f6]/10"
                            : ""
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => handleSelectRow(item.id)}
                          className="h-4 w-4 rounded border-gray-300 focus:ring-[#3b82f6]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm md:text-base font-medium text-[#111827] truncate">
                            {item.name}
                          </p>
                          <p className="text-xs md:text-sm text-[#2d3748]">
                            {formatAudienceSize(item.audience_size_lower_bound)}{" "}
                            -{" "}
                            {formatAudienceSize(item.audience_size_upper_bound)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSelectRow(item.id)}
                            className="text-xs md:text-sm text-[#3b82f6] hover:text-[#2563eb]">
                            {selectedRows.includes(item.id)
                              ? "Selected"
                              : "Select"}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Pagination */}
              {results.length > 0 && (
                <motion.div
                  className="flex items-center justify-between mt-4 md:mt-6 bg-black/70 py-3 px-2 rounded-xl shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}>
                  <div className="flex items-center gap-1 md:gap-2">
                    <button
                      onClick={firstPage}
                      disabled={currentPage === 1}
                      className="p-2 rounded-full bg-[#f1f5f9] hover:bg-[#3b82f6] transition-colors disabled:opacity-30 border border-[#2d3748]/20">
                      <ChevronsLeft size={16} className="text-[#2d3748]" />
                    </button>
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="p-2 rounded-full bg-[#f1f5f9] hover:bg-[#3b82f6] transition-colors disabled:opacity-30 border border-[#2d3748]/20">
                      <ChevronLeft size={16} className="text-[#2d3748]" />
                    </button>
                  </div>
                  <span className="text-sm md:text-base text-white">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1 md:gap-2">
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-full bg-[#f1f5f9] hover:bg-[#3b82f6] transition-colors disabled:opacity-30 border border-[#2d3748]/20">
                      <ChevronRight size={16} className="text-[#2d3748]" />
                    </button>
                    <button
                      onClick={lastPage}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-full bg-[#f1f5f9] hover:bg-[#3b82f6] transition-colors disabled:opacity-30 border border-[#2d3748]/20">
                      <ChevronsRight size={16} className="text-[#2d3748]" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Selected Items List */}
              {selectedRows.length > 0 && (
                <motion.div
                  className="my-5 flex flex-wrap gap-2 bg-blue-100 p-1 md:p-2 rounded-lg border border-[#2d3748]/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}>
                  {results
                    .filter((item) => selectedRows.includes(item.id))
                    .map((item) => (
                      <motion.div
                        key={item.id}
                        className="flex items-center bg-[#f1f5f9] border border-[#2d3748]/20 rounded-lg px-3 py-3 text-sm text-[#111827] gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}>
                        <span className="truncate max-w-[120px]">
                          {item.name}
                        </span>
                        <button
                          onClick={() => handleSelectRow(item.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Remove">
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                </motion.div>
              )}

              {/* Export Button */}
              {results.length > 0 && (
                <motion.button
                  onClick={handleExport}
                  className="mt-4 md:mt-6 w-full md:w-auto bg-[#3b82f6] hover:bg-[#2d3748] text-white px-4 md:px-8 py-2 md:py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}>
                  <Download size={16} />
                  <span>Export Selected ({selectedRows.length})</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Floating Elements */}
          <div className="-z-10 absolute top-[4.2rem] right-2 w-24 h-24 bg-gradient-to-b from-blue-500 to-purple-400 rounded-full opacity-30 animate-float"></div>
          <div
            className="-z-10 absolute bottom-4 right-[33rem] w-32 h-32 bg-gradient-to-r from-black to-purple-600 rounded-full opacity-20 animate-float"
            style={{ animationDelay: "2s" }}></div>
          <div className="-z-10 absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-t from-purple-500 to-blue-300 rounded-full opacity-30 animate-float"></div>

          <div className="-z-10 absolute top-[20rem] left-[20rem] w-40 h-40 bg-gradient-to-b from-purple-600 to-blue-500 rounded-full opacity-30 animate-float"></div>
          <div className="-z-10 absolute top-[20rem] right-[10rem] w-36 h-36 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full opacity-20 animate-float"></div>
        </div>
      </div>
    </div>
  );
}
