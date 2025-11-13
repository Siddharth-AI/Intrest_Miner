
// const ExcelJS = require('exceljs');
// const { getCampaignInsights } = require("../services/metaApiService");
// const { getFacebookToken } = require("../models/facebookModel");
// const { adjustDateRange } = require("../utils/helper");
// const { analyzeCampaignsWithChatGPT } = require("../utils/chatGPTAnalyzer");

// /** Limit parallel AI calls */
// const runWithConcurrency = async (tasks, limit = 5) => {
//   const results = [];
//   const executing = new Set();

//   for (const task of tasks) {
//     const p = Promise.resolve().then(task);
//     results.push(p);
//     executing.add(p);

//     p.finally(() => executing.delete(p));
//     if (executing.size >= limit) await Promise.race(executing);
//   }

//   return Promise.all(results);
// };

// /**
//  * Export filtered campaigns to Excel with optional ChatGPT AI analysis
//  */
// const exportFilteredCampaigns = async (req, res) => {
//   try {
//     const userUuid = req.user.uuid;
//     const {
//       campaigns,
//       adAccountId,
//       adAccountName,
//       date_start,
//       date_stop,
//       exportOptions // 🔥 NEW: Get export options from frontend
//     } = req.body;

//     console.log("📊 Export Request:", {
//       userUuid,
//       adAccountId,
//       adAccountName,
//       campaignCount: campaigns?.length,
//       dateRange: { date_start, date_stop },
//       exportOptions
//     });

//     // 🔥 Extract options with defaults
//     const includeCampaignDetails = exportOptions?.includeCampaignDetails ?? true;
//     const includeAIAnalysis = exportOptions?.includeAIAnalysis ?? true;

//     console.log(`🎯 Export Options: Details=${includeCampaignDetails}, AI=${includeAIAnalysis}`);

//     // Validation
//     if (!adAccountId) {
//       return res.status(400).json({ error: "adAccountId is required" });
//     }

//     if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
//       return res.status(400).json({ error: "No campaigns provided for export" });
//     }

//     const userFacebookToken = await getFacebookToken(userUuid);
//     if (!userFacebookToken) {
//       return res.status(400).json({
//         success: false,
//         error: 'Facebook account not connected.'
//       });
//     }

//     console.log("✅ Found user's Facebook token");

//     // Create Excel Workbook
//     const workbook = new ExcelJS.Workbook();

//     // 🔥 Conditionally create sheets based on options
//     let detailsSheet, aiSheet;

//     if (includeCampaignDetails) {
//       detailsSheet = workbook.addWorksheet('Campaign Performance Details');

//       // Define columns with ALL metrics (same as your original)
//       detailsSheet.columns = [
//         { header: 'Campaign Name', key: 'campaign_name', width: 30 },
//         { header: 'Ad Set Name', key: 'adset_name', width: 30 },
//         { header: 'Ad Name', key: 'ad_name', width: 30 },
//         { header: 'Objective', key: 'objective', width: 20 },
//         { header: 'Buying Type', key: 'buying_type', width: 15 },
//         { header: 'Date Start', key: 'date_start', width: 12 },
//         { header: 'Date Stop', key: 'date_stop', width: 12 },
//         { header: 'Spend (₹)', key: 'spend', width: 12 },
//         { header: 'Impressions', key: 'impressions', width: 13 },
//         { header: 'Clicks', key: 'clicks', width: 10 },
//         { header: 'Reach', key: 'reach', width: 12 },
//         { header: 'CTR (%)', key: 'ctr', width: 10 },
//         { header: 'CPM (₹)', key: 'cpm', width: 10 },
//         { header: 'CPC (₹)', key: 'cpc', width: 10 },
//         { header: 'CPP (₹)', key: 'cpp', width: 10 },
//         { header: 'Purchases', key: 'purchases', width: 12 },
//         { header: 'Add to Cart', key: 'add_to_cart', width: 12 },
//         { header: 'Initiate Checkout', key: 'initiate_checkout', width: 15 },
//         { header: 'Add Payment Info', key: 'add_payment_info', width: 15 },
//         { header: 'View Content', key: 'view_content', width: 12 },
//         { header: 'Landing Page View', key: 'landing_page_view', width: 15 },
//         { header: 'Search', key: 'search', width: 10 },
//         { header: 'Total Conversions', key: 'total_conversions', width: 15 },
//         { header: 'Revenue (₹)', key: 'revenue', width: 12 },
//         { header: 'CPA (₹)', key: 'cpa', width: 12 },
//         { header: 'ROAS', key: 'roas', width: 10 },
//         { header: 'Spend Share %', key: 'spend_share', width: 14 },
//       ];
//     }

//     if (includeAIAnalysis) {
//       aiSheet = workbook.addWorksheet('AI Performance Analysis');

//       aiSheet.columns = [
//         { header: '#', key: 'index', width: 5 },
//         { header: 'Campaign Name', key: 'campaign_name', width: 35 },
//         { header: 'Total Spend (₹)', key: 'total_spend', width: 15 },
//         { header: 'Total Purchases', key: 'purchases', width: 15 },
//         { header: 'Total Revenue (₹)', key: 'revenue', width: 15 },
//         { header: 'ROAS', key: 'roas', width: 10 },
//         { header: 'Performance Rating', key: 'ai_verdict', width: 22 },
//         { header: 'Analysis & Key Insights', key: 'ai_analysis', width: 65 },
//         { header: 'Recommended Actions', key: 'ai_recommendations', width: 75 },
//       ];
//     }

