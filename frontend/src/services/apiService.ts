
import axios from 'axios';
import { BusinessFormData, OpenAIResponse, MetaAPIResponse, MetaRawInterest, GPTAnalysisRequest, GPTInterestAnalysisResponse, MetaInterest } from '@/types/business';

export const generateInterestsWithGPT = async (formData: BusinessFormData): Promise<string[]> => {
  try {
    const prompt = `My Business/Product Name is ${formData.productName}, Business/Product Category is ${formData.category}, Business/Product Description is ${formData.productDescription}, Location is ${formData.location}, Promotion Goal is ${formData.promotionGoal}, Target Audience is ${formData.targetAudience}, Contact Email is ${formData.contactEmail}.

    Suggest some of the most relevant interests from the Meta Graph API to target for Facebook ads. These should include predefined interests that people actively follow or engage with.
    
    Based on the business info, return a single array of highly relevant Meta interests to query. Output format should be:
    
    ["interest 1", "interest 2", "interest 3", ...]
    `;

    const response = await axios.post<OpenAIResponse>(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        }
      }
    );

    // Parse the response to extract the array of interests
    const content = response.data.choices[0].message.content;
    // Convert the string array representation into an actual array
    try {
      // Using Function constructor for safer parsing of JSON array
      const parseArray = new Function(`return ${content}`);
      return parseArray();
    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError);

      // Fallback parsing method - extract content between square brackets
      const match = content.match(/\[(.*)\]/s);
      if (match && match[1]) {
        return match[1].split(',')
          .map(item => item.trim().replace(/^["']|["']$/g, ''))
          .filter(item => item.length > 0);
      }

      throw new Error('Failed to parse interests from GPT response');
    }
  } catch (error) {
    console.error('Error generating interests with GPT:', error);
    throw error;
  }
};

export const fetchInterestFromMeta = async (interest: string): Promise<MetaAPIResponse> => {
  try {
    const url = `https://graph.facebook.com/v18.0/search?type=adinterest&q=${encodeURIComponent(interest)}&limit=1000&access_token=${import.meta.env.VITE_FB_ACCESS_TOKEN}`;
    const response = await axios.get<MetaAPIResponse>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching interest "${interest}" from Meta:`, error);
    throw error;
  }
};

export const analyzeInterestsWithGPT = async (businessData: BusinessFormData, rawInterests: MetaRawInterest[]): Promise<MetaInterest[]> => {
  try {
    // Convert interests to CSV format for GPT to analyze
    const csvRows = rawInterests.map(interest =>
      `${interest.name},${interest.audienceSizeLowerBound},${interest.audienceSizeUpperBound},${interest.path.join(' > ')},${interest.topic},${interest.category}`
    );

    const csvContent = `Name,Audience Size Lower,Audience Size Upper,Path,Topic,Category\n${csvRows.join('\n')}`;

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

    const response = await axios.post<OpenAIResponse>(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        }
      }
    );

    const content = response.data.choices[0].message.content;

    // Extract the JSON portion from the GPT response
    try {
      // Find the JSON object in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisResult = JSON.parse(jsonMatch[0]) as GPTInterestAnalysisResponse;
        return analysisResult.interests;
      } else {
        throw new Error('Failed to extract JSON from GPT response');
      }
    } catch (parseError) {
      console.error('Error parsing GPT analysis response:', parseError);
      throw parseError;
    }
  } catch (error) {
    console.error('Error analyzing interests with GPT:', error);
    throw error;
  }
};
