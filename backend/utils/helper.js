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

function classifyCampaign(campaign, totals) {
  const { ctr, cpc, cpp, actions, spend, clicks, impressions } = totals;
  let category = "unknown";
  let reason = "";
  let recommendation = "review";

  // ---- SALES / CONVERSION ----
  if (actions.purchase > 0) {
    category = "sales/conversion";
    reason = `This campaign is driving **${actions.purchase} purchases** with a cost per purchase (CPP) of ${cpp.toFixed(2)}. 
    It spent ${spend.toFixed(2)} across ${impressions} impressions, generating ${clicks} clicks (CTR: ${ctr.toFixed(2)}%, CPC: ${cpc.toFixed(2)}). 
    Strong conversion activity suggests this campaign is focused on bottom-of-funnel sales.`;
    recommendation = cpp > 500
      ? "Optimize targeting or creatives to reduce CPP."
      : "Keep running and scale budget.";
  }

  // ---- TRAFFIC / AWARENESS ----
  else if (clicks > 1000 && ctr > 2) {
    category = "traffic/awareness";
    reason = `This campaign achieved **high traffic** with ${clicks} clicks and a CTR of ${ctr.toFixed(2)}%. 
    The CPC is low at ${cpc.toFixed(2)}, making it efficient for generating visits. 
    However, it produced no purchases, meaning it works well for awareness or top-of-funnel engagement but lacks conversion power.`;
    recommendation = "Approve for traffic goals, but consider adding retargeting for conversions.";
  }

  // ---- ENGAGEMENT ----
  else if (ctr > 1 && actions.add_to_cart > 0) {
    category = "engagement";
    reason = `This campaign encouraged users to interact, with CTR at ${ctr.toFixed(2)}% and ${actions.add_to_cart} add-to-carts. 
    However, purchases are weak (${actions.purchase}). 
    This suggests users are interested but dropping off before checkout, indicating a mid-funnel engagement focus.`;
    recommendation = "Optimize checkout flow or creative messaging to push users to purchase.";
  }

  // ---- UNDERPERFORMING ----
  else {
    category = "underperforming";
    reason = `This campaign struggled with low CTR (${ctr.toFixed(2)}%), high CPC (${cpc.toFixed(2)}), and no meaningful conversions. 
    It spent ${spend.toFixed(2)} but delivered little value in terms of actions. 
    This indicates poor targeting, weak creatives, or mismatch with audience intent.`;
    recommendation = "End this campaign or completely rework strategy.";
  }

  return { category, reason, recommendation };
}

module.exports = { getTokenFromHeader, adjustDateRange, classifyCampaign };