//     // Style headers
//     const styleHeader = (headerRow, color) => {
//       headerRow.height = 35;
//       headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
//       headerRow.fill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: color }
//       };
//       headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
//       headerRow.border = {
//         top: { style: 'medium', color: { argb: 'FF000000' } },
//         left: { style: 'medium', color: { argb: 'FF000000' } },
//         bottom: { style: 'medium', color: { argb: 'FF000000' } },
//         right: { style: 'medium', color: { argb: 'FF000000' } }
//       };
//     };

//     if (detailsSheet) styleHeader(detailsSheet.getRow(1), 'FF2C3E50');
//     if (aiSheet) styleHeader(aiSheet.getRow(1), 'FF1E3A8A');

//     console.log(`📝 Processing ${campaigns.length} campaigns...`);

//     const accountName = adAccountName || adAccountId.replace('act_', '');
//     let totalAccountSpend = 0;

//     // Collect campaign data (always needed for both sheets)
//     const campaignsForAnalysis = [];

//     // Second pass: Collect ALL campaign data (and accumulate totalAccountSpend)
//     for (const campaign of campaigns) {
//       try {
//         let filters = {};
//         if (date_start && date_stop) {
//           const { since, until } = adjustDateRange(date_start, date_stop, campaign);
//           filters.time_range = JSON.stringify({ since, until });
//         } else {
//           filters.date_preset = "maximum";
//         }

//         console.log(`🔍 Fetching insights for: ${campaign.name}`);
//         const insights = await getCampaignInsights(campaign.id, userFacebookToken, filters);

//         if (!insights || insights.length === 0) {
//           console.log(`⚠️ No insights for: ${campaign.name}`);
//           campaignsForAnalysis.push({
//             campaignName: campaign.name,
//             objective: campaign.objective || 'Not specified',
//             totalSpend: 0,
//             totalImpressions: 0,
//             totalClicks: 0,
//             totalReach: 0,
//             avgCTR: 0,
//             avgCPM: 0,
//             avgCPC: 0,
//             totalPurchases: 0,
//             totalAddToCart: 0,
//             totalInitiateCheckout: 0,
//             totalAddPaymentInfo: 0,
//             totalConversions: 0,
//             totalRevenue: 0,
//             avgCPA: 0,
//             avgROAS: 0,
//             insights: [],
//             hasData: false
//           });
//           continue;
//         }

//         console.log(`✅ Found ${insights.length} ad sets for: ${campaign.name}`);

//         // Calculate campaign totals
//         let totals = {
//           spend: 0,
//           impressions: 0,
//           clicks: 0,
//           reach: 0,
//           purchases: 0,
//           addToCart: 0,
//           initiateCheckout: 0,
//           addPaymentInfo: 0,
//           viewContent: 0,
//           landingPageView: 0,
//           search: 0,
//           revenue: 0
//         };

//         insights.forEach(insight => {
//           totals.spend += parseFloat(insight.spend || 0);
//           totals.impressions += parseInt(insight.impressions || 0);
//           totals.clicks += parseInt(insight.clicks || 0);
//           totals.reach += parseInt(insight.reach || 0);

//           const actions = insight.actions || [];
//           totals.purchases += parseInt(actions.find(a => a.action_type === 'purchase')?.value || 0);
//           totals.addToCart += parseInt(actions.find(a => a.action_type === 'add_to_cart')?.value || 0);
//           totals.initiateCheckout += parseInt(actions.find(a => a.action_type === 'initiate_checkout')?.value || 0);
//           totals.addPaymentInfo += parseInt(actions.find(a => a.action_type === 'add_payment_info')?.value || 0);
//           totals.viewContent += parseInt(actions.find(a => a.action_type === 'view_content')?.value || 0);
//           totals.landingPageView += parseInt(actions.find(a => a.action_type === 'landing_page_view')?.value || 0);
//           totals.search += parseInt(actions.find(a => a.action_type === 'search')?.value || 0);

//           const actionValues = insight.action_values || [];
//           totals.revenue += parseFloat(actionValues.find(a => a.action_type === 'purchase')?.value || 0);
//         });

//         totalAccountSpend += totals.spend;

//         const totalConversions = totals.purchases + totals.addToCart + totals.initiateCheckout + totals.addPaymentInfo;
//         const avgCTR = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
//         const avgCPM = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
//         const avgCPC = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
//         const avgCPA = totalConversions > 0 ? totals.spend / totalConversions : 0;
//         const avgROAS = totals.spend > 0 ? totals.revenue / totals.spend : 0;

//         campaignsForAnalysis.push({
//           campaignName: campaign.name,
//           objective: insights[0]?.objective || campaign.objective || 'Not specified',
//           totalSpend: totals.spend,
//           totalImpressions: totals.impressions,
//           totalClicks: totals.clicks,
//           totalReach: totals.reach,
//           avgCTR: avgCTR,
//           avgCPM: avgCPM,
//           avgCPC: avgCPC,
//           totalPurchases: totals.purchases,
//           totalAddToCart: totals.addToCart,
//           totalInitiateCheckout: totals.initiateCheckout,
//           totalAddPaymentInfo: totals.addPaymentInfo,
//           totalConversions: totalConversions,
//           totalRevenue: totals.revenue,
//           avgCPA: avgCPA,
//           avgROAS: avgROAS,
//           insights: insights,
//           hasData: true
//         });

