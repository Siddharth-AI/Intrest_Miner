/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define interfaces for search history data
export interface SearchHistoryItem {
  id: string;
  search_text: string;
  normalized_text: string;
  type: string;
  category: string;
  filters: Record<string, any>; // Use Record<string, any> for arbitrary object
  visit_count: number;
  created_at: string;
  last_visited: string;
}

interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

interface SearchHistoryState {
  data: SearchHistoryItem[];
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
export const fetchSearchHistory = createAsyncThunk(
  'searchHistory/fetchSearchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('token'); // Get access token from localStorage
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }

      const response = await fetch('http://localhost:1000/search-history/', {
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

const searchHistorySlice = createSlice({
  name: 'searchHistory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchHistory.fulfilled, (state, action: PayloadAction<{ data: SearchHistoryItem[]; pagination: Pagination }>) => {
        state.loading = false;
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSearchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default searchHistorySlice.reducer;
