
const { analyzeCampaignsWithChatGPT } = require('./chatGPTAnalyzer');

const analyzeAndEnrichCampaigns = async (campaignsData, totalAccountSpend = 0) => {
  try {
    console.log(`🔄 Enriching ${campaignsData.length} campaigns with KPIs...`);

    // Step 1: Enrich with KPIs (funnel metrics, derived ratios)
    const enriched = campaignsData.map(c => {
      const spend = c.totalSpend || 0;
      const revenue = c.totalRevenue || 0;
      const clicks = c.totalClicks || 0;
      const purchases = c.totalPurchases || 0;
      const addToCart = c.totalAddToCart || 0;
      const initiateCheckout = c.totalInitiateCheckout || 0;
      const impressions = c.totalImpressions || 0;

      // Calculate funnel metrics
      const addToCartRate = impressions > 0 ? (addToCart / impressions) * 100 : 0;
      const checkoutRate = addToCart > 0 ? (initiateCheckout / addToCart) * 100 : 0;
      const purchaseRate = initiateCheckout > 0 ? (purchases / initiateCheckout) * 100 : 0;
      const conversionRate = impressions > 0 ? (purchases / impressions) * 100 : 0;

      // Calculate cost metrics
      const cpc = clicks > 0 ? (spend / clicks) : 0;
      const cpa = purchases > 0 ? (spend / purchases) : 0;
      const roas = spend > 0 ? (revenue / spend) : 0;
      const spendShare = totalAccountSpend > 0 ? (spend / totalAccountSpend) * 100 : 0;

      return {
        ...c,
        addToCartRate,
        checkoutRate,
        purchaseRate,
        conversionRate,
        cpc,
        cpa,
        roas,
        spendShare,
        funnelEfficiency: `${addToCartRate.toFixed(2)}%→${checkoutRate.toFixed(2)}%→${purchaseRate.toFixed(2)}%`
      }
    });

    // Step 2: Get AI analysis (ONE BATCH CALL)
    console.log(`🤖 Sending ${enriched.length} campaigns to ChatGPT for AI analysis...`);
    const aiResults = await analyzeCampaignsWithChatGPT(enriched);

    // Step 3: Merge AI results with campaigns
    const withAI = enriched.map((campaign, index) => ({
      ...campaign,
      ai_verdict: aiResults[index]?.verdict || 'Average Performance',
      ai_analysis: aiResults[index]?.analysis || 'Analysis unavailable',
      ai_recommendations: aiResults[index]?.recommendations || 'No recommendations'
    }));

    console.log(`✅ Successfully enriched and analyzed ${withAI.length} campaigns with AI`);
    return withAI;

  } catch (error) {
    console.error('❌ Error in analyzeAndEnrichCampaigns:', error.message);
    // Return campaigns with fallback AI data
    return campaignsData.map(c => ({
      ...c,
      ai_verdict: 'Error',
      ai_analysis: 'Analysis failed - please retry',
      ai_recommendations: 'Check logs and retry'
    }));
  }
};

module.exports = { analyzeAndEnrichCampaigns };