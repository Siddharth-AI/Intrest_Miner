/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define interfaces for the state
interface RazorpayState {
  orderLoading: boolean;
  orderError: string | null;
  orderData: any | null; // To store the order details from backend
  verificationLoading: boolean;
  verificationError: string | null;
  verificationSuccess: boolean;
}

// Define interface for coupon validation
interface CouponValidationData {
  coupon: {
    uuid: string;
    code: string;
    name: string;
    description: string;
    discount_type: string;
    discount_value: number;
  };
  pricing: {
    original_amount: number;
    discount_amount: number;
    final_amount: number;
    savings_percentage: string;
  };
}

interface CouponState {
  validationLoading: boolean;
  validationError: string | null;
  appliedCoupon: CouponValidationData | null;
}

// Extended state with coupon functionality
interface ExtendedRazorpayState extends RazorpayState, CouponState { }

const initialState: ExtendedRazorpayState = {
  orderLoading: false,
  orderError: null,
  orderData: null,
  verificationLoading: false,
  verificationError: null,
  verificationSuccess: false,
  validationLoading: false,
  validationError: null,
  appliedCoupon: null,
};

// Async Thunk for validating coupon
export const validateCoupon = createAsyncThunk(
  'razorpay/validateCoupon',
  async (data: { coupon_code: string; plan_id: number }, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_INTEREST_MINER_API_URL}/api/coupons/validate`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.data; // Return coupon validation data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Invalid coupon code');
    }
  }
);

// Updated Async Thunk for creating Razorpay Order with coupon support
export const createRazorpayOrder = createAsyncThunk(
  'razorpay/createOrder',
  async (data: { plan_id: number; coupon_code?: string }, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_INTEREST_MINER_API_URL}/subscriptions/razorpay/order`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data; // This should contain order, payment_uuid, plan, coupon_applied
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create Razorpay order');
    }
  }
);

// Async Thunk for verifying Razorpay Payment
export const verifyRazorpayPayment = createAsyncThunk(
  'razorpay/verifyPayment',
  async (paymentDetails: {
    order_id: string;
    payment_id: string;
    signature: string;
    payment_uuid: string;
    plan_id: number;
    auto_renew: number;
  }, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_INTEREST_MINER_API_URL}/subscriptions/razorpay/verify`,
        paymentDetails,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data; // This should contain success status
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to verify Razorpay payment');
    }
  }
);

const razorpaySlice = createSlice({
  name: 'razorpay',
  initialState,
  reducers: {
    // Reducer to reset the state after a payment attempt (success or failure)
    resetRazorpayState: (state) => {
      state.orderLoading = false;
      state.orderError = null;
      state.orderData = null;
      state.verificationLoading = false;
      state.verificationError = null;
      state.verificationSuccess = false;
      state.validationLoading = false;
      state.validationError = null;
      state.appliedCoupon = null;
    },

    // Clear applied coupon
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
      state.validationError = null;
    },

    // Clear coupon validation error
    clearCouponError: (state) => {
      state.validationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // validateCoupon reducers
      .addCase(validateCoupon.pending, (state) => {
        state.validationLoading = true;
        state.validationError = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action: PayloadAction<CouponValidationData>) => {
        state.validationLoading = false;
        state.appliedCoupon = action.payload;
        state.validationError = null;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.validationLoading = false;
        state.validationError = action.payload as string;
        state.appliedCoupon = null;
      })

      // createRazorpayOrder reducers
      .addCase(createRazorpayOrder.pending, (state) => {
        state.orderLoading = true;
        state.orderError = null;
        state.orderData = null;
        state.verificationSuccess = false; // Reset verification success on new order attempt
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action: PayloadAction<any>) => {
        state.orderLoading = false;
        state.orderData = action.payload;
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.orderLoading = false;
        state.orderError = action.payload as string;
      })

      // verifyRazorpayPayment reducers
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.verificationLoading = true;
        state.verificationError = null;
        state.verificationSuccess = false;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action: PayloadAction<any>) => {
        state.verificationLoading = false;
        state.verificationSuccess = action.payload.success; // Assuming API returns { success: true/false }
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.verificationLoading = false;
        state.verificationError = action.payload as string;
        state.verificationSuccess = false;
      });
  },
});

export const { resetRazorpayState, clearAppliedCoupon, clearCouponError } = razorpaySlice.actions;
export default razorpaySlice.reducer;
