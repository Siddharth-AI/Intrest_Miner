// src/services/analyticsService.ts

import * as stats from 'simple-statistics';
import { Campaign, InsightData } from '../../store/features/facebookAdsSlice'; // Adjust the path as needed

export interface CampaignAnalysis {
  id: string;
  name: string;
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number;
  cpc: number;
  performanceScore: number;
  status: 'Top Performer' | 'Stable' | 'Underperformer' | 'No Data';
  recommendation: string;
}

export interface HistoricalDataPoint {
  date: string;
  spend: number;
  clicks: number;
}

export interface FuturePrediction {
  predictedClicks: number;
  predictedSpend: number;
  recommendation: string;
}

const analyzeAllCampaignsInternal = (campaigns: Campaign[], insights: InsightData[]): CampaignAnalysis[] => {
  const campaignPerformances = campaigns.map(campaign => {
    const campaignInsights = insights.filter(insight => insight.campaign_id === campaign.id);
    const totalSpend = campaignInsights.reduce((acc, i) => acc + parseFloat(i.spend || '0'), 0);
    const totalClicks = campaignInsights.reduce((acc, i) => acc + parseInt(i.clicks || '0'), 0);
    const totalImpressions = campaignInsights.reduce((acc, i) => acc + parseInt(i.impressions || '0'), 0);

    return {
      id: campaign.id,
      name: campaign.name,
      spend: totalSpend,
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
    };
  });

  const campaignsWithData = campaignPerformances.filter(c => c.impressions > 0);

  if (campaignsWithData.length === 0) {
    return campaignPerformances.map(cp => ({
      ...cp,
      performanceScore: 0,
      status: 'No Data',
      recommendation: 'No performance data available for this period.',
    }));
  }

  const ctrs = campaignsWithData.map(c => c.ctr);
  const cpcs = campaignsWithData.map(c => c.cpc);

  const minCtr = Math.min(...ctrs);
  const maxCtr = Math.max(...ctrs);
  const minCpc = Math.min(...cpcs);
  const maxCpc = Math.max(...cpcs);

  return campaignPerformances.map(cp => {
    if (cp.impressions === 0) {
      return { ...cp, performanceScore: 0, status: 'No Data', recommendation: 'No performance data for this period.' };
    }

    const normalizedCtr = maxCtr > minCtr ? (cp.ctr - minCtr) / (maxCtr - minCtr) : 0.5;
    const normalizedCpc = maxCpc > minCpc ? (maxCpc - cp.cpc) / (maxCpc - minCpc) : 0.5;

    const performanceScore = (normalizedCtr * 0.6) + (normalizedCpc * 0.4);

    let status: CampaignAnalysis['status'] = 'Stable';
    let recommendation = 'This campaign is performing as expected. Monitor for any changes.';

    if (performanceScore > 0.75) {
      status = 'Top Performer';
      recommendation = 'Excellent performance! Consider increasing the budget to maximize results.';
    } else if (performanceScore < 0.4) {
      status = 'Underperformer';
      recommendation = 'This campaign is underperforming. Review targeting, ad creative, and budget.';
    }

    return { ...cp, performanceScore, status, recommendation };
  });
};


export const analyzeAllCampaigns = (campaigns: Campaign[], insights: InsightData[]): CampaignAnalysis[] => {
  return analyzeAllCampaignsInternal(campaigns, insights);
};


export const getHistoricalTrend = (insights: InsightData[]): HistoricalDataPoint[] => {
  const dateGroups: { [key: string]: { spend: number; clicks: number } } = {};

  insights.forEach(insight => {
    const date = insight.date_start;
    if (!dateGroups[date]) {
      dateGroups[date] = { spend: 0, clicks: 0 };
    }
    dateGroups[date].spend += parseFloat(insight.spend || '0');
    dateGroups[date].clicks += parseInt(insight.clicks || '0');
  });

  return Object.entries(dateGroups)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const predictFuturePerformance = (historicalData: HistoricalDataPoint[]): FuturePrediction | null => {
  if (historicalData.length < 5) {
    return null;
  }

  const spendData = historicalData.map((d, i) => [i, d.spend]);
  const clicksData = historicalData.map((d, i) => [i, d.clicks]);

  const spendModel = stats.linearRegression(spendData);
  const clicksModel = stats.linearRegression(clicksData);

  const nextTimePeriod = historicalData.length;
  const predictedSpend = stats.linearRegressionLine(spendModel)(nextTimePeriod);
  const predictedClicks = stats.linearRegressionLine(clicksModel)(nextTimePeriod);

  let recommendation = "Future performance is expected to be stable.";
  if (predictedClicks > historicalData[historicalData.length - 1].clicks * 1.1) {
    recommendation = "Positive growth expected. It's a good time to invest more.";
  } else if (predictedClicks < historicalData[historicalData.length - 1].clicks * 0.9) {
    recommendation = "A downward trend is predicted. Consider optimizing before increasing spend.";
  }

  return {
    predictedSpend,
    predictedClicks,
    recommendation,
  };
};
