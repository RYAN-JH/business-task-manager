// 확장된 프로필 정보 타입 정의

export interface BusinessOperationDetails {
  // 매출 & 규모
  monthlyRevenue?: {
    range: string; // "100만원 미만" | "100-500만원" | "500-1000만원" | "1000만원 이상"
    lastUpdated?: string;
  };
  employeeCount?: number;
  organizationStructure?: string;
  operationPeriod?: string; // "6개월 미만" | "6개월-1년" | "1-3년" | "3년 이상"
  growthRate?: {
    monthly?: number;
    yearly?: number;
  };
  mainRevenueSource?: {
    source: string;
    percentage: number;
  }[];
}

export interface CustomerDetails {
  ageDistribution?: {
    "20대": number;
    "30대": number;
    "40대": number;
    "50대 이상": number;
  };
  genderDistribution?: {
    male: number;
    female: number;
    other: number;
  };
  incomeLevel?: string; // "하" | "중하" | "중" | "중상" | "상"
  location?: string[];
  occupations?: string[];
  purchaseFrequency?: string;
  averageOrderValue?: number;
  customerLifetimeValue?: number;
  repurchaseRate?: number;
  referralRate?: number;
}

export interface SalesDistribution {
  mainChannels?: {
    online: number;
    offline: number;
  };
  platforms?: {
    name: string;
    percentage: number;
  }[];
  distributorRelations?: string;
  inventoryManagement?: string;
  logistics?: string;
}

export interface MarketingInfo {
  monthlyBudget?: number;
  budgetAllocation?: {
    channel: string;
    percentage: number;
  }[];
  customerAcquisitionCost?: number;
  returnOnAdSpend?: number;
  currentPlatforms?: string[];
  marketingStaff?: number;
}

export interface BrandIdentity {
  brandStory?: string;
  foundingMotivation?: string;
  mission?: string;
  problemSolved?: string;
  differentiation?: string;
  perceivedImage?: string;
  targetPositioning?: string;
  slogan?: string;
}

export interface CustomerRelationship {
  mainFeedback?: string[];
  complaints?: string[];
  compliments?: string[];
  communityManagement?: boolean;
  customerServiceStyle?: string;
  retentionStrategy?: string;
}

export interface ContentSocialMedia {
  platforms?: {
    name: string;
    followers: number;
    avgViews: number;
    avgLikes: number;
  }[];
  bestContentType?: string;
  publishingSchedule?: string;
  contentCreator?: string;
  preferredFormat?: "video" | "image" | "text" | "mixed";
  toneAndManner?: string;
  commonTopics?: string[];
  avoidedTopics?: string[];
  creationTools?: string[];
  internalVsOutsourced?: {
    internal: number;
    outsourced: number;
  };
}

export interface AudienceAnalysis {
  followerAgeDistribution?: {
    "10대": number;
    "20대": number;
    "30대": number;
    "40대": number;
    "50대 이상": number;
  };
  followerInterests?: string[];
  activeHours?: string[];
  bestPerformingContent?: string;
  engagementPatterns?: string;
  influencerCollaboration?: boolean;
}

export interface PersonalCharacteristics {
  personalityType?: string; // MBTI, DISC 등
  communicationStyle?: string;
  learningStyle?: "visual" | "auditory" | "kinesthetic" | "mixed";
  decisionMaking?: "quick" | "thorough" | "mixed";
  stressHandling?: string;
  motivationFactors?: string[];
}

export interface WorkStyle {
  peakHours?: string;
  preferredEnvironment?: string;
  workStyle?: "multitasking" | "focused" | "mixed";
  planningStyle?: "planned" | "spontaneous" | "mixed";
  collaborationPreference?: "solo" | "collaborative" | "mixed";
  feedbackStyle?: string;
}

export interface ExpertiseCapability {
  strengths?: string[];
  improvementAreas?: string[];
  learningGoals?: string[];
  mentoringNeeds?: string[];
  successFailures?: string;
  roleModels?: string[];
}

export interface OrganizationTeam {
  teamRoles?: {
    member: string;
    role: string;
  }[];
  decisionStructure?: string;
  communicationTools?: string[];
  meetingStyle?: string;
  performanceEvaluation?: string;
  teamCulture?: string;
}

