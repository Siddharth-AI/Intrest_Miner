import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ReceiptText,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks"; // Adjust path to your hooks
import { fetchPayments } from "../../../store/features/billingHistorySlice"; // Adjust path to your billing slice
import { toast } from "@/hooks/use-toast"; // Assuming you have a toast notification system

// Helper function to format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper function to format amount with currency
const formatCurrency = (amount: string, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount));
};

const BillingHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { payments, loading, error } = useAppSelector(
    (state) => state.billingHistory
  );
  console.log(payments, "payment=>>>>>>>>>>>>>");
  const { data: UserProfileData } = useAppSelector((state) => state.profile);
  // console.log(UserProfileData, "biling===========================");
  useEffect(() => {
    // Fetch payments when the component mounts
    dispatch(fetchPayments());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching billing history",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/miner");
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)] p-4 flex items-center justify-center font-inter">
      <motion.div
        className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl max-w-5xl w-full transform transition-all duration-300 hover:shadow-2xl"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}>
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
          <div className="flex items-center">
            <motion.button
              onClick={handleGoBack}
              className="mr-3 p-2 rounded-full bg-[#e0f2fe] hover:bg-[#cce8ff] transition-all duration-200 shadow-md"
              whileTap={{ scale: 0.92 }}>
              <ArrowLeft className="h-5 w-5 text-[#3b82f6]" />
            </motion.button>
            <h2 className="text-xl sm:ml-4 sm:text-3xl font-extrabold text-[#111827]">
              Billing History
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-10">
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
              Loading your billing history...
            </p>
          </div>
        ) : error ? (
          <motion.div
            className="bg-red-500/20 border border-red-400/30 text-red-800 px-4 py-3 rounded-xl max-w-lg mx-auto mt-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <p className="flex items-center gap-2 font-medium text-sm">
              <Shield className="h-4 w-4 text-red-600" />
              {error}
            </p>
            <button
              onClick={() => dispatch(fetchPayments())}
              className="mt-2 text-xs bg-red-500/30 hover:bg-red-500/50 transition-all duration-200 px-3 py-1.5 rounded-lg text-red-800">
              Try again
            </button>
          </motion.div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-600">
            <ReceiptText className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl font-semibold mb-2">
              No Billing History Found
            </p>
            <p className="text-sm">
              It looks like you haven't made any payments yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:table-cell">
                    <div className="flex items-center gap-1">Name</div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> Amount
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:table-cell">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" /> Method
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> Date
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:table-cell">
                    Plan
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr
                    key={payment.uuid}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 sm:table-cell">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-md">
                        {UserProfileData.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 md:table-cell">
                      <span className="capitalize">
                        {payment.payment_method.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 sm:table-cell">
                      <span className="font-medium text-blue-600">
                        {payment.plan_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      {/* Background blobs from ProfileUpdate for consistent theme */}
      <div className="overflow-hidden">
        <div className="-z-10 absolute top-[4.2rem] right-2 w-24 h-24 bg-gradient-to-b from-blue-500 to-purple-400 rounded-full opacity-30 animate-float"></div>
        <div
          className="-z-10 absolute bottom-4 right-[33rem] w-32 h-32 bg-gradient-to-r from-black to-purple-600 rounded-full opacity-20 animate-float"
          style={{ animationDelay: "2s" }}></div>
        <div className="-z-10 absolute -bottom-48 left-24 w-48 h-48 bg-gradient-to-t from-purple-500 to-blue-300 rounded-full opacity-30 animate-float"></div>
        <div className="-z-10 absolute top-48 left-60 w-48 h-48 bg-gradient-to-t from-purple-500 to-blue-600 rounded-full opacity-70 animate-float"></div>
        <div className="-z-10 absolute top-[20rem] right-[10rem] w-36 h-36 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full opacity-20 animate-float"></div>
      </div>
    </div>
  );
};

export default BillingHistory;
