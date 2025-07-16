const axios = require("axios");
const { customResponse } = require("../utils/customResponse");
const { v4: uuidv4 } = require("uuid");
const { insertRecord, selectRecord, softDeleteRecord, checkRecordExists, updateRecord } = require("../utils/sqlFunctions");
// const { customResponse } = require("../utils/customResponse");
const { checkSubscriptionLimits } = require("../middlewares/subscriptionMiddleware");
// Generate interests using OpenAI GPT
const generateInterestsWithGPT = async (businessData) => {
    try {
        const prompt = `My Business/Product Name is ${businessData.productName}, Business/Product Category is ${businessData.category}, Business/Product Description is ${businessData.productDescription}, Location is ${businessData.location}, Promotion Goal is ${businessData.promotionGoal}, Target Audience is ${businessData.targetAudience}, Contact Email is ${businessData.contactEmail}.

    Suggest some of the most relevant interests from the Meta Graph API to target for Facebook ads. These should include predefined interests that people actively follow or engage with.
    
    Based on the business info, return a single array of highly relevant Meta interests to query. Output format should be:
    
    ["interest 1", "interest 2", "interest 3", ...]
    `;

        // Suggest some of the most relevant interests from the Meta Graph API to target for Facebook ads. These should include predefined interests that people actively follow or engage with.
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        const content = response.data.choices[0].message.content;

        try {
            // Using Function constructor for safer parsing of JSON array
            const parseArray = new Function(`return ${content}`);
            return parseArray();
        } catch (parseError) {
            console.error("Error parsing GPT response:", parseError);

            // Fallback parsing method - extract content between square brackets
            const match = content.match(/\[(.*)\]/s);
            if (match && match[1]) {
                return match[1]
                    .split(",")
                    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
                    .filter((item) => item.length > 0);
            }

            throw new Error("Failed to parse interests from GPT response");
        }
    } catch (error) {
        console.error("Error generating interests with GPT:", error);
        throw error;
    }
};

