// const OpenAI = require('openai');

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// /**
//  * Analyze campaigns using ChatGPT with batch processing
//  * @param {Array} campaignsData - Array of campaign objects with ALL details
//  * @returns {Promise<Array>} - Analysis results
//  */
// const analyzeCampaignsWithChatGPT = async (campaignsData) => {
//   try {
//     console.log(`🤖 Analyzing ${campaignsData.length} campaigns with ChatGPT...`);

//     // Build comprehensive JSON data with ALL campaign details
//     const jsonData = {
//       totalCampaigns: campaignsData.length,
//       campaigns: campaignsData.map((campaign, index) => ({
//         index: index,
//         name: campaign.campaignName,
//         objective: campaign.objective || 'Not specified',
//         metrics: {
//           spend: campaign.totalSpend,
//           impressions: campaign.totalImpressions,
//           clicks: campaign.totalClicks,
//           reach: campaign.totalReach,
//           ctr: campaign.avgCTR,
//           cpm: campaign.avgCPM,
//           cpc: campaign.avgCPC,
//           conversions: {
//             purchases: campaign.totalPurchases,
//             addToCart: campaign.totalAddToCart,
//             initiateCheckout: campaign.totalInitiateCheckout,
//             addPaymentInfo: campaign.totalAddPaymentInfo,
//             total: campaign.totalConversions
//           },
//           cpa: campaign.avgCPA,
//           revenue: campaign.totalRevenue,
//           roas: campaign.avgROAS
//         }
//       }))
//     };

//     const jsonString = JSON.stringify(jsonData, null, 2);

//     const prompt = `You are a Meta Ads expert consultant. Analyze ALL campaigns in the JSON data below.

// CAMPAIGN DATA:
// \`\`\`json
// ${jsonString}
// \`\`\`

// 2025 BENCHMARKS:
// - CTR: 1.5-2.5% (excellent) | 1.0-1.5% (good) | 0.5-1.0% (average) | <0.5% (poor)
// - CPM: $5-$15 (excellent) | $15-$50 (good) | $50-$100 (average) | >$100 (poor)
// - CPC: $0.50-$3 (excellent) | $3-$10 (good) | $10-$20 (average) | >$20 (poor)
// - CPA: <$50 (excellent) | $50-$150 (good) | $150-$500 (average) | >$500 (poor)
// - ROAS: >4 (excellent) | 2-4 (good) | 1-2 (average) | <1 (poor)

// CRITICAL INSTRUCTIONS:
// 1. Analyze EVERY campaign in the JSON data
// 2. Return ONLY a valid JSON array, no other text
// 3. Array must have SAME length and order as input campaigns
// 4. Each object must have: "index", "verdict", "analysis", "recommendations"
// 5. Keep analysis under 350 chars, recommendations under 450 chars

// VERDICT OPTIONS (use exactly):
// "Excellent Performance" | "Good Performance" | "Average Performance" | "Needs Improvement" | "Poor Performance"

// RESPONSE FORMAT (return ONLY this JSON array):
// [
//   {
//     "index": 0,
//     "verdict": "Poor Performance",
//     "analysis": "CPM ₹183 is 12x higher than benchmark. CPC ₹14.88 is 7x higher. CPA ₹1,175 is 23x above target. ROAS is very low.",
//     "recommendations": "1) Narrow audience targeting to reduce CPM. 2) Test new ad creatives. 3) Optimize landing page. 4) Set cost cap bidding."
//   }
// ]`;

//     console.log(`📤 Sending ${jsonString.length} chars to ChatGPT...`);

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o", // Fast and cost-effective
//       messages: [
//         {
//           role: "system",
//           content: "You are a Meta Ads expert. Always return valid JSON arrays only, no markdown, no extra text."
//         },
//         {
//           role: "user",
//           content: prompt
//         }
//       ],
//       temperature: 0.7,
//       max_tokens: 4000
//     });

//     const responseText = completion.choices[0].message.content.trim();
//     console.log(`✅ Received response from ChatGPT`);

//     // Clean response
//     let cleanedText = responseText.replace(/``````\n?/g, '').trim();

//     // Parse response
//     let analysisResults;
//     try {
//       analysisResults = JSON.parse(cleanedText);

//       // If wrapped in object, extract array
//       if (!Array.isArray(analysisResults)) {
//         const keys = Object.keys(analysisResults);
//         for (const key of keys) {
//           if (Array.isArray(analysisResults[key])) {
//             analysisResults = analysisResults[key];
//             break;
//           }
//         }
//       }
//     } catch (parseError) {
//       console.error('❌ Failed to parse ChatGPT response:', parseError.message);
//       console.log('Raw response:', cleanedText.substring(0, 500));
//       return createFallbackResults(campaignsData);
//     }

