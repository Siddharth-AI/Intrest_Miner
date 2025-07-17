// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   History,
//   ArrowLeft,
//   Search,
//   Shield,
//   Calendar,
//   Clock,
// } from "lucide-react"; // Added Clock icon
// import { useAppDispatch, useAppSelector } from "../../../store/hooks"; // Adjusted import path
// import {
//   fetchSearchHistory,
//   SearchHistoryItem,
// } from "../../../store/features/searchHistorySlice"; // Adjusted import path

// const SearchHistory: React.FC = () => {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const {
//     data: searchHistory,
//     loading,
//     error,
//   } = useAppSelector((state) => state.searchHistory);

//   useEffect(() => {
//     dispatch(fetchSearchHistory());
//   }, [dispatch]);

//   const formatTimestamp = (timestamp: string): string => {
//     const date = new Date(timestamp);
//     return date.toLocaleString(); // Format to a readable local date and time string
//   };

//   if (loading) {
//     return (
//       <motion.div
//         className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe]" // Lighter, more vibrant gradient
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.3 }}>
//         <div className="relative">
//           <div className="w-12 h-12 border-4 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin"></div>{" "}
//           {/* Smaller loader */}
//           <div
//             className="absolute inset-0 w-12 h-12 border-4 border-[#2563eb]/30 border-t-[#2563eb] rounded-full animate-spin" // Smaller loader
//             style={{
//               animationDirection: "reverse",
//               animationDuration: "1.5s",
//             }}></div>
//         </div>
//         <p className="text-[#2d3748] mt-3 font-medium text-sm">
//           {" "}
//           {/* Smaller text */}
//           Loading search history...
//         </p>
//       </motion.div>
//     );
//   }

//   if (error) {
//     return (
//       <motion.div
//         className="bg-red-500/20 border border-red-400/30 text-red-800 px-4 py-3 rounded-xl max-w-xl mx-auto mt-8 shadow-lg" // Smaller padding, rounded
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}>
//         <p className="flex items-center gap-2 font-medium text-sm">
//           {" "}
//           {/* Smaller text */}
//           <Shield className="h-4 w-4 text-red-600" /> {/* Smaller icon */}
//           {error}
//         </p>
//         <button
//           onClick={() => dispatch(fetchSearchHistory())}
//           className="mt-2 text-xs bg-red-500/30 hover:bg-red-500/50 transition-all duration-200 px-3 py-1.5 rounded-lg text-red-800">
//           {" "}
//           {/* Smaller button */}
//           Try again
//         </button>
//       </motion.div>
//     );
//   }

