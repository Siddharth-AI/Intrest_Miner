"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Star,
  TrendingUp,
  Users,
  Target,
  Loader,
} from "lucide-react";
import type { BusinessFormData } from "@/types/business";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Redux imports
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  generateInterests,
  resetOpenAiState,
} from "../../../store/features/openaiSlice";

interface InterestResultsProps {
  businessData: BusinessFormData;
}

const InterestResults = ({ businessData }: InterestResultsProps) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const {
    data: openAiData,
    loading: isLoading,
    error,
  } = useAppSelector((state) => state.openAi);

  // Theme detection - ONLY ADDITION
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

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [processingStep, setProcessingStep] = useState<string>(
    "Generating interests with AI..."
  );
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!businessData) {
        console.log("No business data available for analysis");
        return;
      }
      if (
        openAiData &&
        openAiData.businessInfo &&
        openAiData.businessInfo.productName === businessData.productName
      ) {
        console.log(
          "Using existing persisted data for:",
          businessData.productName
        );
        return;
      }

      console.log("Fetching new data for:", businessData.productName);

      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress <= 100) {
          setProgress(currentProgress);
          if (currentProgress === 30)
            setProcessingStep("Retrieving audience data from Meta...");
          if (currentProgress === 70)
            setProcessingStep("Analyzing and ranking results with AI...");
        } else {
          clearInterval(interval);
        }
      }, 500);

      try {
        const resultAction = await dispatch(generateInterests(businessData));
        clearInterval(interval);
        setProgress(100);

        if (generateInterests.fulfilled.match(resultAction)) {
          toast({
            title: "Analysis Complete",
            description: `Found and analyzed ${resultAction.payload.analyzedInterests.length} potential Meta ad interests for your business.`,
          });
        } else if (generateInterests.rejected.match(resultAction)) {
          toast({
            title: "Error Analyzing Interests",
            description:
              (resultAction.payload as string) ||
              "There was a problem processing your request. Please try again.",
            variant: "destructive",
          });
        }
      } catch (err) {
        clearInterval(interval);
        console.error("Error dispatching generateInterests:", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [businessData, dispatch, toast, openAiData]);

  const interests = openAiData?.analyzedInterests || [];

  const formatAudienceSize = (lower: number, upper: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };
    return `${formatNumber(lower)} - ${formatNumber(upper)}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Technology":
        return "bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30";
      case "Education":
        return "bg-[#2563eb]/20 text-[#2563eb] border-[#2563eb]/30";
      case "E-commerce":
        return "bg-purple-500/20 text-purple-700 border-purple-500/30";
      case "Healthcare":
        return "bg-red-500/20 text-red-700 border-red-500/30";
      case "Finance":
        return "bg-green-600/20 text-green-800 border-green-600/30";
      case "Real Estate":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "Food & Beverage":
        return "bg-orange-500/20 text-orange-700 border-orange-500/30";
      case "Fashion":
        return "bg-pink-500/20 text-pink-700 border-pink-500/30";
      case "Automotive":
        return "bg-gray-700/20 text-gray-900 border-gray-700/30";
      case "Travel":
        return "bg-indigo-500/20 text-indigo-700 border-indigo-500/30";
      case "Entertainment":
        return "bg-teal-500/20 text-teal-700 border-teal-500/30";
      case "Sports & Fitness":
        return "bg-lime-500/20 text-lime-700 border-lime-500/30";
      case "Beauty":
        return "bg-fuchsia-500/20 text-fuchsia-700 border-fuchsia-500/30";
      case "Home & Garden":
        return "bg-emerald-500/20 text-emerald-700 border-emerald-500/30";
      case "Professional Services":
        return "bg-cyan-500/20 text-cyan-700 border-cyan-500/30";
      case "Business and industry":
        return "bg-green-500/20 text-green-700 border-green-500/30";
      default:
        return "bg-[#2d3748]/20 text-[#2d3748] border-[#2d3748]/30";
    }
  };

  const handleExportCSV = () => {
    const csvHeaders = [
      "Rank",
      "Interest Name",
      "Audience Size Lower",
      "Audience Size Upper",
      "Path",
      "Topic",
      "Relevance Score",
      "Category",
    ];
    const csvRows = interests.map((interest) => [
      interest.rank,
      interest.name,
      interest.audienceSizeLowerBound,
      interest.audienceSizeUpperBound,
      interest.path.join(" > "),
      interest.topic,
      interest.relevanceScore,
      interest.category,
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${businessData.productName}_meta_interests.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Your interest analysis has been downloaded as CSV.",
    });
  };

  const toggleInterestSelection = (interestName: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestName)
        ? prev.filter((name) => name !== interestName)
        : [...prev, interestName]
    );
  };

  const totalAudience = interests.reduce(
    (sum, interest) =>
      sum +
      (interest.audienceSizeLowerBound + interest.audienceSizeUpperBound) / 2,
    0
  );

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <Card className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-700 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-20 h-20">
                <Loader className="w-20 h-20 text-[#3b82f6] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#111827] dark:text-white text-sm font-bold">
                    {progress}%
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#111827] dark:text-white mb-2">
                {processingStep}
              </h3>
              <div className="w-full bg-[#2d3748]/20 dark:bg-gray-600 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-[#2d3748] dark:text-gray-300 text-sm mt-2">
                This may take a minute as we analyze thousands of potential
                interests...
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error && !interests.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-red-700 dark:text-red-300">
              Error
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => dispatch(resetOpenAiState())}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!openAiData && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <Card className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-700 shadow-lg">
          <CardContent className="p-8 text-center text-[#2d3748] dark:text-gray-300">
            <p>
              No analysis results available yet. Please provide business
              information to start.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}>
          <Card className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-700 shadow-lg hover:shadow-blue-100 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-[#3b82f6] mr-3" />
                <div>
                  <p className="text-sm font-medium text-[#2d3748] dark:text-gray-300">
                    Total Interests Found
                  </p>
                  <p className="text-2xl font-bold text-[#111827] dark:text-white">
                    {interests.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}>
          <Card className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-700 shadow-lg hover:shadow-blue-100 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-[#2563eb] mr-3" />
                <div>
                  <p className="text-sm font-medium text-[#2d3748] dark:text-gray-300">
                    Avg. Audience Size
                  </p>
                  <p className="text-xl font-bold text-[#111827] dark:text-white">
                    {interests.length > 0
                      ? formatAudienceSize(
                          totalAudience / interests.length,
                          totalAudience / interests.length
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}>
          <Card className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-700 shadow-lg hover:shadow-blue-100 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-[#2d3748] dark:text-gray-300">
                    Top Relevance Score
                  </p>
                  <p className="text-2xl font-bold text-[#111827] dark:text-white">
                    {interests.length > 0
                      ? `${Math.max(
                          ...interests.map((i) => i.relevanceScore)
                        )}%`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Results Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}>
        <Card className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-[#111827] dark:text-white">
                  Meta Ad Interest Analysis
                </CardTitle>
                <CardDescription className="text-[#2d3748] dark:text-gray-300">
                  AI-generated and ranked interests for{" "}
                  {businessData.productName}
                </CardDescription>
              </div>
              <Button
                onClick={handleExportCSV}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={interests.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-[#2d3748]/20 dark:border-gray-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2d3748]/20 dark:border-gray-700 hover:bg-[#3b82f6]/5 dark:hover:bg-gray-700/50">
                    <TableHead className="text-[#2d3748] dark:text-gray-300 font-semibold">
                      Rank
                    </TableHead>
                    <TableHead className="text-[#2d3748] dark:text-gray-300 font-semibold">
                      Interest Name
                    </TableHead>
                    <TableHead className="text-[#2d3748] dark:text-gray-300 font-semibold">
                      Audience Size
                    </TableHead>
                    <TableHead className="text-[#2d3748] dark:text-gray-300 font-semibold">
                      Relevance
                    </TableHead>
                    <TableHead className="text-[#2d3748] dark:text-gray-300 font-semibold">
                      Category
                    </TableHead>
                    <TableHead className="text-[#2d3748] dark:text-gray-300 font-semibold">
                      Topic
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interests.length > 0 ? (
                    interests.map((interest) => (
                      <TableRow
                        key={interest.name}
                        className="border-[#2d3748]/20 dark:border-gray-700 hover:bg-[#3b82f6]/5 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        onClick={() => toggleInterestSelection(interest.name)}>
                        <TableCell className="text-[#111827] dark:text-white font-medium">
                          <div className="flex items-center">
                            #{interest.rank}
                            {interest.rank <= 3 && (
                              <Star className="w-4 h-4 text-amber-500 ml-1" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#111827] dark:text-white font-medium">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedInterests.includes(
                                interest.name
                              )}
                              onChange={() =>
                                toggleInterestSelection(interest.name)
                              }
                              className="mr-2 accent-[#3b82f6]"
                            />
                            {interest.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#2d3748] dark:text-gray-300">
                          {formatAudienceSize(
                            interest.audienceSizeLowerBound,
                            interest.audienceSizeUpperBound
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-12 bg-[#2d3748]/20 dark:bg-gray-600 rounded-full h-2 mr-2">
                              <div
                                className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${interest.relevanceScore}%`,
                                }}></div>
                            </div>
                            <span className="text-[#111827] dark:text-white font-medium">
                              {interest.relevanceScore}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${getCategoryColor(
                              interest.category
                            )} rounded-lg`}>
                            {interest.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#2d3748] dark:text-gray-300">
                          {interest.topic}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-[#2d3748] dark:text-gray-300 py-8">
                        {error
                          ? "Failed to load interests."
                          : "No interests found for your business data yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {selectedInterests.length > 0 && (
              <motion.div
                className="mt-4 p-4 bg-[#3b82f6]/5 dark:bg-blue-900/20 rounded-xl border border-[#2d3748]/20 dark:border-gray-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}>
                <p className="text-[#111827] dark:text-white font-medium mb-2">
                  Selected Interests ({selectedInterests.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <Badge
                      key={interest}
                      className="bg-[#3b82f6] text-white rounded-lg">
                      {interest}
                    </Badge>
                  ))}
                </div>
                <Button
                  className="mt-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => {
                    const selectedData = interests.filter((i) =>
                      selectedInterests.includes(i.name)
                    );
                    console.log(
                      "Selected interests for Meta Ad Manager:",
                      selectedData
                    );
                    toast({
                      title: "Interests Ready",
                      description: `${selectedInterests.length} interests ready for Meta Ad Manager`,
                    });
                  }}>
                  Add to Meta Campaign
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Workflow Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}>
        <Card className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#111827] dark:text-white">
              Workflow Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="text-[#3b82f6] font-medium">
                  Step 1: Business Analysis
                </h4>
                <p className="text-[#2d3748] dark:text-gray-300">
                  ✓ Collected business information
                </p>
                <p className="text-[#2d3748] dark:text-gray-300">
                  ✓ Generated AI prompt for {businessData.category} sector
                </p>
              </div>
              <div>
                <h4 className="text-[#3b82f6] font-medium">
                  Step 2: GPT Interest Generation
                </h4>
                <p className="text-[#2d3748] dark:text-gray-300">
                  ✓ AI analyzed: {businessData.productName}
                </p>
                <p className="text-[#2d3748] dark:text-gray-300">
                  ✓ Generated potential relevant interests
                </p>
              </div>
              <div>
                <h4 className="text-[#3b82f6] font-medium">
                  Step 3: Meta Graph API Query
                </h4>
                <p className="text-[#2d3748] dark:text-gray-300">
                  ✓ Fetched complete audience data from Meta
                </p>
                <p className="text-[#2d3748] dark:text-gray-300">
                  ✓ Collected: Name, Audience Size, Path, Topic
                </p>
              </div>
              <div>
                <h4 className="text-[#3b82f6] font-medium">
                  Step 4: AI Analysis
                </h4>
                <p className="text-[#2d3748] dark:text-gray-300">
                  ✓ Analyzed data with GPT for best performers
                </p>
                <p className="text-[#2d3748] dark:text-gray-300">
                  ✓ Ranked and scored for business relevance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default InterestResults;