// Fetch interest data from Meta Graph API
const fetchInterestFromMeta = async (interest) => {
    try {
        const url = `https://graph.facebook.com/v18.0/search?type=adinterest&q=${encodeURIComponent(interest)}&limit=1000&access_token=${process.env.FB_ACCESS_TOKEN}`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching interest "${interest}" from Meta:`, error);
        throw error;
    }
};

// Analyze interests using OpenAI GPT
const analyzeInterestsWithGPT = async (businessData, rawInterests) => {
    try {
        // Convert interests to CSV format for GPT to analyze
        const csvRows = rawInterests.map((interest) => `${interest.name},${interest.audience_size_lower_bound || 0},${interest.audience_size_upper_bound || 0},${interest.path ? interest.path.join(" > ") : ""},${interest.topic || ""},${interest.description || ""}`);

        const csvContent = `Name,Audience Size Lower,Audience Size Upper,Path,Topic,Category\n${csvRows.join("\n")}`;

        const prompt = `Hi, I'm analyzing Meta ad interests for my business "${businessData.productName}" in the ${businessData.category} category.

Business Description: ${businessData.productDescription}
Target Audience: ${businessData.targetAudience}
Promotion Goal: ${businessData.promotionGoal}

Here's the Meta Graph API data in CSV format:

${csvContent}

Please analyze the interests and identify the best ones that would perform well and generate leads for this business. Return the results in JSON format with the following structure for each interest:
{
  "interests": [
    {
      "name": "Interest Name",
      "audienceSizeLowerBound": 1000000,
      "audienceSizeUpperBound": 2000000,
      "path": ["path", "to", "interest"],
      "topic": "Topic Name",
      "relevanceScore": 85,
      "category": "Category Name",
      "rank": 1
    },
    ...
  ]
}

Assign a relevance score (1-100) and rank to each interest based on how well it matches the business goals and target audience. 
IMPORTANT: You must return AT LEAST 15 top performing interests in your response, or more if you find additional highly relevant ones.`;

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.5,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        const content = response.data.choices[0].message.content;

        try {
            // Find the JSON object in the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const analysisResult = JSON.parse(jsonMatch[0]);
                return analysisResult.interests;
            } else {
                throw new Error("Failed to extract JSON from GPT response");
            }
        } catch (parseError) {
            console.error("Error parsing GPT analysis response:", parseError);
            throw parseError;
        }
    } catch (error) {
        console.error("Error analyzing interests with GPT:", error);
        throw error;
    }
};

// Main controller function to generate business interests
const generateBusinessInterests = async (req, res, next) => {
    try {
        const { productName, category, productDescription, location, promotionGoal, targetAudience, contactEmail } = req.body;

        // Validate required fields
        if (!productName || !category || !productDescription || !targetAudience || !contactEmail) {
            return customResponse("Missing required fields", 400, false)(req, res);
        }

        const businessData = {
            productName,
            category,
            productDescription,
            location,
            promotionGoal,
            targetAudience,
            contactEmail,
        };

        // Step 1: Generate interest suggestions using GPT
        console.log("Generating interest suggestions with GPT...");
        const suggestedInterests = await generateInterestsWithGPT(businessData);

        if (!suggestedInterests || suggestedInterests.length === 0) {
            return customResponse("Failed to generate interest suggestions", 500, false)(req, res);
        }

        // Step 2: Fetch detailed data from Meta Graph API for each suggested interest
        console.log("Fetching interest data from Meta Graph API...");
        const metaInterestsPromises = suggestedInterests.map((interest) =>
            fetchInterestFromMeta(interest).catch((error) => {
                console.error(`Failed to fetch interest: ${interest}`, error);
                return { data: [] }; // Return empty data for failed requests
            })
        );

        const metaInterestsResults = await Promise.all(metaInterestsPromises);

        // Flatten and filter the results
        const allRawInterests = metaInterestsResults.flatMap((result) => result.data || []).filter((interest) => interest && interest.name);

        if (allRawInterests.length === 0) {
            return customResponse("No interests found from Meta Graph API", 404, false)(req, res);
        }

        // Step 3: Analyze and rank interests using GPT
        console.log("Analyzing interests with GPT...");
        const analyzedInterests = await analyzeInterestsWithGPT(businessData, allRawInterests);
        next();

        // Step 4: Return the final results
        return res.status(200).json({
            message: "Business interests generated successfully",
            status: 200,
            success: true,
            data: {
                businessInfo: businessData,
                suggestedInterests,
                totalRawInterests: allRawInterests.length,
                analyzedInterests: analyzedInterests || [],
                summary: {
                    totalSuggestions: suggestedInterests.length,
                    totalMetaResults: allRawInterests.length,
                    finalRecommendations: analyzedInterests ? analyzedInterests.length : 0,
                },
            },
        });
    } catch (error) {
        console.error("Business interests generation error:", error);

        // Handle specific API errors
        if (error.response && error.response.status === 401) {
            return customResponse("API authentication failed. Please check API keys.", 401, false)(req, res);
        }

        if (error.response && error.response.status === 429) {
            return customResponse("API rate limit exceeded. Please try again later.", 429, false)(req, res);
        }

        return customResponse("Failed to generate business interests", 500, false)(req, res);
    }
};

// Store form details or update visit count if already exists
const storeFormDetails = async (req, res) => {
  try {
    const {
      productName,
      category,
      productDescription,
      location,
      promotionGoal,
      targetAudience,
      contactEmail,
      filters = {},
    } = req.body;

    const user_uuid = req.user.uuid;

    // Basic validation
    if (
      !productName ||
      !category ||
      !productDescription ||
      !location ||
      !promotionGoal ||
      !targetAudience ||
      !contactEmail
    ) {
      return customResponse("All fields are required.", 400, false)(req, res);
    }

    // Check if user exists
    const userExists = await checkRecordExists("users", "uuid", user_uuid);
    if (!userExists) {
      return customResponse("User not found", 404, false)(req, res);
    }

    // Check for existing form
    const existingForm = await checkExistingForm(user_uuid, productName);

    if (existingForm) {
      // Update visit count if form exists
      await updateFormEntry(existingForm.uuid, existingForm.visit_count + 1);

      return res.status(200).json({
        message: "Form visit updated successfully",
        status: 200,
        success: true,
        data: {
          product_id: existingForm.uuid,
          visit_count: existingForm.visit_count + 1,
        },
      });
    }

    // Insert new form
    const newFormData = {
      uuid: uuidv4(),
      user_uuid,
      productName,
      category,
      productDescription,
      location,
      promotionGoal,
      targetAudience,
      contactEmail,
      filters: JSON.stringify(filters),
      created_at: new Date(),
      last_visited: new Date(),
      visit_count: 1,
    };

    await insertRecord("business_details_history", newFormData);

    return res.status(201).json({
      message: "Form data stored successfully",
      status: 201,
      success: true,
      data: {
        product_id: newFormData.uuid,
        visit_count: 1,
      },
    });
  } catch (error) {
    console.error("Form storage error:", error);
    return customResponse(
      "Failed to store form: " + (error.message || "Unknown error"),
      500,
      false
    )(req, res);
  }
};

// Update visit count and last visited time
const updateFormEntry = async (uuid, newVisitCount) => {
  try {
    await updateRecord(
      "business_details_history",
      {
        visit_count: newVisitCount,
        last_visited: new Date(),
      },
      "uuid",
      uuid
    );
  } catch (error) {
    console.error("Error updating form entry:", error);
    throw error;
  }
};

// Check if form already exists for the user
const checkExistingForm = async (user_uuid, productName) => {
  try {
    const query = `
      SELECT uuid, visit_count
      FROM business_details_history
      WHERE user_uuid = ?
        AND productName = ?
        AND is_deleted = 0
      LIMIT 1
    `;
    const results = await selectRecord(query, [user_uuid, productName]);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Error checking existing form:", error);
    throw error;
  }
};


//get this show data from the database.
const getFormDetails = async (req, res) => {
    try {
        const user_uuid = req.user.uuid;
        const { limit = 20, offset = 0, sort_by = "created_at", sort_order = "DESC", category, search_term } = req.query;

        // Sanitize and validate pagination and sorting
        const safeLimit = Math.min(Number.parseInt(limit) || 20, 100);
        const safeOffset = Math.max(Number.parseInt(offset) || 0, 0);
        const validSortFields = ["created_at", "last_visited", "productName", "category"];
        const validSortOrders = ["ASC", "DESC"];
        const sortField = validSortFields.includes(sort_by) ? sort_by : "created_at";
        const sortOrder = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : "DESC";

        // Build query conditions
        const conditions = ["user_uuid = ?"];
        const params = [user_uuid];

        if (category) {
            conditions.push("category = ?");
            params.push(category);
        }

        if (search_term) {
            conditions.push("(productName LIKE ? OR productDescription LIKE ?)");
            const term = `%${search_term}%`;
            params.push(term, term);
        }

        // Count query for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM business_details_history
            WHERE ${conditions.join(" AND ")}
        `;
        const countResult = await selectRecord(countQuery, params);
        const totalCount = countResult[0]?.total || 0;

        // Main data query

        const mainQuery = `
            SELECT uuid, productName, category, productDescription, location,
                   promotionGoal, targetAudience, contactEmail, filters,
                   created_at, last_visited,visit_count
            FROM business_details_history
            WHERE ${conditions.join(" AND ")}
            ORDER BY ${sortField} ${sortOrder}
            LIMIT ? OFFSET ?
        `;
        const mainParams = [...params, safeLimit, safeOffset];
        const records = await selectRecord(mainQuery, mainParams);

        // Format data
        const formattedData = records.map((item) => ({
            id: item.uuid,
            productName: item.productName,
            category: item.category,
            productDescription: item.productDescription,
            location: item.location,
            promotionGoal: item.promotionGoal,
            targetAudience: item.targetAudience,
            contactEmail: item.contactEmail,
            filters: item.filters ? (typeof item.filters === "string" ? JSON.parse(item.filters) : item.filters) : {},
            created_at: item.created_at,
            last_visited: item.last_visited,
            visit_count: item.visit_count,
        }));

        return res.status(200).json({
            status: 200,
            success: true,
            data: formattedData,
            pagination: {
                limit: safeLimit,
                offset: safeOffset,
                total: totalCount,
            },
        });
    } catch (error) {
        console.error("Fetch form details error:", error);
        return customResponse("Failed to fetch form details: " + (error.message || "Unknown error"), 500, false)(req, res);
    }
};

module.exports = {
    generateBusinessInterests,
    storeFormDetails,
    getFormDetails,
};
