// src/pages/dashboard/search/SearchHistory.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  History,
  ArrowLeft,
  Search,
  Shield,
  Calendar,
  Clock,
  Briefcase,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchSearchHistory,
  SearchHistoryItem,
} from "../../../store/features/facebookSearchHistorySlice";
import {
  fetchSearchAiHistory,
  SearchHistoryAiItem,
} from "../../../store/features/openAiSearchHistorySlice";

const SearchHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/miner");
  };

  const {
    data: facebookSearchHistory,
    loading: facebookLoading,
    error: facebookError,
  } = useAppSelector((state) => state.facebookSearchHistory);

  const {
    data: openaiBusinessHistory,
    loading: openaiLoading,
    error: openaiError,
  } = useAppSelector((state) => state.aiSearchHistory);

  const [activeTab, setActiveTab] = useState<"facebook" | "openai">("facebook");

  useEffect(() => {
    if (activeTab === "openai") {
      dispatch(fetchSearchAiHistory());
    } else if (activeTab === "facebook") {
      dispatch(fetchSearchHistory());
    }
  }, [activeTab, dispatch]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderContent = () => {
    const loading = activeTab === "facebook" ? facebookLoading : openaiLoading;
    const error = activeTab === "facebook" ? facebookError : openaiError;
    const data =
      activeTab === "facebook" ? facebookSearchHistory : openaiBusinessHistory;

    if (loading) {
      return (
        <motion.div
          className="flex flex-col items-center justify-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}>
          <div className="relative">
            <div className="w-12 h-12 border-[5px] border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <div
              className="absolute inset-0 w-12 h-12 border-[5px] border-purple-200 border-t-purple-500 rounded-full animate-spin"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.2s",
              }}
            />
          </div>
          <p className="text-gray-600 mt-4 text-sm italic tracking-wide">
            Fetching your historical data...
          </p>
        </motion.div>
      );
    }

    if (error) {
      return (
        <motion.div
          className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-xl max-w-xl mx-auto mt-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <p className="flex items-center gap-2 font-medium text-sm">
            <Shield className="h-4 w-4 text-red-600" />
            {error}
          </p>
          <button
            onClick={() =>
              dispatch(
                activeTab === "facebook"
                  ? fetchSearchHistory()
                  : fetchSearchAiHistory()
              )
            }
            className="mt-2 text-xs bg-red-500/20 hover:bg-red-500/40 transition-all duration-200 px-3 py-1.5 rounded-lg text-red-800">
            Try again
          </button>
        </motion.div>
      );
    }

    if (data.length === 0) {
      return (
        <motion.div
          className="bg-gradient-to-br from-white to-gray-100 rounded-2xl border border-gray-200 p-8 text-center shadow-xl max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          {activeTab === "facebook" ? (
            <Search className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          ) : (
            <Briefcase className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          )}
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Nothing found here!
          </h2>
          <p className="text-gray-600 text-base">
            {activeTab === "facebook"
              ? "You haven't searched anything on Miner yet."
              : "No Permium submission found."}
          </p>
        </motion.div>
      );
    }

    return (
      <div className="space-y-4">
        {data.map(
          (item: SearchHistoryItem | SearchHistoryAiItem, index: number) => (
            <motion.div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md hover:scale-[1.01] transition duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}>
              <div className="flex items-start gap-4 w-full">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                  {activeTab === "facebook" ? (
                    <Search className="h-5 w-5" />
                  ) : (
                    <Briefcase className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-grow space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {"productName" in item
                      ? item.productName
                      : item.search_text}
                  </h3>
                  {"category" in item && (
                    <p className="text-sm text-gray-500">
                      Category: {item.category}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatTimestamp(item.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(item.last_visited)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right mt-4 sm:mt-0">
                {"visit_count" in item && (
                  <p className="text-sm text-gray-700">
                    Visits:{" "}
                    <span className="font-bold text-blue-600">
                      {item.visit_count}
                    </span>
                  </p>
                )}
                {"type" in item && (
                  <p className="text-xs text-gray-500">Type: {item.type}</p>
                )}
                {"promotionGoal" in item && (
                  <>
                    <p className="text-sm text-gray-700">
                      Goal:{" "}
                      <span className="font-bold text-purple-600">
                        {item.promotionGoal}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Location: {item.location}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.07)] px-4 font-inter relative">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center mb-10 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <motion.button
            onClick={handleGoBack}
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            <ArrowLeft className="h-5 w-5 text-blue-600" />
          </motion.button>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Your Search History
          </h1>
        </motion.div>

        {/* Tabs */}
        <div className="flex mb-8 bg-white p-1 rounded-full border border-gray-200 shadow-md max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("facebook")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 font-semibold rounded-full transition ${
              activeTab === "facebook"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}>
            <Search className="w-4 h-4" />
            Miner
          </button>
          <button
            onClick={() => setActiveTab("openai")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 font-semibold rounded-full transition ${
              activeTab === "openai"
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-100"
            }`}>
            <Briefcase className="w-4 h-4" />
            Premium
          </button>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Floating Gradients */}
        <div className="overflow-hidden">
          <div className="-z-10 absolute top-[4.2rem] right-2 w-24 h-24 bg-gradient-to-b from-blue-500 to-purple-400 rounded-full opacity-30 animate-float"></div>
          <div
            className="-z-10 absolute bottom-4 right-[33rem] w-32 h-32 bg-gradient-to-r from-black to-purple-600 rounded-full opacity-20  animate-float"
            style={{ animationDelay: "2s" }}></div>
          <div className="-z-10 absolute bottom-0 left-16 w-48 h-48 bg-gradient-to-t from-purple-500 to-blue-300 rounded-full opacity-30  animate-float"></div>
          <div className="-z-10 absolute top-48 left-60 w-48 h-48 bg-gradient-to-t from-purple-500 to-blue-600 rounded-full opacity-70  animate-float"></div>
          <div className="-z-10 absolute top-[20rem] right-[10rem] w-36 h-36 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full opacity-20  animate-float"></div>
        </div>
      </div>
    </div>
  );
};

export default SearchHistory;
