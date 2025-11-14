

const OpenAI = require('openai');
const { calculateOpenAICost } = require('./calculateKpi');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze campaigns using ChatGPT with BATCH PROCESSING
 * 🔥 Process campaigns in chunks to avoid token limits
 */
const analyzeCampaignsWithChatGPT = async (campaignsData) => {
  try {
    console.log(`🤖 Analyzing ${campaignsData.length} campaigns with ChatGPT (batch mode)...`);

    // 🔥 CRITICAL: Process in batches of 10 campaigns
    const BATCH_SIZE = 10;
    const allResults = [];

    for (let i = 0; i < campaignsData.length; i += BATCH_SIZE) {
      const batch = campaignsData.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(campaignsData.length / BATCH_SIZE);

      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} campaigns)...`);

      try {
        const batchResults = await analyzeBatch(batch, i);
        allResults.push(...batchResults);
        console.log(`✅ Batch ${batchNumber}/${totalBatches} completed`);
      } catch (error) {
        console.error(`❌ Batch ${batchNumber} failed:`, error.message);
        // Add fallback results for failed batch
        const fallbackResults = batch.map((c, idx) => ({
          index: i + idx,
          verdict: 'Needs Improvement',
          analysis: 'Analysis temporarily unavailable. Please retry.',
          recommendations: 'Retry analysis or check system logs.'
        }));
        allResults.push(...fallbackResults);
      }

      // Add small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < campaignsData.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Successfully analyzed ${allResults.length} campaigns`);
    return allResults;

  } catch (error) {
    console.error('❌ ChatGPT Analysis Error:', error.message);
    return createFallbackResults(campaignsData);
  }
};

/**
 * Analyze a single batch of campaigns
 */
