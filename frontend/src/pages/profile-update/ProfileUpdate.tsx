import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  ArrowLeft,
  Edit,
  Save,
  User,
  Phone,
  MapPin,
  Globe,
  Calendar,
  CheckCircle,
} from "lucide-react"; // Added more icons for better visual representation
import { useAppDispatch, useAppSelector } from "../../../store/hooks"; // Adjusted import path based on previous conversation
import {
  updateProfileData,
  fetchProfileData,
  resetUpdateStatus,
} from "../../../store/features/profileSlice";
import { toast } from "@/hooks/use-toast";

const ProfileUpdate: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    data: userData,
    loading,
    error,
    updateLoading,
    updateError,
    updateSuccess,
  } = useAppSelector((state) => state.profile);
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/miner");
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    address: "",
    country: "",
    dob: "",
  });

  const [isEditing, setIsEditing] = useState<boolean>(false); // New state for toggling edit mode
  useEffect(() => {
    // Fetch profile data if not already available in the store
    if (!userData && !loading && !error) {
      dispatch(fetchProfileData());
    } else if (userData) {
      // Populate form data once user data is loaded
      setFormData({
        name: userData.name || "",
        contact: userData.contact || "",
        address: userData.address || "",
        country: userData.country || "",
        dob: userData.dob || "",
        // Assuming DOB is in YYYY-MM-DD format
      });
    }
  }, [userData, loading, error, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      toast({
        title: "Profile updated successfully!",
      });
      setIsEditing(false); // Exit edit mode on successful update
      // Optionally navigate back after a short delay, or just show success message

      dispatch(fetchProfileData());

      const timer = setTimeout(() => {
        dispatch(resetUpdateStatus()); // Reset status after message clears
        // navigate("/profile"); // You can re-enable this if you want to navigate back automatically
      }, 2000);
      return () => clearTimeout(timer);
    } else if (updateError) {
      toast({
        title: "Profile updated failed",
        variant: "destructive",
      });
    }
  }, [updateSuccess, updateError, navigate, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value || "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = { ...formData };
    // Convert empty string DOB to null before sending
    if (dataToSend.dob === "") {
      dataToSend.dob = null;
    }
    console.log(dataToSend);
    await dispatch(updateProfileData(dataToSend));
  };

  const renderField = (
    label: string,
    value: string | null,
    Icon: React.ElementType
  ) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-200 last:border-b-0">
      {" "}
      {/* Reduced padding */}
      <div className="flex items-center gap-2.5">
        {" "}
        {/* Reduced gap */}
        <Icon className="h-4 w-4 text-[#3b82f6]" /> {/* Reduced icon size */}
        <span className="font-medium text-[#111827] text-lg">
          {label}:
        </span>{" "}
        {/* Reduced font size */}
      </div>
      <span className="text-[#2d3748] font-semibold text-md">{value}</span>{" "}
      {/* Reduced font size */}
    </div>
  );

  if (loading) {
    return (
      <motion.div
        className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe]" // Lighter, more vibrant gradient
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}>
        <div className="relative">
          <div className="w-12 h-12 border-4 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin"></div>{" "}
          {/* Smaller loader */}
          <div
            className="absolute inset-0 w-12 h-12 border-4 border-[#2563eb]/30 border-t-[#2563eb] rounded-full animate-spin" // Smaller loader
            style={{
              animationDirection: "reverse",
              animationDuration: "1.5s",
            }}></div>
        </div>
        <p className="text-[#2d3748] mt-3 font-medium text-sm">
          {" "}
          {/* Smaller text */}
          Loading your profile data...
        </p>
      </motion.div>
    );
  }

  if (error && !userData) {
    // Only show error if no data could be loaded initially
    return (
      <motion.div
        className="bg-red-500/20 border border-red-400/30 text-red-800 px-4 py-3 rounded-xl max-w-lg mx-auto mt-8 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <p className="flex items-center gap-2 font-medium text-sm">
          {" "}
          {/* Smaller text */}
          <Shield className="h-4 w-4 text-red-600" /> {/* Smaller icon */}
          {error}
        </p>
        <button
          onClick={() => dispatch(fetchProfileData())} // Retry fetching data
          className="mt-2 text-xs bg-red-500/30 hover:bg-red-500/50 transition-all duration-200 px-3 py-1.5 rounded-lg text-red-800">
          {" "}
          {/* Smaller button */}
          Try again
        </button>
      </motion.div>
    );
  }

  return (
    <div className=" pt-32 pb-20 min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)] p-4 flex items-center justify-center font-inter">
      {" "}
      {/* Reduced overall padding */}
      <motion.div
        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl max-w-3xl w-full transform transition-all duration-300 hover:shadow-2xl"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}>
        {" "}
        {/* Reduced duration */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
          {" "}
          {/* Reduced margin-bottom, padding-bottom */}
          <div className="flex items-center">
            {!isEditing && (
              <motion.button
                onClick={handleGoBack}
                className="mr-3 p-2 rounded-full bg-[#e0f2fe] hover:bg-[#cce8ff] transition-all duration-200 shadow-md"
                whileTap={{ scale: 0.92 }}>
                {" "}
                {/* Adjusted scale */}
                <ArrowLeft className="h-5 w-5 text-[#3b82f6]" />
                {/* Reduced icon size */}
              </motion.button>
            )}
            <h2 className="text-xl sm:ml-4 sm:text-3xl font-extrabold text-[#111827]">
              {!isEditing ? "Profile Details" : "Update Profile"}
            </h2>

            {/* Reduced font size */}
          </div>
          {!isEditing && (
            <motion.button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#3b82f6] text-white font-semibold flex items-center gap-1.5 shadow-md transform transition-all duration-300"
              whileHover={{
                scale: 1.03,
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              }}
              whileTap={{ scale: 0.97 }}>
              {" "}
              {/* Adjusted scale */}
              <Edit className="h-4 w-4" />
              Edit
              {/* Reduced icon size */}
            </motion.button>
          )}
        </div>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {" "}
            {/* Reduced space-y */}
            {/* Input fields for editing */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#2d3748] mb-1.5">
                {" "}
                {/* Reduced font size, margin-bottom */}
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-3 focus:ring-[#3b82f6]/40 focus:border-[#3b82f6] outline-none transition-all duration-200 bg-gray-50 text-[#111827] text-base shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium text-[#2d3748] mb-1.5">
                Contact
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={(e) => {
                  const input = e.target.value;
                  // Only update if input is digits only
                  if (/^\d*$/.test(input)) {
                    handleChange(e);
                  }
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-3 focus:ring-[#3b82f6]/40 focus:border-[#3b82f6] outline-none transition-all duration-200 bg-gray-50 text-[#111827] text-base shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-[#2d3748] mb-1.5">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-3 focus:ring-[#3b82f6]/40 focus:border-[#3b82f6] outline-none transition-all duration-200 bg-gray-50 text-[#111827] text-base shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-[#2d3748] mb-1.5">
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-3 focus:ring-[#3b82f6]/40 focus:border-[#3b82f6] outline-none transition-all duration-200 bg-gray-50 text-[#111827] text-base shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-[#2d3748] mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-3 focus:ring-[#3b82f6]/40 focus:border-[#3b82f6] outline-none transition-all duration-200 bg-gray-50 text-[#111827] text-base shadow-sm"
              />
            </div>
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#3b82f6] text-white font-bold py-3.5 px-5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-md"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
              }}
              whileTap={{ scale: 0.98 }}
              disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                  {/* Reduced size */}
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes{" "}
                  {/* Reduced icon size */}
                </>
              )}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-[#2d3748] font-bold py-3.5 px-5 rounded-xl transition-all duration-300 mt-2 text-base shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              Cancel
            </motion.button>
          </form>
        ) : (
          // Read-only view
          userData && (
            <div className="space-y-2 text-[#2d3748] bg-gray-50 p-5 rounded-xl shadow-inner">
              {" "}
              {/* Reduced padding, rounded, shadow */}
              {renderField("Name", userData.name, User)}
              {renderField("Email", userData.email, User)}{" "}
              {/* Email is not in formData, but good to display */}
              {renderField("Contact", userData.contact, Phone)}
              {renderField("Address", userData.address, MapPin)}
              {renderField("Country", userData.country, Globe)}
              {renderField("Date of Birth", userData.dob, Calendar)}
              {renderField(
                "Account Status",
                userData.account_status,
                CheckCircle
              )}
            </div>
          )
        )}
      </motion.div>
      <div className="overflow-hidden">
        <div className="-z-10 absolute top-[4.2rem] right-2 w-24 h-24 bg-gradient-to-b from-blue-500 to-purple-400 rounded-full opacity-30 animate-float"></div>
        <div
          className="-z-10 absolute bottom-4 right-[33rem] w-32 h-32 bg-gradient-to-r from-black to-purple-600 rounded-full opacity-20 animate-float"
          style={{ animationDelay: "2s" }}></div>
        <div className="-z-10 absolute -bottom-48 left-24 w-48 h-48 bg-gradient-to-t from-purple-500 to-blue-300 rounded-full opacity-30 animate-float"></div>
        <div className="-z-10 absolute top-48 left-60 w-48 h-48 bg-gradient-to-t from-purple-500 to-blue-600 rounded-full opacity-70 animate-float"></div>
        {/* <div className="-z-10 absolute top-[20rem] left-[20rem] w-40 h-40 bg-gradient-to-b from-purple-600 to-blue-500 rounded-full opacity-30 animate-float"></div> */}
        <div className="-z-10 absolute top-[20rem] right-[10rem] w-36 h-36 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full opacity-20 animate-float"></div>
      </div>
    </div>
  );
};

export default ProfileUpdate;
