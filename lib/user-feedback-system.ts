// 사용자 피드백 및 만족도 관리 시스템

export interface FeedbackData {
  id: string;
  userId: string;
  interactionId: string;
  sessionId: string;
  personaUsed: 'moment.ryan' | 'atozit';
  
  // 피드백 내용
  rating: number; // 1-5 점수
  helpful: boolean;
  accuracy: number; // 1-5, 응답의 정확도
  relevance: number; // 1-5, 응답의 관련성
  clarity: number; // 1-5, 응답의 명확성
  
  // 텍스트 피드백
  comment?: string;
  improvementSuggestions?: string[];
  positiveAspects?: string[];
  
  // 구체적 피드백 카테고리
  feedbackCategories: {
    responseQuality: 'excellent' | 'good' | 'average' | 'poor';
    personaAccuracy: 'perfect' | 'good' | 'acceptable' | 'poor';
    helpfulness: 'very_helpful' | 'helpful' | 'somewhat' | 'not_helpful';
    responseTime: 'fast' | 'acceptable' | 'slow';
  };
  
  // 메타데이터
  timestamp: string;
  deviceType?: string;
  sessionDuration?: number;
  userContext?: any;
}

export interface UserSatisfactionMetrics {
  userId: string;
  
  // 전체 만족도 지표
  overallSatisfaction: number; // 0-1
  totalFeedbacks: number;
  averageRating: number;
  
  // 페르소나별 만족도
  personaSatisfaction: {
    'moment.ryan': {
      averageRating: number;
      totalInteractions: number;
      satisfactionTrend: number[]; // 최근 트렌드
      strongPoints: string[];
      weakPoints: string[];
    };
    'atozit': {
      averageRating: number;
      totalInteractions: number;
      satisfactionTrend: number[];
      strongPoints: string[];
      weakPoints: string[];
    };
  };
  
  // 상세 메트릭
  detailedMetrics: {
    responseQuality: number;
    personaAccuracy: number;
    helpfulness: number;
    responseTime: number;
  };
  
  // 시간대별 만족도
  satisfactionByTime: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  
  // 토픽별 만족도
  satisfactionByTopic: Record<string, number>;
  
  lastUpdated: string;
}

export interface ImprovementAction {
  id: string;
  userId: string;
  type: 'persona_adjustment' | 'response_style' | 'content_quality' | 'system_improvement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  targetPersona?: 'moment.ryan' | 'atozit';
  
  // 액션 세부사항
  actionPlan: {
    shortTerm: string[]; // 즉시 적용 가능한 개선사항
    mediumTerm: string[]; // 중기 개선사항
    longTerm: string[]; // 장기 개선사항
  };
  