//   return (
//     <div className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] p-4 font-inter">
//       {" "}
//       {/* Reduced padding */}
//       <div className="max-w-3xl mx-auto">
//         {" "}
//         {/* Reduced max-width */}
//         <motion.div
//           className="flex items-center mb-6"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}>
//           <motion.button
//             onClick={() => navigate("/profile")}
//             className="mr-3 p-2 rounded-full bg-[#e0f2fe] hover:bg-[#cce8ff] transition-all duration-200 shadow-md"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}>
//             <ArrowLeft className="h-5 w-5 text-[#3b82f6]" />{" "}
//             {/* Reduced icon size */}
//           </motion.button>
//           <h1 className="text-3xl font-extrabold text-[#111827]">
//             Search History
//           </h1>{" "}
//           {/* Reduced font size */}
//         </motion.div>
//         {searchHistory.length === 0 ? (
//           <motion.div
//             className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-xl"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}>
//             <History className="h-16 w-16 text-[#3b82f6] mx-auto mb-4" />{" "}
//             {/* Reduced icon size */}
//             <p className="text-xl text-[#111827] font-bold">
//               {" "}
//               {/* Reduced font size */}
//               No search history found.
//             </p>
//             <p className="text-base text-[#2d3748] mt-2">
//               Start searching to see your history here!
//             </p>{" "}
//             {/* Reduced font size */}
//           </motion.div>
//         ) : (
//           <div className="space-y-4">
//             {" "}
//             {/* Reduced space-y */}
//             {searchHistory.map((item: SearchHistoryItem, index: number) => (
//               <motion.div
//                 key={item.id}
//                 className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between transform transition-all duration-300 hover:shadow-md hover:scale-[1.005]"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3, delay: index * 0.05 }}>
//                 <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
//                   {" "}
//                   {/* Reduced gap */}
//                   <div className="p-2 bg-[#e0f2fe] rounded-full text-[#3b82f6] flex-shrink-0">
//                     {" "}
//                     {/* Reduced padding */}
//                     <Search className="h-5 w-5" /> {/* Reduced icon size */}
//                   </div>
//                   <div className="flex-grow">
//                     <p className="font-semibold text-lg text-[#111827] mb-0.5">
//                       {" "}
//                       {/* Reduced font size, margin-bottom */}
//                       {item.search_text}
//                     </p>
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-xs text-[#2d3748]">
//                       {" "}
//                       {/* Reduced gap, font size */}
//                       <span className="flex items-center gap-1">
//                         <Calendar className="h-3 w-3 text-gray-500" />{" "}
//                         {/* Reduced icon size */}
//                         Searched on: {formatTimestamp(item.created_at)}
//                       </span>
//                       <span className="flex items-center gap-1 mt-0.5 sm:mt-0">
//                         {" "}
//                         {/* Reduced margin-top */}
//                         <Clock className="h-3 w-3 text-gray-500" />{" "}
//                         {/* Reduced icon size */}
//                         Last visited: {formatTimestamp(item.last_visited)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="text-left sm:text-right mt-3 sm:mt-0 sm:ml-auto">
//                   {" "}
//                   {/* Reduced margin-top */}
//                   <p className="text-sm font-medium text-[#111827]">
//                     {" "}
//                     {/* Reduced font size */}
//                     Visits:{" "}
//                     <span className="font-bold text-[#3b82f6]">
//                       {item.visit_count}
//                     </span>
//                   </p>
//                   <p className="text-xs text-[#2d3748]/80">Type: {item.type}</p>{" "}
//                   {/* Reduced font size */}
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SearchHistory;
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
  Briefcase, // Icon for business history
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchSearchHistory,
  SearchHistoryItem, // Import SearchHistoryItem from the slice
} from "../../../store/features/facebookSearchHistorySlice"; // Path to your Facebook search history slice
import {
  fetchSearchAiHistory, // Import the new thunk
  SearchHistoryAiItem, // Import the new interface
} from "../../../store/features/openAiSearchHistorySlice"; // Path to your OpenAI business search slice

const SearchHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Facebook Search History state from Redux
  const {
    data: facebookSearchHistory,
    loading: facebookLoading,
    error: facebookError,
  } = useAppSelector((state) => state.searchHistory); // Accessing the facebook search history slice

  // OpenAI Business History state from Redux
  const {
    data: openaiBusinessHistory,
    loading: openaiLoading,
    error: openaiError,
  } = useAppSelector((state) => state.searchHistoryAi); // Accessing the openai business search slice

  console.log(openaiBusinessHistory, "my data=>>>>>>>");

  const [activeTab, setActiveTab] = useState<"facebook" | "openai">("facebook");

  useEffect(() => {
    // Fetch Facebook search history on component mount
    if (activeTab === "openai") {
      dispatch(fetchSearchHistory());
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    // Fetch OpenAI business history when the tab is active
    if (activeTab === "openai") {
      dispatch(fetchSearchAiHistory()); // Dispatch the thunk from the new slice
    } else if (activeTab === "facebook") {
      dispatch(fetchSearchHistory());
    }
  }, [activeTab, dispatch]); // Refetch when activeTab changes to 'openai' or dispatch changes

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Format to a readable local date and time string
  };

  const renderContent = () => {
    if (activeTab === "facebook") {
      if (facebookLoading) {
        return (
          <motion.div
            className="flex flex-col justify-center items-center py-16"
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
              Loading Facebook search history...
            </p>
          </motion.div>
        );
      }

      if (facebookError) {
        return (
          <motion.div
            className="bg-red-500/20 border border-red-400/30 text-red-800 px-4 py-3 rounded-xl max-w-xl mx-auto mt-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <p className="flex items-center gap-2 font-medium text-sm">
              <Shield className="h-4 w-4 text-red-600" />
              {facebookError}
            </p>
            <button
              onClick={() => dispatch(fetchSearchHistory())} // Retrigger fetch for Facebook
              className="mt-2 text-xs bg-red-500/30 hover:bg-red-500/50 transition-all duration-200 px-3 py-1.5 rounded-lg text-red-800">
              Try again
            </button>
          </motion.div>
        );
      }

      return facebookSearchHistory.length === 0 ? (
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <History className="h-16 w-16 text-[#3b82f6] mx-auto mb-4" />
          <p className="text-xl text-[#111827] font-bold">
            No Facebook search history found.
          </p>
          <p className="text-base text-[#2d3748] mt-2">
            Start searching on Facebook to see your history here!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {facebookSearchHistory.map(
            (item: SearchHistoryItem, index: number) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between transform transition-all duration-300 hover:shadow-md hover:scale-[1.005]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}>
                <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                  <div className="p-2 bg-[#e0f2fe] rounded-full text-[#3b82f6] flex-shrink-0">
                    <Search className="h-5 w-5" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-lg text-[#111827] mb-0.5">
                      {item.search_text}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-xs text-[#2d3748]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        Searched on: {formatTimestamp(item.created_at)}
                      </span>
                      <span className="flex items-center gap-1 mt-0.5 sm:mt-0">
                        <Clock className="h-3 w-3 text-gray-500" />
                        Last visited: {formatTimestamp(item.last_visited)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right mt-3 sm:mt-0 sm:ml-auto">
                  <p className="text-sm font-medium text-[#111827]">
                    Visits:{" "}
                    <span className="font-bold text-[#3b82f6]">
                      {item.visit_count}
                    </span>
                  </p>
                  <p className="text-xs text-[#2d3748]/80">Type: {item.type}</p>
                </div>
              </motion.div>
            )
          )}
        </div>
      );
    } else if (activeTab === "openai") {
      if (openaiLoading) {
        return (
          <motion.div
            className="flex flex-col justify-center items-center py-16"
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
              Loading OpenAI business history...
            </p>
          </motion.div>
        );
      }

      if (openaiError) {
        return (
          <motion.div
            className="bg-red-500/20 border border-red-400/30 text-red-800 px-4 py-3 rounded-xl max-w-xl mx-auto mt-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <p className="flex items-center gap-2 font-medium text-sm">
              <Shield className="h-4 w-4 text-red-600" />
              {openaiError}
            </p>
            <button
              onClick={() => dispatch(fetchSearchAiHistory())} // Retrigger fetch for OpenAI
              className="mt-2 text-xs bg-red-500/30 hover:bg-red-500/50 transition-all duration-200 px-3 py-1.5 rounded-lg text-red-800">
              Try again
            </button>
          </motion.div>
        );
      }

      return openaiBusinessHistory.length === 0 ? (
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <Briefcase className="h-16 w-16 text-[#3b82f6] mx-auto mb-4" />
          <p className="text-xl text-[#111827] font-bold">
            No OpenAI business history found.
          </p>
          <p className="text-base text-[#2d3748] mt-2">
            Submit business information to see your history here!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {openaiBusinessHistory.map(
            (item: SearchHistoryAiItem, index: number) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between transform transition-all duration-300 hover:shadow-md hover:scale-[1.005]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}>
                <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                  <div className="p-2 bg-[#e0f2fe] rounded-full text-[#3b82f6] flex-shrink-0">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-lg text-[#111827] mb-0.5">
                      {item.productName}
                    </p>
                    <p className="text-sm text-[#2d3748] mb-0.5">
                      Category: {item.category}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-xs text-[#2d3748]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        Submitted on: {formatTimestamp(item.created_at)}
                      </span>
                      <span className="flex items-center gap-1 mt-0.5 sm:mt-0">
                        <Clock className="h-3 w-3 text-gray-500" />
                        Last visited: {formatTimestamp(item.last_visited)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right mt-3 sm:mt-0 sm:ml-auto">
                  <p className="text-sm font-medium text-[#111827]">
                    Goal:{" "}
                    <span className="font-bold text-[#3b82f6]">
                      {item.promotionGoal}
                    </span>
                  </p>
                  <p className="text-xs text-[#2d3748]/80">
                    Location: {item.location}
                  </p>
                </div>
              </motion.div>
            )
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] p-4 font-inter">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="flex items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <motion.button
            onClick={() => navigate("/profile")}
            className="mr-3 p-2 rounded-full bg-[#e0f2fe] hover:bg-[#cce8ff] transition-all duration-200 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            <ArrowLeft className="h-5 w-5 text-[#3b82f6]" />
          </motion.button>
          <h1 className="text-3xl font-extrabold text-[#111827]">History</h1>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-white rounded-xl shadow-md p-1">
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold rounded-lg transition-colors duration-200 ${
              activeTab === "facebook"
                ? "bg-[#3b82f6] text-white shadow-lg"
                : "text-[#2d3748] hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("facebook")}>
            Facebook
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold rounded-lg transition-colors duration-200 ${
              activeTab === "openai"
                ? "bg-[#3b82f6] text-white shadow-lg"
                : "text-[#2d3748] hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("openai")}>
            OpenAI
          </button>
        </div>

        {/* Render content based on active tab */}
        {renderContent()}
      </div>
    </div>
  );
};

export default SearchHistory;