export interface BusinessProcess {
  productDevelopment?: string;
  marketingProcess?: string;
  customerService?: string;
  qualityControl?: string;
  dataAnalysis?: string;
  automationLevel?: number;
}

export interface GoalsStrategy {
  businessGoals?: {
    oneYearRevenue?: number;
    threeYearVision?: string;
    expansionPlan?: string;
    investmentPlan?: string;
    mergersAcquisitions?: string;
    diversification?: string;
  };
  marketingGoals?: {
    brandAwareness?: string;
    customerGrowth?: number;
    conversionRate?: number;
    newChannels?: string[];
    internationalExpansion?: boolean;
    offlineExpansion?: boolean;
  };
  personalGoals?: {
    skillDevelopment?: string[];
    networking?: string;
    workLifeBalance?: string;
    revenueTarget?: number;
    socialImpact?: string;
    personalBranding?: string;
  };
}

export interface MarketCompetition {
  marketInfo?: {
    marketSize?: number;
    growthRate?: number;
    seasonality?: string;
    trends?: string[];
    regulations?: string[];
    techChanges?: string[];
  };
  competitorAnalysis?: {
    name: string;
    differentiation: string;
    marketingStrategy: string;
    strengths: string[];
    weaknesses: string[];
    marketShare: number;
    benchmarks: string[];
  }[];
}

export interface PerformanceMetrics {
  kpis?: {
    revenue?: string[];
    marketing?: string[];
    customerSatisfaction?: string[];
    brandAwareness?: string[];
    operational?: string[];
    employee?: string[];
  };
  dataUsage?: {
    collectedData?: string[];
    analysisTools?: string[];
    reportingFrequency?: string;
    decisionMakingLevel?: number;
    improvementAreas?: string[];
    externalSources?: string[];
  };
}

export interface InnovationTechnology {
  techAdoption?: {
    openness?: number;
    currentTools?: string[];
    automationWishlist?: string[];
    aiInterest?: number;
    cloudUsage?: number;
    newPlatformWillingness?: number;
  };
}

export interface ExtendedProfile {
  // 기존 기본 프로필 정보
  userId: string;
  name?: string;
  email?: string;
  businessName?: string;
  businessType?: string;
  industry?: string;
  experienceLevel?: string;
  goals?: string[];
  challenges?: string[];
  interests?: string[];
  lastUpdated: string;

  // AI 선호도 (기존 시스템과의 호환성)
  aiPreferences?: {
    preferredPersona?: string;
    communicationStyle?: string;
    responseLength?: string;
    formalityLevel?: string;
    includeExamples?: boolean;
    includeActionItems?: boolean;
  };

  // 확장된 프로필 정보
  businessOperation?: BusinessOperationDetails;
  customerDetails?: CustomerDetails;
  salesDistribution?: SalesDistribution;
  marketing?: MarketingInfo;
  brandIdentity?: BrandIdentity;
  customerRelationship?: CustomerRelationship;
  contentSocialMedia?: ContentSocialMedia;
  audienceAnalysis?: AudienceAnalysis;
  personalCharacteristics?: PersonalCharacteristics;
  workStyle?: WorkStyle;
  expertiseCapability?: ExpertiseCapability;
  organizationTeam?: OrganizationTeam;
  businessProcess?: BusinessProcess;
  goalsStrategy?: GoalsStrategy;
  marketCompetition?: MarketCompetition;
  performanceMetrics?: PerformanceMetrics;
  innovationTechnology?: InnovationTechnology;

  // 프로필 완성도 추적
  completionStatus?: {
    [key: string]: boolean;
  };
  completionPercentage?: number;
  
  // 🆕 "모르겠다" 답변 처리를 위한 임시 필드 (프로필에는 저장하지 않음)
  uncertaintyHandling?: {
    isUncertain: boolean;
    guidingQuestions: string[];
    contextualHints: string[];
    explorationDirection: string;
  };
}

// 프로필 정보 수집을 위한 질문 템플릿
export interface ProfileQuestion {
  category: string;
  field: string;
  question: string;
  followUpQuestions?: string[];
  priority: "high" | "medium" | "low";
  triggerContext?: string[]; // 어떤 대화 상황에서 이 질문을 해야 하는지
}

// 프로필 분석 결과
export interface ProfileAnalysis {
  missingFields: string[];
  incompleteSections: string[];
  priorityQuestions: ProfileQuestion[];
  recommendations: string[];
}