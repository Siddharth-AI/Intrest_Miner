function calculateTotals(insights) {
  const totals = {
    impressions: 0,
    clicks: 0,
    reach: 0,
    spend: 0,
    ctr: 0,
    cpc: 0,
    cpp: 0,
    actions: { add_to_cart: 0, purchase: 0, initiate_checkout: 0, add_payment_info: 0 }
  };

  insights.forEach(insight => {
    totals.impressions += parseInt(insight.impressions || 0);
    totals.clicks += parseInt(insight.clicks || 0);
    totals.reach += parseInt(insight.reach || 0);
    totals.spend += parseFloat(insight.spend || 0);

    if (insight.actions) {
      insight.actions.forEach(action => {
        const type = action.action_type;
        if (totals.actions[type] !== undefined) totals.actions[type] += parseInt(action.value);
      });
    }
  });

  totals.ctr = totals.clicks && totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0;
  totals.cpc = totals.clicks ? totals.spend / totals.clicks : 0;
  totals.cpp = totals.actions.purchase ? totals.spend / totals.actions.purchase : 0;

  return totals;
}

function recommendCampaign(campaignAnalysis) {
  return campaignAnalysis
    .map(c => ({ ...c, score: c.totals.clicks + 3 * c.totals.actions.purchase - c.totals.spend / 100 }))
    .sort((a, b) => b.score - a.score)[0];
}
module.exports = { calculateTotals, recommendCampaign };