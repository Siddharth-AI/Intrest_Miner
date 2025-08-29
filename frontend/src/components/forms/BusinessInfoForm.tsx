"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BusinessFormData } from "@/types/business";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { DNA } from "react-loader-spinner";

// Redux imports
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  saveBusinessDetails,
  resetSaveBusinessDetailsState,
} from "../../../store/features/openAiSearchHistorySlice";

interface BusinessInfoFormProps {
  onSubmit: (data: BusinessFormData) => void;
  isLoading: boolean;
}

const BusinessInfoForm = ({ onSubmit, isLoading }: BusinessInfoFormProps) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();

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

  const {
    savingBusinessDetails,
    saveBusinessDetailsError,
    savedBusinessDetailsSuccess,
  } = useAppSelector((state) => state.aiSearchHistory);

  const [formData, setFormData] = useState<BusinessFormData>({
    productName: "",
    category: "",
    productDescription: "",
    location: "",
    promotionGoal: "",
    targetAudience: "",
    contactEmail: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = Object.entries(formData);
    const emptyFields = requiredFields.filter(([_, value]) => !value.trim());

    if (emptyFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const resultAction = await dispatch(saveBusinessDetails(formData));

    if (saveBusinessDetails.fulfilled.match(resultAction)) {
      console.log("Business information saved successfully!");
    } else if (saveBusinessDetails.rejected.match(resultAction)) {
      console.log("Failed to save business information. Please try again.");
    }

    onSubmit(formData);

    setTimeout(() => {
      dispatch(resetSaveBusinessDetailsState());
    }, 3000);
  };

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const categories = [
    "Technology",
    "Education",
    "E-commerce",
    "Healthcare",
    "Finance",
    "Real Estate",
    "Food & Beverage",
    "Fashion",
    "Automotive",
    "Travel",
    "Entertainment",
    "Sports & Fitness",
    "Beauty",
    "Home & Garden",
    "Professional Services",
  ];

  const promotionGoals = [
    "Brand Awareness",
    "Lead Generation",
    "Sales Conversion",
    "App Downloads",
    "Website Traffic",
    "Event Promotion",
    "Customer Retention",
    "Market Research",
  ];

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}>
          <Label
            htmlFor="productName"
            className="text-[#111827] dark:text-white font-medium">
            Product/Business Name *
          </Label>
          <Input
            id="productName"
            placeholder="e.g., Coding Sharks"
            value={formData.productName}
            onChange={(e) => handleInputChange("productName", e.target.value)}
            className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-600 text-[#111827] dark:text-white placeholder:text-[#2d3748] dark:placeholder:text-gray-400 focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl"
          />
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}>
          <Label
            htmlFor="category"
            className="text-[#111827] dark:text-white font-medium">
            Category *
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange("category", value)}>
            <SelectTrigger className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-600 text-[#111827] dark:text-white focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-600 rounded-xl">
              {categories.map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="text-[#111827] dark:text-white hover:bg-[#3b82f6]/10 dark:hover:bg-gray-700 focus:bg-[#3b82f6]/10 dark:focus:bg-gray-700">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}>
        <Label
          htmlFor="productDescription"
          className="text-[#111827] dark:text-white font-medium">
          Product/Business Description *
        </Label>
        <Textarea
          id="productDescription"
          placeholder="Describe your product or service in detail..."
          value={formData.productDescription}
          onChange={(e) =>
            handleInputChange("productDescription", e.target.value)
          }
          className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-600 text-[#111827] dark:text-white placeholder:text-[#2d3748] dark:placeholder:text-gray-400 focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl min-h-[100px] resize-none"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}>
          <Label
            htmlFor="location"
            className="text-[#111827] dark:text-white font-medium">
            Location *
          </Label>
          <Input
            id="location"
            placeholder="e.g., Indore, Madhya Pradesh"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-600 text-[#111827] dark:text-white placeholder:text-[#2d3748] dark:placeholder:text-gray-400 focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl"
          />
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}>
          <Label
            htmlFor="promotionGoal"
            className="text-[#111827] dark:text-white font-medium">
            Promotion Goal *
          </Label>
          <Select
            value={formData.promotionGoal}
            onValueChange={(value) =>
              handleInputChange("promotionGoal", value)
            }>
            <SelectTrigger className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-600 text-[#111827] dark:text-white focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl">
              <SelectValue placeholder="Select goal" />
            </SelectTrigger>
            <SelectContent className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-600 rounded-xl">
              {promotionGoals.map((goal) => (
                <SelectItem
                  key={goal}
                  value={goal}
                  className="text-[#111827] dark:text-white hover:bg-[#3b82f6]/10 dark:hover:bg-gray-700 focus:bg-[#3b82f6]/10 dark:focus:bg-gray-700">
                  {goal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}>
        <Label
          htmlFor="targetAudience"
          className="text-[#111827] dark:text-white font-medium">
          Target Audience *
        </Label>
        <Input
          id="targetAudience"
          placeholder="e.g., Freshers, Graduates, Career Switchers"
          value={formData.targetAudience}
          onChange={(e) => handleInputChange("targetAudience", e.target.value)}
          className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-600 text-[#111827] dark:text-white placeholder:text-[#2d3748] dark:placeholder:text-gray-400 focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl"
        />
      </motion.div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}>
        <Label
          htmlFor="contactEmail"
          className="text-[#111827] dark:text-white font-medium">
          Contact Email *
        </Label>
        <Input
          id="contactEmail"
          type="email"
          placeholder="your.email@example.com"
          value={formData.contactEmail}
          onChange={(e) => handleInputChange("contactEmail", e.target.value)}
          className="bg-[#f1f5f9] dark:bg-gray-800 border-[#2d3748]/20 dark:border-gray-600 text-[#111827] dark:text-white placeholder:text-[#2d3748] dark:placeholder:text-gray-400 focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}>
        <Button
          type="submit"
          disabled={isLoading || savingBusinessDetails}
          className="w-full bg-[#3b82f6] hover:bg-[#2d3748] dark:bg-blue-600 dark:hover:bg-blue-700 text-[#f1f5f9] font-semibold py-3 text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
          {isLoading || savingBusinessDetails ? (
            <div className="flex items-center">
              <DNA
                visible={true}
                height="80"
                width="80"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
              />
            </div>
          ) : (
            "Generate Interest Suggestions"
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
};

export default BusinessInfoForm;
