/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// ===== Types ===== (keeping all your existing types)
export interface AdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  spend_cap: string;
}

// Add these new interfaces at the top of your facebookAdsSlice.ts
export interface FacebookConnection {
  id: number;
  user_id: number;
  fb_user_id: string;
  fb_access_token: string;
  fb_token_updated_at: string;
  fb_token_expires_in: number;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacebookStatus {
  facebook_connected: boolean;
  facebook_token_valid: boolean;
  total_connections: number;
  primary_connection: FacebookConnection | null;
  all_connections: FacebookConnection[];
  user_profile: {
    id: number;
    uuid: string;
    name: string;
    email: string;
    avatar_path: string | null;
    account_status: string;
  };
}

export interface FacebookAuthState {
  isConnected: boolean;
  isLoading: boolean;
  status: FacebookStatus | null;
  connections: FacebookConnection[];
  primaryConnection: FacebookConnection | null;
  error: string | null;
}


export interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  start_time: string;
  stop_time?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  source_campaign_id: string;
  totals?: any;
  verdict?: any;
  // 🔥 NEW: AI Analysis Fields
  ai_verdict?: string;
  ai_analysis?: string;
  ai_recommendations?: string;

}

export interface InsightData {
  account_currency: string;
  account_id: string;
  account_name: string;
  campaign_id: string;
  campaign_name: string;
  adset_id: string;
  adset_name: string;
  ad_id: string;
  ad_name: string;
  date_start: string;
  date_stop: string;
  impressions: string;
  clicks: string;
  spend: string;
  ctr: string;
  cpc: string;
  cpp: string;
  reach: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
  objective: string;
  buying_type: string;
  full_view_impressions: string;
  full_view_reach: string;
}

interface AggregatedStats {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalReach: number;
  avgCTR: number;
  avgCPC: number;
  avgCPM: number;
  totalPurchases: number;
  totalPurchaseValue: number;
  totalAddToCarts: number;
  totalViewContent: number;
}

interface CustomDateRange {
  since: string;
  until: string;
}

interface TopCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  start_time: string;
  stop_time?: string;
  daily_budget?: string;
  source_campaign_id: string;
  totals: {
    impressions: number;
    clicks: number;
    reach: number;
    spend: number;
    ctr: number;
    cpc: number;
    cpp: number;
    actions: {
      add_to_cart: number;
      purchase: number;
      initiate_checkout: number;
      add_payment_info: number;
    };
  };
  verdict: {
    category: string;
    reason: string;
    recommendation: string;
  };
  score: number;
}

interface StableCampaigns {
  id: string;
  name: string;
  objective: string;
  status: string;
  start_time: string;
  stop_time?: string;
  daily_budget?: string;
  source_campaign_id: string;
  totals: {
    impressions: number;
    clicks: number;
    reach: number;
    spend: number;
    ctr: number;
    cpc: number;
    cpp: number;
    actions: {
      add_to_cart: number;
      purchase: number;
      initiate_checkout: number;
      add_payment_info: number;
    };
  };
  verdict: {
    category: string;
    reason: string;
    recommendation: string;
  };
}

interface underperforming {
  id: string;
  name: string;
  objective: string;
  status: string;
  start_time: string;
  stop_time?: string;
  daily_budget?: string;
  source_campaign_id: string;
  totals: {
    impressions: number;
    clicks: number;
    reach: number;
    spend: number;
    ctr: number;
    cpc: number;
    cpp: number;
    actions: {
      add_to_cart: number;
      purchase: number;
      initiate_checkout: number;
      add_payment_info: number;
    };
  };
  verdict: {
    category: string;
    reason: string;
    recommendation: string;
  };
}

// 🔥 Enhanced State with FIXED Caching
// 🔥 UPDATED: FacebookAdsState interface
interface FacebookAdsState {
  adAccounts: AdAccount[];
  campaigns: Campaign[];
  insights: InsightData[];
  campaignInsights: InsightData[];
  campaignInsightstotal: InsightData[];
  aggregatedStats: AggregatedStats | null;
  selectedAccount: string;
  selectedCampaign: string;
  dateFilter: string;
  customDateRange: CustomDateRange;
  searchTerm: string;
  statusFilter: string;
  loading: boolean;
  initialLoading: boolean;
  showModal: boolean;
  showCustomDatePicker: boolean;
  selectedCampaignForModal: Campaign | null;
  error: string | null;
  lastUpdated: string | null;

