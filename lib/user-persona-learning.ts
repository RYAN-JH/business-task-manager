// 일반 사용자 페르소나 학습 시스템

export interface UserPersonaProfile {
  userId: string;
  version: string;
  lastUpdated: string;
  learningStage: 'initial' | 'developing' | 'mature' | 'advanced';
  
  // 사용자 특성
  userCharacteristics: {
    communicationPreferences: {
      preferredTone: 'formal' | 'casual' | 'friendly' | 'professional';
      responseLength: 'brief' | 'detailed' | 'comprehensive';
      explanationLevel: 'basic' | 'intermediate' | 'advanced';
      examplePreference: boolean;
    };
    
    interactionPatterns: {
      questionTypes: string[]; // 주로 묻는 질문 유형
      topicInterests: string[]; // 관심 주제
      sessionLength: number; // 평균 세션 길이
      timeOfUse: string[]; // 주로 사용하는 시간대
    };
    
    learningStyle: {
      prefersStepByStep: boolean;
      likesVisualExamples: boolean;
      needsRepeatedExplanations: boolean;
      learnsFromMistakes: boolean;
    };
    
    businessContext: {
      industry?: string;
      role?: string;
      experienceLevel: 'beginner' | 'intermediate' | 'expert';
      primaryGoals: string[];
      currentChallenges: string[];
    };
  };
  
  // 선호하는 페르소나
  personaAffinities: {
    'moment.ryan': {
      affinityScore: number; // 0-1
      successfulInteractions: number;
      preferredTopics: string[];
      satisfactionRating: number;
    };
    'atozit': {
      affinityScore: number;
      successfulInteractions: number;
      preferredTopics: string[];
      satisfactionRating: number;
    };
  };
  
  // 학습 메타데이터
  learningMetadata: {
    totalInteractions: number;
    totalSessions: number;
    averageSatisfaction: number;
    improvementAreas: string[];
    strongPoints: string[];
    lastMajorUpdate: string;
  };
}

export interface UserInteraction {
  id: string;
  userId: string;
  sessionId: string;
  personaUsed: 'moment.ryan' | 'atozit';
  userMessage: string;
  aiResponse: string;
  userFeedback?: {
    helpful: boolean;
    rating: number; // 1-5
    comment?: string;
    improvementSuggestions?: string[];
  };
  interactionMetrics: {
    responseTime: number;
    messageLength: number;
    complexity: 'low' | 'medium' | 'high';
    topicCategory: string;
    satisfactionPrediction: number; // 0-1
  };
  timestamp: string;
  learningInsights?: any;
}

export interface UserLearningGoal {
  id: string;
  userId: string;
  goalType: 'skill_development' | 'problem_solving' | 'knowledge_building' | 'decision_support';
  description: string;
  targetPersona?: 'moment.ryan' | 'atozit';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'achieved' | 'paused';
  progressMetrics: {
    currentLevel: number; // 0-100
    milestones: any[];
    blockers: string[];
  };
  createdAt: string;
  targetDate?: string;
}

export class UserPersonaLearningService {
  
  // 사용자 페르소나 프로필 초기화
  static async initializeUserProfile(userId: string): Promise<UserPersonaProfile> {
    const now = new Date().toISOString();
    
    const profile: UserPersonaProfile = {
      userId,
      version: '1.0.0',
      lastUpdated: now,
      learningStage: 'initial',
      
      userCharacteristics: {
        communicationPreferences: {
          preferredTone: 'friendly',
          responseLength: 'detailed',
          explanationLevel: 'intermediate',
          examplePreference: true
        },
        
        interactionPatterns: {
          questionTypes: [],
          topicInterests: [],
          sessionLength: 0,
          timeOfUse: []
        },
        
        learningStyle: {
          prefersStepByStep: true,
          likesVisualExamples: true,
          needsRepeatedExplanations: false,
          learnsFromMistakes: true
        },
        
        businessContext: {
          experienceLevel: 'beginner',
          primaryGoals: [],
          currentChallenges: []
        }
      },
      
      personaAffinities: {
        'moment.ryan': {
          affinityScore: 0.5,
          successfulInteractions: 0,
          preferredTopics: [],
          satisfactionRating: 0
        },
        'atozit': {
          affinityScore: 0.5,
          successfulInteractions: 0,
          preferredTopics: [],
          satisfactionRating: 0
        }
      },
      
      learningMetadata: {
        totalInteractions: 0,
        totalSessions: 0,
        averageSatisfaction: 0,
        improvementAreas: [],
        strongPoints: [],
        lastMajorUpdate: now
      }
    };

    console.log(`👤 사용자 페르소나 프로필 초기화: ${userId}`);
    return profile;
  }

