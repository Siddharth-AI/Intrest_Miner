/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define interfaces for search history data
export interface SearchHistoryAiItem {
  id: string;
  productName: string,
  category: string;
  filters: Record<string, any>; // Use Record<string, any> for arbitrary object
  visit_count: number;
  created_at: string;
  last_visited: string;
  productDescription: string,
  location: string,
  promotionGoal: string,
  targetAudience: string,
  contactEmail: string,
}

interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

interface SearchHistoryState {
  data: SearchHistoryAiItem[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

const initialState: SearchHistoryState = {
  data: [],
  loading: false,
  error: null,
  pagination: null,
};

// Async Thunk for fetching search history
export const fetchSearchAiHistory = createAsyncThunk(
  'searchHistory/fetchSearchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('token'); // Get access token from localStorage
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }

      const response = await fetch('http://localhost:1000/business/business-details-history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Include access token in header
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.message || 'Failed to fetch search history');
      }

      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An unknown error occurred');
    }
  }
);

const searchHistoryAiSlice = createSlice({
  name: 'searchHistoryAi',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchAiHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchAiHistory.fulfilled, (state, action: PayloadAction<{ data: SearchHistoryAiItem[]; pagination: Pagination }>) => {
        state.loading = false;
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSearchAiHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
// No specific reducers, so no actions to export here
export default searchHistoryAiSlice.reducer;