  // 성공 지표
  successMetrics: {
    targetRatingIncrease: number;
    targetSatisfactionIncrease: number;
    timeframe: string;
  };
  
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export class UserFeedbackSystem {
  
  // 피드백 수집 및 저장
  static async collectFeedback(feedbackData: Omit<FeedbackData, 'id' | 'timestamp'>): Promise<string> {
    try {
      const feedbackId = this.generateId();
      const timestamp = new Date().toISOString();
      
      const feedback: FeedbackData = {
        ...feedbackData,
        id: feedbackId,
        timestamp
      };
      
      // 피드백 데이터 저장
      await this.saveFeedback(feedback);
      
      // 실시간 분석 및 처리
      await this.processRealTimeFeedback(feedback);
      
      // 사용자 만족도 메트릭 업데이트
      await this.updateSatisfactionMetrics(feedback);
      
      // 부정적 피드백의 경우 즉시 대응
      if (feedback.rating <= 2 || !feedback.helpful) {
        await this.handleNegativeFeedback(feedback);
      }
      
      console.log(`📝 피드백 수집 완료: ${feedback.userId} - 평점 ${feedback.rating}`);
      
      return feedbackId;
    } catch (error) {
      console.error('피드백 수집 실패:', error);
      throw error;
    }
  }

  // 사용자 만족도 메트릭 조회
  static async getUserSatisfactionMetrics(userId: string): Promise<UserSatisfactionMetrics> {
    try {
      // 기존 메트릭 로드 또는 초기화
      let metrics = await this.loadSatisfactionMetrics(userId);
      
      if (!metrics) {
        metrics = await this.initializeSatisfactionMetrics(userId);
      }
      
      // 최신 데이터로 업데이트
      await this.refreshMetrics(metrics);
      
      return metrics;
    } catch (error) {
      console.error('만족도 메트릭 조회 실패:', error);
      
      // 기본 메트릭 반환
      return this.initializeSatisfactionMetrics(userId);
    }
  }

  // 피드백 기반 개선 액션 생성
  static async generateImprovementActions(userId: string): Promise<ImprovementAction[]> {
    try {
      const satisfactionMetrics = await this.getUserSatisfactionMetrics(userId);
      const recentFeedbacks = await this.getRecentFeedbacks(userId, 20);
      
      const actions: ImprovementAction[] = [];
      
      // 낮은 평점 영역 분석
      if (satisfactionMetrics.overallSatisfaction < 0.7) {
        actions.push(await this.createOverallImprovementAction(userId, satisfactionMetrics));
      }
      
      // 페르소나별 개선 액션
      for (const [persona, metrics] of Object.entries(satisfactionMetrics.personaSatisfaction)) {
        if (metrics.averageRating < 3.5) {
          actions.push(await this.createPersonaImprovementAction(
            userId, 
            persona as 'moment.ryan' | 'atozit', 
            metrics
          ));
        }
      }
      
      // 반복적인 불만사항 분석
      const commonIssues = this.analyzeCommonIssues(recentFeedbacks);
      for (const issue of commonIssues) {
        actions.push(await this.createIssueBasedAction(userId, issue));
      }
      
      // 우선순위 정렬
      actions.sort((a, b) => {
        const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      console.log(`🔧 개선 액션 생성: ${userId} - ${actions.length}개 액션`);
      
      return actions;
    } catch (error) {
      console.error('개선 액션 생성 실패:', error);
      return [];
    }
  }

  // 실시간 피드백 분석 및 알림
  static async processRealTimeFeedback(feedback: FeedbackData): Promise<void> {
    try {
      // 피드백 패턴 분석
      const pattern = await this.analyzeFeedbackPattern(feedback);
      
      // 긍정적 피드백 처리
      if (feedback.rating >= 4 && feedback.helpful) {
        await this.handlePositiveFeedback(feedback, pattern);
      }
      
      // 중립적 피드백 처리
      if (feedback.rating === 3) {
        await this.handleNeutralFeedback(feedback, pattern);
      }
      
      // 트렌드 분석
      await this.updateSatisfactionTrends(feedback);
      
      console.log(`⚡ 실시간 피드백 처리: ${feedback.rating}점 - ${feedback.personaUsed}`);
    } catch (error) {
      console.error('실시간 피드백 처리 실패:', error);
    }
  }

  // 피드백 기반 개인화 추천
  static async getPersonalizationRecommendations(userId: string): Promise<{
    responseStyle: any;
    personaPreference: any;
    contentAdjustments: any;
    interactionPattern: any;
  }> {
    try {
      const metrics = await this.getUserSatisfactionMetrics(userId);
      const feedbacks = await this.getRecentFeedbacks(userId, 50);
      
      return {
        responseStyle: this.analyzePreferredResponseStyle(feedbacks),
        personaPreference: this.analyzePersonaPreference(metrics),
        contentAdjustments: this.analyzeContentPreferences(feedbacks),
        interactionPattern: this.analyzeInteractionPreferences(feedbacks)
      };
    } catch (error) {
      console.error('개인화 추천 생성 실패:', error);
      return {
        responseStyle: {},
        personaPreference: {},
        contentAdjustments: {},
        interactionPattern: {}
      };
    }
  }

  // 만족도 예측 모델
  static async predictUserSatisfaction(
    userId: string,
    proposedResponse: string,
    context: any
  ): Promise<{
    predictedRating: number;
    confidence: number;
    riskFactors: string[];
    recommendations: string[];
  }> {
    try {
      const userHistory = await this.getUserFeedbackHistory(userId);
      const metrics = await this.getUserSatisfactionMetrics(userId);
      
      // 간단한 예측 모델 (실제로는 ML 모델 사용)
      const baseScore = metrics.overallSatisfaction * 5;
      const contextAdjustment = this.calculateContextAdjustment(context, userHistory);
      const responseQualityScore = this.assessResponseQuality(proposedResponse);
      
      const predictedRating = Math.min(5, Math.max(1, 
        baseScore * 0.4 + contextAdjustment * 0.3 + responseQualityScore * 0.3
      ));
      
      const confidence = this.calculatePredictionConfidence(userHistory.length, metrics);
      const riskFactors = this.identifyRiskFactors(proposedResponse, context, userHistory);
      const recommendations = this.generateResponseRecommendations(riskFactors, metrics);
      
      return {
        predictedRating,
        confidence,
        riskFactors,
        recommendations
      };
    } catch (error) {
      console.error('만족도 예측 실패:', error);
      return {
        predictedRating: 3.0,
        confidence: 0.5,
        riskFactors: [],
        recommendations: []
      };
    }
  }

  // 헬퍼 메서드들
  private static async saveFeedback(feedback: FeedbackData): Promise<void> {
    // 실제로는 데이터베이스에 저장
    console.log(`💾 피드백 저장: ${feedback.id}`);
  }

  private static async processRealTimeFeedback(feedback: FeedbackData): Promise<void> {
    // 실시간 피드백 처리 로직
    console.log(`⚡ 실시간 처리: ${feedback.id}`);
  }

  private static async updateSatisfactionMetrics(feedback: FeedbackData): Promise<void> {
    // 만족도 메트릭 업데이트
    console.log(`📊 메트릭 업데이트: ${feedback.userId}`);
  }

  private static async handleNegativeFeedback(feedback: FeedbackData): Promise<void> {
    // 부정적 피드백 즉시 대응
    console.log(`🚨 부정적 피드백 처리: ${feedback.id} - 평점 ${feedback.rating}`);
    
    // 즉시 개선 액션 생성
    const urgentAction = await this.createUrgentImprovementAction(feedback);
    
    // 알림 발송 (실제 구현에서는 관리자 알림)
    console.log(`📢 긴급 알림: 사용자 ${feedback.userId} 불만족 피드백`);
  }

  private static async handlePositiveFeedback(feedback: FeedbackData, pattern: any): Promise<void> {
    // 긍정적 피드백 처리 - 성공 패턴 학습
    console.log(`👍 긍정적 피드백 처리: ${feedback.id}`);
    
    // 성공 패턴을 다른 사용자에게도 적용할 수 있도록 학습
    await this.learnFromSuccessPattern(feedback, pattern);
  }

  private static async handleNeutralFeedback(feedback: FeedbackData, pattern: any): Promise<void> {
    // 중립적 피드백 처리 - 개선 기회 탐색
    console.log(`😐 중립적 피드백 처리: ${feedback.id}`);
  }

  private static async loadSatisfactionMetrics(userId: string): Promise<UserSatisfactionMetrics | null> {
    // 실제로는 데이터베이스에서 로드
    return null;
  }

  private static async initializeSatisfactionMetrics(userId: string): Promise<UserSatisfactionMetrics> {
    const now = new Date().toISOString();
    
    return {
      userId,
      overallSatisfaction: 0.5,
      totalFeedbacks: 0,
      averageRating: 0,
      
      personaSatisfaction: {
        'moment.ryan': {
          averageRating: 0,
          totalInteractions: 0,
          satisfactionTrend: [],
          strongPoints: [],
          weakPoints: []
        },
        'atozit': {
          averageRating: 0,
          totalInteractions: 0,
          satisfactionTrend: [],
          strongPoints: [],
          weakPoints: []
        }
      },
      
      detailedMetrics: {
        responseQuality: 0,
        personaAccuracy: 0,
        helpfulness: 0,
        responseTime: 0
      },
      
      satisfactionByTime: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      },
      
      satisfactionByTopic: {},
      
      lastUpdated: now
    };
  }

  private static async refreshMetrics(metrics: UserSatisfactionMetrics): Promise<void> {
    // 최신 피드백 데이터를 반영하여 메트릭 업데이트
    console.log(`🔄 메트릭 새로고침: ${metrics.userId}`);
  }

  private static async getRecentFeedbacks(userId: string, limit: number): Promise<FeedbackData[]> {
    // 실제로는 데이터베이스에서 조회
    return [];
  }

  private static async createOverallImprovementAction(
    userId: string, 
    metrics: UserSatisfactionMetrics
  ): Promise<ImprovementAction> {
    return {
      id: this.generateId(),
      userId,
      type: 'system_improvement',
      priority: 'high',
      description: '전반적인 사용자 만족도 개선',
      actionPlan: {
        shortTerm: ['응답 품질 향상', '개인화 강화'],
        mediumTerm: ['페르소나 정확도 개선'],
        longTerm: ['AI 모델 재훈련']
      },
      successMetrics: {
        targetRatingIncrease: 0.5,
        targetSatisfactionIncrease: 0.2,
        timeframe: '1개월'
      },
      status: 'planned',
      createdAt: new Date().toISOString()
    };
  }

  private static async createPersonaImprovementAction(
    userId: string,
    persona: 'moment.ryan' | 'atozit',
    metrics: any
  ): Promise<ImprovementAction> {
    return {
      id: this.generateId(),
      userId,
      type: 'persona_adjustment',
      priority: 'medium',
      description: `${persona} 페르소나 성능 개선`,
      targetPersona: persona,
      actionPlan: {
        shortTerm: ['응답 스타일 조정'],
        mediumTerm: ['전문성 강화'],
        longTerm: ['페르소나 특성 재정의']
      },
      successMetrics: {
        targetRatingIncrease: 0.3,
        targetSatisfactionIncrease: 0.15,
        timeframe: '2주'
      },
      status: 'planned',
      createdAt: new Date().toISOString()
    };
  }

  private static async createIssueBasedAction(userId: string, issue: any): Promise<ImprovementAction> {
    return {
      id: this.generateId(),
      userId,
      type: 'content_quality',
      priority: 'medium',
      description: `반복 이슈 해결: ${issue.type}`,
      actionPlan: {
        shortTerm: [issue.quickFix],
        mediumTerm: [issue.mediumFix],
        longTerm: [issue.longTermFix]
      },
      successMetrics: {
        targetRatingIncrease: 0.2,
        targetSatisfactionIncrease: 0.1,
        timeframe: '1주'
      },
      status: 'planned',
      createdAt: new Date().toISOString()
    };
  }

  private static async createUrgentImprovementAction(feedback: FeedbackData): Promise<ImprovementAction> {
    return {
      id: this.generateId(),
      userId: feedback.userId,
      type: 'system_improvement',
      priority: 'critical',
      description: '긴급 사용자 불만족 해결',
      actionPlan: {
        shortTerm: ['즉시 사과 및 대안 제시', '문제 상황 분석'],
        mediumTerm: ['근본 원인 해결'],
        longTerm: ['재발 방지 시스템 구축']
      },
      successMetrics: {
        targetRatingIncrease: 1.0,
        targetSatisfactionIncrease: 0.3,
        timeframe: '즉시'
      },
      status: 'in_progress',
      createdAt: new Date().toISOString()
    };
  }

  private static analyzeCommonIssues(feedbacks: FeedbackData[]): any[] {
    // 공통 이슈 분석
    return [];
  }

  private static async analyzeFeedbackPattern(feedback: FeedbackData): Promise<any> {
    // 피드백 패턴 분석
    return {};
  }

  private static async updateSatisfactionTrends(feedback: FeedbackData): Promise<void> {
    // 만족도 트렌드 업데이트
    console.log(`📈 트렌드 업데이트: ${feedback.personaUsed}`);
  }

  private static async learnFromSuccessPattern(feedback: FeedbackData, pattern: any): Promise<void> {
    // 성공 패턴 학습
    console.log(`🎓 성공 패턴 학습: ${feedback.id}`);
  }

  private static analyzePreferredResponseStyle(feedbacks: FeedbackData[]): any {
    return { tone: 'friendly', length: 'detailed' };
  }

  private static analyzePersonaPreference(metrics: UserSatisfactionMetrics): any {
    return { preferred: 'moment.ryan', confidence: 0.8 };
  }

  private static analyzeContentPreferences(feedbacks: FeedbackData[]): any {
    return { includeExamples: true, structuredFormat: true };
  }

  private static analyzeInteractionPreferences(feedbacks: FeedbackData[]): any {
    return { preferredSessionLength: 15, optimalResponseTime: 3 };
  }

  private static async getUserFeedbackHistory(userId: string): Promise<FeedbackData[]> {
    return [];
  }

  private static calculateContextAdjustment(context: any, history: FeedbackData[]): number {
    return 0.5; // 임시값
  }

  private static assessResponseQuality(response: string): number {
    return response.length > 100 ? 4.0 : 3.0; // 간단한 품질 평가
  }

  private static calculatePredictionConfidence(historyLength: number, metrics: UserSatisfactionMetrics): number {
    return Math.min(0.9, historyLength * 0.1);
  }

  private static identifyRiskFactors(response: string, context: any, history: FeedbackData[]): string[] {
    const risks = [];
    if (response.length < 50) risks.push('응답이 너무 짧음');
    if (!response.includes('예')) risks.push('구체적 예시 부족');
    return risks;
  }

  private static generateResponseRecommendations(riskFactors: string[], metrics: UserSatisfactionMetrics): string[] {
    const recommendations = [];
    if (riskFactors.includes('응답이 너무 짧음')) {
      recommendations.push('더 상세한 설명 추가');
    }
    return recommendations;
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}