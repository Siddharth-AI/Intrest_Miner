/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface ForgotPasswordState {
  loading: boolean;
  error: string | null;
  success: boolean;
  step: 'email' | 'otp' | 'reset';
  email: string;
  resetToken: string;
  message: string | null;
}

const initialState: ForgotPasswordState = {
  loading: false,
  error: null,
  success: false,
  step: 'email',
  email: '',
  resetToken: '',
  message: null,
};

export const forgotPassword = createAsyncThunk(
  'forgotPassword/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/auth/forgot-password`, { email });
      if (response.data.success) {
        return { email, message: response.data.message };
      } else {
        return rejectWithValue(response.data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'forgotPassword/verifyOtp',
  async (data: { email: string; otp_code: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/auth/verify-otp`, data);
      if (response.data.success) {
        return { resetToken: response.data.data.reset_token, message: response.data.message };
      } else {
        return rejectWithValue(response.data.message || 'OTP verification failed');
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'forgotPassword/resetPassword',
  async (data: { reset_token: string; new_password: string; confirm_password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/auth/reset-password`, data);
      if (response.data.success) {
        return { message: response.data.message };
      } else {
        return rejectWithValue(response.data.message || 'Password reset failed');
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Password reset failed');
    }
  }
);

const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {
    resetForgotPasswordState: () => initialState,
    setStep: (state, action) => {
      state.step = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.step = 'otp';
        state.email = action.payload.email;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.step = 'reset';
        state.resetToken = action.payload.resetToken;
        state.message = action.payload.message;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.step = 'email';
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { resetForgotPasswordState, setStep } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer; 