  // 사용자 상호작용 기록 및 학습
  static async recordUserInteraction(interaction: UserInteraction): Promise<void> {
    try {
      // 상호작용 기록 저장
      await this.saveInteractionRecord(interaction);
      
      // 사용자 프로필 업데이트
      await this.updateUserProfileFromInteraction(interaction);
      
      // 페르소나 친화도 조정
      await this.adjustPersonaAffinity(interaction);
      
      // 학습 인사이트 추출
      const insights = await this.extractUserLearningInsights(interaction);
      
      // 개인화 추천 업데이트
      await this.updatePersonalizationRecommendations(interaction.userId, insights);
      
      console.log(`📝 사용자 상호작용 기록: ${interaction.userId} - ${interaction.personaUsed}`);
    } catch (error) {
      console.error('사용자 상호작용 기록 실패:', error);
    }
  }

  // 사용자 맞춤 페르소나 추천
  static async recommendPersonaForUser(
    userId: string, 
    userMessage: string,
    currentContext?: any
  ): Promise<{
    recommendedPersona: 'moment.ryan' | 'atozit';
    confidence: number;
    reason: string;
    alternativeOption?: 'moment.ryan' | 'atozit';
  }> {
    try {
      const userProfile = await this.loadUserProfile(userId);
      
      // 메시지 의도 분석
      const messageAnalysis = await this.analyzeUserMessage(userMessage);
      
      // 페르소나 친화도 기반 추천
      const affinityScores = userProfile.personaAffinities;
      
      // 토픽 기반 점수 계산
      const topicScores = this.calculateTopicBasedScores(messageAnalysis.topics, userProfile);
      
      // 사용자 선호도 기반 점수
      const preferenceScores = this.calculatePreferenceScores(messageAnalysis, userProfile);
      
      // 종합 점수 계산
      const finalScores = {
        'moment.ryan': (
          affinityScores['moment.ryan'].affinityScore * 0.4 +
          topicScores['moment.ryan'] * 0.3 +
          preferenceScores['moment.ryan'] * 0.3
        ),
        'atozit': (
          affinityScores['atozit'].affinityScore * 0.4 +
          topicScores['atozit'] * 0.3 +
          preferenceScores['atozit'] * 0.3
        )
      };
      
      const recommendedPersona = finalScores['moment.ryan'] > finalScores['atozit'] 
        ? 'moment.ryan' 
        : 'atozit';
      
      const confidence = Math.max(finalScores['moment.ryan'], finalScores['atozit']);
      const alternativeOption = recommendedPersona === 'moment.ryan' ? 'atozit' : 'moment.ryan';
      
      const reason = this.generateRecommendationReason(
        recommendedPersona,
        messageAnalysis,
        userProfile
      );
      
      return {
        recommendedPersona,
        confidence: Math.min(0.95, Math.max(0.55, confidence)), // 55-95% 범위로 제한
        reason,
        alternativeOption: Math.abs(finalScores['moment.ryan'] - finalScores['atozit']) < 0.1 
          ? alternativeOption 
          : undefined
      };
    } catch (error) {
      console.error('사용자 맞춤 페르소나 추천 실패:', error);
      
      // 기본 추천
      return {
        recommendedPersona: 'moment.ryan',
        confidence: 0.6,
        reason: '기본 추천 (분석 오류 발생)'
      };
    }
  }