//       } catch (error) {
//         console.error(`❌ Error processing ${campaign.name}:`, error.message);
//       }
//     }

//     console.log(`💰 Total account spend: ₹${totalAccountSpend.toFixed(2)}`);

//     // 🔥 CONDITIONALLY RUN CHATGPT ANALYSIS (parallel, per-campaign)
//     let aiResults = [];

//     if (includeAIAnalysis) {
//       console.log(`🤖 Running ChatGPT analysis per campaign (parallel mode)...`);
//       const tasks = campaignsForAnalysis.map((data) => async () => {
//         if (!data.hasData) {
//           return { verdict: 'No Data', analysis: 'No insights available', recommendations: '-' };
//         }
//         const payload = [{
//           campaignName: data.campaignName,
//           objective: data.objective,
//           totalSpend: data.totalSpend,
//           totalImpressions: data.totalImpressions,
//           totalClicks: data.totalClicks,
//           avgCTR: data.avgCTR,
//           totalPurchases: data.totalPurchases,
//           totalRevenue: data.totalRevenue,
//           avgROAS: data.avgROAS
//         }];
//         const result = await analyzeCampaignsWithChatGPT(payload);
//         return result?.[0] || { verdict: 'Error', analysis: 'AI failed', recommendations: 'Retry later' };
//       });

//       aiResults = await runWithConcurrency(tasks, 5);
//     } else {
//       console.log(`⏭️ Skipping AI analysis (not requested)`);
//       aiResults = campaignsForAnalysis.map(() => ({
//         verdict: 'N/A',
//         analysis: 'AI analysis not included in this export',
//         recommendations: 'Select "AI Performance Analysis" to include AI insights'
//       }));
//     }

//     // Generate Excel sheets based on options
//     const aiAnalysisResults = [];
//     let currentRow = 2;

//     for (let i = 0; i < campaignsForAnalysis.length; i++) {
//       const campaignData = campaignsForAnalysis[i];
//       const aiResult = aiResults[i];
//       const insights = campaignData.insights;

//       // 🔥 Collect AI sheet data (even if not displayed, needed for logic)
//       aiAnalysisResults.push({
//         campaign_name: campaignData.campaignName,
//         total_spend: campaignData.totalSpend ?? 0,
//         purchases: campaignData.totalPurchases ?? 0,
//         revenue: campaignData.totalRevenue ?? 0,
//         roas: campaignData.avgROAS ?? 0,
//         ai_verdict: aiResult?.verdict || 'N/A',
//         ai_analysis: aiResult?.analysis || 'No analysis available',
//         ai_recommendations: aiResult?.recommendations || 'No recommendations available'
//       });

//       // 🔥 ONLY add to details sheet if requested
//       if (includeCampaignDetails && detailsSheet) {
//         if (!campaignData.hasData) {
//           const row = detailsSheet.addRow({
//             campaign_name: campaignData.campaignName,
//             adset_name: 'No data',
//             ad_name: 'No data available',
//             objective: campaignData.objective,
//             spend: 0,
//             impressions: 0,
//             clicks: 0,
//             reach: 0,
//             ctr: 0,
//             cpm: 0,
//             cpc: 0
//           });
//           row.font = { color: { argb: 'FFFF0000' }, bold: true };
//           currentRow++;
//           continue;
//         }

//         // Add ALL ad sets to details sheet (same formatting as original)
//         const startRow = currentRow;

//         for (let j = 0; j < insights.length; j++) {
//           const insight = insights[j];

//           const spend = parseFloat(insight.spend || 0);
//           const impressions = parseInt(insight.impressions || 0);
//           const clicks = parseInt(insight.clicks || 0);
//           const reach = parseInt(insight.reach || 0);
//           const ctr = parseFloat(insight.ctr || 0);
//           const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
//           const cpc = parseFloat(insight.cpc || 0);
//           const cpp = parseFloat(insight.cpp || 0);

//           const actions = insight.actions || [];
//           const purchases = parseInt(actions.find(a => a.action_type === 'purchase')?.value || 0);
//           const addToCart = parseInt(actions.find(a => a.action_type === 'add_to_cart')?.value || 0);
//           const initiateCheckout = parseInt(actions.find(a => a.action_type === 'initiate_checkout')?.value || 0);
//           const addPaymentInfo = parseInt(actions.find(a => a.action_type === 'add_payment_info')?.value || 0);
//           const viewContent = parseInt(actions.find(a => a.action_type === 'view_content')?.value || 0);
//           const landingPageView = parseInt(actions.find(a => a.action_type === 'landing_page_view')?.value || 0);
//           const search = parseInt(actions.find(a => a.action_type === 'search')?.value || 0);

//           const actionValues = insight.action_values || [];
//           const revenue = parseFloat(actionValues.find(a => a.action_type === 'purchase')?.value || 0);

//           const totalConversions = purchases + addToCart + initiateCheckout + addPaymentInfo;
//           const cpa = totalConversions > 0 ? spend / totalConversions : 0;
//           const roas = spend > 0 ? revenue / spend : 0;
//           const spendShare = totalAccountSpend > 0 ? (spend / totalAccountSpend) * 100 : 0;

