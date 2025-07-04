
export interface BusinessFormData {
  productName: string;
  category: string;
  productDescription: string;
  location: string;
  promotionGoal: string;
  targetAudience: string;
  contactEmail: string;
}

export interface MetaInterest {
  name: string;
  audienceSizeLowerBound: number;
  audienceSizeUpperBound: number;
  path: string[];
  topic: string;
  relevanceScore: number;
  category: string;
  rank: number;
}

export interface InterestAnalysis {
  topInterests: MetaInterest[];
  totalInterestsFound: number;
  averageAudienceSize: number;
  recommendedBudget: string;
}

// API Response Types
export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface MetaAPIResponse {
  data: {
    id: string;
    name: string;
    audience_size_lower_bound: number;
    audience_size_upper_bound: number;
    path: string[];
    topic: string;
    disambiguation_category: string;
  }[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
  };
}

export interface MetaRawInterest {
  name: string;
  audienceSizeLowerBound: number;
  audienceSizeUpperBound: number;
  path: string[];
  topic: string;
  category: string;
}

export interface GPTAnalysisRequest {
  businessData: BusinessFormData;
  interests: MetaRawInterest[];
}

export interface GPTInterestAnalysisResponse {
  interests: MetaInterest[];
}
