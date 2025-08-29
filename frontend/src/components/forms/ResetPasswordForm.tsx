import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
  resetPassword,
  resetForgotPasswordState,
} from "../../../store/features/forgotPasswordSlice";
import { FaLock, FaRedo } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ResetPasswordFormProps {
  resetToken: string;
  onReset: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  resetToken,
  onReset,
}) => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const forgot = useSelector((state: RootState) => state.forgotPassword);

  React.useEffect(() => {
    if (forgot.success && forgot.message?.toLowerCase().includes("reset")) {
      toast({
        title: "Password Reset!",
        description: forgot.message || "Password reset successfully.",
      });
      onReset();
      dispatch(resetForgotPasswordState());
    } else if (forgot.error) {
      toast({
        title: "Validation Error",
        description: forgot.error,
        variant: "destructive",
      });
    }
  }, [forgot.success, forgot.message, forgot.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    dispatch(
      resetPassword({
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
    );
  };

  return (
    <div className="px-8">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 w-full lg:w-[700px] shadow-2xl border border-white/20 relative overflow-hidden flex flex-col items-center mr-16">
        <div className="flex flex-col items-center mb-6">
          <FaLock className="w-16 h-16 text-green-500 mb-2 animate-pulse" />
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="text-gray-600">Enter your new password below.</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm flex flex-col items-center">
          <div className="relative w-full mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full px-4 py-3 border-2 border-green-200 rounded-full focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:shadow-md text-lg pr-12"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}>
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="relative w-full mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full px-4 py-3 border-2 border-green-200 rounded-full focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:shadow-md text-lg pr-12"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600"
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={-1}>
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-green-600 text-white rounded-full font-semibold shadow-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-60"
            disabled={forgot.loading}>
            {forgot.loading ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordForm;
