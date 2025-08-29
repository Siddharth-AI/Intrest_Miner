import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of a single payment record based on your API response
interface Payment {
  uuid: string;
  amount: string;
  currency: string;
  payment_method: string;
  payment_gateway: string;
  transaction_id: string;
  status: string;
  payment_date: string; // ISO string, e.g., "2025-06-23T10:37:32.000Z"
  created_at: string; // ISO string
  plan_name: string;
  subscription_id: string | null;
}

// Define the state shape for the billing slice
interface BillingState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

const initialState: BillingState = {
  payments: [],
  loading: false,
  error: null,
};

// Async thunk for fetching payments from the API
export const fetchPayments = createAsyncThunk(
  'billing/fetchPayments', // Action type prefix
  async (_, { rejectWithValue }) => {
    try {
      // Retrieve the access token from localStorage (assuming it's stored there)
      const accessToken = localStorage.getItem('token');

      if (!accessToken) {
        // If no access token is found, reject the thunk with an error message
        return rejectWithValue('Authentication required. No access token found.');
      }

      // Make the API call to fetch payments
      const response = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/billing/payments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Include the access token in the Authorization header
        },
      });

      // Check if the response was successful
      if (!response.ok) {
        // If response is not OK (e.g., 401, 403, 500), parse the error message from the response body
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch payments. Please try again.');
      }

      // Parse the successful response
      const result = await response.json();
      // Return the 'data' array from the response as the payload
      console.log(result.data, "slice data=>>>>>>>>>>>>>>>>>>")
      return result.data as Payment[];
    } catch (err) {
      // Catch any network or unexpected errors
      if (err instanceof Error) {
        return rejectWithValue(err.message); // Return the error message if it's an Error object
      }
      return rejectWithValue('An unknown error occurred while fetching payments.'); // Generic error for other cases
    }
  }
);

// Create the billing slice
const billingHistorySlice = createSlice({
  name: 'billing', // Slice name
  initialState, // Initial state defined above
  reducers: {
    // No synchronous reducers needed for this specific request, but they could be added here
    clearPayments: (state) => {
      state.payments = [];
      state.error = null;
    }
  },
  // Define extra reducers to handle the lifecycle of the async thunk (pending, fulfilled, rejected)
  extraReducers: (builder) => {
    builder
      // When fetchPayments is pending
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true; // Set loading to true
        state.error = null;   // Clear any previous errors
      })
      // When fetchPayments is fulfilled (successful)
      .addCase(fetchPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
        state.loading = false;      // Set loading to false
        state.payments = action.payload; // Update payments with the fetched data
        state.error = null;         // Clear any errors
      })
      // When fetchPayments is rejected (failed)
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;      // Set loading to false
        state.payments = [];        // Clear payments on error
        // Extract error message if available, otherwise use default
        state.error = typeof action.payload === 'string'
          ? action.payload
          : 'Failed to load billing history.';
      });
  },
});

// Export the reducer and any actions
export const { clearPayments } = billingHistorySlice.actions;
export default billingHistorySlice.reducer;
