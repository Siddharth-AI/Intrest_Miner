const axios = require('axios');

const API_VERSION = 'v18.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}/ads_archive`;

// Add this to your controller for debugging
const testTokenAccess = async (req, res) => {
  const ACCESS_TOKEN = process.env.USER_ACCESS_TOKEN;
  try {
    // Test 1: Check token validity
    const tokenCheck = await axios.get(`https://graph.facebook.com/me?access_token=${ACCESS_TOKEN}`);
    console.log('✅ Token is valid for user:', tokenCheck.data);

    // Test 2: Try minimal Ad Library call
    const minimalCall = await axios.get('https://graph.facebook.com/v18.0/ads_archive', {
      params: {
        access_token: ACCESS_TOKEN,
        search_terms: 'covid', // Political ads are more likely to show
        ad_type: 'POLITICAL_AND_ISSUE_ADS',
        ad_reached_countries: 'US',
        limit: 5
      }
    });

    res.json({
      token_status: 'valid',
      user_info: tokenCheck.data,
      ad_library_access: 'working',
      test_results: minimalCall.data?.data?.length || 0,
      sample_ad: minimalCall.data?.data?.[0] || null
    });

  } catch (error) {
    console.error('Token test failed:', error.response?.data);

    res.status(500).json({
      token_status: 'failed',
      error_code: error.response?.data?.error?.code,
      error_message: error.response?.data?.error?.message,
      error_subcode: error.response?.data?.error?.error_subcode,
      solution: getErrorSolution(error.response?.data?.error)
    });
  }
};

function getErrorSolution(error) {
  if (!error) return 'Check your internet connection and try again';

  switch (error.code) {
    case 10:
      return 'Verify your ID at facebook.com/ID for Ad Library API access';
    case 190:
      return 'Generate a new User Access Token from Graph API Explorer';
    case 100:
      return 'Check your request parameters and token permissions';
    default:
      return `Facebook API Error ${error.code}: ${error.message}`;
  }
}


// // Basic search controller - returns first page only
const getAllSearchResults = async (req, res) => {
  try {
    const {
      search_terms,
      ad_type = 'ALL',
      ad_active_status = 'ALL',
      limit = 100,
      ...otherFilters
    } = req.query;

    if (!search_terms) {
      return res.status(400).json({
        error: 'search_terms parameter is required',
        example: '/test/search?search_terms=skincare'
      });
    }

    console.log('Basic search for:', search_terms);
    const results = await searchAdsComprehensive(search_terms, { limit, ...otherFilters });

    res.json({
      success: true,
      search_type: 'basic',
      search_terms,
      total_results: results.data?.length || 0,
      has_next_page: !!results.paging?.next,
      data: results.data || [],
      paging: results.paging || null
    });

  } catch (error) {
    console.error('Basic search error:', error);
    res.status(500).json({
      error: 'Basic search failed',
      message: error.message,
      details: error.response?.data || null
    });
  }
};

// // Advanced search with filters controller
// const searchWithFilters = async (req, res) => {
//   try {
//     const { search_terms, ...filters } = req.query;

//     if (!search_terms) {
//       return res.status(400).json({
//         error: 'search_terms parameter is required',
//         available_filters: [
//           'ad_type', 'ad_active_status', 'media_type', 'publisher_platforms',
//           'ad_delivery_date_min', 'ad_delivery_date_max', 'languages',
//           'ad_reached_countries', 'limit'
//         ]
//       });
//     }

//     console.log('Advanced search for:', search_terms, 'with filters:', filters);
//     const results = await searchWithAllFilters(search_terms, filters);

//     res.json({
//       success: true,
//       search_type: 'advanced_filtered',
//       search_terms,
//       filters_applied: Object.keys(filters).length > 0 ? filters : 'none',
//       total_results: results.data?.length || 0,
//       has_next_page: !!results.paging?.next,
//       data: results.data || [],
//       paging: results.paging || null
//     });

//   } catch (error) {
//     console.error('Advanced search error:', error);
//     res.status(500).json({
//       error: 'Advanced search failed',
//       message: error.message,
//       details: error.response?.data || null
//     });
//   }
// };

// // Paginated search - gets ALL results across multiple pages
// const getPaginatedResults = async (req, res) => {
//   try {
//     const {
//       search_terms,
//       max_pages = 5, // Limit to prevent infinite requests
//       ...options
//     } = req.query;

//     if (!search_terms) {
//       return res.status(400).json({
//         error: 'search_terms parameter is required',
//         note: 'max_pages parameter limits total pages (default: 5)'
//       });
//     }

//     console.log(`Paginated search for: ${search_terms}, max pages: ${max_pages}`);

//     // Add timeout for long-running requests
//     const timeoutPromise = new Promise((_, reject) =>
//       setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
//     );