//           const row = detailsSheet.addRow({
//             campaign_name: '',
//             adset_name: insight.adset_name || 'Unknown',
//             ad_name: insight.ad_name || 'Unknown',
//             objective: insight.objective || '',
//             buying_type: insight.buying_type || '',
//             date_start: insight.date_start || '',
//             date_stop: insight.date_stop || '',
//             spend: spend,
//             impressions: impressions,
//             clicks: clicks,
//             reach: reach,
//             ctr: ctr,
//             cpm: cpm,
//             cpc: cpc,
//             cpp: cpp,
//             purchases: purchases,
//             add_to_cart: addToCart,
//             initiate_checkout: initiateCheckout,
//             add_payment_info: addPaymentInfo,
//             view_content: viewContent,
//             landing_page_view: landingPageView,
//             search: search,
//             total_conversions: totalConversions,
//             revenue: revenue,
//             cpa: totalConversions > 0 ? cpa : 0,
//             roas: roas,
//             spend_share: spendShare
//           });

//           row.fill = {
//             type: 'pattern',
//             pattern: 'solid',
//             fgColor: { argb: j % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FA' }
//           };
//           row.font = { name: 'Calibri', size: 10 };
//           row.alignment = { vertical: 'middle' };

//           row.eachCell((cell) => {
//             cell.border = {
//               top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
//               left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
//               bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
//               right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
//             };
//           });

//           // Format numbers
//           ['spend', 'cpm', 'cpc', 'cpp', 'cpa', 'revenue'].forEach(col => {
//             const cell = row.getCell(col);
//             cell.numFmt = '₹#,##0.00';
//             cell.alignment = { horizontal: 'right', vertical: 'middle' };
//           });

//           ['impressions', 'clicks', 'reach', 'purchases', 'add_to_cart', 'initiate_checkout', 'add_payment_info', 'view_content', 'landing_page_view', 'search', 'total_conversions'].forEach(col => {
//             const cell = row.getCell(col);
//             cell.numFmt = '#,##0';
//             cell.alignment = { horizontal: 'right', vertical: 'middle' };
//           });

//           ['ctr', 'roas', 'spend_share'].forEach(col => {
//             const cell = row.getCell(col);
//             cell.numFmt = '0.00';
//             cell.alignment = { horizontal: 'right', vertical: 'middle' };
//           });

//           currentRow++;
//         }

//         const endRow = currentRow - 1;

//         // Merge campaign name
//         if (insights.length > 0) {
//           detailsSheet.mergeCells(`A${startRow}:A${endRow}`);
//           const campaignCell = detailsSheet.getCell(`A${startRow}`);
//           campaignCell.value = campaignData.campaignName;
//           campaignCell.font = { bold: true, size: 11, color: { argb: 'FF1E3A8A' } };
//           campaignCell.fill = {
//             type: 'pattern',
//             pattern: 'solid',
//             fgColor: { argb: 'FFE3F2FD' }
//           };
//           campaignCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
//           campaignCell.border = {
//             top: { style: 'medium', color: { argb: 'FF1E3A8A' } },
//             left: { style: 'medium', color: { argb: 'FF1E3A8A' } },
//             bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
//             right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
//           };
//         }

//         // Spacing
//         const spacingRow = detailsSheet.addRow({});
//         spacingRow.height = 5;
//         spacingRow.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: 'FFECEFF1' }
//         };
//         currentRow++;
//       }
//     }

//     // 🔥 ONLY add to AI sheet if requested
//     if (includeAIAnalysis && aiSheet) {
//       for (let i = 0; i < aiAnalysisResults.length; i++) {
//         const result = aiAnalysisResults[i];
//         const row = aiSheet.addRow({
//           index: i + 1,
//           ...result
//         });

//         row.fill = {
//           type: 'pattern',
//           pattern: 'solid',
//           fgColor: { argb: i % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FA' }
//         };
//         row.font = { name: 'Calibri', size: 10 };
//         row.height = 90;

//         const verdictCell = row.getCell('ai_verdict');
//         const verdict = result.ai_verdict;

//         if (verdict.includes('Excellent')) {
//           verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00C851' } };
//           verdictCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
//         } else if (verdict.includes('Good')) {
//           verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF33B679' } };
//           verdictCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
//         } else if (verdict.includes('Average')) {
//           verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC107' } };
//           verdictCell.font = { bold: true, color: { argb: 'FF000000' }, size: 11 };
//         } else if (verdict.includes('Needs')) {
//           verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8800' } };
//           verdictCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
//         } else if (verdict.includes('Poor')) {
//           verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF4444' } };
//           verdictCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
//         }

//         verdictCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

//         row.getCell('ai_analysis').alignment = { wrapText: true, vertical: 'top' };
//         row.getCell('ai_recommendations').alignment = { wrapText: true, vertical: 'top' };
//         row.getCell('ai_recommendations').font = { bold: true, color: { argb: 'FF1565C0' } };

//         row.getCell('total_spend').numFmt = '₹#,##0.00';
//         row.getCell('revenue').numFmt = '₹#,##0.00';
//         row.getCell('roas').numFmt = '0.00';

//         row.eachCell((cell) => {
//           cell.border = {
//             top: { style: 'thin', color: { argb: 'FFBDBDBD' } },
//             left: { style: 'thin', color: { argb: 'FFBDBDBD' } },
//             bottom: { style: 'thin', color: { argb: 'FFBDBDBD' } },
//             right: { style: 'thin', color: { argb: 'FFBDBDBD' } }
//           };
//         });
//       }
//     }

//     // Freeze headers for created sheets
//     if (detailsSheet) detailsSheet.views = [{ state: 'frozen', ySplit: 1 }];
//     if (aiSheet) aiSheet.views = [{ state: 'frozen', ySplit: 1 }];