async function analyzeBatch(batchCampaigns, startIndex) {
  // Build JSON payload for this batch
  const jsonData = {
    totalCampaigns: batchCampaigns.length,
    campaigns: batchCampaigns.map((c, i) => ({
      index: startIndex + i,
      campaignName: c.campaignName,
      objective: c.objective || 'Not specified',
      metrics: {
        spend: c.totalSpend ?? 0,
        impressions: c.totalImpressions ?? 0,
        clicks: c.totalClicks ?? 0,
        reach: c.totalReach ?? 0,
        ctr: c.avgCTR ?? 0,
        cpm: c.avgCPM ?? 0,
        cpc: c.avgCPC ?? 0,
        conversions: {
          purchases: c.totalPurchases ?? 0,
          addToCart: c.totalAddToCart ?? 0,
          initiateCheckout: c.totalInitiateCheckout ?? 0,
          addPaymentInfo: c.totalAddPaymentInfo ?? 0,
          total: c.totalConversions ?? 0
        },
        cpa: c.avgCPA ?? 0,
        revenue: c.totalRevenue ?? 0,
        roas: c.avgROAS ?? 0
      }
    }))
  };

  const jsonString = JSON.stringify(jsonData, null, 2);

  // Account-level averages
  const avgROAS = (batchCampaigns.reduce((acc, c) => acc + (c.avgROAS || 0), 0) / batchCampaigns.length).toFixed(2);
  const avgCTR = (batchCampaigns.reduce((acc, c) => acc + (c.avgCTR || 0), 0) / batchCampaigns.length).toFixed(2);

  const prompt = `You are a senior Meta Ads performance strategist. Analyze each campaign in the JSON dataset.

ACCOUNT AVERAGES:
- avgROAS: ${avgROAS}
- avgCTR: ${avgCTR}%

CAMPAIGNS JSON:
\`\`\`json
${jsonString}
\`\`\`

2025 BENCHMARKS:
- CTR: Excellent (>2.5%), Good (1.5-2.49%), Average (0.8-1.49%), Poor (<0.8%)
- CPM: Excellent (<₹100), Good (₹101-250), Average (₹251-600), Poor (>₹600)
- CPC: Excellent (<₹15), Good (₹16-50), Average (₹51-120), Poor (>₹120)
- CPA: Excellent (<₹150), Good (₹151-400), Average (₹401-800), Poor (>₹800)
- ROAS: Excellent (>4.0), Good (2.0-3.99), Average (1.0-1.99), Poor (<1.0)

INSTRUCTIONS:
1. Analyze EACH campaign using benchmarks and account averages
2. Return ONLY a valid JSON array (no markdown, no extra text)
3. Array must have SAME length and order as input campaigns
4. Each object: {index, verdict, analysis, recommendations}
5. Keep analysis under 350 chars, recommendations under 450 chars

VERDICT OPTIONS (use exactly):
- "Excellent Performance"
- "Good Performance"
- "Average Performance"
- "Needs Improvement"
- "Poor Performance"

Return ONLY the JSON array:`;

  console.log(`📤 Sending ${jsonString.length} chars to ChatGPT...`);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a Meta Ads expert. Always return valid JSON arrays only, no markdown, no extra text.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.2,
    max_tokens: 4000  // 🔥 Increased token limit
  });

  // 🔥 COST LOGGING HERE
  const cost = calculateOpenAICost(completion.usage);

  console.log("===============================================");
  console.log("🧮 GPT API COST FOR THIS BATCH");
  console.log(`Prompt Tokens     : ${cost.prompt_tokens}`);
  console.log(`Completion Tokens : ${cost.completion_tokens}`);
  console.log(`Total Tokens      : ${cost.total_tokens}`);
  console.log(`💵 Cost (USD)      : $${cost.usd.toFixed(6)}`);
  console.log(`🇮🇳 Cost (INR)      : ₹${cost.inr.toFixed(2)}`);
  console.log("===============================================");

  const responseText = completion.choices[0].message.content.trim();
  console.log(`📥 Received response (${responseText.length} chars)`);

  // Clean and parse response
  let cleaned = responseText.replace(/``````\n?/g, '').trim();

  // Try to parse
  let parsed;
  try {
    parsed = JSON.parse(cleaned);

    // If wrapped in object, extract array
    if (!Array.isArray(parsed)) {
      const arrKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
      if (arrKey) {
        parsed = parsed[arrKey];
      }
    }
  } catch (err) {
    // Try to find JSON array in text
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        parsed = JSON.parse(arrayMatch[0]);
      } catch (err2) {
        console.error('❌ Secondary parse failed:', err2.message);
        throw new Error('Failed to parse ChatGPT response');
      }
    } else {
      throw new Error('No JSON array found in response');
    }
  }

  // Validate length
  if (!Array.isArray(parsed)) {
    throw new Error('Response is not an array');
  }

  if (parsed.length !== batchCampaigns.length) {
    console.warn(`⚠️ Length mismatch: Expected ${batchCampaigns.length}, got ${parsed.length}`);
    // If we got fewer results, pad with fallbacks
    while (parsed.length < batchCampaigns.length) {
      parsed.push({
        index: startIndex + parsed.length,
        verdict: 'Needs Improvement',
        analysis: 'Analysis incomplete',
        recommendations: 'Retry analysis'
      });
    }
  }

  // Validate and sanitize
  const validVerdicts = [
    'Excellent Performance',
    'Good Performance',
    'Average Performance',
    'Needs Improvement',
    'Poor Performance'
  ];

  const results = parsed.map((item, idx) => {
    const index = item.index !== undefined ? item.index : (startIndex + idx);

    let verdict = item?.verdict || 'Average Performance';
    verdict = validVerdicts.find(v => item.verdict?.includes(v)) || verdict;
    if (!validVerdicts.includes(verdict)) {
      verdict = 'Average Performance';
    }

    let analysis = (item?.analysis || '').toString().replace(/"/g, '').trim();
    let recommendations = (item?.recommendations || '').toString().replace(/"/g, '').trim();

    if (!analysis) {
      analysis = 'Analysis based on provided metrics and benchmarks.';
    }
    if (!recommendations) {
      recommendations = 'Follow standard optimization steps: test creative, adjust targeting, re-evaluate bids.';
    }

    if (analysis.length > 400) {
      analysis = analysis.slice(0, 397) + '...';
    }
    if (recommendations.length > 450) {
      recommendations = recommendations.slice(0, 447) + '...';
    }

    return {
      index,
      verdict,
      analysis,
      recommendations
    };
  });

  return results;
}

/**
 * Create fallback results when AI fails
 */
function createFallbackResults(campaignsData) {
  return campaignsData.map((c, idx) => ({
    index: idx,
    verdict: 'Needs Improvement',
    analysis: 'Automated analysis failed - please try again.',
    recommendations: 'Retry analysis; ensure API key and network connectivity.'
  }));
}

module.exports = { analyzeCampaignsWithChatGPT };

