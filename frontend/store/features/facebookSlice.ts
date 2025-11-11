// src/features/facebookSearch/facebookSearchSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Define the shape of a single interest
interface FacebookInterest {
  id: string;
  name: string;
  audience_size_lower_bound: number;
  audience_size_upper_bound: number;
  path?: string[];
  topic?: string;
}

// Define the shape of our slice's state
interface FacebookSearchState {
  interests: FacebookInterest[];
  totalResults: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  selectedRows: string[]; // New
  currentPage: number;   // New
}

const initialState: FacebookSearchState = {
  interests: [],
  totalResults: 0,
  status: "idle",
  error: null,
  selectedRows: [], // New
  currentPage: 1,   // New
};

// Async thunk for fetching data (remains the same)
export const searchFacebookInterests = createAsyncThunk(
  "facebookSearch/searchInterests",
  async ({ query, limit }: { query: string; limit: number }) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authorization token found");

    const response = await axios.post(
      `${import.meta.env.VITE_INTEREST_MINER_API_URL}/api/facebook/search`,
      { query, limit },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data;
  }
);

const facebookSearchSlice = createSlice({
  name: "facebookSearch",
  initialState,
  reducers: {
    // UPDATED: resetSearchState now also resets the new properties
    resetSearchState: (state) => {
      state.status = "idle";
      state.interests = [];
      state.totalResults = 0;
      state.error = null;
      state.selectedRows = [];
      state.currentPage = 1;
    },
    // NEW: Action to set the current page
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    // NEW: Action to replace all selected rows (for select all/clear)
    setSelectedRows: (state, action: PayloadAction<string[]>) => {
      state.selectedRows = action.payload;
    },
    // NEW: Action to toggle a single row selection
    toggleRowSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedRows.includes(id)) {
        state.selectedRows = state.selectedRows.filter((rowId) => rowId !== id);
      } else {
        state.selectedRows.push(id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFacebookInterests.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(searchFacebookInterests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.interests = action.payload.interests;
        state.totalResults = action.payload.total_results;
        // UPDATED: Reset selections and page on every new successful search
        state.selectedRows = [];
        state.currentPage = 1;
      })
      .addCase(searchFacebookInterests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch interests";
      });
  },
});

// Export the new actions
export const {
  resetSearchState,
  setCurrentPage,
  setSelectedRows,
  toggleRowSelection,
} = facebookSearchSlice.actions;

export default facebookSearchSlice.reducer;