  // 사용자 피드백 처리
  static async processFeedback(
    userId: string,
    interactionId: string,
    feedback: {
      helpful: boolean;
      rating: number;
      comment?: string;
      improvementSuggestions?: string[];
    }
  ): Promise<void> {
    try {
      // 피드백 저장
      await this.saveFeedback(interactionId, feedback);
      
      // 사용자 프로필 업데이트
      await this.updateProfileFromFeedback(userId, feedback);
      
      // 페르소나 친화도 조정
      await this.adjustAffinityFromFeedback(userId, interactionId, feedback);
      
      // 부정적 피드백의 경우 개선 액션 계획
      if (!feedback.helpful || feedback.rating < 3) {
        await this.planImprovementActions(userId, feedback);
      }
      
      console.log(`👍 사용자 피드백 처리: ${userId} - 평점 ${feedback.rating}`);
    } catch (error) {
      console.error('사용자 피드백 처리 실패:', error);
    }
  }

  // 개인화된 응답 스타일 추천
  static async getPersonalizedResponseStyle(userId: string): Promise<{
    tone: string;
    length: string;
    complexity: string;
    includeExamples: boolean;
    structurePreferences: string[];
  }> {
    try {
      const userProfile = await this.loadUserProfile(userId);
      const prefs = userProfile.userCharacteristics.communicationPreferences;
      
      return {
        tone: prefs.preferredTone,
        length: prefs.responseLength,
        complexity: prefs.explanationLevel,
        includeExamples: prefs.examplePreference,
        structurePreferences: this.inferStructurePreferences(userProfile)
      };
    } catch (error) {
      console.error('개인화 스타일 조회 실패:', error);
      
      // 기본값 반환
      return {
        tone: 'friendly',
        length: 'detailed',
        complexity: 'intermediate',
        includeExamples: true,
        structurePreferences: ['step-by-step', 'examples', 'summary']
      };
    }
  }

  // 사용자 학습 목표 설정
  static async setUserLearningGoal(
    userId: string,
    goal: Omit<UserLearningGoal, 'id' | 'userId' | 'createdAt' | 'progressMetrics'>
  ): Promise<string> {
    try {
      const goalId = this.generateId();
      const now = new Date().toISOString();
      
      const learningGoal: UserLearningGoal = {
        id: goalId,
        userId,
        ...goal,
        progressMetrics: {
          currentLevel: 0,
          milestones: [],
          blockers: []
        },
        createdAt: now
      };
      
      // 실제로는 데이터베이스에 저장
      console.log(`🎯 사용자 학습 목표 설정: ${userId} - ${goal.description}`);
      
      return goalId;
    } catch (error) {
      console.error('학습 목표 설정 실패:', error);
      throw error;
    }
  }

  // 학습 진행도 업데이트
  static async updateLearningProgress(
    userId: string,
    goalId: string,
    progressData: {
      currentLevel?: number;
      newMilestone?: any;
      blocker?: string;
    }
  ): Promise<void> {
    try {
      // 실제로는 데이터베이스 업데이트
      console.log(`📈 학습 진행도 업데이트: ${userId} - ${goalId}`);
      
      // 목표 달성 확인
      if (progressData.currentLevel && progressData.currentLevel >= 100) {
        await this.celebrateGoalAchievement(userId, goalId);
      }
    } catch (error) {
      console.error('학습 진행도 업데이트 실패:', error);
    }
  }

  // 사용자 성장 분석
  static async analyzeUserGrowth(userId: string): Promise<{
    overallProgress: number;
    strongAreas: string[];
    improvementAreas: string[];
    recommendedActions: string[];
    nextMilestones: any[];
  }> {
    try {
      const userProfile = await this.loadUserProfile(userId);
      const recentInteractions = await this.getRecentInteractions(userId, 50);
      
      // 성장 지표 계산
      const growthMetrics = this.calculateGrowthMetrics(userProfile, recentInteractions);
      
      return {
        overallProgress: growthMetrics.overallScore,
        strongAreas: growthMetrics.strengths,
        improvementAreas: userProfile.learningMetadata.improvementAreas,
        recommendedActions: this.generateActionRecommendations(growthMetrics),
        nextMilestones: this.suggestNextMilestones(userProfile, growthMetrics)
      };
    } catch (error) {
      console.error('사용자 성장 분석 실패:', error);
      return {
        overallProgress: 0,
        strongAreas: [],
        improvementAreas: [],
        recommendedActions: [],
        nextMilestones: []
      };
    }
  }

