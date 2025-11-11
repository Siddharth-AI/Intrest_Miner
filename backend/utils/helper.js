
// Helper function
function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("No Authorization header provided");
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") throw new Error("Invalid Authorization format");
  return parts[1];
}


function adjustDateRange(date_start, date_stop, campaign) {
  const today = new Date().toISOString().split("T")[0];
  const campaignStart = campaign.start_time ? campaign.start_time.split("T")[0] : "2000-01-01";
  const campaignStop = campaign.stop_time ? campaign.stop_time.split("T")[0] : today;

  let since = date_start ? (new Date(date_start) < new Date(campaignStart) ? campaignStart : date_start) : campaignStart;
  let until = date_stop ? (new Date(date_stop) > new Date(campaignStop) ? campaignStop : date_stop) : campaignStop;

  if (new Date(since) > new Date(until)) since = until;

  return { since, until };
}

// Add this to your existing helper.js file

function classifyCampaign(campaign, totals) {
  const { ctr, cpc, cpp, actions, spend, clicks, impressions, average_lead_cost } = totals;
  const { objective, name } = campaign;

  let category = "unknown";
  let reason = "";
  let recommendation = "";

  // 🎯 LEAD GENERATION CAMPAIGNS
  if (objective === 'OUTCOME_LEADS' || actions.lead > 0) {
    if (actions.lead >= 20 && average_lead_cost <= 80) {
      category = "lead_champion";
      reason = `🚀 This campaign is absolutely crushing it! Generated **${actions.lead} high-quality leads** at just ₹${average_lead_cost.toFixed(2)} per lead. With a solid CTR of ${ctr.toFixed(2)}% and total spend of ₹${spend.toFixed(2)}, this is exactly what successful lead generation looks like.`;
      recommendation = "🔥 Scale this baby up! Increase budget by 50-100% and consider duplicating the strategy for similar audiences.";
    }
    else if (actions.lead >= 10 && average_lead_cost <= 120) {
      category = "lead_performer";
      reason = `💪 Strong performance with **${actions.lead} leads** at ₹${average_lead_cost.toFixed(2)} per lead. Your CTR of ${ctr.toFixed(2)}% shows decent audience engagement, and the cost per lead is reasonable for your industry.`;
      recommendation = "✅ Keep it running! Consider A/B testing different creatives to improve CTR and potentially lower lead costs.";
    }
    else if (actions.lead >= 5) {
      category = "lead_developing";
      reason = `📈 Getting some traction with **${actions.lead} leads**, but there's room for improvement. Lead cost of ₹${average_lead_cost.toFixed(2)} is acceptable, though CTR of ${ctr.toFixed(2)}% suggests targeting could be refined.`;
      recommendation = "🔧 Optimize targeting and test new ad creatives. Consider lookalike audiences based on existing leads.";
    }
    else {
      category = "lead_struggling";
      reason = `😓 This campaign is having trouble generating quality leads. With only ${actions.lead} leads from ₹${spend.toFixed(2)} spend, the performance isn't meeting expectations. CTR of ${ctr.toFixed(2)}% indicates poor audience match.`;
      recommendation = "🛠️ Major optimization needed! Review audience targeting, refresh creatives, or consider pausing to rework strategy.";
    }
  }

  // 💰 SALES/PURCHASE CAMPAIGNS
  else if (objective === 'OUTCOME_SALES' || actions.purchase > 0) {
    if (actions.purchase >= 5 && cpp <= 500) {
      category = "sales_superstar";
      reason = `🛒 Excellent sales performance! Generated **${actions.purchase} purchases** with a cost per purchase of ₹${cpp.toFixed(2)}. ROI looks fantastic with ${clicks} clicks from ${impressions.toLocaleString()} impressions.`;
      recommendation = "🚀 Winner! Scale budget aggressively and expand to similar audiences. This is money-making gold!";
    }
    else if (actions.purchase >= 2) {
      category = "sales_steady";
      reason = `🎯 Decent sales activity with **${actions.purchase} purchases**. Cost per purchase of ₹${cpp.toFixed(2)} is workable, though there's potential for optimization.`;
      recommendation = "📊 Monitor closely and test variations. Consider retargeting website visitors to boost conversion rates.";
    }
    else if (actions.purchase >= 1) {
      category = "sales_emerging";
      reason = `🌱 Starting to see some conversions with ${actions.purchase} purchase(s). The foundation is there, but consistency needs improvement.`;
      recommendation = "🔄 Focus on conversion optimization. Test checkout flow and consider cart abandonment campaigns.";
    }
    else {
      category = "sales_struggling";
      reason = `📉 No purchases yet despite ₹${spend.toFixed(2)} in spend. High CPC of ₹${cpc.toFixed(2)} with low conversion suggests audience or offer mismatch.`;
      recommendation = "🎯 Review entire funnel from ad to checkout. Consider different audiences or promotional offers.";
    }
  }

  // 👁️ AWARENESS CAMPAIGNS
  else if (objective === 'OUTCOME_AWARENESS') {
    if (clicks >= 200 && ctr >= 0.15) {
      category = "awareness_viral";
      reason = `🌟 Outstanding reach and engagement! **${clicks} clicks** from ${impressions.toLocaleString()} impressions shows strong audience interest. CTR of ${ctr.toFixed(2)}% is well above industry benchmarks.`;
      recommendation = "🎉 Perfect for brand building! Consider converting engaged users with retargeting campaigns for conversions.";
    }
    else if (clicks >= 100 && ctr >= 0.08) {
      category = "awareness_solid";
      reason = `👍 Good awareness campaign with **${clicks} clicks** and CTR of ${ctr.toFixed(2)}%. Reaching the right people and generating decent interest.`;
      recommendation = "📈 Steady performance! Test different content formats (video, carousel) to boost engagement further.";
    }
    else if (clicks >= 50) {
      category = "awareness_building";
      reason = `🌱 Building momentum with ${clicks} clicks. CTR of ${ctr.toFixed(2)}% shows room for improvement in creative appeal or audience targeting.`;
      recommendation = "🎨 Refresh creatives with more compelling visuals or copy. Consider broader interest targeting.";
    }
    else {
      category = "awareness_struggling";
      reason = `😔 Low engagement with only ${clicks} clicks from ${impressions.toLocaleString()} impressions. CTR of ${ctr.toFixed(2)}% suggests poor audience resonance.`;
      recommendation = "🔄 Complete creative overhaul needed. Test different messaging angles and audience segments.";
    }
  }

  // 💬 ENGAGEMENT CAMPAIGNS
  else if (objective === 'OUTCOME_ENGAGEMENT') {
    if (ctr >= 0.5 && clicks >= 50) {
      category = "engagement_magnet";
      reason = `🧲 Incredible engagement! CTR of ${ctr.toFixed(2)}% with ${clicks} clicks shows your content is truly resonating with the audience.`;
      recommendation = "🔥 Content gold! Analyze what's working and apply these insights to other campaigns.";
    }
    else if (ctr >= 0.3) {
      category = "engagement_strong";
      reason = `💪 Strong engagement metrics with CTR of ${ctr.toFixed(2)}%. Audience is clearly interested in your content.`;
      recommendation = "✨ Great foundation! Experiment with similar content themes and post timing optimization.";
    }
    else if (clicks >= 30) {
      category = "engagement_moderate";
      reason = `📊 Moderate engagement with ${clicks} interactions. There's potential to improve connection with your audience.`;
      recommendation = "🎯 Test more interactive content formats like polls, questions, or user-generated content.";
    }
    else {
      category = "engagement_weak";
      reason = `😐 Limited engagement with CTR of ${ctr.toFixed(2)}%. Content might not be hitting the right emotional triggers.`;
      recommendation = "🎨 Rethink content strategy. Focus on trending topics, emotional storytelling, or community building.";
    }
  }

  // ❌ FALLBACK FOR UNDERPERFORMING
  else {
    category = "needs_attention";
    reason = `🤔 This campaign needs some love! With ${clicks} clicks from ₹${spend.toFixed(2)} spend and CTR of ${ctr.toFixed(2)}%, performance is below expectations.`;
    recommendation = "🛠️ Time for optimization! Review targeting, refresh creatives, or consider testing a completely different approach.";
  }

  return { category, reason, recommendation };
}

module.exports = { getTokenFromHeader, adjustDateRange, classifyCampaign };