//     const searchPromise = getAllPaginatedResults(search_terms, {
//       ...options,
//       maxPages: parseInt(max_pages)
//     });

//     const results = await Promise.race([searchPromise, timeoutPromise]);

//     res.json({
//       success: true,
//       search_type: 'paginated_all',
//       search_terms,
//       total_results: results.total_count,
//       pages_fetched: results.pages_fetched,
//       data: results.data,
//       execution_time: results.execution_time
//     });

//   } catch (error) {
//     console.error('Paginated search error:', error);
//     res.status(500).json({
//       error: 'Paginated search failed',
//       message: error.message,
//       details: error.response?.data || null
//     });
//   }
// };

// // Search by specific page ID
// const searchByPageId = async (req, res) => {
//   try {
//     const {
//       page_ids,
//       ad_type = 'ALL',
//       ad_active_status = 'ALL',
//       limit = 100,
//       ...otherOptions
//     } = req.query;

//     if (!page_ids) {
//       return res.status(400).json({
//         error: 'page_ids parameter is required',
//         example: '/test/page-search?page_ids=123456789,987654321',
//         note: 'Comma-separated list of page IDs (max 10)'
//       });
//     }

//     const pageIdArray = page_ids.split(',').map(id => id.trim()).slice(0, 10);

//     console.log('Page search for IDs:', pageIdArray);
//     const results = await searchByPageIds(pageIdArray, {
//       ad_type,
//       ad_active_status,
//       limit,
//       ...otherOptions
//     });

//     res.json({
//       success: true,
//       search_type: 'page_ids',
//       page_ids: pageIdArray,
//       total_results: results.data?.length || 0,
//       has_next_page: !!results.paging?.next,
//       data: results.data || [],
//       paging: results.paging || null
//     });

//   } catch (error) {
//     console.error('Page search error:', error);
//     res.status(500).json({
//       error: 'Page search failed',
//       message: error.message,
//       details: error.response?.data || null
//     });
//   }
// };

// // CORE SEARCH FUNCTIONS