  // 헬퍼 메서드들
  private static async saveInteractionRecord(interaction: UserInteraction): Promise<void> {
    // 실제로는 데이터베이스에 저장
    console.log(`💾 상호작용 기록 저장: ${interaction.id}`);
  }

  private static async updateUserProfileFromInteraction(interaction: UserInteraction): Promise<void> {
    try {
      const userProfile = await this.loadUserProfile(interaction.userId);
      
      // 상호작용 패턴 업데이트
      userProfile.userCharacteristics.interactionPatterns.questionTypes = 
        this.updateQuestionTypes(userProfile.userCharacteristics.interactionPatterns.questionTypes, interaction);
      
      // 토픽 관심사 업데이트
      userProfile.userCharacteristics.interactionPatterns.topicInterests = 
        this.updateTopicInterests(userProfile.userCharacteristics.interactionPatterns.topicInterests, interaction);
      
      // 메타데이터 업데이트
      userProfile.learningMetadata.totalInteractions += 1;
      userProfile.lastUpdated = new Date().toISOString();
      
      await this.saveUserProfile(userProfile);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    }
  }

  private static async adjustPersonaAffinity(interaction: UserInteraction): Promise<void> {
    if (!interaction.userFeedback) return;
    
    const userProfile = await this.loadUserProfile(interaction.userId);
    const persona = interaction.personaUsed;
    const feedback = interaction.userFeedback;
    
    // 피드백 기반 친화도 조정
    const currentAffinity = userProfile.personaAffinities[persona];
    const adjustment = this.calculateAffinityAdjustment(feedback);
    
    currentAffinity.affinityScore = Math.max(0, Math.min(1, 
      currentAffinity.affinityScore + adjustment
    ));
    
    if (feedback.helpful) {
      currentAffinity.successfulInteractions += 1;
    }
    
    currentAffinity.satisfactionRating = 
      (currentAffinity.satisfactionRating + feedback.rating) / 2;
    
    await this.saveUserProfile(userProfile);
  }

  private static async analyzeUserMessage(message: string): Promise<any> {
    // 실제로는 NLP 분석
    return {
      intent: 'information_seeking',
      topics: ['marketing', 'strategy'],
      complexity: 'medium',
      urgency: 'normal',
      emotionalTone: 'neutral'
    };
  }

  private static calculateTopicBasedScores(
    topics: string[], 
    userProfile: UserPersonaProfile
  ): { 'moment.ryan': number; 'atozit': number } {
    const momentRyanTopics = ['marketing', 'content', 'sns', 'social', 'campaign'];
    const atozitTopics = ['branding', 'customer', 'business', 'strategy', 'management'];
    
    const momentScore = topics.reduce((score, topic) => 
      score + (momentRyanTopics.some(mt => topic.includes(mt)) ? 0.2 : 0), 0
    );
    
    const atozitScore = topics.reduce((score, topic) => 
      score + (atozitTopics.some(at => topic.includes(at)) ? 0.2 : 0), 0
    );
    
    return {
      'moment.ryan': Math.min(1, momentScore),
      'atozit': Math.min(1, atozitScore)
    };
  }

  private static calculatePreferenceScores(
    messageAnalysis: any,
    userProfile: UserPersonaProfile
  ): { 'moment.ryan': number; 'atozit': number } {
    // 사용자 선호도 기반 점수 계산
    const prefs = userProfile.userCharacteristics.communicationPreferences;
    
    // moment.ryan은 casual, friendly 톤 선호
    const momentScore = (prefs.preferredTone === 'casual' || prefs.preferredTone === 'friendly') ? 0.2 : 0;
    
    // atozit은 formal, professional 톤 선호
    const atozitScore = (prefs.preferredTone === 'formal' || prefs.preferredTone === 'professional') ? 0.2 : 0;
    
    return {
      'moment.ryan': momentScore,
      'atozit': atozitScore
    };
  }

