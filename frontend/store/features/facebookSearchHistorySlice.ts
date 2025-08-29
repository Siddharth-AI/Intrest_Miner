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
  // New state for the POST request
  savingSearchHistory: boolean;
  saveSearchHistoryError: string | null;
  saveSearchHistorySuccess: boolean;
}

const initialState: SearchHistoryState = {
  data: [],
  loading: false,
  error: null,
  pagination: null,
  savingSearchHistory: false, // Initial state for saving
  saveSearchHistoryError: null, // Initial state for save error
  saveSearchHistorySuccess: false, // Initial state for save success
};

// Async Thunk for fetching search history (existing)
export const fetchSearchHistory = createAsyncThunk(
  'facebookSearchHistory/fetchSearchHistory', // Changed name to be more specific
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('token'); // Get access token from localStorage
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/search-history/`, {
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

// NEW Async Thunk for saving Facebook search history (POST API)
export const saveFacebookSearchHistory = createAsyncThunk(
  'facebookSearchHistory/saveSearchHistory', // Changed name to be more specific
  async (query: { search_text: string }, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('token'); // Get access token from localStorage
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/search-history/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(query), // Sending the search_text
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.message || 'Failed to store search history');
      }

      return result; // Return the success response data
    } catch (error: any) {
      return rejectWithValue(error.message || 'An unknown error occurred while saving search history');
    }
  }
);


const facebookSearchHistorySlice = createSlice({
  name: 'facebookSearchHistory', // Renamed slice name for clarity
  initialState,
  reducers: {
    // Add a reducer to reset the save state, useful after a successful save or error display
    resetSaveSearchHistoryState: (state) => {
      state.savingSearchHistory = false;
      state.saveSearchHistoryError = null;
      state.saveSearchHistorySuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Reducers for fetchSearchHistory (existing)
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
      })
      // Reducers for saveFacebookSearchHistory (NEW)
      .addCase(saveFacebookSearchHistory.pending, (state) => {
        state.savingSearchHistory = true;
        state.saveSearchHistoryError = null;
        state.saveSearchHistorySuccess = false;
      })
      .addCase(saveFacebookSearchHistory.fulfilled, (state, action) => {
        state.savingSearchHistory = false;
        state.saveSearchHistorySuccess = true;
        // Optionally, you might want to add the new item to the data array
        // if the API returns the full saved item and you want to display it immediately.
        console.log("Search history stored successfully:", action.payload);
      })
      .addCase(saveFacebookSearchHistory.rejected, (state, action) => {
        state.savingSearchHistory = false;
        state.saveSearchHistoryError = action.payload as string;
        state.saveSearchHistorySuccess = false;
        console.error("Failed to store search history:", action.payload);
      });
  },
});

export const { resetSaveSearchHistoryState } = facebookSearchHistorySlice.actions; // Export the new action
export default facebookSearchHistorySlice.reducer;