// // Basic comprehensive search function [web:1]
async function searchAdsComprehensive(searchTerms, options = {}) {
  const defaultParams = {
    access_token: process.env.USER_ACCESS_TOKEN,
    search_terms: searchTerms,
    ad_type: options.ad_type || 'ALL',
    ad_active_status: options.ad_active_status || 'ALL',
    ad_reached_countries: options.ad_reached_countries || 'ALL',
    media_type: options.media_type || 'ALL',
    publisher_platforms: ['FACEBOOK', 'INSTAGRAM', 'AUDIENCE_NETWORK', 'MESSENGER', 'WHATSAPP', 'OCULUS', 'THREADS'],
    limit: options.limit || 100,
    fields: 'id'
  };

  try {
    const response = await axios.get(BASE_URL, {
      params: defaultParams,
      timeout: 15000 // 15 second timeout
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'API request failed');
  }
}

// // Advanced search with all filtering options [web:1][web:2]
// async function searchWithAllFilters(searchTerms, filters = {}) {
//   const params = {
//     access_token: ACCESS_TOKEN,
//     search_terms: searchTerms,
//     ad_active_status: filters.ad_active_status || 'ALL',
//     ad_type: filters.ad_type || 'ALL',
//     media_type: filters.media_type || 'ALL',
//     limit: Math.min(parseInt(filters.limit) || 100, 1000), // Cap at 1000
//     fields: 'id,ad_creative_body,ad_creative_link_caption,ad_creative_link_description,ad_creative_link_title,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,bylines,currency,delivery_by_region,demographic_distribution,estimated_audience_size,impressions,languages,page_id,page_name,publisher_platforms,region_distribution,spend'
//   };

//   // Handle array parameters properly
//   if (filters.ad_reached_countries) {
//     params.ad_reached_countries = Array.isArray(filters.ad_reached_countries)
//       ? filters.ad_reached_countries
//       : filters.ad_reached_countries.split(',');
//   } else {
//     params.ad_reached_countries = 'ALL';
//   }

//   if (filters.publisher_platforms) {
//     params.publisher_platforms = Array.isArray(filters.publisher_platforms)
//       ? filters.publisher_platforms
//       : filters.publisher_platforms.split(',');
//   } else {
//     params.publisher_platforms = ['FACEBOOK', 'INSTAGRAM', 'AUDIENCE_NETWORK', 'MESSENGER', 'WHATSAPP', 'OCULUS', 'THREADS'];
//   }

//   // Date filters
//   if (filters.ad_delivery_date_min) params.ad_delivery_date_min = filters.ad_delivery_date_min;
//   if (filters.ad_delivery_date_max) params.ad_delivery_date_max = filters.ad_delivery_date_max;

//   // Language filters
//   if (filters.languages) {
//     params.languages = Array.isArray(filters.languages)
//       ? filters.languages
//       : filters.languages.split(',');
//   }

//   // Search type
//   if (filters.search_type) params.search_type = filters.search_type;

//   try {
//     const response = await axios.get(BASE_URL, {
//       params,
//       timeout: 15000
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Advanced API Error:', error.response?.data || error.message);
//     throw new Error(error.response?.data?.error?.message || 'Advanced API request failed');
//   }
// }

// // Paginated search to get ALL results [web:40][web:41]
// async function getAllPaginatedResults(searchTerms, options = {}) {
//   const startTime = Date.now();
//   let allResults = [];
//   let nextPageUrl = null;
//   let pageCount = 0;
//   const maxPages = options.maxPages || 5;

//   console.log(`Starting paginated search for "${searchTerms}", max pages: ${maxPages}`);

//   do {
//     try {
//       let requestUrl;
//       let requestParams = {};

//       if (nextPageUrl) {
//         // Use the next page URL directly
//         requestUrl = nextPageUrl;
//       } else {
//         // First page - build URL with parameters
//         requestUrl = BASE_URL;
//         requestParams = {
//           access_token: ACCESS_TOKEN,
//           search_terms: searchTerms,
//           ad_type: options.ad_type || 'ALL',
//           ad_active_status: options.ad_active_status || 'ALL',
//           ad_reached_countries: 'ALL',
//           media_type: options.media_type || 'ALL',
//           publisher_platforms: ['FACEBOOK', 'INSTAGRAM', 'AUDIENCE_NETWORK', 'MESSENGER', 'WHATSAPP', 'OCULUS', 'THREADS'],
//           limit: Math.min(parseInt(options.limit) || 500, 1000),
//           fields: 'id,ad_creative_body,ad_creative_link_caption,ad_creative_link_description,ad_creative_link_title,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,bylines,currency,delivery_by_region,demographic_distribution,estimated_audience_size,impressions,languages,page_id,page_name,publisher_platforms,region_distribution,spend'
//         };
//       }

//       const response = nextPageUrl
//         ? await axios.get(requestUrl, { timeout: 15000 })
//         : await axios.get(requestUrl, { params: requestParams, timeout: 15000 });

//       const data = response.data;

//       if (data.error) {
//         throw new Error(`API Error: ${data.error.message}`);
//       }

//       if (data.data && data.data.length > 0) {
//         allResults = allResults.concat(data.data);
//         console.log(`Page ${pageCount + 1}: Retrieved ${data.data.length} ads`);
//       }

//       nextPageUrl = data.paging?.next || null;
//       pageCount++;

//       // Rate limiting - wait 200ms between requests [web:48]
//       if (nextPageUrl && pageCount < maxPages) {
//         await new Promise(resolve => setTimeout(resolve, 200));
//       }

//     } catch (error) {
//       console.error(`Pagination error on page ${pageCount + 1}:`, error.message);
//       break;
//     }
//   } while (nextPageUrl && pageCount < maxPages);

//   const endTime = Date.now();
//   const executionTime = `${(endTime - startTime) / 1000} seconds`;

//   console.log(`Pagination completed: ${allResults.length} total ads across ${pageCount} pages`);

//   return {
//     data: allResults,
//     total_count: allResults.length,
//     pages_fetched: pageCount,
//     execution_time: executionTime
//   };
// }

// // Search by specific page IDs [web:1]
// async function searchByPageIds(pageIds, options = {}) {
//   const params = {
//     access_token: ACCESS_TOKEN,
//     search_page_ids: pageIds.slice(0, 10), // API limit of 10 page IDs
//     ad_type: options.ad_type || 'ALL',
//     ad_active_status: options.ad_active_status || 'ALL',
//     limit: Math.min(parseInt(options.limit) || 100, 1000),
//     fields: 'id,ad_creative_body,ad_creative_link_caption,ad_creative_link_description,ad_creative_link_title,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,bylines,currency,delivery_by_region,demographic_distribution,estimated_audience_size,impressions,languages,page_id,page_name,publisher_platforms,region_distribution,spend'
//   };

//   // Add optional filters
//   if (options.ad_delivery_date_min) params.ad_delivery_date_min = options.ad_delivery_date_min;
//   if (options.ad_delivery_date_max) params.ad_delivery_date_max = options.ad_delivery_date_max;
//   if (options.media_type) params.media_type = options.media_type;

//   try {
//     const response = await axios.get(BASE_URL, {
//       params,
//       timeout: 15000
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Page search API Error:', error.response?.data || error.message);
//     throw new Error(error.response?.data?.error?.message || 'Page search API request failed');
//   }
// }

module.exports = {
  getAllSearchResults,
  // searchWithFilters,
  // getPaginatedResults,
  // searchByPageId,
  searchAdsComprehensive,
  // searchWithAllFilters,
  // getAllPaginatedResults,
  // searchByPageIds,
  testTokenAccess
};
