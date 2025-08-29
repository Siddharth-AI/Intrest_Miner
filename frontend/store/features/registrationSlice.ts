/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface RegistrationState {
  loading: boolean;
  success: boolean;
  error: string | null;
  message: string | null;
}

const initialState: RegistrationState = {
  loading: false,
  success: false,
  error: null,
  message: null,
};

export const registerUser = createAsyncThunk(
  "registration/registerUser",
  async (
    data: { name: string; email: string; password: string; confirm_password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/auth/register`, data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    }
  }
);

const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {
    resetRegistrationState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message = action.payload.message || "User created successfully";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
        state.message = null;
      });
  },
});

export const { resetRegistrationState } = registrationSlice.actions;
export default registrationSlice.reducer;
