/* eslint-disable @typescript-eslint/no-explicit-any */
// store/features/facebookAdsSlice.ts

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

// Types for API responses - Updated based on actual API response
export interface AdAccount {
  id: string
  name: string
  account_status: number
  currency: string
  spend_cap: string
}

export interface Campaign {
  id: string
  name: string
  objective: string
  status: string
  start_time: string
  stop_time?: string
  daily_budget?: string
  lifetime_budget?: string
  source_campaign_id: string
}

export interface InsightData {
  account_currency: string
  account_id: string
  account_name: string
  campaign_id: string
  campaign_name: string
  adset_id: string
  adset_name: string
  ad_id: string
  ad_name: string
  date_start: string
  date_stop: string
  impressions: string
  clicks: string
  spend: string
  ctr: string
  cpc: string
  cpp: string
  reach: string
  actions?: Array<{
    action_type: string
    value: string
  }>
  action_values?: Array<{
    action_type: string
    value: string
  }>
  objective: string
  buying_type: string
  full_view_impressions: string
  full_view_reach: string
}

interface AggregatedStats {
  totalSpend: number
  totalImpressions: number
  totalClicks: number
  totalReach: number
  avgCTR: number
  avgCPC: number
  avgCPM: number
  totalPurchases: number
  totalPurchaseValue: number
  totalAddToCarts: number
  totalViewContent: number
}

interface CustomDateRange {
  since: string
  until: string
}

// New types for analysis
interface CampaignAnalysis {
  id: string
  name: string
  status: string
  recommendation: string
  performanceScore: number
  spend: number
  clicks: number
  impressions: number
  reach: number
  ctr: number
  cpc: number
  purchases: number
  purchaseValue: number
  roas: number
}

interface FuturePrediction {
  predictedClicks: number
  predictedSpend: number
  recommendation: string
}

interface AnalysisState {
  campaignAnalyses: CampaignAnalysis[]
  historicalTrend: any[]
  futurePrediction: FuturePrediction | null
}

interface FacebookAdsState {
  // Data
  adAccounts: AdAccount[]
  campaigns: Campaign[]
  insights: InsightData[]
  campaignInsights: InsightData[]
  aggregatedStats: AggregatedStats | null
  analysis: AnalysisState
  // Filters
  selectedAccount: string
  selectedCampaign: string
  dateFilter: string
  customDateRange: CustomDateRange
  searchTerm: string
  statusFilter: string
  // UI State
  loading: boolean
  initialLoading: boolean
  showModal: boolean
  showCustomDatePicker: boolean
  showAnalyticsModal: boolean
  selectedCampaignForModal: Campaign | null
  // Error handling
  error: string | null
  // Meta
  lastUpdated: string | null
}

const initialState: FacebookAdsState = {
  // Data
  adAccounts: [],
  campaigns: [],
  insights: [],
  campaignInsights: [],
  aggregatedStats: null,
  analysis: {
    campaignAnalyses: [],
    historicalTrend: [],
    futurePrediction: null,
  },
  // Filters
  selectedAccount: "",
  selectedCampaign: "",
  dateFilter: "maximum", // Changed default to 'maximum' to match API
  customDateRange: { since: "", until: "" },
  searchTerm: "",
  statusFilter: "all",
  // UI State
  loading: false,
  initialLoading: true,
  showModal: false,
  showCustomDatePicker: false,
  showAnalyticsModal: false,
  selectedCampaignForModal: null,
  // Error handling
  error: null,
  // Meta
  lastUpdated: null,
}

// Helper function to get access token
const getAccessToken = () => {
  return localStorage.getItem("FB_ACCESS_TOKEN")
}

const buildDateParameter = (dateFilter: string, customDateRange: CustomDateRange) => {
  if (dateFilter === "custom" && customDateRange.since && customDateRange.until) {
    return `time_range={"since":"${customDateRange.since}","until":"${customDateRange.until}"}`
  } else if (dateFilter === "maximum") {
    return "date_preset=maximum"
  } else {
    return `date_preset=${dateFilter}`
  }
}

