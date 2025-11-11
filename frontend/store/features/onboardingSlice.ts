/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface OnboardingState {
  hasSeenOnboarding: boolean;
  hasSeenInterestMinerTutorial: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: OnboardingState = {
  hasSeenOnboarding: false,
  hasSeenInterestMinerTutorial: false,
  loading: false,
  error: null,
};

// Fetch onboarding status from backend
export const fetchOnboardingStatus = createAsyncThunk(
  'onboarding/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/onboarding/onboarding-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched onboarding status:', response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch onboarding status');
    }
  }
);

// Update onboarding status
export const updateOnboardingStatus = createAsyncThunk(
  'onboarding/updateStatus',
  async (
    data: { hasSeenOnboarding?: boolean; hasSeenInterestMinerTutorial?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Updating onboarding status with data:', data);
      const response = await axios.put(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/onboarding/onboarding-status`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update onboarding status');
    }
  }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    resetOnboardingState: (state) => {
      state.hasSeenOnboarding = false;
      state.hasSeenInterestMinerTutorial = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch status
      .addCase(fetchOnboardingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnboardingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.hasSeenOnboarding = action.payload.hasSeenOnboarding;
        state.hasSeenInterestMinerTutorial = action.payload.hasSeenInterestMinerTutorial;
      })
      .addCase(fetchOnboardingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update status
      .addCase(updateOnboardingStatus.fulfilled, (state, action) => {
        if (action.payload.hasSeenOnboarding !== undefined) {
          state.hasSeenOnboarding = action.payload.hasSeenOnboarding;
        }
        if (action.payload.hasSeenInterestMinerTutorial !== undefined) {
          state.hasSeenInterestMinerTutorial = action.payload.hasSeenInterestMinerTutorial;
        }
      });
  },
});

export const { resetOnboardingState } = onboardingSlice.actions;
export default onboardingSlice.reducer;