//     if (!Array.isArray(analysisResults)) {
//       console.error('❌ Response is not an array');
//       return createFallbackResults(campaignsData);
//     }

//     // Clean and validate
//     const validVerdicts = ['Excellent Performance', 'Good Performance', 'Average Performance', 'Needs Improvement', 'Poor Performance'];

//     analysisResults = analysisResults.map((result, idx) => {
//       if (result.index === undefined) result.index = idx;

//       if (!result.verdict || !validVerdicts.some(v => result.verdict.includes(v))) {
//         result.verdict = 'Average Performance';
//       }

//       result.verdict = result.verdict.replace(/[*_#]/g, '').trim();
//       result.analysis = (result.analysis || 'Analysis based on benchmarks')
//         .replace(/[*_#\n]/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim();
//       result.recommendations = (result.recommendations || 'Follow standard practices')
//         .replace(/[*_#\n]/g, ' ')
//         .replace(/\s+/g, ' ')
//         .trim();

//       if (result.analysis.length > 400) result.analysis = result.analysis.substring(0, 397) + '...';
//       if (result.recommendations.length > 500) result.recommendations = result.recommendations.substring(0, 497) + '...';

//       return {
//         verdict: result.verdict,
//         analysis: result.analysis,
//         recommendations: result.recommendations
//       };
//     });

//     console.log(`✅ Successfully analyzed ${analysisResults.length} campaigns`);
//     return analysisResults;

//   } catch (error) {
//     console.error('❌ ChatGPT Analysis Error:', error.message);
//     return createFallbackResults(campaignsData);
//   }
// };

// function createFallbackResults(campaignsData) {
//   return campaignsData.map(() => ({
//     verdict: 'Error',
//     analysis: 'Analysis failed - please try again',
//     recommendations: 'Contact support if issue persists'
//   }));
// }

// module.exports = {
//   analyzeCampaignsWithChatGPT
// };

// utils/chatGPTAnalyzer.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyze campaigns using ChatGPT with a high-level expert prompt.
 * Expects campaignsData: Array of enriched campaign objects (see exportController.js for enrichment).
 * Returns an array of { index, verdict, analysis, recommendations } in same order.
 */