  private static generateRecommendationReason(
    persona: 'moment.ryan' | 'atozit',
    messageAnalysis: any,
    userProfile: UserPersonaProfile
  ): string {
    const reasons = [];
    
    if (userProfile.personaAffinities[persona].affinityScore > 0.7) {
      reasons.push(`${persona}와의 높은 호환성`);
    }
    
    if (messageAnalysis.topics.some((t: string) => 
      (persona === 'moment.ryan' && ['marketing', 'content', 'sns'].includes(t)) ||
      (persona === 'atozit' && ['branding', 'business', 'strategy'].includes(t))
    )) {
      reasons.push('질문 주제와의 전문성 일치');
    }
    
    return reasons.length > 0 
      ? reasons.join(', ') 
      : `${persona} 페르소나가 적합한 것으로 판단됩니다`;
  }

  private static async loadUserProfile(userId: string): Promise<UserPersonaProfile> {
    // 실제로는 데이터베이스에서 로드
    return this.initializeUserProfile(userId);
  }

  private static async saveUserProfile(profile: UserPersonaProfile): Promise<void> {
    // 실제로는 데이터베이스에 저장
    console.log(`💾 사용자 프로필 저장: ${profile.userId}`);
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // 기타 헬퍼 메서드들
  private static updateQuestionTypes(current: string[], interaction: UserInteraction): string[] {
    // 질문 유형 업데이트 로직
    return current;
  }

  private static updateTopicInterests(current: string[], interaction: UserInteraction): string[] {
    // 토픽 관심사 업데이트 로직
    return current;
  }

  private static calculateAffinityAdjustment(feedback: any): number {
    return feedback.helpful ? 0.1 : -0.05;
  }

  private static inferStructurePreferences(profile: UserPersonaProfile): string[] {
    return ['step-by-step', 'examples', 'summary'];
  }

  private static async saveFeedback(interactionId: string, feedback: any): Promise<void> {
    console.log(`📝 피드백 저장: ${interactionId}`);
  }

  private static async updateProfileFromFeedback(userId: string, feedback: any): Promise<void> {
    console.log(`📊 피드백 기반 프로필 업데이트: ${userId}`);
  }

  private static async adjustAffinityFromFeedback(userId: string, interactionId: string, feedback: any): Promise<void> {
    console.log(`⚖️ 피드백 기반 친화도 조정: ${userId}`);
  }

  private static async planImprovementActions(userId: string, feedback: any): Promise<void> {
    console.log(`🔧 개선 액션 계획: ${userId}`);
  }

  private static async celebrateGoalAchievement(userId: string, goalId: string): Promise<void> {
    console.log(`🎉 목표 달성 축하: ${userId} - ${goalId}`);
  }

  private static async getRecentInteractions(userId: string, limit: number): Promise<UserInteraction[]> {
    return [];
  }

  private static calculateGrowthMetrics(profile: UserPersonaProfile, interactions: UserInteraction[]): any {
    return {
      overallScore: 0.7,
      strengths: ['communication', 'learning']
    };
  }

  private static generateActionRecommendations(metrics: any): string[] {
    return ['더 많은 실습', '피드백 제공', '목표 설정'];
  }

  private static suggestNextMilestones(profile: UserPersonaProfile, metrics: any): any[] {
    return [
      { title: '중급 수준 달성', progress: 60 },
      { title: '전문성 강화', progress: 30 }
    ];
  }

  private static async extractUserLearningInsights(interaction: UserInteraction): Promise<any> {
    return {
      learningPatterns: [],
      preferences: {},
      improvements: []
    };
  }

  private static async updatePersonalizationRecommendations(userId: string, insights: any): Promise<void> {
    console.log(`🎯 개인화 추천 업데이트: ${userId}`);
  }
}