function calculateTotals(insights) {
  const totals = {
    impressions: 0,
    clicks: 0,
    reach: 0,
    spend: 0,
    ctr: 0,
    cpc: 0,
    cpp: 0,
    actions: {
      add_to_cart: 0,
      purchase: 0,
      initiate_checkout: 0,
      add_payment_info: 0,
      lead: 0
    },
    cost_per_action_type: {},
    total_leads: 0,
    total_lead_value: 0,
    average_lead_cost: 0,
    revenue: 0    // ← ADD THIS
  };

  let leadCostSum = 0;
  let leadCountSum = 0;

  insights.forEach(insight => {
    totals.impressions += parseInt(insight.impressions || 0);
    totals.clicks += parseInt(insight.clicks || 0);
    totals.reach += parseInt(insight.reach || 0);
    totals.spend += parseFloat(insight.spend || 0);

    // Process actions
    if (insight.actions) {
      insight.actions.forEach(action => {
        const type = action.action_type;
        const value = parseInt(action.value || 0);

        if (totals.actions[type] !== undefined) {
          totals.actions[type] += value;
        }

        if (type === 'lead') {
          leadCountSum += value;

          if (insight.cost_per_action_type) {
            const leadCostItem = insight.cost_per_action_type.find(c => c.action_type === 'lead');
            if (leadCostItem) {
              const leadCost = parseFloat(leadCostItem.value || 0);
              leadCostSum += leadCost * value;
            }
          }
        }
      });
    }

    // Revenue from action_values
    const actionValues = insight.action_values || [];

    const purchaseValue = actionValues.find(v =>
      v.action_type === "purchase" ||
      v.action_type === "omni_purchase" ||
      v.action_type === "onsite_web_purchase"
    );

    totals.revenue += parseFloat(purchaseValue?.value || 0);

    // Cost per action types
    if (insight.cost_per_action_type) {
      insight.cost_per_action_type.forEach(costAction => {
        const actionType = costAction.action_type;
        const cost = parseFloat(costAction.value || 0);

        if (!totals.cost_per_action_type[actionType]) {
          totals.cost_per_action_type[actionType] = cost;
        } else {
          totals.cost_per_action_type[actionType] += cost;
        }
      });
    }
  });

  // Derived metrics
  totals.ctr = totals.clicks && totals.impressions
    ? (totals.clicks / totals.impressions) * 100
    : 0;

  totals.cpc = totals.clicks ? totals.spend / totals.clicks : 0;
  totals.cpp = totals.actions.purchase ? totals.spend / totals.actions.purchase : 0;

  totals.total_leads = totals.actions.lead;

  if (leadCountSum > 0) {
    totals.average_lead_cost = leadCostSum / leadCountSum;
    totals.total_lead_value = totals.spend;
  }

  return totals;
}


function recommendCampaign(campaignAnalysis) {
  return campaignAnalysis
    .map(c => ({
      ...c,
      score: c.totals.clicks + 5 * c.totals.actions.purchase + 3 * c.totals.actions.lead - c.totals.spend / 50
    }))
    .sort((a, b) => b.score - a.score)[0];
}

// New performance classification function
function getPerformanceCategory(campaign, totals) {
  const { ctr, cpc, actions, spend, clicks, impressions, average_lead_cost } = totals;
  const { objective } = campaign;

  // Lead generation campaigns
  if (objective === 'OUTCOME_LEADS' || actions.lead > 0) {
    if (actions.lead >= 20 && average_lead_cost <= 80 && ctr >= 0.3) {
      return 'excellent';
    }
    if (actions.lead >= 10 && average_lead_cost <= 120 && ctr >= 0.2) {
      return 'stable';
    }
    if (actions.lead >= 5 && average_lead_cost <= 200) {
      return 'moderate';
    }
    return 'underperforming';
  }

  // Purchase/Sales campaigns
  if (objective === 'OUTCOME_SALES' || actions.purchase > 0) {
    if (actions.purchase >= 5 && totals.cpp <= 500 && ctr >= 0.5) {
      return 'excellent';
    }
    if (actions.purchase >= 2 && totals.cpp <= 1000 && ctr >= 0.3) {
      return 'stable';
    }
    if (actions.purchase >= 1) {
      return 'moderate';
    }
    return 'underperforming';
  }

  // Awareness campaigns
  if (objective === 'OUTCOME_AWARENESS') {
    if (clicks >= 200 && ctr >= 0.15 && cpc <= 6) {
      return 'excellent';
    }
    if (clicks >= 100 && ctr >= 0.08 && cpc <= 10) {
      return 'stable';
    }
    if (clicks >= 50 && ctr >= 0.05) {
      return 'moderate';
    }
    return 'underperforming';
  }

  // Engagement campaigns
  if (objective === 'OUTCOME_ENGAGEMENT') {
    if (ctr >= 0.5 && cpc <= 8 && clicks >= 50) {
      return 'excellent';
    }
    if (ctr >= 0.3 && cpc <= 12 && clicks >= 30) {
      return 'stable';
    }
    if (ctr >= 0.1 && clicks >= 10) {
      return 'moderate';
    }
    return 'underperforming';
  }

  // Default fallback
  if (clicks >= 100 && ctr >= 0.2) return 'stable';
  if (clicks >= 50) return 'moderate';
  return 'underperforming';
}

function calculateOpenAICost(usage) {
  if (!usage) return { usd: 0, inr: 0 };

  const prompt_tokens = usage.prompt_tokens || 0;
  const completion_tokens = usage.completion_tokens || 0;

  const costInputUSD = (prompt_tokens / 1_000_000) * 5;   // $5 per 1M tokens
  const costOutputUSD = (completion_tokens / 1_000_000) * 15; // $15 per 1M tokens

  const totalUSD = costInputUSD + costOutputUSD;
  const INR_RATE = 84;

  return {
    usd: totalUSD,
    inr: totalUSD * INR_RATE,
    prompt_tokens,
    completion_tokens,
    total_tokens: prompt_tokens + completion_tokens
  };
}


module.exports = { calculateOpenAICost, calculateTotals, recommendCampaign, getPerformanceCategory };
