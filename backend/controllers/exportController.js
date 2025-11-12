const ExcelJS = require('exceljs');
const { getCampaignInsights } = require("../services/metaApiService");
const { getFacebookToken } = require("../models/facebookModel");
const { adjustDateRange } = require("../utils/helper");
const { analyzeCampaignPerformance } = require("../utils/aiAnalyzer");

/**
 * Export filtered campaigns to Excel with professional formatting
 */
const exportFilteredCampaigns = async (req, res) => {
  try {
    const userUuid = req.user.uuid;
    const { campaigns, adAccountId, adAccountName, date_start, date_stop } = req.body;

    console.log("📊 Export Request:", {
      userUuid,
      adAccountId,
      adAccountName,
      campaignCount: campaigns?.length,
      dateRange: { date_start, date_stop }
    });

    // ===== Validation =====
    if (!adAccountId) {
      return res.status(400).json({ error: "adAccountId is required" });
    }

    if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
      return res.status(400).json({ error: "No campaigns provided for export" });
    }

    const userFacebookToken = await getFacebookToken(userUuid);
    if (!userFacebookToken) {
      return res.status(400).json({
        success: false,
        error: 'Facebook account not connected. Please connect your Facebook account first.'
      });
    }

    console.log("✅ Found user's Facebook token");

    // ===== Create Excel Workbook =====
    const workbook = new ExcelJS.Workbook();

    // 📋 SHEET 1: Campaign Details
    const detailsSheet = workbook.addWorksheet('Campaign Performance Details');

    // 🤖 SHEET 2: AI Performance Report
    const aiSheet = workbook.addWorksheet('AI Performance Analysis');

    // ===== SHEET 1: Define Columns (WITH NEW COLUMNS) =====
    detailsSheet.columns = [
      { header: 'Campaign Name', key: 'campaign_name', width: 30 },
      { header: 'Ad Name', key: 'ad_name', width: 35 },
      { header: 'Spends', key: 'spends', width: 12 },
      { header: 'Impressions', key: 'impressions', width: 13 },
      { header: 'Reach', key: 'reach', width: 12 },
      { header: 'CPM', key: 'cpm', width: 10 },
      { header: 'Link Clicks', key: 'link_clicks', width: 12 },
      { header: 'CTR', key: 'ctr', width: 10 },
      { header: 'CPC', key: 'cpc', width: 10 },
      { header: 'Conversions', key: 'conversions', width: 13 },
      { header: 'CPA', key: 'cpa', width: 12 }, // ✅ NEW
      { header: 'ROAS', key: 'roas', width: 10 }, // ✅ NEW
      { header: 'Spend Share %', key: 'spend_share', width: 14 }, // ✅ NEW
    ];

    // ===== SHEET 2: AI Report Columns =====
    aiSheet.columns = [
      { header: '#', key: 'index', width: 5 },
      { header: 'Campaign Name', key: 'campaign_name', width: 35 },
      { header: 'Total Spend', key: 'total_spend', width: 13 },
      { header: 'Total Conversions', key: 'conversions', width: 16 },
      { header: 'Performance Rating', key: 'ai_verdict', width: 22 },
      { header: 'Analysis & Key Insights', key: 'ai_analysis', width: 65 },
      { header: 'Recommended Actions', key: 'ai_recommendations', width: 75 },
    ];

    // ===== Style Header Rows =====
    const styleDetailHeader = (headerRow) => {
      headerRow.height = 35;
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C3E50' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    };

    const styleAIHeader = (headerRow) => {
      headerRow.height = 35;
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' }
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow.border = {
        top: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'medium', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        right: { style: 'medium', color: { argb: 'FF000000' } }
      };
    };

    styleDetailHeader(detailsSheet.getRow(1));
    styleAIHeader(aiSheet.getRow(1));

    console.log(`📝 Processing ${campaigns.length} campaigns with professional formatting...`);

    const accountName = adAccountName || adAccountId.replace('act_', '');
    const aiAnalysisResults = [];
    let currentRow = 2;

    // ✅ Calculate total spend across all campaigns for Spend Share calculation
    let totalAccountSpend = 0;

    // First pass: Calculate total spend
    for (const campaign of campaigns) {
      try {
        let filters = {};
        if (date_start && date_stop) {
          const { since, until } = adjustDateRange(date_start, date_stop, campaign);
          filters.time_range = JSON.stringify({ since, until });
        } else {
          filters.date_preset = "maximum";
        }

        const insights = await getCampaignInsights(campaign.id, userFacebookToken, filters);
        if (insights && insights.length > 0) {
          insights.forEach(insight => {
            totalAccountSpend += parseFloat(insight.spend || 0);
          });
        }
      } catch (err) {
        console.error(`Error calculating spend for ${campaign.name}:`, err.message);
      }
    }

    console.log(`💰 Total account spend: $${totalAccountSpend.toFixed(2)}`);

    // ===== Process Each Campaign =====
    for (let campaignIndex = 0; campaignIndex < campaigns.length; campaignIndex++) {
      const campaign = campaigns[campaignIndex];

      try {
        let filters = {};
        if (date_start && date_stop) {
          const { since, until } = adjustDateRange(date_start, date_stop, campaign);
          filters.time_range = JSON.stringify({ since, until });
        } else {
          filters.date_preset = "maximum";
        }

        console.log(`🔍 Fetching insights for campaign: ${campaign.name}`);

        const insights = await getCampaignInsights(campaign.id, userFacebookToken, filters);

        if (!insights || insights.length === 0) {
          console.log(`⚠️ No insights found for campaign: ${campaign.name}`);

          const row = detailsSheet.addRow({
            campaign_name: campaign.name,
            ad_name: 'No data available',
            spends: '$0.00',
            impressions: 0,
            reach: 0,
            cpm: '$0.00',
            link_clicks: 0,
            ctr: '0.00%',
            cpc: '$0.00',
            conversions: 0,
            cpa: '#DIV/0!',
            roas: '0.00x',
            spend_share: '0.00%'
          });

          row.font = { bold: true, color: { argb: 'FFFF0000' } };
          row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE0E0' } };

          aiAnalysisResults.push({
            campaign_name: campaign.name,
            total_spend: '$0.00',
            conversions: 0,
            ai_verdict: 'No Data',
            ai_analysis: 'No campaign data available for analysis',
            ai_recommendations: 'Ensure campaign is active and has sufficient data to analyze'
          });

          currentRow++;
          continue;
        }

        console.log(`✅ Found ${insights.length} insights for campaign: ${campaign.name}`);

        // ===== Calculate Campaign Totals =====
        let campaignTotals = {
          spend: 0,
          impressions: 0,
          clicks: 0,
          reach: 0,
          conversions: 0,
          revenue: 0 // For ROAS calculation
        };

        insights.forEach(insight => {
          campaignTotals.spend += parseFloat(insight.spend || 0);
          campaignTotals.impressions += parseInt(insight.impressions || 0);
          campaignTotals.clicks += parseInt(insight.clicks || 0);
          campaignTotals.reach += parseInt(insight.reach || 0);

          const actions = insight.actions || [];
          const purchases = parseInt(actions.find(a => a.action_type === 'purchase')?.value || 0);
          const leads = parseInt(actions.find(a => a.action_type === 'lead')?.value || 0);
          campaignTotals.conversions += purchases + leads;

          // Calculate revenue for ROAS (from action_values if available)
          const actionValues = insight.action_values || [];
          const purchaseValue = parseFloat(actionValues.find(a => a.action_type === 'purchase')?.value || 0);
          campaignTotals.revenue += purchaseValue;
        });

        const campaignCTR = campaignTotals.impressions > 0
          ? (campaignTotals.clicks / campaignTotals.impressions) * 100
          : 0;
        const campaignCPM = campaignTotals.impressions > 0
          ? (campaignTotals.spend / campaignTotals.impressions) * 1000
          : 0;
        const campaignCPC = campaignTotals.clicks > 0
          ? campaignTotals.spend / campaignTotals.clicks
          : 0;
        const campaignCPA = campaignTotals.conversions > 0
          ? campaignTotals.spend / campaignTotals.conversions
          : 0;

        // ✅ Calculate ROAS (Return on Ad Spend)
        const campaignROAS = campaignTotals.spend > 0
          ? campaignTotals.revenue / campaignTotals.spend
          : 0;

        // ✅ Calculate Spend Share
        const campaignSpendShare = totalAccountSpend > 0
          ? (campaignTotals.spend / totalAccountSpend) * 100
          : 0;

        // ===== AI ANALYSIS =====
        console.log(`🤖 Running AI analysis for campaign: ${campaign.name}...`);

        const aiAnalysis = await analyzeCampaignPerformance({
          campaignName: campaign.name,
          spend: campaignTotals.spend,
          impressions: campaignTotals.impressions,
          clicks: campaignTotals.clicks,
          reach: campaignTotals.reach,
          ctr: campaignCTR,
          cpm: campaignCPM,
          cpc: campaignCPC,
          signups: campaignTotals.conversions,
          costPerSignup: campaignCPA,
          objective: campaign.objective
        });

        const { verdict, analysis, recommendations } = aiAnalysis;
        console.log(`✅ AI Verdict: ${verdict}`);

        aiAnalysisResults.push({
          campaign_name: campaign.name,
          total_spend: `$${campaignTotals.spend.toFixed(2)}`,
          conversions: campaignTotals.conversions,
          ai_verdict: verdict,
          ai_analysis: analysis,
          ai_recommendations: recommendations
        });

        // ===== SHEET 1: Add Campaign Data with Grouping =====
        const startRow = currentRow;

        for (let i = 0; i < insights.length; i++) {
          const insight = insights[i];

          const spend = parseFloat(insight.spend || 0);
          const impressions = parseInt(insight.impressions || 0);
          const clicks = parseInt(insight.clicks || 0);
          const reach = parseInt(insight.reach || 0);

          const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
          const cpc = clicks > 0 ? spend / clicks : 0;

          const actions = insight.actions || [];
          const purchases = parseInt(actions.find(a => a.action_type === 'purchase')?.value || 0);
          const leads = parseInt(actions.find(a => a.action_type === 'lead')?.value || 0);
          const conversions = purchases + leads;

          // ✅ Calculate CPA for this ad set
          const cpa = conversions > 0 ? spend / conversions : 0;

          // ✅ Calculate ROAS for this ad set
          const actionValues = insight.action_values || [];
          const revenue = parseFloat(actionValues.find(a => a.action_type === 'purchase')?.value || 0);
          const roas = spend > 0 ? revenue / spend : 0;

          // ✅ Calculate Spend Share for this ad set
          const spendShare = totalAccountSpend > 0 ? (spend / totalAccountSpend) * 100 : 0;

          const row = detailsSheet.addRow({
            campaign_name: '',
            ad_name: insight.adset_name || insight.ad_name || 'Unknown Ad Set',
            spends: `$${spend.toFixed(2)}`,
            impressions: impressions.toLocaleString(),
            reach: reach.toLocaleString(),
            cpm: `$${cpm.toFixed(2)}`,
            link_clicks: clicks,
            ctr: `${ctr.toFixed(2)}%`,
            cpc: `$${cpc.toFixed(2)}`,
            conversions: conversions,
            cpa: conversions > 0 ? `$${cpa.toFixed(2)}` : '#DIV/0!', // ✅ NEW
            roas: `${roas.toFixed(2)}x`, // ✅ NEW
            spend_share: `${spendShare.toFixed(2)}%` // ✅ NEW
          });

          // Styling
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: i % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FA' }
          };

          row.font = { name: 'Calibri', size: 10 };
          row.alignment = { vertical: 'middle' };

          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
              left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
              bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
              right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
            };
          });

          // Right align numeric columns
          ['spends', 'impressions', 'reach', 'cpm', 'link_clicks', 'ctr', 'cpc', 'conversions', 'cpa', 'roas', 'spend_share'].forEach(col => {
            row.getCell(col).alignment = { horizontal: 'right', vertical: 'middle' };
          });

          currentRow++;
        }

        const endRow = currentRow - 1;

        // Merge campaign name cells
        if (insights.length > 0) {
          detailsSheet.mergeCells(`A${startRow}:A${endRow}`);

          const campaignCell = detailsSheet.getCell(`A${startRow}`);
          campaignCell.value = campaign.name;
          campaignCell.font = { bold: true, size: 11, name: 'Calibri', color: { argb: 'FF1E3A8A' } };
          campaignCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE3F2FD' }
          };
          campaignCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          campaignCell.border = {
            top: { style: 'medium', color: { argb: 'FF1E3A8A' } },
            left: { style: 'medium', color: { argb: 'FF1E3A8A' } },
            bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          };
        }

        // Spacing row
        const spacingRow = detailsSheet.addRow({});
        spacingRow.height = 5;
        spacingRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFECEFF1' }
        };
        currentRow++;

      } catch (campaignError) {
        console.error(`❌ Error processing campaign ${campaign.name}:`, campaignError.message);

        const errorRow = detailsSheet.addRow({
          campaign_name: campaign.name,
          ad_name: `Error: ${campaignError.message}`,
          spends: '$0.00',
          impressions: 0,
          reach: 0,
          cpm: '$0.00',
          link_clicks: 0,
          ctr: '0.00%',
          cpc: '$0.00',
          conversions: 0,
          cpa: '#DIV/0!',
          roas: '0.00x',
          spend_share: '0.00%'
        });

        errorRow.font = { color: { argb: 'FFFF0000' }, bold: true };
        currentRow++;

        aiAnalysisResults.push({
          campaign_name: campaign.name,
          total_spend: '$0.00',
          conversions: 0,
          ai_verdict: 'Error',
          ai_analysis: `Analysis failed: ${campaignError.message}`,
          ai_recommendations: 'Please check campaign data and try again'
        });
      }
    }

    // ===== SHEET 2: AI Performance Report =====
    console.log(`📊 Creating AI Performance Report...`);

    for (let i = 0; i < aiAnalysisResults.length; i++) {
      const result = aiAnalysisResults[i];
      const row = aiSheet.addRow({
        index: i + 1,
        ...result
      });

      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: i % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FA' }
      };

      row.font = { name: 'Calibri', size: 10 };
      row.height = 90;

      const verdictCell = row.getCell('ai_verdict');
      const verdict = result.ai_verdict;

      if (verdict.includes('Excellent')) {
        verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00C851' } };
        verdictCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      } else if (verdict.includes('Good')) {
        verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF33B679' } };
        verdictCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      } else if (verdict.includes('Average')) {
        verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC107' } };
        verdictCell.font = { bold: true, color: { argb: 'FF000000' }, size: 11 };
      } else if (verdict.includes('Needs Improvement')) {
        verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8800' } };
        verdictCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      } else if (verdict.includes('Poor')) {
        verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF4444' } };
        verdictCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      }

      verdictCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

      const analysisCell = row.getCell('ai_analysis');
      analysisCell.alignment = { wrapText: true, vertical: 'top' };
      analysisCell.font = { size: 10, name: 'Calibri' };

      const recommendationsCell = row.getCell('ai_recommendations');
      recommendationsCell.alignment = { wrapText: true, vertical: 'top' };
      recommendationsCell.font = { size: 10, bold: true, color: { argb: 'FF1565C0' }, name: 'Calibri' };

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFBDBDBD' } },
          left: { style: 'thin', color: { argb: 'FFBDBDBD' } },
          bottom: { style: 'thin', color: { argb: 'FFBDBDBD' } },
          right: { style: 'thin', color: { argb: 'FFBDBDBD' } }
        };
      });

      row.getCell('index').alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell('campaign_name').alignment = { vertical: 'middle', wrapText: true };
      row.getCell('total_spend').alignment = { horizontal: 'right', vertical: 'middle' };
      row.getCell('conversions').alignment = { horizontal: 'center', vertical: 'middle' };
    }

    // Freeze headers
    detailsSheet.views = [{ state: 'frozen', ySplit: 1 }];
    aiSheet.views = [{ state: 'frozen', ySplit: 1 }];

    console.log("✅ Professional Excel report generated");

    // ✅ Generate filename with account name and timestamp
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // 2025-11-12
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // 16-30-45

    // Clean account name (remove special characters)
    const cleanAccountName = accountName.replace(/[^a-zA-Z0-9-_]/g, '_');

    const filename = `${cleanAccountName}_Campaign_Report_${dateStr}_${timeStr}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();

    console.log(`📥 Report sent: ${filename}`);

  } catch (err) {
    console.error('❌ Export error:', err);
    res.status(500).json({ error: 'Failed to export data', message: err.message });
  }
};

module.exports = { exportFilteredCampaigns };