//     console.log("✅ Excel report generation complete");
//     console.log(`   📋 Sheets created: ${includeCampaignDetails ? 'Details ✓' : ''} ${includeAIAnalysis ? 'AI Analysis ✓' : ''}`);

//     // Generate filename
//     const now = new Date();
//     const dateStr = now.toISOString().split('T')[0];
//     const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
//     const cleanAccountName = accountName.replace(/[^a-zA-Z0-9-_]/g, '_');

//     // 🔥 Add sheet type to filename
//     let sheetType = '';
//     if (includeCampaignDetails && includeAIAnalysis) {
//       sheetType = 'Full_Report';
//     } else if (includeCampaignDetails) {
//       sheetType = 'Performance_Data';
//     } else if (includeAIAnalysis) {
//       sheetType = 'AI_Analysis';
//     }

//     const filename = `${cleanAccountName}_${sheetType}_${dateStr}_${timeStr}.xlsx`;

//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

//     await workbook.xlsx.write(res);
//     res.end();

//     console.log(`📥 Report sent: ${filename}`);

//   } catch (err) {
//     console.error('❌ Export error:', err);
//     res.status(500).json({ error: 'Failed to export data', message: err.message });
//   }
// };

// module.exports = { exportFilteredCampaigns };

// controllers/exportController.js
const ExcelJS = require('exceljs');
const { getCampaignInsights } = require("../services/metaApiService");
const { getFacebookToken } = require("../models/facebookModel");
const { adjustDateRange } = require("../utils/helper");
const { analyzeCampaignsWithChatGPT } = require("../utils/chatGPTAnalyzer");

/** Limit parallel AI calls utility (kept if you need per-campaign calls later) */
const runWithConcurrency = async (tasks, limit = 5) => {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const p = Promise.resolve().then(task);
    results.push(p);
    executing.add(p);
    p.finally(() => executing.delete(p));
    if (executing.size >= limit) await Promise.race(executing);
  }

  return Promise.all(results);
};

/**
 * Export filtered campaigns to Excel with optional ChatGPT AI analysis
 * NOTE: Excel view/formatting/styles retained exactly as required.
 */