// Async thunks for API calls
export const fetchAdAccounts = createAsyncThunk("facebookAds/fetchAdAccounts", async (_, { rejectWithValue }) => {
  const token = getAccessToken()
  if (!token) {
    return rejectWithValue("No access token found")
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?fields=name,account_status,currency,spend_cap&access_token=${token}`,
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.data || []
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch ad accounts")
  }
})

export const fetchCampaigns = createAsyncThunk(
  "facebookAds/fetchCampaigns",
  async (accountId: string, { rejectWithValue }) => {
    const token = getAccessToken()
    if (!token) {
      return rejectWithValue("No access token found")
    }

    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${accountId}/campaigns?fields=id,name,objective,status,start_time,stop_time,daily_budget,lifetime_budget,source_campaign_id&access_token=${token}`,
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.data || []
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch campaigns")
    }
  },
)

export const fetchInsights = createAsyncThunk("facebookAds/fetchInsights", async (_, { getState, rejectWithValue }) => {
  const state = getState() as { facebookAds: FacebookAdsState }
  const { selectedAccount, dateFilter, customDateRange } = state.facebookAds
  const token = getAccessToken()
  if (!token) {
    return rejectWithValue("No access token found")
  }

  try {
    const dateParam = buildDateParameter(dateFilter, customDateRange)
    const fields =
      "account_currency,account_id,account_name,campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,date_start,date_stop,impressions,clicks,spend,ctr,cpc,cpp,reach,actions,action_values,conversions,conversion_values,converted_product_quantity,converted_product_value,objective,buying_type,full_view_impressions,full_view_reach,cost_per_15_sec_video_view"

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${selectedAccount}/insights?fields=${fields}&${dateParam}&level=ad&access_token=${token}`,
    )
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.data || []
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch insights")
  }
})

export const fetchCampaignInsights = createAsyncThunk(
  "facebookAds/fetchCampaignInsights",
  async (campaignId: string, { getState, rejectWithValue }) => {
    const state = getState() as { facebookAds: FacebookAdsState }
    const { dateFilter, customDateRange } = state.facebookAds
    const token = getAccessToken()
    if (!token) {
      return rejectWithValue("No access token found")
    }

    try {
      const dateParam = buildDateParameter(dateFilter, customDateRange)
      const fields =
        "account_currency,account_id,account_name,campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,date_start,date_stop,impressions,clicks,spend,ctr,cpc,cpp,reach,actions,action_values,conversions,conversion_values,converted_product_quantity,converted_product_value,objective,buying_type,full_view_impressions,full_view_reach,cost_per_15_sec_video_view"

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${campaignId}/insights?fields=${fields}&${dateParam}&level=ad&access_token=${token}`,
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.data || []
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch campaign insights")
    }
  },
)

const calculateAggregatedStats = (insights: InsightData[]): AggregatedStats | null => {
  if (insights.length === 0) return null

  const totals = insights.reduce(
    (acc, insight) => {
      const purchases = insight.actions?.find((action) => action.action_type === "purchase")?.value || "0"
      const purchaseValue = insight.action_values?.find((action) => action.action_type === "purchase")?.value || "0"
      const addToCarts = insight.actions?.find((action) => action.action_type === "add_to_cart")?.value || "0"
      const viewContent = insight.actions?.find((action) => action.action_type === "view_content")?.value || "0"

      return {
        spend: acc.spend + Number.parseFloat(insight.spend || "0"),
        impressions: acc.impressions + Number.parseInt(insight.impressions || "0"),
        clicks: acc.clicks + Number.parseInt(insight.clicks || "0"),
        reach: acc.reach + Number.parseInt(insight.reach || "0"),
        ctr: acc.ctr + Number.parseFloat(insight.ctr || "0"),
        cpc: acc.cpc + Number.parseFloat(insight.cpc || "0"),
        purchases: acc.purchases + Number.parseInt(purchases),
        purchaseValue: acc.purchaseValue + Number.parseFloat(purchaseValue),
        addToCarts: acc.addToCarts + Number.parseInt(addToCarts),
        viewContent: acc.viewContent + Number.parseInt(viewContent),
      }
    },
    {
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
    },
  )

  const avgCTR = totals.ctr / insights.length
  const avgCPC = totals.cpc / insights.length
  const avgCPM = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0

  return {
    totalSpend: totals.spend,
    totalImpressions: totals.impressions,
    totalClicks: totals.clicks,
    totalReach: totals.reach,
    avgCTR: avgCTR,
    avgCPC: avgCPC,
    avgCPM: avgCPM,
    totalPurchases: totals.purchases,
    totalPurchaseValue: totals.purchaseValue,
    totalAddToCarts: totals.addToCarts,
    totalViewContent: totals.viewContent,
  }
}