  facebookAuth: FacebookAuthState;

  // Your existing AnalyticsPage fields
  campaignAnalysis: Campaign[];
  overallTotals: any | null;
  loadingCampaigns: boolean;
  loadingTotals: boolean;
  topCampaign: any | null; // 🔥 CHANGED: from array to single object
  stableCampaigns: any[];
  underperforming: any[];

  // 🔥 NEW: Additional campaign categories from API
  excellentCampaigns: any[];
  moderateCampaigns: any[];


  // 🔥 NEW: Optimized caching fields
  insightsCache: Record<string, {
    data: any;
    timestamp: number;
    expiresIn: number;
  }>;
  insightsLastUpdated: Record<string, number>;
  exportModal: {
    isOpen: boolean;
    options: {
      includeCampaignDetails: boolean;
      includeAIAnalysis: boolean;
    };
  };
}


// ===== Helpers =====
const getAccessToken = () => localStorage.getItem("token");

const calculateAggregatedStats = (insights: InsightData[]): AggregatedStats | null => {
  if (!insights.length) return null;

  const totals = {
    spend: 0,
    impressions: 0,
    clicks: 0,
    reach: 0,
    ctr: 0,
    cpc: 0,
    purchases: 0,
    purchaseValue: 0,
    addToCarts: 0,
    viewContent: 0,
  };

  insights.forEach(insight => {
    const purchases = insight.actions?.find(a => a.action_type === "purchase")?.value || "0";
    const purchaseValue = insight.action_values?.find(a => a.action_type === "purchase")?.value || "0";
    const addToCarts = insight.actions?.find(a => a.action_type === "add_to_cart")?.value || "0";
    const viewContent = insight.actions?.find(a => a.action_type === "view_content")?.value || "0";

    totals.spend += parseFloat(insight.spend || "0");
    totals.impressions += parseInt(insight.impressions || "0");
    totals.clicks += parseInt(insight.clicks || "0");
    totals.reach += parseInt(insight.reach || "0");
    totals.ctr += parseFloat(insight.ctr || "0");
    totals.cpc += parseFloat(insight.cpc || "0");
    totals.purchases += parseInt(purchases);
    totals.purchaseValue += parseFloat(purchaseValue);
    totals.addToCarts += parseInt(addToCarts);
    totals.viewContent += parseInt(viewContent);
  });

  const count = insights.length;
  return {
    totalSpend: totals.spend,
    totalImpressions: totals.impressions,
    totalClicks: totals.clicks,
    totalReach: totals.reach,
    avgCTR: totals.ctr / count,
    avgCPC: totals.cpc / count,
    avgCPM: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
    totalPurchases: totals.purchases,
    totalPurchaseValue: totals.purchaseValue,
    totalAddToCarts: totals.addToCarts,
    totalViewContent: totals.viewContent,
  };
};

const separateCampaignsByCategory = (campaigns: Campaign[]) => {
  const underperformingCampaigns: any[] = [];
  const stableCampaigns: any[] = [];

  campaigns.forEach(campaign => {
    if (campaign.totals && campaign.verdict) {
      if (campaign.verdict.category === "underperforming") {
        underperformingCampaigns.push(campaign as any);
      } else {
        stableCampaigns.push(campaign as any);
      }
    }
  });

  return {
    underperforming: underperformingCampaigns,
    stable: stableCampaigns
  };
};

// 🔥 CHANGED: 12-hour cache instead of 5 minutes
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours cache


const generateCacheKey = (accountId: string, dateFilter: string, customDateRange: any) => {
  return `${accountId}_${dateFilter}_${customDateRange.since || 'none'}_${customDateRange.until || 'none'}`;
};

// 🔥 UPDATED: Better cache validation with logging
const isCacheValid = (cacheEntry: any) => {
  if (!cacheEntry) {
    console.log('❌ No cache found');
    return false;
  }

  const ageMs = Date.now() - cacheEntry.timestamp;
  const ageHours = (ageMs / (60 * 60 * 1000)).toFixed(1);
  const isValid = ageMs < cacheEntry.expiresIn;

  if (isValid) {
    console.log(`✅ Cache is valid (${ageHours} hours old)`);
  } else {
    console.log(`⏰ Cache expired (${ageHours} hours old, limit is 12h)`);
  }

  return isValid;
};