const exportFilteredCampaigns = async (req, res) => {
  try {
    const userUuid = req.user.uuid;
    const {
      campaigns,
      adAccountId,
      adAccountName,
      date_start,
      date_stop,
      exportOptions // includeCampaignDetails, includeAIAnalysis
    } = req.body;

    console.log("📊 Export Request:", {
      userUuid,
      adAccountId,
      adAccountName,
      campaignCount: campaigns?.length,
      dateRange: { date_start, date_stop },
      exportOptions
    });

    const includeCampaignDetails = exportOptions?.includeCampaignDetails ?? true;
    const includeAIAnalysis = exportOptions?.includeAIAnalysis ?? true;

    if (!adAccountId) return res.status(400).json({ error: "adAccountId is required" });
    if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) return res.status(400).json({ error: "No campaigns provided for export" });

    const userFacebookToken = await getFacebookToken(userUuid);
    if (!userFacebookToken) return res.status(400).json({ success: false, error: 'Facebook account not connected.' });

    console.log("✅ Found user's Facebook token");

    // Create Excel Workbook
    const workbook = new ExcelJS.Workbook();

    // Conditionally create sheets based on options (preserve original layout/styles)
    let detailsSheet, aiSheet;

    if (includeCampaignDetails) {
      detailsSheet = workbook.addWorksheet('Campaign Performance Details');
      detailsSheet.columns = [
        { header: 'Campaign Name', key: 'campaign_name', width: 30 },
        { header: 'Ad Set Name', key: 'adset_name', width: 30 },
        { header: 'Ad Name', key: 'ad_name', width: 30 },
        { header: 'Objective', key: 'objective', width: 20 },
        { header: 'Buying Type', key: 'buying_type', width: 15 },
        { header: 'Date Start', key: 'date_start', width: 12 },
        { header: 'Date Stop', key: 'date_stop', width: 12 },
        { header: 'Spend (₹)', key: 'spend', width: 12 },
        { header: 'Impressions', key: 'impressions', width: 13 },
        { header: 'Clicks', key: 'clicks', width: 10 },
        { header: 'Reach', key: 'reach', width: 12 },
        { header: 'CTR (%)', key: 'ctr', width: 10 },
        { header: 'CPM (₹)', key: 'cpm', width: 10 },
        { header: 'CPC (₹)', key: 'cpc', width: 10 },
        { header: 'CPP (₹)', key: 'cpp', width: 10 },
        { header: 'Purchases', key: 'purchases', width: 12 },
        { header: 'Add to Cart', key: 'add_to_cart', width: 12 },
        { header: 'Initiate Checkout', key: 'initiate_checkout', width: 15 },
        { header: 'Add Payment Info', key: 'add_payment_info', width: 15 },
        { header: 'View Content', key: 'view_content', width: 12 },
        { header: 'Landing Page View', key: 'landing_page_view', width: 15 },
        { header: 'Search', key: 'search', width: 10 },
        { header: 'Total Conversions', key: 'total_conversions', width: 15 },
        { header: 'Revenue (₹)', key: 'revenue', width: 12 },
        { header: 'CPA (₹)', key: 'cpa', width: 12 },
        { header: 'ROAS', key: 'roas', width: 10 },
        { header: 'Spend Share %', key: 'spend_share', width: 14 },
      ];
    }

    if (includeAIAnalysis) {
      aiSheet = workbook.addWorksheet('AI Performance Analysis');
      aiSheet.columns = [
        { header: '#', key: 'index', width: 5 },
        { header: 'Campaign Name', key: 'campaign_name', width: 35 },
        { header: 'Total Spend (₹)', key: 'total_spend', width: 15 },
        { header: 'Total Purchases', key: 'purchases', width: 15 },
        { header: 'Total Revenue (₹)', key: 'revenue', width: 15 },
        { header: 'ROAS', key: 'roas', width: 10 },
        { header: 'Performance Rating', key: 'ai_verdict', width: 22 },
        { header: 'Analysis & Key Insights', key: 'ai_analysis', width: 65 },
        { header: 'Recommended Actions', key: 'ai_recommendations', width: 75 },
      ];
    }

    const styleHeader = (headerRow, color) => {
      headerRow.height = 35;
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      headerRow.border = {
        top: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'medium', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        right: { style: 'medium', color: { argb: 'FF000000' } }
      };
    };
    if (detailsSheet) styleHeader(detailsSheet.getRow(1), 'FF2C3E50');
    if (aiSheet) styleHeader(aiSheet.getRow(1), 'FF1E3A8A');

    console.log(`📝 Processing ${campaigns.length} campaigns...`);

    const accountName = adAccountName || adAccountId.replace('act_', '');
    let totalAccountSpend = 0;

    // First pass: Calculate total account spend (keeps your original behavior)
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

    console.log(`💰 Total account spend: ₹${totalAccountSpend.toFixed(2)}`);

    // Collect campaign data
    const campaignsForAnalysis = [];
    for (const campaign of campaigns) {
      try {
        let filters = {};
        if (date_start && date_stop) {
          const { since, until } = adjustDateRange(date_start, date_stop, campaign);
          filters.time_range = JSON.stringify({ since, until });
        } else {
          filters.date_preset = "maximum";
        }

        console.log(`🔍 Fetching insights for: ${campaign.name}`);
        const insights = await getCampaignInsights(campaign.id, userFacebookToken, filters);

        if (!insights || insights.length === 0) {
          console.log(`⚠️ No insights for: ${campaign.name}`);
          campaignsForAnalysis.push({
            campaignName: campaign.name,
            objective: campaign.objective || 'Not specified',
            totalSpend: 0,
            totalImpressions: 0,
            totalClicks: 0,
            totalReach: 0,
            avgCTR: 0,
            avgCPM: 0,
            avgCPC: 0,
            totalPurchases: 0,
            totalAddToCart: 0,
            totalInitiateCheckout: 0,
            totalAddPaymentInfo: 0,
            totalConversions: 0,
            totalRevenue: 0,
            avgCPA: 0,
            avgROAS: 0,
            insights: [],
            hasData: false
          });
          continue;
        }

        console.log(`✅ Found ${insights.length} ad sets for: ${campaign.name}`);

        // Calculate campaign totals
        let totals = {
          spend: 0,
          impressions: 0,
          clicks: 0,
          reach: 0,
          purchases: 0,
          addToCart: 0,
          initiateCheckout: 0,
          addPaymentInfo: 0,
          viewContent: 0,
          landingPageView: 0,
          search: 0,
          revenue: 0
        };

        insights.forEach(insight => {
          totals.spend += parseFloat(insight.spend || 0);
          totals.impressions += parseInt(insight.impressions || 0);
          totals.clicks += parseInt(insight.clicks || 0);
          totals.reach += parseInt(insight.reach || 0);

          const actions = insight.actions || [];
          totals.purchases += parseInt(actions.find(a => a.action_type === 'purchase')?.value || 0);
          totals.addToCart += parseInt(actions.find(a => a.action_type === 'add_to_cart')?.value || 0);
          totals.initiateCheckout += parseInt(actions.find(a => a.action_type === 'initiate_checkout')?.value || 0);
          totals.addPaymentInfo += parseInt(actions.find(a => a.action_type === 'add_payment_info')?.value || 0);
          totals.viewContent += parseInt(actions.find(a => a.action_type === 'view_content')?.value || 0);
          totals.landingPageView += parseInt(actions.find(a => a.action_type === 'landing_page_view')?.value || 0);
          totals.search += parseInt(actions.find(a => a.action_type === 'search')?.value || 0);

          const actionValues = insight.action_values || [];
          totals.revenue += parseFloat(actionValues.find(a => a.action_type === 'purchase')?.value || 0);
        });

        totalAccountSpend += totals.spend;

        const totalConversions = totals.purchases + totals.addToCart + totals.initiateCheckout + totals.addPaymentInfo;
        const avgCTR = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
        const avgCPM = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
        const avgCPC = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
        const avgCPA = totalConversions > 0 ? totals.spend / totalConversions : 0;
        const avgROAS = totals.spend > 0 ? totals.revenue / totals.spend : 0;

        campaignsForAnalysis.push({
          campaignName: campaign.name,
          objective: insights[0]?.objective || campaign.objective || 'Not specified',
          totalSpend: totals.spend,
          totalImpressions: totals.impressions,
          totalClicks: totals.clicks,
          totalReach: totals.reach,
          avgCTR: avgCTR,
          avgCPM: avgCPM,
          avgCPC: avgCPC,
          totalPurchases: totals.purchases,
          totalAddToCart: totals.addToCart,
          totalInitiateCheckout: totals.initiateCheckout,
          totalAddPaymentInfo: totals.addPaymentInfo,
          totalConversions: totalConversions,
          totalRevenue: totals.revenue,
          avgCPA: avgCPA,
          avgROAS: avgROAS,
          insights: insights,
          hasData: true
        });

      } catch (error) {
        console.error(`❌ Error processing ${campaign.name}:`, error.message);
      }
    }

    // Enrich campaign data with derived KPIs BEFORE sending to AI
    const enrichedCampaigns = campaignsForAnalysis.map(c => {
      const spend = c.totalSpend || 0;
      const revenue = c.totalRevenue || 0;
      const clicks = c.totalClicks || 0;
      const purchases = c.totalPurchases || 0;
      const addToCart = c.totalAddToCart || 0;
      const initiateCheckout = c.totalInitiateCheckout || 0;
      const impressions = c.totalImpressions || 0;
      const reach = c.totalReach || 0;

      const addToCartRate = impressions > 0 ? (addToCart / impressions) * 100 : 0;
      const checkoutRate = addToCart > 0 ? (initiateCheckout / addToCart) * 100 : 0;
      const purchaseRate = initiateCheckout > 0 ? (purchases / initiateCheckout) * 100 : 0;
      const conversionRate = impressions > 0 ? (purchases / impressions) * 100 : 0;

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
      };
    });

    // CONDITIONALLY RUN CHATGPT ANALYSIS (we send enrichedCampaigns)
    let aiResults = [];
    if (includeAIAnalysis) {
      // 🧮 Estimate AI token cost before sending to ChatGPT
      const jsonString = JSON.stringify(enrichedCampaigns);
      const charCount = jsonString.length;
      const estimatedTokens = Math.round(charCount / 4) + 500; // rough + output
      const model = "gpt-4o"; // or "gpt-4o" if using full version

      // 💰 Cost calculation (USD → INR)
      const usdToInr = 84.5;
      let inputRateUsd = model === "gpt-4o" ? 2.50 : 0.15;
      let outputRateUsd = model === "gpt-4o" ? 10.00 : 0.60;

      const inputTokens = estimatedTokens * 0.9;
      const outputTokens = estimatedTokens * 0.1;

      const totalCostUsd = (inputTokens / 1_000_000) * inputRateUsd +
        (outputTokens / 1_000_000) * outputRateUsd;
      const totalCostInr = (totalCostUsd * usdToInr).toFixed(3);

      console.log(`💰 Estimated AI cost (${model}): ~₹${totalCostInr} for ${enrichedCampaigns.length} campaign(s)`);

      console.log(`🤖 Running ChatGPT analysis for ${enrichedCampaigns.length} campaigns...`);
      aiResults = await analyzeCampaignsWithChatGPT(enrichedCampaigns);
    } else {
      console.log(`⏭️ Skipping AI analysis (not requested)`);
      aiResults = enrichedCampaigns.map(() => ({
        verdict: 'N/A',
        analysis: 'AI analysis not included in this export',
        recommendations: 'Select "AI Performance Analysis" to include AI insights'
      }));
    }

    // Now generate Excel sheets exactly as original (no visual changes)
    const aiAnalysisResults = [];
    let currentRow = 2;

    for (let i = 0; i < campaignsForAnalysis.length; i++) {
      const campaignData = campaignsForAnalysis[i];
      const aiResult = aiResults[i] || {};
      const insights = campaignData.insights;

      aiAnalysisResults.push({
        campaign_name: campaignData.campaignName,
        total_spend: campaignData.totalSpend ?? 0,
        purchases: campaignData.totalPurchases ?? 0,
        revenue: campaignData.totalRevenue ?? 0,
        roas: campaignData.avgROAS ?? 0,
        ai_verdict: aiResult.verdict || 'N/A',
        ai_analysis: aiResult.analysis || 'No analysis available',
        ai_recommendations: aiResult.recommendations || 'No recommendations available'
      });

      if (includeCampaignDetails && detailsSheet) {
        if (!campaignData.hasData) {
          const row = detailsSheet.addRow({
            campaign_name: campaignData.campaignName,
            adset_name: 'No data',
            ad_name: 'No data available',
            objective: campaignData.objective,
            spend: 0,
            impressions: 0,
            clicks: 0,
            reach: 0,
            ctr: 0,
            cpm: 0,
            cpc: 0
          });
          row.font = { color: { argb: 'FFFF0000' }, bold: true };
          currentRow++;
          continue;
        }

        const startRow = currentRow;

        for (let j = 0; j < insights.length; j++) {
          const insight = insights[j];

          const spend = parseFloat(insight.spend || 0);
          const impressions = parseInt(insight.impressions || 0);
          const clicks = parseInt(insight.clicks || 0);
          const reach = parseInt(insight.reach || 0);
          const ctr = parseFloat(insight.ctr || 0);
          const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
          const cpc = parseFloat(insight.cpc || 0);
          const cpp = parseFloat(insight.cpp || 0);

          const actions = insight.actions || [];
          const purchases = parseInt(actions.find(a => a.action_type === 'purchase')?.value || 0);
          const addToCart = parseInt(actions.find(a => a.action_type === 'add_to_cart')?.value || 0);
          const initiateCheckout = parseInt(actions.find(a => a.action_type === 'initiate_checkout')?.value || 0);
          const addPaymentInfo = parseInt(actions.find(a => a.action_type === 'add_payment_info')?.value || 0);
          const viewContent = parseInt(actions.find(a => a.action_type === 'view_content')?.value || 0);
          const landingPageView = parseInt(actions.find(a => a.action_type === 'landing_page_view')?.value || 0);
          const search = parseInt(actions.find(a => a.action_type === 'search')?.value || 0);

          const actionValues = insight.action_values || [];
          const revenue = parseFloat(actionValues.find(a => a.action_type === 'purchase')?.value || 0);

          const totalConversions = purchases + addToCart + initiateCheckout + addPaymentInfo;
          const cpa = totalConversions > 0 ? spend / totalConversions : 0;
          const roas = spend > 0 ? revenue / spend : 0;
          const spendShare = totalAccountSpend > 0 ? (spend / totalAccountSpend) * 100 : 0;

          const row = detailsSheet.addRow({
            campaign_name: '',
            adset_name: insight.adset_name || 'Unknown',
            ad_name: insight.ad_name || 'Unknown',
            objective: insight.objective || '',
            buying_type: insight.buying_type || '',
            date_start: insight.date_start || '',
            date_stop: insight.date_stop || '',
            spend: spend,
            impressions: impressions,
            clicks: clicks,
            reach: reach,
            ctr: ctr,
            cpm: cpm,
            cpc: cpc,
            cpp: cpp,
            purchases: purchases,
            add_to_cart: addToCart,
            initiate_checkout: initiateCheckout,
            add_payment_info: addPaymentInfo,
            view_content: viewContent,
            landing_page_view: landingPageView,
            search: search,
            total_conversions: totalConversions,
            revenue: revenue,
            cpa: totalConversions > 0 ? cpa : 0,
            roas: roas,
            spend_share: spendShare
          });

          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: j % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FA' }
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

          // Format numbers
          ['spend', 'cpm', 'cpc', 'cpp', 'cpa', 'revenue'].forEach(col => {
            const cell = row.getCell(col);
            cell.numFmt = '₹#,##0.00';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          });

          ['impressions', 'clicks', 'reach', 'purchases', 'add_to_cart', 'initiate_checkout', 'add_payment_info', 'view_content', 'landing_page_view', 'search', 'total_conversions'].forEach(col => {
            const cell = row.getCell(col);
            cell.numFmt = '#,##0';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          });

          ['ctr', 'roas', 'spend_share'].forEach(col => {
            const cell = row.getCell(col);
            cell.numFmt = '0.00';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
          });

          currentRow++;
        }

        const endRow = currentRow - 1;

        // Merge campaign name
        if (insights.length > 0) {
          detailsSheet.mergeCells(`A${startRow}:A${endRow}`);
          const campaignCell = detailsSheet.getCell(`A${startRow}`);
          campaignCell.value = campaignData.campaignName;
          campaignCell.font = { bold: true, size: 11, color: { argb: 'FF1E3A8A' } };
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

        // Spacing
        const spacingRow = detailsSheet.addRow({});
        spacingRow.height = 5;
        spacingRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFECEFF1' }
        };
        currentRow++;
      }
    }

    // Add AI sheet rows (preserve original formatting + coloring logic)
    if (includeAIAnalysis && aiSheet) {
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
        const verdict = result.ai_verdict || '';

        if (verdict.includes('Excellent')) {
          verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00C851' } };
          verdictCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        } else if (verdict.includes('Good')) {
          verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF33B679' } };
          verdictCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        } else if (verdict.includes('Average')) {
          verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC107' } };
          verdictCell.font = { bold: true, color: { argb: 'FF000000' }, size: 11 };
        } else if (verdict.includes('Needs')) {
          verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8800' } };
          verdictCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        } else if (verdict.includes('Poor')) {
          verdictCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF4444' } };
          verdictCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        }

        verdictCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

        row.getCell('ai_analysis').alignment = { wrapText: true, vertical: 'top' };
        row.getCell('ai_recommendations').alignment = { wrapText: true, vertical: 'top' };
        row.getCell('ai_recommendations').font = { bold: true, color: { argb: 'FF1565C0' } };

        row.getCell('total_spend').numFmt = '₹#,##0.00';
        row.getCell('revenue').numFmt = '₹#,##0.00';
        row.getCell('roas').numFmt = '0.00';

        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFBDBDBD' } },
            left: { style: 'thin', color: { argb: 'FFBDBDBD' } },
            bottom: { style: 'thin', color: { argb: 'FFBDBDBD' } },
            right: { style: 'thin', color: { argb: 'FFBDBDBD' } }
          };
        });
      }
    }

    // Freeze headers for created sheets
    if (detailsSheet) detailsSheet.views = [{ state: 'frozen', ySplit: 1 }];
    if (aiSheet) aiSheet.views = [{ state: 'frozen', ySplit: 1 }];

    console.log("✅ Excel report generation complete");
    console.log(`   📋 Sheets created: ${includeCampaignDetails ? 'Details ✓' : ''} ${includeAIAnalysis ? 'AI Analysis ✓' : ''}`);

    // Generate filename same as original logic
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const cleanAccountName = accountName.replace(/[^a-zA-Z0-9-_]/g, '_');

    let sheetType = '';
    if (includeCampaignDetails && includeAIAnalysis) {
      sheetType = 'Full_Report';
    } else if (includeCampaignDetails) {
      sheetType = 'Performance_Data';
    } else if (includeAIAnalysis) {
      sheetType = 'AI_Analysis';
    }

    const filename = `${cleanAccountName}_${sheetType}_${dateStr}_${timeStr}.xlsx`;

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
