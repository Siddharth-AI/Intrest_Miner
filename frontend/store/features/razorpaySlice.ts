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

const initialState: RazorpayState = {
  orderLoading: false,
  orderError: null,
  orderData: null,

  verificationLoading: false,
  verificationError: null,
  verificationSuccess: false,
};

// Async Thunk for creating Razorpay Order
export const createRazorpayOrder = createAsyncThunk(
  'razorpay/createOrder',
  async (planUuid: number, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('token');
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_INTEREST_MINER_API_URL}/subscriptions/razorpay/order`,
        { plan_id: planUuid },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data; // This should contain order, payment_uuid, plan
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
    plan_id: number; // This should be the plan's UUID, not sort_order
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
    },
  },
  extraReducers: (builder) => {
    builder
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

export const { resetRazorpayState } = razorpaySlice.actions;
export default razorpaySlice.reducer;