// ===== Enhanced Initial State =====
const initialState: FacebookAdsState = {
  // All your existing state
  adAccounts: [],
  campaigns: [],
  insights: [],
  campaignInsights: [],
  campaignInsightstotal: [],
  aggregatedStats: null,
  selectedAccount: "",
  selectedCampaign: "",
  dateFilter: "maximum",
  customDateRange: { since: "", until: "" },
  searchTerm: "",
  statusFilter: "all",
  loading: false,
  initialLoading: true,
  showModal: false,
  showCustomDatePicker: false,
  selectedCampaignForModal: null,
  error: null,
  lastUpdated: null,
  topCampaign: null, // 🔥 CHANGED: from [] to null
  stableCampaigns: [],
  underperforming: [],
  campaignAnalysis: [],
  overallTotals: null,
  loadingCampaigns: false,
  loadingTotals: false,
  facebookAuth: {
    isConnected: false,
    isLoading: false,
    status: null,
    connections: [],
    primaryConnection: null,
    error: null,
  },

  // 🔥 NEW: Additional campaign categories
  excellentCampaigns: [],
  moderateCampaigns: [],

  // 🔥 NEW: Caching initialization
  insightsCache: {},
  insightsLastUpdated: {},
  exportModal: {
    isOpen: false,
    options: {
      includeCampaignDetails: true,
      includeAIAnalysis: true
    }
  }
};


// Check Facebook connection status
export const checkFacebookStatus = createAsyncThunk(
  "facebookAds/checkFacebookStatus",
  async (_, { rejectWithValue }) => {
    const token = getAccessToken();
    if (!token) return rejectWithValue("No access token found");

    try {
      const res = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/api/facebook/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.data; // Returns FacebookStatus
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to check Facebook status");
    }
  }
);

