/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// ===== Types =====

export interface AdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  spend_cap: string;
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
  actions?: Array<{ action_type: string; value: string; }>;
  action_values?: Array<{ action_type: string; value: string; }>;
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

interface FacebookAdsState {
  adAccounts: AdAccount[];
  campaigns: Campaign[];
  insights: InsightData[]; // For "analyze" (all campaigns)
  campaignInsights: InsightData[]; // For current selected campaign (mode: "single")
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
  showAnalyticsModal: boolean;
  selectedCampaignForModal: Campaign | null;
  error: string | null;
  lastUpdated: string | null;
}

// ===== Helpers =====

const getAccessToken = () => localStorage.getItem("FB_ACCESS_TOKEN");

// Helper: build date parameter for queries
const buildDateParameter = (dateFilter: string, customDateRange: CustomDateRange) => {
  if (dateFilter === "custom" && customDateRange.since && customDateRange.until) {
    return `time_range={"since":"${customDateRange.since}","until":"${customDateRange.until}"}`;
  } else if (dateFilter === "maximum") {
    return "date_preset=maximum";
  } else {
    return `date_preset=${dateFilter}`;
  }
};

// Aggregate insight stats helper
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

// ===== Initial State =====

const initialState: FacebookAdsState = {
  adAccounts: [],
  campaigns: [],
  insights: [],
  campaignInsights: [],
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
  showAnalyticsModal: false,
  selectedCampaignForModal: null,
  error: null,
  lastUpdated: null,
};

// ===== Thunks =====

// Fetch Ad Accounts
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

// Fetch Campaigns
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

// Fetch Insights (multi-campaign, "analyze" mode)
export const fetchInsights = createAsyncThunk("facebookAds/fetchInsights", async (_, { getState, rejectWithValue }) => {
  const state = getState() as { facebookAds: FacebookAdsState };
  const { selectedAccount, dateFilter, customDateRange } = state.facebookAds;
  const token = getAccessToken();
  if (!token) return rejectWithValue("No access token found");

  try {
    const body: any = {
      mode: "analyze",
      adAccountId: selectedAccount
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
    // Defensive: backend may wrap campaigns in {insights:[]} or return array directly.
    return Array.isArray(data) ? data : data.insights || [];
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch insights");
  }
});

// Fetch Single Campaign Insights (for currently selected campaign)
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
      const data = await res.json();
      return data.insights || [];
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch campaign insights");
    }
  }
);

// ===== Slice =====

const facebookAdsSlice = createSlice({
  name: "facebookAds",
  initialState,
  reducers: {
    clearAllData: state => {
      state.adAccounts = [];
      state.campaigns = [];
      state.insights = [];
      state.campaignInsights = [];
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
      state.showAnalyticsModal = false;
      state.selectedCampaignForModal = null;
      state.error = null;
      state.lastUpdated = null;
      if (typeof window !== "undefined") localStorage.removeItem("FB_ACCESS_TOKEN");
    },
    setSelectedAccount: (state, action: PayloadAction<string>) => {
      state.selectedAccount = action.payload;
      state.campaigns = [];
      state.insights = [];
      state.campaignInsights = [];
      state.aggregatedStats = null;
      state.searchTerm = "";
      state.statusFilter = "all";
    },
    setSelectedCampaign: (state, action: PayloadAction<string>) => {
      state.selectedCampaign = action.payload;
      state.campaignInsights = [];
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
    setShowAnalyticsModal: (state, action: PayloadAction<boolean>) => {
      state.showAnalyticsModal = action.payload;
    },
    setAnalysisResults: (state, action: PayloadAction<any>) => {
      // placeholder for analytics data
    },
    resetFilters: (state) => {
      state.searchTerm = "";
      state.statusFilter = "all";
      state.dateFilter = "maximum";
      state.customDateRange = { since: "", until: "" };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.initialLoading = false;
        state.adAccounts = action.payload;
        state.lastUpdated = new Date().toISOString();
        if (action.payload.length > 0 && !state.selectedAccount) {
          state.selectedAccount = action.payload[0].id;
        }
      })
      .addCase(fetchAdAccounts.rejected, (state, action) => {
        state.loading = false;
        state.initialLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.insights = action.payload;
        state.aggregatedStats = calculateAggregatedStats(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCampaignInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaignInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.campaignInsights = action.payload;
      })
      .addCase(fetchCampaignInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ===== Exports =====

export const {
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
  setShowAnalyticsModal,
  setAnalysisResults,
  clearAllData,
  resetFilters,
} = facebookAdsSlice.actions;

export default facebookAdsSlice.reducer;