const analyzeCampaignsWithChatGPT = async (campaignsData = []) => {
  try {
    console.log(`🤖 Analyzing ${campaignsData.length} campaigns with ChatGPT (expert prompt)...`);

    // Build JSON payload
    const jsonData = {
      totalCampaigns: campaignsData.length,
      campaigns: campaignsData.map((c, i) => ({
        index: i,
        campaignName: c.campaignName,
        objective: c.objective || 'Not specified',
        metrics: {
          spend: c.totalSpend ?? 0,
          impressions: c.totalImpressions ?? 0,
          clicks: c.totalClicks ?? 0,
          reach: c.totalReach ?? 0,
          ctr: c.avgCTR ?? 0,
          cpm: c.avgCPM ?? 0,
          cpc: c.cpc ?? 0,
          conversions: {
            purchases: c.totalPurchases ?? 0,
            addToCart: c.totalAddToCart ?? 0,
            initiateCheckout: c.totalInitiateCheckout ?? 0,
            addPaymentInfo: c.totalAddPaymentInfo ?? 0,
            total: c.totalConversions ?? 0
          },
          cpa: c.cpa ?? 0,
          revenue: c.totalRevenue ?? 0,
          roas: c.avgROAS ?? 0,
          // Derived ratios added by exportController
          addToCartRate: c.addToCartRate ?? 0,
          checkoutRate: c.checkoutRate ?? 0,
          purchaseRate: c.purchaseRate ?? 0,
          conversionRate: c.conversionRate ?? 0,
          spendShare: c.spendShare ?? 0,
          funnelEfficiency: c.funnelEfficiency ?? ''
        }
      }))
    };

    const jsonString = JSON.stringify(jsonData, null, 2);

    // Account-level averages for better relative reasoning
    const avgROAS = (() => {
      const v = campaignsData.reduce((acc, c) => acc + (c.avgROAS || 0), 0);
      return campaignsData.length ? (v / campaignsData.length).toFixed(2) : '0.00';
    })();
    const avgCTR = (() => {
      const v = campaignsData.reduce((acc, c) => acc + (c.avgCTR || 0), 0);
      return campaignsData.length ? (v / campaignsData.length).toFixed(2) : '0.00';
    })();

    // Expert-level prompt (strict JSON-only output)
    const prompt = `
You are a senior Meta Ads performance strategist with deep practical experience across e-commerce and lead-gen accounts.
You will perform a thorough, human-style audit of each campaign using the provided JSON dataset.

ACCOUNT AVERAGES (for reference):
- avgROAS: ${avgROAS}
- avgCTR: ${avgCTR}%

CAMPAIGNS JSON:
\`\`\`json
${jsonString}
\`\`\`

2025 BENCHMARKS (contextual):
- CTR (%): Excellent ≥ 2.5 | Good 1.5–2.49 | Average 0.8–1.49 | Poor < 0.8
- CPM (₹): Excellent ≤ 100 | Good 101–250 | Average 251–600 | Poor > 600
- CPC (₹): Excellent ≤ 15 | Good 16–50 | Average 51–120 | Poor > 120
- CPA (₹): Excellent ≤ 150 | Good 151–400 | Average 401–800 | Poor > 800
- ROAS: Excellent ≥ 4.0 | Good 2.0–3.99 | Average 1.0–1.99 | Poor < 1.0

INSTRUCTIONS:
1) Evaluate each campaign individually using ALL supplied metrics (top, mid, bottom funnel and derived ratios).
2) Use account averages & benchmarks to reason relatively.
3) Consider funnel signals (e.g., high CTR & low ROAS → funnel/leak issue).
4) Consider spendShare when advising about scaling.
5) Be concise, pragmatic and tactical.

OUTPUT (MUST be JSON array ONLY; same order/index as input):
[
  {
    "index": 0,
    "verdict": "Good Performance", 
    "analysis": "short expert insight <400 chars",
    "recommendations": "3-4 specific actions <450 chars"
  }
]

VERDICT OPTIONS (use exactly one):
"Excellent Performance" | "Good Performance" | "Average Performance" | "Needs Improvement" | "Poor Performance"

CRITICAL: Return ONLY the JSON array. No commentary, no markdown, no code fences.
`;

    console.log(`📤 Sending ${jsonString.length} chars to ChatGPT...`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",            // high-quality, cost-effective model
      messages: [
        { role: "system", content: "You are a senior Meta Ads strategist. Return valid JSON arrays only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,               // low temperature for consistent outputs
      max_tokens: 2000
    });

    const responseText = completion.choices[0].message.content.trim();
    console.log('✅ Received response from ChatGPT');

    // Clean and try to parse JSON from response (strip code fences if any)
    let cleaned = responseText.replace(/```json|```/g, '').trim();

    // Handle cases where assistant might accidentally return an object wrapper
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
      // If parsed is an object containing the array, try to extract
      if (!Array.isArray(parsed)) {
        const arrKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (arrKey) parsed = parsed[arrKey];
      }
    } catch (err) {
      // Attempt to find the first JSON array in the text
      const arrayMatch = cleaned.match(/\[([\s\S]*?)\]/);
      if (arrayMatch) {
        try {
          parsed = JSON.parse(arrayMatch[0]);
        } catch (err2) {
          console.error('❌ Secondary parse failed:', err2.message);
        }
      }
    }

    if (!Array.isArray(parsed) || parsed.length !== campaignsData.length) {
      console.error('❌ Parsed response invalid or length mismatch — falling back to safe results.');
      return createFallbackResults(campaignsData);
    }

    // Validate and sanitize each result
    const validVerdicts = [
      "Excellent Performance",
      "Good Performance",
      "Average Performance",
      "Needs Improvement",
      "Poor Performance"
    ];

    const results = parsed.map((item, idx) => {
      const index = (item && item.index !== undefined) ? item.index : idx;
      let verdict = item?.verdict || 'Average Performance';
      // Normalize verdict: find one of valid verdicts inside the string
      verdict = validVerdicts.find(v => (item.verdict || '').includes(v)) || verdict;
      if (!validVerdicts.includes(verdict)) verdict = 'Average Performance';

      let analysis = (item?.analysis || '').toString().replace(/\s+/g, ' ').trim();
      let recommendations = (item?.recommendations || '').toString().replace(/\s+/g, ' ').trim();

      if (!analysis) analysis = 'Analysis based on provided metrics and benchmarks.';
      if (!recommendations) recommendations = 'Follow standard optimization steps: test creative, adjust targeting, re-evaluate bids.';

      if (analysis.length > 400) analysis = analysis.slice(0, 397) + '...';
      if (recommendations.length > 450) recommendations = recommendations.slice(0, 447) + '...';

      return {
        index,
        verdict,
        analysis,
        recommendations
      };
    });

    console.log(`✅ Successfully analyzed ${results.length} campaigns`);
    return results;

  } catch (error) {
    console.error('❌ ChatGPT Analysis Error:', error.message);
    return createFallbackResults(campaignsData);
  }
};

function createFallbackResults(campaignsData) {
  return campaignsData.map((c, idx) => ({
    index: idx,
    verdict: 'Needs Improvement',
    analysis: 'Automated analysis failed; run again or check logs.',
    recommendations: 'Retry analysis; ensure API key and network connectivity.'
  }));
}

module.exports = {
  analyzeCampaignsWithChatGPT
};