// Initiate Facebook login
export const initiateFacebookLogin = createAsyncThunk(
  "facebookAds/initiateFacebookLogin",
  async (_, { rejectWithValue }) => {
    const token = getAccessToken();
    if (!token) return rejectWithValue("No access token found");

    try {
      const res = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/api/facebook/login`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      // Redirect to Facebook OAuth URL
      window.location.href = data.data.authUrl;

      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to initiate Facebook login");
    }
  }
);

// Unlink Facebook account
export const unlinkFacebookAccount = createAsyncThunk<
  { success: true; connectionId?: number }, // return type
  number | undefined,                       // payload type
  { rejectValue: string }                   // thunkApi config
>(
  "facebookAds/unlinkFacebookAccount",
  async (connectionId, { rejectWithValue, dispatch }) => {
    const token = getAccessToken();
    if (!token) return rejectWithValue("No access token found");

    try {
      const url = connectionId
        ? `${import.meta.env.VITE_INTEREST_MINER_API_URL}/api/facebook/unlink/${connectionId}`
        : `${import.meta.env.VITE_INTEREST_MINER_API_URL}/api/facebook/unlink`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      // Refresh status after unlinking
      dispatch(checkFacebookStatus());

      return { success: true, connectionId };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to unlink Facebook account");
    }
  }
);

// Set primary connection
export const setPrimaryFacebookConnection = createAsyncThunk(
  "facebookAds/setPrimaryConnection",
  async (connectionId: number, { rejectWithValue, dispatch }) => {
    const token = getAccessToken();
    if (!token) return rejectWithValue("No access token found");

    try {
      const res = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/api/facebook/set-primary/${connectionId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      // Refresh status after setting primary
      dispatch(checkFacebookStatus());

      return { success: true, connectionId };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to set primary connection");
    }
  }
);



// ===== Your Existing Thunks (unchanged) =====
export const fetchAdAccounts = createAsyncThunk("facebookAds/fetchAdAccounts", async (_, { rejectWithValue }) => {
  const token = getAccessToken();
  if (!token) return rejectWithValue("No access token found");

  try {
    const res = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/api/adaccounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch ad accounts");
  }
});

export const fetchCampaigns = createAsyncThunk("facebookAds/fetchCampaigns", async (accountId: string, { rejectWithValue }) => {
  const token = getAccessToken();
  if (!token) return rejectWithValue("No access token found");

  try {
    const res = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/api/campaigns/${accountId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch campaigns");
  }
});

// 🔥 FIXED: fetchInsights thunk with proper caching and state management
export const fetchInsights = createAsyncThunk(
  "facebookAds/fetchInsights",
  async (
    params: {
      forceRefresh?: boolean;
      enableAI?: boolean; // 🔥 NEW: Control AI
    } = {},
    { getState, rejectWithValue }
  ) => {
    const { forceRefresh = false, enableAI = false } = params;
    const state = getState() as { facebookAds: FacebookAdsState };
    const { selectedAccount, dateFilter, customDateRange, insightsCache } = state.facebookAds;

    if (!selectedAccount) {
      return rejectWithValue("No account selected");
    }

    // 🔥 Include AI flag in cache key - separate cache for AI/non-AI
    const cacheKey = `${selectedAccount}_${dateFilter}_${customDateRange.since || 'none'}_${customDateRange.until || 'none'}_AI${enableAI ? '_ON' : '_OFF'}`;


    // 🔥 Check cache first, but allow force refresh
    // 🔥 Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = insightsCache[cacheKey];

      if (cachedData) {
        const ageMs = Date.now() - cachedData.timestamp;
        const CACHE_DURATION_MS = 12 * 60 * 60 * 1000;

        if (ageMs < CACHE_DURATION_MS) {
          const ageHours = (ageMs / (60 * 60 * 1000)).toFixed(1);
          console.log(`✅ Using cached data (${ageHours} hours old)`);

          return {
            ...cachedData.data,
            fromCache: true,
            cacheKey,
            timestamp: cachedData.timestamp
          };
        } else {
          const ageHours = (ageMs / (60 * 60 * 1000)).toFixed(1);
          console.log(`⏰ Cache expired (${ageHours} hours old)`);
        }
      } else {
        console.log('❌ No cache found');
      }
    }

    const token = getAccessToken();
    if (!token) return rejectWithValue("No access token found");
    if (forceRefresh) {
      console.log('🔄 Force refresh requested, bypassing cache...');
    }

    try {
      console.log(`🔄 Fetching insights for ${selectedAccount} | AI: ${enableAI ? 'ENABLED 💸' : 'DISABLED (FREE)'}`);
      const body: any = {
        mode: "analyze",
        adAccountId: selectedAccount,
        enableAI: enableAI  // 🔥 Send AI flag to backend
      };

      if (dateFilter === "custom") {
        body.date_start = customDateRange.since;
        body.date_stop = customDateRange.until;
      }

      const res = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/api/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      return { ...data, cacheKey, timestamp: Date.now(), fromCache: false };
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch insights");
    }
  }
);

// 🔥 NEW: Debounced insights fetcher (simplified)
let debounceTimer: NodeJS.Timeout;

export const fetchInsightsDebounced = createAsyncThunk(
  "facebookAds/fetchInsightsDebounced",
  async (
    params: {
      forceRefresh?: boolean;
      enableAI?: boolean;  // 🔥 NEW
    } = {},
    { dispatch }
  ) => {
    const { forceRefresh = false, enableAI = false } = params;

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // 🔥 FIX: Return a proper promise
    return new Promise((resolve, reject) => {
      debounceTimer = setTimeout(async () => {
        try {
          console.log(`⏱️ Debounced fetch | AI: ${enableAI ? 'ENABLED 💸' : 'DISABLED (FREE)'}`);

          // Dispatch fetchInsights
          const result = await dispatch(fetchInsights({
            forceRefresh,
            enableAI
          }));

          // 🔥 CRITICAL: Check if successful
          if (fetchInsights.fulfilled.match(result)) {
            console.log('✅ Insights fetch successful');
            resolve(result.payload);
          } else if (fetchInsights.rejected.match(result)) {
            console.error('❌ Insights fetch rejected:', result.payload);
            reject(result.payload);
          } else {
            console.warn('⚠️ Unexpected result:', result);
            // resolve(result.payload)
          }
        } catch (error) {
          console.error('❌ Debounced fetch error:', error);
          reject(error);
        }
      }, 1000);
    });
  }
);

// Your existing campaign insights thunk (unchanged)
export const fetchCampaignInsights = createAsyncThunk(
  "facebookAds/fetchCampaignInsights",
  async (campaignId: string, { getState, rejectWithValue }) => {
    const state = getState() as { facebookAds: FacebookAdsState };
    const { selectedAccount, dateFilter, customDateRange } = state.facebookAds;
    const token = getAccessToken();
    if (!token) return rejectWithValue("No access token found");

    try {
      const body: any = {
        mode: "single",
        adAccountId: selectedAccount,
        campaignId,
      };
      if (dateFilter === "custom") {
        body.date_start = customDateRange.since;
        body.date_stop = customDateRange.until;
      }

      const res = await fetch(`${import.meta.env.VITE_INTEREST_MINER_API_URL}/api/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch campaign insights");
    }
  }
);

