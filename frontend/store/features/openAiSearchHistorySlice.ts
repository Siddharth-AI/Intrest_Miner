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

// Define the type for the data being sent to the POST API
// This should match the BusinessFormData from your BusinessInfoForm.tsx
export interface BusinessFormData {
  productName: string;
  category: string;
  productDescription: string;
  location: string;
  promotionGoal: string;
  targetAudience: string;
  contactEmail: string;
}

interface SearchHistoryState {
  data: SearchHistoryAiItem[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  // New state for the POST request
  savingBusinessDetails: boolean;
  saveBusinessDetailsError: string | null;
  savedBusinessDetailsSuccess: boolean;
}

const initialState: SearchHistoryState = {
  data: [],
  loading: false,
  error: null,
  pagination: null,
  savingBusinessDetails: false, // Initial state for saving
  saveBusinessDetailsError: null, // Initial state for save error
  savedBusinessDetailsSuccess: false, // Initial state for save success
};

// Async Thunk for fetching search history (existing)
export const fetchSearchAiHistory = createAsyncThunk(
  'searchHistory/fetchSearchAiHistory',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('token'); // Get access token from localStorage
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/business/business-details-history`, {
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

// NEW Async Thunk for saving business details (POST API)
export const saveBusinessDetails = createAsyncThunk(
  'searchHistory/saveBusinessDetails',
  async (formData: BusinessFormData, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('token'); // Get access token from localStorage
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/business/businesSearchistory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData), // Sending the entire formData object
      });

      const result = await response.json();

      if (!response.ok) {
        // If the response is not OK, reject with the error message from the backend
        return rejectWithValue(result.message || 'Failed to save business details');
      }

      return result; // Return the success response data
    } catch (error: any) {
      // Catch any network errors or other unexpected issues
      return rejectWithValue(error.message || 'An unknown error occurred while saving business details');
    }
  }
);


const searchHistoryAiSlice = createSlice({
  name: 'searchHistoryAi',
  initialState,
  reducers: {
    // Add a reducer to reset the save state, useful after a successful save or error display
    resetSaveBusinessDetailsState: (state) => {
      state.savingBusinessDetails = false;
      state.saveBusinessDetailsError = null;
      state.savedBusinessDetailsSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Reducers for fetchSearchAiHistory (existing)
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
      })
      // Reducers for saveBusinessDetails (NEW)
      .addCase(saveBusinessDetails.pending, (state) => {
        state.savingBusinessDetails = true;
        state.saveBusinessDetailsError = null;
        state.savedBusinessDetailsSuccess = false;
      })
      .addCase(saveBusinessDetails.fulfilled, (state, action) => {
        state.savingBusinessDetails = false;
        state.savedBusinessDetailsSuccess = true;
        // Optionally, you might want to add the new item to the data array
        // if the API returns the full saved item and you want to display it immediately.
        // For now, we'll just set success.
        console.log("Business details saved successfully:", action.payload);
      })
      .addCase(saveBusinessDetails.rejected, (state, action) => {
        state.savingBusinessDetails = false;
        state.saveBusinessDetailsError = action.payload as string;
        state.savedBusinessDetailsSuccess = false;
        console.error("Failed to save business details:", action.payload);
      });
  },
});

export const { resetSaveBusinessDetailsState } = searchHistoryAiSlice.actions; // Export the new action
export default searchHistoryAiSlice.reducer;
