/* eslint-disable @typescript-eslint/no-explicit-any */
// store/features/subscriptionPlansSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the interface for a single pricing tier as received from the API
export interface ApiPricingTier {
  uuid: string;
  name: string;
  description: string;
  price: string; // API returns price as a string
  search_limit: number;
  duration_days: number;
  features: string[];
  is_active: number;
  is_popular: number; // 0 or 1
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Define the state shape for the subscription plans slice
interface SubscriptionPlansState {
  data: ApiPricingTier[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SubscriptionPlansState = {
  data: [],
  status: 'idle',
  error: null,
};

// Async thunk to fetch subscription plans
export const fetchSubscriptionPlans = createAsyncThunk(
  'subscriptionPlans/fetchSubscriptionPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ data: ApiPricingTier[] }>(
        `${import.meta.env.VITE_INTEREST_MINER_API_URL}/subscription-plans`
      );
      // Filter out inactive plans and sort by sort_order
      const activeAndSortedPlans = response.data.data;


      console.log(activeAndSortedPlans, "my plans=>>>>>>>>>>>>>>")
      return activeAndSortedPlans;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription plans');
    }
  }
);

const subscriptionPlansSlice = createSlice({
  name: 'subscriptionPlans',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action: PayloadAction<ApiPricingTier[]>) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.data = []; // Clear data on failure
      });
  },
});

export default subscriptionPlansSlice.reducer;