// ===== FIXED Slice =====
const facebookAdsSlice = createSlice({
  name: "facebookAds",
  initialState,
  reducers: {
    // All your existing reducers (unchanged)
    clearAllData: state => {
      const preservedInsightsCache = state.insightsCache;
      const preservedInsightsLastUpdated = state.insightsLastUpdated;

      // Reset all arrays and values explicitly
      Object.assign(state, initialState);
      state.adAccounts = [];
      state.campaigns = [];
      state.insights = [];
      state.campaignInsights = [];
      state.campaignInsightstotal = [];
      state.aggregatedStats = null;
      state.selectedAccount = "";
      state.selectedCampaign = "";
      state.dateFilter = "maximum";
      state.customDateRange = { since: "", until: "" };
      state.searchTerm = "";
      state.statusFilter = "all";
      state.loading = false;
      state.initialLoading = true;
      state.showModal = false;
      state.showCustomDatePicker = false;
      state.selectedCampaignForModal = null;
      state.error = null;
      state.lastUpdated = null;
      state.topCampaign = null;
      state.stableCampaigns = [];
      state.underperforming = [];
      state.campaignAnalysis = [];
      state.overallTotals = null;
      state.loadingCampaigns = false;
      state.loadingTotals = false;
      state.excellentCampaigns = [];
      state.moderateCampaigns = [];
      // 🔥 RESTORE AI cache (DON'T CLEAR ON LOGOUT)
      state.insightsCache = preservedInsightsCache;
      state.insightsLastUpdated = preservedInsightsLastUpdated;

      console.log('✅ State cleared (AI cache preserved)');
    },


    setSelectedAccount: (state, action: PayloadAction<string>) => {
      state.selectedAccount = action.payload;
      state.campaigns = [];
      state.insights = [];
      state.campaignInsights = [];
      state.campaignInsightstotal = [];
      state.aggregatedStats = null;
      state.searchTerm = "";
      state.statusFilter = "all";
    },

    setSelectedCampaign: (state, action: PayloadAction<string>) => {
      state.selectedCampaign = action.payload;
      state.campaignInsights = [];
      state.campaignInsightstotal = [];
    },

    setDateFilter: (state, action: PayloadAction<string>) => {
      state.dateFilter = action.payload;
      if (action.payload !== "custom") {
        state.customDateRange = { since: "", until: "" };
        state.showCustomDatePicker = false;
      } else {
        state.showCustomDatePicker = true;
      }
    },

    setCustomDateRange: (state, action: PayloadAction<CustomDateRange>) => {
      state.customDateRange = action.payload;
    },

    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },

    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },

    setShowModal: (state, action: PayloadAction<boolean>) => {
      state.showModal = action.payload;
      if (!action.payload) {
        state.selectedCampaignForModal = null;
        state.campaignInsights = [];
      }
    },

    setShowCustomDatePicker: (state, action: PayloadAction<boolean>) => {
      state.showCustomDatePicker = action.payload;
    },

    setSelectedCampaignForModal: (state, action: PayloadAction<Campaign | null>) => {
      state.selectedCampaignForModal = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    calculateStats: (state) => {
      state.aggregatedStats = calculateAggregatedStats(state.insights);
    },

    setAnalysisResults: (state, action: PayloadAction<any>) => {
      // Keep your existing logic here
    },

    resetFilters: (state) => {
      state.searchTerm = "";
      state.statusFilter = "all";
      state.dateFilter = "maximum";
      state.customDateRange = { since: "", until: "" };
    },

    // 🔥 NEW: Cache management reducers
    invalidateInsightsCache: (state, action: PayloadAction<string>) => {
      const accountId = action.payload;
      Object.keys(state.insightsCache).forEach(key => {
        if (key.startsWith(accountId)) {
          state.insightsCache[key].expiresIn = 0; // Force expiry
        }
      });
    },
    // 🔥 NEW: Clear cache for specific account or all
    clearCache: (state, action: PayloadAction<string | 'all'>) => {
      if (action.payload === 'all') {
        console.log('🗑️ Clearing all account caches');
        state.insightsCache = {};
        state.insightsLastUpdated = {};
      } else {
        console.log(`🗑️ Clearing cache for account: ${action.payload}`);
        // Clear all cache keys starting with this account ID
        Object.keys(state.insightsCache).forEach(key => {
          if (key.startsWith(action.payload)) {
            delete state.insightsCache[key];
          }
        });
        delete state.insightsLastUpdated[action.payload];
      }
    },

    // 🔥 NEW: Facebook authentication reducers
    clearFacebookAuth: (state) => {
      state.facebookAuth = {
        isConnected: false,
        isLoading: false,
        status: null,
        connections: [],
        primaryConnection: null,
        error: null,
      };
    },

    setFacebookError: (state, action: PayloadAction<string | null>) => {
      state.facebookAuth.error = action.payload;
    },
    // ... existing reducers
    openExportModal: (state) => {
      state.exportModal.isOpen = true;
    },
    closeExportModal: (state) => {
      state.exportModal.isOpen = false;
    },
    setExportOptions: (state, action: PayloadAction<{ includeCampaignDetails: boolean; includeAIAnalysis: boolean }>) => {
      state.exportModal.options = action.payload;
    }

  },
  extraReducers: (builder) => {
    builder
      // All your existing cases (unchanged)
      .addCase(fetchAdAccounts.pending, (state) => {
        state.loading = true;
        state.initialLoading = true;
      })
      .addCase(fetchAdAccounts.fulfilled, (state, action) => {
        state.adAccounts = action.payload;
        state.loading = false;
        state.initialLoading = false;
      })
      .addCase(fetchAdAccounts.rejected, (state, action) => {
        state.loading = false;
        state.initialLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchCampaigns.pending, (state) => {
        state.loadingCampaigns = true;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loadingCampaigns = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loadingCampaigns = false;
        state.error = action.payload as string;
      })

      // 🔥 FIXED: Insights with proper loading and caching
      .addCase(fetchInsights.pending, (state) => {
        console.log('🔄 fetchInsights.pending - Setting loadingTotals = true');
        state.loadingTotals = true;
        state.error = null;
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        console.log('✅ fetchInsights.fulfilled - Processing data');
        const data = action.payload;

        state.loadingTotals = false;
        state.error = null;

        // 🔥 FIXED: Always update state with data (cached or fresh)
        state.overallTotals = data.overallTotals || null;
        state.campaignAnalysis = data.campaignAnalysis || [];
        state.topCampaign = data.topCampaign || null; // 🔥 CHANGED: single object
        state.insights = data.insights || [];

        // 🔥 NEW: Handle new campaign categories from API
        state.excellentCampaigns = data.excellentCampaigns || [];
        state.stableCampaigns = data.stableCampaigns || [];
        state.moderateCampaigns = data.moderateCampaigns || [];
        state.underperforming = data.underperforming || [];

        // Process campaigns by category (fallback for old API)
        if (!data.excellentCampaigns && !data.stableCampaigns && !data.moderateCampaigns) {
          const { underperforming, stable } = separateCampaignsByCategory(state.campaignAnalysis);
          state.underperforming = underperforming;
          state.stableCampaigns = stable;
        }

        // Calculate aggregated stats
        state.aggregatedStats = calculateAggregatedStats(state.insights);

        // 🔥 FIXED: Handle caching properly
        if (!data.fromCache) {
          // Store fresh data in cache
          const cacheEntry = {
            data: {
              overallTotals: data.overallTotals,
              campaignAnalysis: data.campaignAnalysis,
              topCampaign: data.topCampaign,
              insights: data.insights,
              // 🔥 NEW: Cache new categories
              excellentCampaigns: data.excellentCampaigns,
              stableCampaigns: data.stableCampaigns,
              moderateCampaigns: data.moderateCampaigns,
              underperforming: data.underperforming,
            },
            timestamp: data.timestamp || Date.now(),
            expiresIn: CACHE_DURATION,
          };

          state.insightsCache[data.cacheKey] = cacheEntry;
          state.insightsLastUpdated[state.selectedAccount] = Date.now();
          console.log(`💾 Fresh data cached: ${data.cacheKey}`);
          console.log(`📊 Cached ${state.campaignAnalysis.length} campaigns`);
          console.log(`⏰ Cache will expire in 12 hours`);
        } else {
          console.log(`📦 Using cached data: ${data.cacheKey}`);
        }

        console.log(`✅ Data processed: ${state.excellentCampaigns.length} excellent, ${state.stableCampaigns.length} stable, ${state.moderateCampaigns.length} moderate, ${state.underperforming.length} underperforming`);
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        console.log('❌ fetchInsights.rejected');
        state.loadingTotals = false;
        state.error = action.payload as string;
      })

      // Handle debounced insights
      .addCase(fetchInsightsDebounced.pending, (state) => {
        // Optional: You can set loading here too
        state.loadingTotals = true;
      })
      .addCase(fetchInsightsDebounced.fulfilled, (state) => {
        // Handled by fetchInsights.fulfilled
      })

      // Your existing campaign insights cases (unchanged)
      .addCase(fetchCampaignInsights.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCampaignInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.campaignInsights = action.payload || [];
        state.campaignInsightstotal = action.payload.insights || [];
      })
      .addCase(fetchCampaignInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔥 NEW: Facebook status cases
      .addCase(checkFacebookStatus.pending, (state) => {
        state.facebookAuth.isLoading = true;
        state.facebookAuth.error = null;
      })
      .addCase(checkFacebookStatus.fulfilled, (state, action) => {
        const status = action.payload;
        state.facebookAuth.isLoading = false;
        state.facebookAuth.status = status;
        state.facebookAuth.isConnected = status.facebook_connected;
        state.facebookAuth.connections = status.all_connections;
        state.facebookAuth.primaryConnection = status.primary_connection;
      })
      .addCase(checkFacebookStatus.rejected, (state, action) => {
        state.facebookAuth.isLoading = false;
        state.facebookAuth.error = action.payload as string;
      })

      // Facebook login cases
      .addCase(initiateFacebookLogin.pending, (state) => {
        state.facebookAuth.isLoading = true;
        state.facebookAuth.error = null;
      })
      .addCase(initiateFacebookLogin.fulfilled, (state) => {
        state.facebookAuth.isLoading = false;
        // Redirect happens in thunk
      })
      .addCase(initiateFacebookLogin.rejected, (state, action) => {
        state.facebookAuth.isLoading = false;
        state.facebookAuth.error = action.payload as string;
      })

      // Unlink cases
      .addCase(unlinkFacebookAccount.pending, (state) => {
        state.facebookAuth.isLoading = true;
      })
      .addCase(unlinkFacebookAccount.fulfilled, (state) => {
        state.facebookAuth.isLoading = false;
        // Status will be refreshed by checkFacebookStatus
      })
      .addCase(unlinkFacebookAccount.rejected, (state, action) => {
        state.facebookAuth.isLoading = false;
        state.facebookAuth.error = action.payload as string;
      })

      // Set primary cases
      .addCase(setPrimaryFacebookConnection.pending, (state) => {
        state.facebookAuth.isLoading = true;
      })
      .addCase(setPrimaryFacebookConnection.fulfilled, (state) => {
        state.facebookAuth.isLoading = false;
        // Status will be refreshed by checkFacebookStatus
      })
      .addCase(setPrimaryFacebookConnection.rejected, (state, action) => {
        state.facebookAuth.isLoading = false;
        state.facebookAuth.error = action.payload as string;
      })
  }
});

export const {
  // All your existing exports
  setSelectedAccount,
  setSelectedCampaign,
  setDateFilter,
  setCustomDateRange,
  setSearchTerm,
  setStatusFilter,
  setShowModal,
  setShowCustomDatePicker,
  setSelectedCampaignForModal,
  clearError,
  calculateStats,
  setAnalysisResults,
  clearAllData,
  clearFacebookAuth,
  setFacebookError,
  resetFilters,
  clearCache, // 🔥 NEW
  // 🔥 NEW: Cache management exports
  invalidateInsightsCache,
  openExportModal,
  closeExportModal,
  setExportOptions,

} = facebookAdsSlice.actions;

export default facebookAdsSlice.reducer;
