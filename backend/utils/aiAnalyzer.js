const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Analyze campaign performance with detailed reasoning and recommendations
 * @param {Object} campaignData - Campaign metrics data
 * @returns {Promise<Object>} - { verdict, analysis, recommendations }
 */
const analyzeCampaignPerformance = async (campaignData) => {
  try {
    const {
      campaignName,
      spend,
      impressions,
      clicks,
      reach,
      ctr,
      cpm,
      cpc,
      signups,
      costPerSignup,
      objective
    } = campaignData;

    const conversionRate = clicks > 0 ? ((signups / clicks) * 100).toFixed(2) : 0;

    const prompt = `
You are a Meta Ads expert consultant. Analyze this campaign and provide detailed insights.

Campaign: ${campaignName}
Objective: ${objective || 'Not specified'}
Spend: $${spend.toFixed(2)}
Impressions: ${impressions.toLocaleString()}
Clicks: ${clicks}
Reach: ${reach.toLocaleString()}
CTR: ${ctr.toFixed(2)}%
CPM: $${cpm.toFixed(2)}
CPC: $${cpc.toFixed(2)}
Conversions: ${signups}
Cost per Conversion: ${signups > 0 ? '$' + costPerSignup.toFixed(2) : 'No conversions'}
Conversion Rate: ${conversionRate}%

2025 Benchmarks:
✅ CTR: 1.5-2.5% (excellent) | 1.0-1.5% (good) | 0.5-1.0% (average)
✅ CPM: $5-$15 (excellent) | $15-$50 (good) | $50-$100 (average) | >$100 (poor)
✅ CPC: $0.50-$3 (excellent) | $3-$10 (good) | $10-$20 (average) | >$20 (poor)
✅ Cost/Conversion: <$50 (excellent) | $50-$150 (good) | $150-$500 (average) | >$500 (poor)
✅ Conversion Rate: >5% (excellent) | 2-5% (good) | 0.5-2% (average) | <0.5% (poor)

Provide your analysis in this EXACT format:

VERDICT: [One of: Excellent Performance | Good Performance | Average Performance | Needs Improvement | Poor Performance]

ANALYSIS: [Detailed 200-300 character explanation of WHY this verdict was given. Mention specific metrics that are above/below benchmark and their impact on performance. Be specific with numbers.]

RECOMMENDATIONS: [Detailed 250-350 character actionable steps to improve performance. Provide 3-5 specific tactics based on the metrics. For poor performance, focus on major fixes. For good performance, focus on optimization. Be practical and specific.]

Example format:
VERDICT: Poor Performance
ANALYSIS: Your CPM of $183.10 is 12x higher than the $5-$15 benchmark, indicating very poor audience targeting. CPC of $14.88 is 7x higher than the $0.50-$3 benchmark. Cost per conversion of $1,175.47 is 23x above the $10-$50 benchmark, making this campaign unprofitable.
RECOMMENDATIONS: 1) Narrow your audience targeting to reduce CPM - focus on lookalike audiences of past customers. 2) Improve ad creative to increase CTR and lower CPC - test video ads and user-generated content. 3) Optimize landing page to improve conversion rate. 4) Set cost cap bidding at $50 per conversion maximum. 5) A/B test different ad formats and copy.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse AI response
    const verdictMatch = text.match(/VERDICT:\s*(.+?)(?:\n|$)/i);
    const analysisMatch = text.match(/ANALYSIS:\s*(.+?)(?:\n\n|RECOMMENDATIONS:|$)/is);
    const recommendationsMatch = text.match(/RECOMMENDATIONS:\s*(.+?)$/is);

    let verdict = verdictMatch ? verdictMatch[1].trim() : null;
    let analysis = analysisMatch ? analysisMatch[1].trim() : null;
    let recommendations = recommendationsMatch ? recommendationsMatch[1].trim() : null;

    // Validate verdict
    const validVerdicts = ['Excellent Performance', 'Good Performance', 'Average Performance', 'Needs Improvement', 'Poor Performance'];
    if (!verdict || !validVerdicts.some(v => verdict.includes(v))) {
      console.log(`⚠️ AI gave invalid response, using fallback`);
      return calculateFallbackVerdict(campaignData);
    }

    // Clean up responses
    verdict = verdict.replace(/[*_#]/g, '').trim();
    analysis = analysis ? analysis.replace(/[*_#\n]/g, ' ').replace(/\s+/g, ' ').trim() : 'Analysis based on industry benchmarks';
    recommendations = recommendations ? recommendations.replace(/[*_#\n]/g, ' ').replace(/\s+/g, ' ').trim() : 'Follow standard optimization practices';

    // Ensure reasonable lengths
    if (analysis.length > 400) analysis = analysis.substring(0, 397) + '...';
    if (recommendations.length > 500) recommendations = recommendations.substring(0, 497) + '...';

    return { verdict, analysis, recommendations };

  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    return calculateFallbackVerdict(campaignData);
  }
};

/**
 * Enhanced fallback verdict with detailed reasoning
 */
const calculateFallbackVerdict = (campaignData) => {
  const { ctr, cpm, cpc, signups, spend, costPerSignup, impressions, clicks } = campaignData;

  let score = 0;
  const issues = [];
  const strengths = [];
  const recommendations = [];

  // CTR Analysis
  if (ctr >= 2.5) {
    score += 25;
    strengths.push(`excellent CTR of ${ctr.toFixed(2)}%`);
  } else if (ctr >= 1.5) {
    score += 20;
    strengths.push(`good CTR of ${ctr.toFixed(2)}%`);
  } else if (ctr >= 1.0) {
    score += 15;
    recommendations.push('Improve ad creative to increase CTR above 1.5%');
  } else if (ctr >= 0.5) {
    score += 8;
    issues.push(`low CTR of ${ctr.toFixed(2)}%`);
    recommendations.push('Test new ad creatives with compelling hooks and clear CTAs');
  } else {
    issues.push(`very low CTR of ${ctr.toFixed(2)}%`);
    recommendations.push('Completely refresh ad creative - test video ads and user-generated content');
  }

  // CPM Analysis
  if (cpm <= 10) {
    score += 25;
    strengths.push(`excellent CPM of $${cpm.toFixed(2)}`);
  } else if (cpm <= 20) {
    score += 20;
    strengths.push(`good CPM of $${cpm.toFixed(2)}`);
  } else if (cpm <= 50) {
    score += 10;
    recommendations.push('Optimize audience targeting to reduce CPM');
  } else if (cpm <= 100) {
    score += 5;
    issues.push(`high CPM of $${cpm.toFixed(2)}`);
    recommendations.push('Narrow your audience targeting - use lookalike audiences');
  } else {
    score -= 10;
    issues.push(`extremely high CPM of $${cpm.toFixed(2)} (12x benchmark)`);
    recommendations.push('Urgently refine audience targeting - your audience is too expensive');
  }

  // CPC Analysis
  if (cpc <= 2) {
    score += 25;
    strengths.push(`excellent CPC of $${cpc.toFixed(2)}`);
  } else if (cpc <= 5) {
    score += 20;
    strengths.push(`good CPC of $${cpc.toFixed(2)}`);
  } else if (cpc <= 10) {
    score += 10;
    recommendations.push('Improve ad relevance score to lower CPC');
  } else if (cpc <= 20) {
    score += 5;
    issues.push(`high CPC of $${cpc.toFixed(2)}`);
    recommendations.push('Test different ad formats and improve landing page experience');
  } else {
    score -= 5;
    issues.push(`very high CPC of $${cpc.toFixed(2)}`);
    recommendations.push('Reduce CPC by improving Quality Score and ad relevance');
  }

  // Conversion Analysis
  if (signups > 0) {
    const conversionRate = (signups / clicks) * 100;

    if (costPerSignup <= 30) {
      score += 25;
      strengths.push(`excellent cost per conversion of $${costPerSignup.toFixed(2)}`);
    } else if (costPerSignup <= 75) {
      score += 20;
      strengths.push(`good cost per conversion of $${costPerSignup.toFixed(2)}`);
    } else if (costPerSignup <= 150) {
      score += 12;
      recommendations.push('Optimize landing page to improve conversion rate');
    } else if (costPerSignup <= 500) {
      score += 5;
      issues.push(`high cost per conversion of $${costPerSignup.toFixed(2)}`);
      recommendations.push('A/B test landing pages and improve checkout flow');
    } else {
      score -= 10;
      issues.push(`extremely high cost per conversion of $${costPerSignup.toFixed(2)}`);
      recommendations.push('Set cost cap bidding and completely redesign conversion funnel');
    }

    if (conversionRate >= 5) {
      score += 10;
      strengths.push('high conversion rate');
    } else if (conversionRate < 0.5) {
      issues.push('very low conversion rate');
      recommendations.push('Fix landing page - likely major conversion blockers exist');
    }

  } else {
    if (spend > 500) {
      score -= 20;
      issues.push('no conversions despite $' + spend.toFixed(0) + ' spend');
      recommendations.push('Pause campaign immediately and review conversion tracking setup');
    } else if (spend > 200) {
      score -= 10;
      issues.push('no conversions yet');
      recommendations.push('Check pixel tracking and optimize for micro-conversions first');
    } else if (spend > 50) {
      score -= 5;
      recommendations.push('Monitor closely - give campaign more time to generate conversions');
    }
  }

  // Build analysis
  let analysis = '';
  if (issues.length > 0) {
    analysis = `Performance issues identified: ${issues.join(', ')}.`;
  }
  if (strengths.length > 0) {
    analysis += ` Strong points: ${strengths.join(', ')}.`;
  }
  if (!analysis) {
    analysis = 'Mixed performance against 2025 industry benchmarks.';
  }

  // Build recommendations (top 3-5)
  let recommendationText = recommendations.slice(0, 5).join('. ') + '.';
  if (!recommendationText.trim()) {
    recommendationText = 'Continue monitoring performance and test new variations regularly.';
  }

  // Determine verdict
  let verdict;
  if (score >= 85) verdict = "Excellent Performance";
  else if (score >= 65) verdict = "Good Performance";
  else if (score >= 45) verdict = "Average Performance";
  else if (score >= 25) verdict = "Needs Improvement";
  else verdict = "Poor Performance";

  console.log(`   📊 Score: ${score}/100 | Verdict: ${verdict}`);

  return { verdict, analysis, recommendations: recommendationText };
};

module.exports = {
  analyzeCampaignPerformance,
  calculateFallbackVerdict
};
