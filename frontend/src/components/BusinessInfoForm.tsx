"use client";

import type React from "react";

import { useState } from "react";
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

interface BusinessInfoFormProps {
  onSubmit: (data: BusinessFormData) => void;
  isLoading: boolean;
}

const BusinessInfoForm = ({ onSubmit, isLoading }: BusinessInfoFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BusinessFormData>({
    productName: "",
    category: "",
    productDescription: "",
    location: "",
    promotionGoal: "",
    targetAudience: "",
    contactEmail: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
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

    onSubmit(formData);
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
          <Label htmlFor="productName" className="text-[#111827] font-medium">
            Product/Business Name *
          </Label>
          <Input
            id="productName"
            placeholder="e.g., Coding Sharks"
            value={formData.productName}
            onChange={(e) => handleInputChange("productName", e.target.value)}
            className="bg-[#f1f5f9] border-[#2d3748]/20 text-[#111827] placeholder:text-[#2d3748] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl"
          />
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}>
          <Label htmlFor="category" className="text-[#111827] font-medium">
            Category *
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange("category", value)}>
            <SelectTrigger className="bg-[#f1f5f9] border-[#2d3748]/20 text-[#111827] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-[#f1f5f9] border-[#2d3748]/20 rounded-xl">
              {categories.map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="text-[#111827] hover:bg-[#3b82f6]/10 focus:bg-[#3b82f6]/10">
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
          className="text-[#111827] font-medium">
          Product/Business Description *
        </Label>
        <Textarea
          id="productDescription"
          placeholder="Describe your product or service in detail..."
          value={formData.productDescription}
          onChange={(e) =>
            handleInputChange("productDescription", e.target.value)
          }
          className="bg-[#f1f5f9] border-[#2d3748]/20 text-[#111827] placeholder:text-[#2d3748] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl min-h-[100px] resize-none"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}>
          <Label htmlFor="location" className="text-[#111827] font-medium">
            Location *
          </Label>
          <Input
            id="location"
            placeholder="e.g., Indore, Madhya Pradesh"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="bg-[#f1f5f9] border-[#2d3748]/20 text-[#111827] placeholder:text-[#2d3748] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl"
          />
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}>
          <Label htmlFor="promotionGoal" className="text-[#111827] font-medium">
            Promotion Goal *
          </Label>
          <Select
            value={formData.promotionGoal}
            onValueChange={(value) =>
              handleInputChange("promotionGoal", value)
            }>
            <SelectTrigger className="bg-[#f1f5f9] border-[#2d3748]/20 text-[#111827] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl">
              <SelectValue placeholder="Select goal" />
            </SelectTrigger>
            <SelectContent className="bg-[#f1f5f9] border-[#2d3748]/20 rounded-xl">
              {promotionGoals.map((goal) => (
                <SelectItem
                  key={goal}
                  value={goal}
                  className="text-[#111827] hover:bg-[#3b82f6]/10 focus:bg-[#3b82f6]/10">
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
        <Label htmlFor="targetAudience" className="text-[#111827] font-medium">
          Target Audience *
        </Label>
        <Input
          id="targetAudience"
          placeholder="e.g., Freshers, Graduates, Career Switchers"
          value={formData.targetAudience}
          onChange={(e) => handleInputChange("targetAudience", e.target.value)}
          className="bg-[#f1f5f9] border-[#2d3748]/20 text-[#111827] placeholder:text-[#2d3748] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl"
        />
      </motion.div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}>
        <Label htmlFor="contactEmail" className="text-[#111827] font-medium">
          Contact Email *
        </Label>
        <Input
          id="contactEmail"
          type="email"
          placeholder="your.email@example.com"
          value={formData.contactEmail}
          onChange={(e) => handleInputChange("contactEmail", e.target.value)}
          className="bg-[#f1f5f9] border-[#2d3748]/20 text-[#111827] placeholder:text-[#2d3748] focus:border-[#3b82f6] focus:ring-[#3b82f6]/20 rounded-xl"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#3b82f6] hover:bg-[#2d3748] text-[#f1f5f9] font-semibold py-3 text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#f1f5f9] border-t-transparent mr-2"></div>
              Processing...
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