const facebookAdsSlice = createSlice({
  name: "facebookAds",
  initialState,
  reducers: {
    // Filter actions
    // In your facebookAdsSlice.ts, add this new action in the reducers section:

    clearAllData: (state) => {
      // Reset to initial state
      state.adAccounts = []
      state.campaigns = []
      state.insights = []
      state.campaignInsights = []
      state.aggregatedStats = null
      state.analysis = {
        campaignAnalyses: [],
        historicalTrend: [],
        futurePrediction: null,
      }
      state.selectedAccount = ""
      state.selectedCampaign = ""
      state.dateFilter = "maximum" // Changed default to 'maximum'
      state.customDateRange = { since: "", until: "" }
      state.searchTerm = ""
      state.statusFilter = "all"
      state.loading = false
      state.initialLoading = true
      state.showModal = false
      state.showCustomDatePicker = false
      state.showAnalyticsModal = false
      state.selectedCampaignForModal = null
      state.error = null
      state.lastUpdated = null

      // Clear Facebook access token
      if (typeof window !== "undefined") {
        localStorage.removeItem("FB_ACCESS_TOKEN")
      }
    },
    setSelectedAccount: (state, action: PayloadAction<string>) => {
      state.selectedAccount = action.payload
      state.campaigns = []
      state.insights = []
      state.aggregatedStats = null
      state.searchTerm = ""
      state.statusFilter = "all"
    },
    setSelectedCampaign: (state, action: PayloadAction<string>) => {
      state.selectedCampaign = action.payload
    },
    setDateFilter: (state, action: PayloadAction<string>) => {
      state.dateFilter = action.payload
      if (action.payload !== "custom") {
        state.customDateRange = { since: "", until: "" }
        state.showCustomDatePicker = false
      } else {
        state.showCustomDatePicker = true
      }
    },
    setCustomDateRange: (state, action: PayloadAction<CustomDateRange>) => {
      state.customDateRange = action.payload
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload
    },
    // UI actions
    setShowModal: (state, action: PayloadAction<boolean>) => {
      state.showModal = action.payload
      if (!action.payload) {
        state.selectedCampaignForModal = null
        state.campaignInsights = []
      }
    },
    setShowCustomDatePicker: (state, action: PayloadAction<boolean>) => {
      state.showCustomDatePicker = action.payload
    },
    setSelectedCampaignForModal: (state, action: PayloadAction<Campaign>) => {
      state.selectedCampaignForModal = action.payload
    },
    // Reset actions
    resetFilters: (state) => {
      state.searchTerm = ""
      state.statusFilter = "all"
      state.dateFilter = "maximum" // Changed default to 'maximum'
      state.customDateRange = { since: "", until: "" }
    },
    clearError: (state) => {
      state.error = null
    },
    // Calculate stats from current insights
    calculateStats: (state) => {
      state.aggregatedStats = calculateAggregatedStats(state.insights)
    },
    // New actions for analytics
    setShowAnalyticsModal: (state, action: PayloadAction<boolean>) => {
      state.showAnalyticsModal = action.payload
    },
    setAnalysisResults: (state, action: PayloadAction<AnalysisState>) => {
      state.analysis = action.payload
    },
  },
  extraReducers: (builder) => {
    // Fetch Ad Accounts
    builder
      .addCase(fetchAdAccounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAdAccounts.fulfilled, (state, action) => {
        state.loading = false
        state.initialLoading = false
        state.adAccounts = action.payload
        state.lastUpdated = new Date().toISOString()
        // Auto-select first account if none selected
        if (action.payload.length > 0 && !state.selectedAccount) {
          state.selectedAccount = action.payload[0].id
        }
      })
      .addCase(fetchAdAccounts.rejected, (state, action) => {
        state.loading = false
        state.initialLoading = false
        state.error = action.payload as string
      })
      // Fetch Campaigns
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false
        state.campaigns = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch Insights
      .addCase(fetchInsights.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.loading = false
        state.insights = action.payload
        state.aggregatedStats = calculateAggregatedStats(action.payload)
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch Campaign Insights
      .addCase(fetchCampaignInsights.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCampaignInsights.fulfilled, (state, action) => {
        state.loading = false
        state.campaignInsights = action.payload
      })
      .addCase(fetchCampaignInsights.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

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
  resetFilters,
  clearError,
  calculateStats,
  setShowAnalyticsModal,
  setAnalysisResults,
  clearAllData,
} = facebookAdsSlice.actions

export default facebookAdsSlice.reducer
