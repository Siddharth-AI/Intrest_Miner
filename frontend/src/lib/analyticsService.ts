// src/services/analyticsService.ts

import * as stats from "simple-statistics"
import type { Campaign, InsightData } from "../../store/features/facebookAdsSlice"

export interface CampaignAnalysis {
  id: string
  name: string
  spend: number
  clicks: number
  impressions: number
  reach: number
  ctr: number
  cpc: number
  purchases: number
  purchaseValue: number
  roas: number
  performanceScore: number
  status: "Top Performer" | "Stable" | "Underperformer" | "No Data"
  recommendation: string
}

export interface HistoricalDataPoint {
  date: string
  spend: number
  clicks: number
}

export interface FuturePrediction {
  predictedClicks: number
  predictedSpend: number
  recommendation: string
}

const analyzeAllCampaignsInternal = (campaigns: Campaign[], insights: InsightData[]): CampaignAnalysis[] => {
  const campaignPerformances = campaigns.map((campaign) => {
    const campaignInsights = insights.filter((insight) => insight.campaign_id === campaign.id)

    if (campaignInsights.length === 0) {
      return {
        id: campaign.id,
        name: campaign.name,
        spend: 0,
        clicks: 0,
        impressions: 0,
        reach: 0,
        ctr: 0,
        cpc: 0,
        purchases: 0,
        purchaseValue: 0,
        roas: 0,
      }
    }

    const totals = campaignInsights.reduce(
      (acc, insight) => {
        // Extract purchase data from actions
        const purchases = insight.actions?.find((action) => action.action_type === "purchase")?.value || "0"
        const purchaseValue = insight.action_values?.find((action) => action.action_type === "purchase")?.value || "0"

        return {
          spend: acc.spend + Number.parseFloat(insight.spend || "0"),
          clicks: acc.clicks + Number.parseInt(insight.clicks || "0"),
          impressions: acc.impressions + Number.parseInt(insight.impressions || "0"),
          reach: acc.reach + Number.parseInt(insight.reach || "0"),
          purchases: acc.purchases + Number.parseInt(purchases),
          purchaseValue: acc.purchaseValue + Number.parseFloat(purchaseValue),
        }
      },
      { spend: 0, clicks: 0, impressions: 0, reach: 0, purchases: 0, purchaseValue: 0 },
    )

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
    const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0
    const roas = totals.spend > 0 ? totals.purchaseValue / totals.spend : 0

    return {
      id: campaign.id,
      name: campaign.name,
      spend: totals.spend,
      clicks: totals.clicks,
      impressions: totals.impressions,
      reach: totals.reach,
      ctr: ctr,
      cpc: cpc,
      purchases: totals.purchases,
      purchaseValue: totals.purchaseValue,
      roas: roas,
    }
  })

  const campaignsWithData = campaignPerformances.filter((c) => c.impressions > 0)

  if (campaignsWithData.length === 0) {
    return campaignPerformances.map((cp) => ({
      ...cp,
      performanceScore: 0,
      status: "No Data" as const,
      recommendation: "No performance data available for this period.",
    }))
  }

  const ctrs = campaignsWithData.map((c) => c.ctr)
  const cpcs = campaignsWithData.map((c) => c.cpc)
  const roases = campaignsWithData.map((c) => c.roas)
  const spends = campaignsWithData.map((c) => c.spend)

  const minCtr = Math.min(...ctrs)
  const maxCtr = Math.max(...ctrs)
  const minCpc = Math.min(...cpcs)
  const maxCpc = Math.max(...cpcs)
  const minRoas = Math.min(...roases)
  const maxRoas = Math.max(...roases)
  const minSpend = Math.min(...spends)
  const maxSpend = Math.max(...spends)

  return campaignPerformances.map((cp) => {
    if (cp.impressions === 0) {
      return {
        ...cp,
        performanceScore: 0,
        status: "No Data" as const,
        recommendation: "No performance data for this period.",
      }
    }

    // Normalize metrics (0-1 scale)
    const normalizedCtr = maxCtr > minCtr ? (cp.ctr - minCtr) / (maxCtr - minCtr) : 0.5
    const normalizedCpc = maxCpc > minCpc ? (maxCpc - cp.cpc) / (maxCpc - minCpc) : 0.5 // Lower CPC is better
    const normalizedRoas = maxRoas > minRoas ? (cp.roas - minRoas) / (maxRoas - minRoas) : 0.5
    const normalizedSpend = maxSpend > minSpend ? (cp.spend - minSpend) / (maxSpend - minSpend) : 0.5

    // Weighted performance score
    const performanceScore =
      normalizedCtr * 0.25 + // CTR weight: 25%
      normalizedCpc * 0.25 + // CPC weight: 25%
      normalizedRoas * 0.35 + // ROAS weight: 35% (most important)
      normalizedSpend * 0.15 // Spend weight: 15%

    let status: CampaignAnalysis["status"] = "Stable"
    let recommendation = "This campaign is performing as expected. Monitor for any changes."

    if (performanceScore > 0.75) {
      status = "Top Performer"
      recommendation = `Excellent performance! CTR: ${cp.ctr.toFixed(2)}%, CPC: ₹${cp.cpc.toFixed(2)}, ROAS: ${cp.roas.toFixed(2)}x. Consider increasing budget to scale this success.`
    } else if (performanceScore < 0.4) {
      status = "Underperformer"
      if (cp.ctr < 1) {
        recommendation = `Low CTR (${cp.ctr.toFixed(2)}%) indicates poor ad relevance. Review targeting and creative.`
      } else if (cp.cpc > 20) {
        recommendation = `High CPC (₹${cp.cpc.toFixed(2)}) is eating into profits. Optimize targeting and bidding strategy.`
      } else if (cp.roas < 2) {
        recommendation = `Poor ROAS (${cp.roas.toFixed(2)}x) suggests low conversion value. Review landing page and offer.`
      } else {
        recommendation = "Multiple metrics need improvement. Consider pausing and optimizing before relaunch."
      }
    } else {
      // Stable campaigns - provide specific insights
      if (cp.roas > 3) {
        recommendation = `Good ROAS (${cp.roas.toFixed(2)}x) but room for improvement. CTR: ${cp.ctr.toFixed(2)}%, CPC: ₹${cp.cpc.toFixed(2)}.`
      } else if (cp.ctr > 2) {
        recommendation = `Strong CTR (${cp.ctr.toFixed(2)}%) shows good engagement. Focus on improving conversion rate.`
      } else {
        recommendation = `Stable performance. CTR: ${cp.ctr.toFixed(2)}%, CPC: ₹${cp.cpc.toFixed(2)}, ROAS: ${cp.roas.toFixed(2)}x.`
      }
    }

    return { ...cp, performanceScore, status, recommendation }
  })
}

