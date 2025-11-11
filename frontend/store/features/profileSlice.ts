/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the interfaces for your profile data
export interface PlanDetails {
  id: number;
  name: string;
  price: number;
  duration_days: number;
  search_limit: number;
  features: string; // This will be a JSON string, so we'll parse it
}

export interface UserProfileData {
  uuid: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  country: string;
  dob: string;
  account_status?: string;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
  end_date: string;
  current_plan: number;
  subscription_status: string;
  open_Ai_searches: number;
  open_Ai_total_searches: number;
  searches_remaining: number;
  total_searches_made: number;
  plan_details: PlanDetails;
  fb_user_id?: string | null; // or Date if you parse it
  fb_token_expires_in?: number | null;

}

interface ProfileState {
  data: UserProfileData | null;
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  updateError: string | null;
  updateSuccess: boolean;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
};

// Async Thunk for fetching profile data
export const fetchProfileData = createAsyncThunk(
  'profile/fetchProfileData',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('token'); // Get access token from localStorage
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/auth/profile-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Include access token in header
        },
      });

      const result = await response.json();


      if (!response.ok) {
        return rejectWithValue(result.message || 'Failed to fetch profile data');
      }

      // Parse the features string into an array
      if (result.data && result.data.plan_details && typeof result.data.plan_details.features === 'string') {
        try {
          result.data.plan_details.features = JSON.parse(result.data.plan_details.features);
        } catch (parseError) {
          console.error("Failed to parse plan features:", parseError);
          result.data.plan_details.features = []; // Default to empty array on parse error
        }
      }
      // console.log(result.data, "profile fetch data=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An unknown error occurred');
    }
  }
);

// Async Thunk for updating profile data
export const updateProfileData = createAsyncThunk(
  'profile/updateProfileData',
  async (profileUpdate: { name: string; contact: string; address: string; country: string; dob: string; }, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem('token'); // Get access token from localStorage
      if (!accessToken) {
        return rejectWithValue('No access token found');
      }

      const response = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Include access token in header
        },
        body: JSON.stringify(profileUpdate),
      });

      const result = await response.json();

      if (!response.ok) {
        return rejectWithValue(result.message || 'Failed to update profile data');
      }

      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An unknown error occurred during update');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Action to reset update success state
    resetUpdateStatus: (state) => {
      state.updateSuccess = false;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile Data
      .addCase(fetchProfileData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileData.fulfilled, (state, action: PayloadAction<UserProfileData>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfileData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Profile Data
      .addCase(updateProfileData.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfileData.fulfilled, (state) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        // Optionally refetch profile data after successful update to ensure consistency
        // state.data = { ...state.data, ...action.meta.arg }; // This would update locally, but a refetch is safer
      })
      .addCase(updateProfileData.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
        state.updateSuccess = false;
      });
  },
});

export const { resetUpdateStatus } = profileSlice.actions;
export default profileSlice.reducer;

