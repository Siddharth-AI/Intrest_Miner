/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface LoginState {
  loading: boolean;
  success: boolean;
  error: string | null;
  user: {
    uuid: string;
    user_id: number;
    email: string;
    access_token: string;
  } | null;
}

const initialState: LoginState = {
  loading: false,
  success: false,
  error: null,
  user: null,
};

export const loginUser = createAsyncThunk(
  "login/loginUser",
  async (
    data: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/auth/login`, data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    logout: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
        state.user = null;
      });
  },
});

export const { logout } = loginSlice.actions;
export default loginSlice.reducer; 