export const analyzeAllCampaigns = (campaigns: Campaign[], insights: InsightData[]): CampaignAnalysis[] => {
  return analyzeAllCampaignsInternal(campaigns, insights)
}

export const getHistoricalTrend = (insights: InsightData[]): HistoricalDataPoint[] => {
  const dateGroups: { [key: string]: { spend: number; clicks: number } } = {}

  insights.forEach((insight) => {
    const date = insight.date_start
    if (!dateGroups[date]) {
      dateGroups[date] = { spend: 0, clicks: 0 }
    }
    dateGroups[date].spend += Number.parseFloat(insight.spend || "0")
    dateGroups[date].clicks += Number.parseInt(insight.clicks || "0")
  })

  return Object.entries(dateGroups)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export const predictFuturePerformance = (historicalData: HistoricalDataPoint[]): FuturePrediction | null => {
  if (historicalData.length < 5) {
    return null
  }

  const spendData = historicalData.map((d, i) => [i, d.spend])
  const clicksData = historicalData.map((d, i) => [i, d.clicks])

  const spendModel = stats.linearRegression(spendData)
  const clicksModel = stats.linearRegression(clicksData)

  const nextTimePeriod = historicalData.length
  const predictedSpend = stats.linearRegressionLine(spendModel)(nextTimePeriod)
  const predictedClicks = stats.linearRegressionLine(clicksModel)(nextTimePeriod)

  let recommendation = "Future performance is expected to be stable."
  if (predictedClicks > historicalData[historicalData.length - 1].clicks * 1.1) {
    recommendation = "Positive growth expected. It's a good time to invest more."
  } else if (predictedClicks < historicalData[historicalData.length - 1].clicks * 0.9) {
    recommendation = "A downward trend is predicted. Consider optimizing before increasing spend."
  }

  return {
    predictedSpend: Math.max(0, predictedSpend),
    predictedClicks: Math.max(0, predictedClicks),
    recommendation,
  }
}
