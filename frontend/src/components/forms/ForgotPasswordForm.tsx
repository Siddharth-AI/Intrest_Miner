/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { IoLockClosedSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
  forgotPassword,
  resetForgotPasswordState,
} from "../../../store/features/forgotPasswordSlice";
import { toast } from "@/hooks/use-toast";

interface ForgotPasswordFormProps {
  onOtpSent: (email: string) => void;
}

export default function ForgotPasswordForm({
  onOtpSent,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const forgot = useSelector((state: RootState) => state.forgotPassword);
  const navigate = useNavigate();

  // useEffect(() => {
  //   dispatch(resetForgotPasswordState());
  // }, []);

  useEffect(() => {
    if (forgot.success && forgot.step === "otp" && forgot.email === email) {
      toast({
        title: "OTP Sent!",
        description: forgot.message || "Check your email for the OTP.",
      });
      onOtpSent(email);
      dispatch(resetForgotPasswordState());
    } else if (forgot.error) {
      toast({
        title: "Error",
        description: forgot.error,
        variant: "destructive",
      });
    }
  }, [forgot.success, forgot.step, forgot.email, forgot.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };
  return (
    <>
      {/* Right side form */}
      <div className="w-full lg:w-[1000px] flex items-center justify-center relative">
        {/* Decorative background elements */}

        <div className="absolute top-20 right-20 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 w-[90%] md:w-[75%] shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-blue-50/30 pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500"></div>

          <div className="relative z-10">
            {/* Back Arrow Button */}

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-200">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Forgot Password
              </h2>
              <p className="text-gray-600">
                provide your email for which you want to reset your password!
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-purple-500 rounded-full focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:shadow-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              {/* forgot-password Button */}
              <button
                type="submit"
                className="w-full py-3 mt-4 bg-purple-600 text-white rounded-full font-semibold shadow-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-60"
                disabled={forgot.loading}>
                {forgot.loading ? "Sending..." : "NEXT"}
              </button>
              {/* Back to Login Button */}
              <button
                type="button"
                onClick={() => {
                  dispatch(resetForgotPasswordState());
                  navigate("/login");
                }}
                className="w-full py-3 mt-3 bg-gray-200 text-gray-800 rounded-full font-semibold shadow hover:bg-gray-300 transition-all duration-200">
                Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
