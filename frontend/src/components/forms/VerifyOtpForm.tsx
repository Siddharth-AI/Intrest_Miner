import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
  verifyOtp,
  resetForgotPasswordState,
} from "../../../store/features/forgotPasswordSlice";
import { FaShieldAlt } from "react-icons/fa";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface VerifyOtpFormProps {
  email: string;
  onVerified: (resetToken: string) => void;
}

const VerifyOtpForm: React.FC<VerifyOtpFormProps> = ({ email, onVerified }) => {
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const forgot = useSelector((state: RootState) => state.forgotPassword);

  React.useEffect(() => {
    if (forgot.success && forgot.step === "reset" && forgot.resetToken) {
      toast({
        title: "OTP Verified!",
        description: forgot.message || "OTP verified successfully.",
      });
      onVerified(forgot.resetToken);
      dispatch(resetForgotPasswordState());
    } else if (forgot.error) {
      toast({
        title: "Error",
        description: forgot.error,
        variant: "destructive",
      });
    }
  }, [forgot.success, forgot.step, forgot.resetToken, forgot.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(verifyOtp({ email, otp_code: otp }));
  };

  return (
    <div className="px-8">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 relative overflow-hidden flex flex-col items-center w-full lg:w-[700px] lg:mr-16">
        <div className="flex flex-col items-center mb-6">
          <FaShieldAlt className="w-16 h-16 text-blue-500 mb-2 animate-pulse" />
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Verify OTP
          </h2>
          <p className="text-gray-600">
            Enter the OTP sent to{" "}
            <span className="font-semibold text-blue-600">{email}</span>
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm flex flex-col items-center">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full mb-4 px-4 py-3 border-2 border-blue-200 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:shadow-md text-center text-lg tracking-widest"
            maxLength={6}
          />
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-blue-600 text-white rounded-full font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-60"
            disabled={forgot.loading}>
            {forgot.loading ? "Verifying..." : "Verify"}
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch(resetForgotPasswordState());
              navigate("/login");
            }}
            className="w-full py-3 mt-3 bg-gray-200 text-gray-800 rounded-full font-semibold shadow hover:bg-gray-300 transition-all duration-200">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtpForm;
