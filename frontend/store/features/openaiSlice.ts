// src/store/features/openaiSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { BusinessFormData } from "../../src/types/business"; // Assuming you have this type defined

// Define the shape of an analyzed interest based on your API response
export interface AnalyzedInterest {
  name: string;
  audienceSizeLowerBound: number;
  audienceSizeUpperBound: number;
  path: string[];
  topic: string;
  relevanceScore: number;
  category: string;
  rank: number;
}

// Define the shape of the API response data
interface GenerateInterestsResponse {
  businessInfo: BusinessFormData;
  suggestedInterests: string[];
  totalRawInterests: number;
  analyzedInterests: AnalyzedInterest[];
  summary: {
    totalSuggestions: number;
    totalMetaResults: number;
    finalRecommendations: number;
  };
}

// Define the state shape for the OpenAI slice
interface OpenAiState {
  data: GenerateInterestsResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: OpenAiState = {
  data: null,
  loading: false,
  error: null,
};

// Create an async thunk for generating interests
export const generateInterests = createAsyncThunk(
  "openai/generateInterests",
  async (businessData: BusinessFormData, { rejectWithValue }) => {

    const accessToken = localStorage.getItem('token'); // Get access token from localStorage
    if (!accessToken) {
      return rejectWithValue('No access token found');
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_INTEREST_MINER_API_URL}/business/generate-interests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include the Authorization header with your token
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify(businessData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // If the server responds with an error status, reject the thunk with the error message
        return rejectWithValue(result.message || "Failed to generate interests");
      }

      return result.data as GenerateInterestsResponse;
    } catch (err) {
      // Handle network errors or other unexpected issues
      return rejectWithValue("An unexpected error occurred.");
    }
  }
);

const openaiSlice = createSlice({
  name: "openai",
  initialState,
  reducers: {
    resetOpenAiState: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateInterests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        generateInterests.fulfilled,
        (state, action: PayloadAction<GenerateInterestsResponse>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(generateInterests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetOpenAiState } = openaiSlice.actions;

export default openaiSlice.reducer;
