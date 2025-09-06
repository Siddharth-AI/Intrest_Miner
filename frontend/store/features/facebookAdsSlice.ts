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
  totals?: any;
  verdict?: any;
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
};

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
  showAnalyticsModal: boolean;
  selectedCampaignForModal: Campaign | null;
  error: string | null;
  lastUpdated: string | null;

  // 🔹 New for AnalyticsPage
  campaignAnalysis: Campaign[];
  overallTotals: any | null;
  loadingCampaigns: boolean;
  loadingTotals: boolean;
  topCampaign: TopCampaign[];
  stableCampaigns: StableCampaigns[];
  underperforming: underperforming[];
}

// ===== Helpers =====
const getAccessToken = () => localStorage.getItem("FB_ACCESS_TOKEN");

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
  showAnalyticsModal: false,
  selectedCampaignForModal: null,
  error: null,
  lastUpdated: null,
  topCampaign: [],
  stableCampaigns: [],
  underperforming: [],
  campaignAnalysis: [], // 🔹 new
  overallTotals: null,  // 🔹 new
  loadingCampaigns: false, // 🔹 new
  loadingTotals: false,    // 🔹 new
};

// ===== Thunks =====
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
    return await res.json();
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch insights");
  }
});

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

// ===== Slice =====
const facebookAdsSlice = createSlice({
  name: "facebookAds",
  initialState,
  reducers: {
    // (your apprentice’s reducers unchanged)
    clearAllData: state => {
      Object.assign(state, initialState);
      if (typeof window !== "undefined") localStorage.removeItem("FB_ACCESS_TOKEN");
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
    setShowAnalyticsModal: (state, action: PayloadAction<boolean>) => {
      state.showAnalyticsModal = action.payload;
    },
    setAnalysisResults: (state, action: PayloadAction<any>) => { },
    resetFilters: (state) => {
      state.searchTerm = "";
      state.statusFilter = "all";
      state.dateFilter = "maximum";
      state.customDateRange = { since: "", until: "" };
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== Ad Accounts =====
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

      // ===== Campaigns =====
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

      // ===== Insights (Totals) =====
      .addCase(fetchInsights.pending, (state) => {
        state.loadingTotals = true;
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.loadingTotals = false;
        const data = action.payload;
        state.overallTotals = data.overallTotals || null;
        state.campaignAnalysis = data.campaignAnalysis || [];
        state.topCampaign = data.topCampaign || [];
        state.stableCampaigns = data.stableCampaigns || [];
        state.underperforming = data.underperforming || [];
        state.insights = data.insights || [];
        state.aggregatedStats = calculateAggregatedStats(state.insights);
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        state.loadingTotals = false;
        state.error = action.payload as string;
      })

      // ===== Single Campaign Insights =====
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
      });
  }

});

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
