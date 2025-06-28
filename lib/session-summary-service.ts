// 세션 요약 및 학습 반영 서비스

import { ConversationSession, ConversationMessage, SessionSummary } from './conversation-manager';
import { PersonaLearningService } from './persona-learning-service';
import { UserPersonaLearningService } from './user-persona-learning';
import { isAdminUser, getAdminDisplayName } from './admin-utils';

export interface SessionAnalysisResult {
  sessionId: string;
  userId: string;
  isAdminSession: boolean;
  
  // 세션 기본 정보
  sessionMetrics: {
    duration: number; // 분 단위
    messageCount: number;
    averageMessageLength: number;
    conversationDepth: 'shallow' | 'medium' | 'deep';
    topicConsistency: number; // 0-1
  };
  
  // 내용 분석
  contentAnalysis: {
    mainTopics: string[];
    keyInsights: string[];
    discussedConcepts: string[];
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced';
    emotionalTone: 'positive' | 'neutral' | 'negative' | 'mixed';
  };
  
  // 학습 가치 평가
  learningValue: {
    overallScore: number; // 0-100
    knowledgeExtraction: number; // 0-100
    personalityInsights: number; // 0-100
    expertiseDiscovery: number; // 0-100
    writingPatterns: number; // 0-100
  };
  
  // 페르소나별 인사이트
  personaInsights: {
    personaType: 'moment.ryan' | 'atozit';
    strengthsRevealed: string[];
    improvementAreas: string[];
    newCharacteristics: string[];
    communicationPatterns: any;
  };
  
  // 사용자 학습 인사이트 (일반 사용자용)
  userLearningInsights?: {
    learningProgress: number;
    engagementLevel: 'low' | 'medium' | 'high';
    satisfactionPrediction: number;
    recommendedNextSteps: string[];
  };
}

export interface LearningReflectionPlan {
  sessionId: string;
  personaType: 'moment.ryan' | 'atozit';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // 즉시 반영 항목 (실시간)
  immediateUpdates: {
    writingStyle: any;
    toneAdjustments: any;
    vocabularyExpansion: string[];
    responsePatterns: any;
  };
  
  // 배치 반영 항목 (세션 종료 후)
  batchUpdates: {
    expertiseKnowledge: any;
    personalityTraits: any;
    businessInsights: any;
    methodologyUpdates: any;
  };
  
  // 장기 반영 항목 (누적 분석 후)
  longTermUpdates: {
    corePhilosophy: any;
    decisionMakingStyle: any;
    problemSolvingApproach: any;
    industryPerspective: any;
  };
  
  // 검증 및 품질 관리
  qualityChecks: {
    consistencyScore: number;
    conflictResolution: any[];
    confidenceLevel: number;
    reviewRequired: boolean;
  };
}

export class SessionSummaryService {
  
  // 세션 종료 시 종합 분석 및 요약 생성
  static async generateSessionSummary(sessionId: string): Promise<SessionSummary> {
    try {
      console.log(`📋 세션 요약 생성 시작: ${sessionId}`);
      
      // 세션 정보 및 메시지 조회
      const session = await this.getSessionById(sessionId);
      const messages = await this.getSessionMessages(sessionId);
      
      if (!session || messages.length === 0) {
        throw new Error('세션 또는 메시지를 찾을 수 없습니다.');
      }
      
      // 세션 분석 수행
      const analysisResult = await this.analyzeSession(session, messages);
      
      // 학습 반영 계획 생성
      const reflectionPlan = await this.generateLearningReflectionPlan(analysisResult);
      
      // 요약 객체 생성
      const summary = await this.createSessionSummary(session, analysisResult, reflectionPlan);
      
      // 요약 저장
      await this.saveSessionSummary(summary);
      
      // 학습 반영 실행 (백그라운드)
      this.executeLearningReflection(reflectionPlan, analysisResult).catch(console.error);
      
      console.log(`✅ 세션 요약 생성 완료: ${sessionId}`);
      return summary;
      
    } catch (error) {
      console.error('세션 요약 생성 실패:', error);
      throw error;
    }
  }

  // 실시간 학습 반영 (메시지별)
  static async processRealTimeLearning(
    sessionId: string,
    message: ConversationMessage
  ): Promise<void> {
    try {
      const session = await this.getSessionById(sessionId);
      if (!session) return;
      
      // Admin 메시지인 경우만 실시간 학습
      if (message.role === 'user' && isAdminUser(session.adminEmail)) {
        console.log(`⚡ 실시간 학습 처리: ${sessionId} - ${message.id}`);
        
        // 메시지에서 즉시 학습 가능한 인사이트 추출
        const insights = await this.extractRealTimeInsights(message, session.personaType);
        
        // 페르소나에 즉시 반영
        if (insights.confidence > 0.7) {
          await PersonaLearningService.processRealTimeLearning(
            sessionId,
            message.content,
            session.personaType,
            session.adminEmail!
          );
        }
      }
      
      // 일반 사용자 학습 패턴 업데이트
      if (message.role === 'user' && !isAdminUser(session.adminEmail)) {
        await this.updateUserLearningPattern(session.userId, message);
      }
      
    } catch (error) {
      console.error('실시간 학습 처리 실패:', error);
    }
  }

  // 배치 학습 반영 실행
  static async executeLearningReflection(
    plan: LearningReflectionPlan,
    analysis: SessionAnalysisResult
  ): Promise<void> {
    try {
      console.log(`🧠 학습 반영 실행 시작: ${plan.sessionId}`);
      
      // 1. 즉시 반영 항목 처리
      await this.applyImmediateUpdates(plan.immediateUpdates, plan.personaType);
      
      // 2. 배치 반영 항목 처리
      await this.applyBatchUpdates(plan.batchUpdates, plan.personaType, analysis);
      
      // 3. 품질 검증
      const qualityResult = await this.validateLearningQuality(plan, analysis);
      
      // 4. 장기 반영 항목 (조건부)
      if (qualityResult.shouldApplyLongTerm) {
        await this.applyLongTermUpdates(plan.longTermUpdates, plan.personaType);
      }
      
      // 5. 학습 로그 기록
      await this.logLearningReflection(plan, qualityResult);
      
      // 6. 일반 사용자 학습 반영 (해당하는 경우)
      if (!analysis.isAdminSession) {
        await this.reflectUserLearning(analysis);
      }
      
      console.log(`✅ 학습 반영 완료: ${plan.sessionId}`);
      
    } catch (error) {
      console.error('학습 반영 실행 실패:', error);
    }
  }

  // 세션 분석 수행
  private static async analyzeSession(
    session: ConversationSession,
    messages: ConversationMessage[]
  ): Promise<SessionAnalysisResult> {
    try {
      const isAdmin = isAdminUser(session.adminEmail);
      const userMessages = messages.filter(m => m.role === 'user');
      const assistantMessages = messages.filter(m => m.role === 'assistant');
      
      // 기본 메트릭 계산
      const sessionMetrics = this.calculateSessionMetrics(session, messages);
      
      // 내용 분석
      const contentAnalysis = await this.analyzeContent(messages);
      
      // 학습 가치 평가
      const learningValue = this.evaluateLearningValue(messages, isAdmin);
      
      // 페르소나 인사이트 추출
      const personaInsights = await this.extractPersonaInsights(
        session.personaType,
        userMessages,
        isAdmin
      );
      
      // 사용자 학습 인사이트 (일반 사용자)
      const userLearningInsights = !isAdmin 
        ? await this.extractUserLearningInsights(session.userId, messages)
        : undefined;
      
      return {
        sessionId: session.id,
        userId: session.userId,
        isAdminSession: isAdmin,
        sessionMetrics,
        contentAnalysis,
        learningValue,
        personaInsights,
        userLearningInsights
      };
      
    } catch (error) {
      console.error('세션 분석 실패:', error);
      throw error;
    }
  }

  // 학습 반영 계획 생성
  private static async generateLearningReflectionPlan(
    analysis: SessionAnalysisResult
  ): Promise<LearningReflectionPlan> {
    try {
      const priority = this.determineLearningPriority(analysis);
      
      return {
        sessionId: analysis.sessionId,
        personaType: analysis.personaInsights.personaType,
        priority,
        
        immediateUpdates: {
          writingStyle: this.extractWritingStyleUpdates(analysis),
          toneAdjustments: this.extractToneAdjustments(analysis),
          vocabularyExpansion: analysis.contentAnalysis.discussedConcepts,
          responsePatterns: this.extractResponsePatterns(analysis)
        },
        
        batchUpdates: {
          expertiseKnowledge: this.extractExpertiseUpdates(analysis),
          personalityTraits: this.extractPersonalityUpdates(analysis),
          businessInsights: this.extractBusinessUpdates(analysis),
          methodologyUpdates: this.extractMethodologyUpdates(analysis)
        },
        
        longTermUpdates: {
          corePhilosophy: this.extractPhilosophyUpdates(analysis),
          decisionMakingStyle: this.extractDecisionStyleUpdates(analysis),
          problemSolvingApproach: this.extractProblemSolvingUpdates(analysis),
          industryPerspective: this.extractIndustryUpdates(analysis)
        },
        
        qualityChecks: {
          consistencyScore: this.calculateConsistencyScore(analysis),
          conflictResolution: this.identifyConflicts(analysis),
          confidenceLevel: analysis.learningValue.overallScore / 100,
          reviewRequired: analysis.learningValue.overallScore < 70
        }
      };
      
    } catch (error) {
      console.error('학습 반영 계획 생성 실패:', error);
      throw error;
    }
  }

  // 세션 요약 객체 생성
  private static async createSessionSummary(
    session: ConversationSession,
    analysis: SessionAnalysisResult,
    plan: LearningReflectionPlan
  ): Promise<SessionSummary> {
    const summaryId = this.generateId();
    const now = new Date().toISOString();
    
    return {
      id: summaryId,
      sessionId: session.id,
      personaType: session.personaType,
      adminEmail: session.adminEmail!,
      
      summaryContent: this.generateSummaryContent(analysis),
      extractedKnowledge: this.consolidateExtractedKnowledge(analysis),
      learningInsights: this.consolidateLearningInsights(analysis, plan),
      
      keyTopics: analysis.contentAnalysis.mainTopics,
      expertiseAreas: analysis.personaInsights.strengthsRevealed,
      personalityTraits: analysis.personaInsights.newCharacteristics,
      writingStyleAnalysis: plan.immediateUpdates.writingStyle,
      businessInsights: plan.batchUpdates.businessInsights,
      
      createdAt: now,
      appliedToPersona: false
    };
  }

  // 즉시 반영 처리
  private static async applyImmediateUpdates(
    updates: any,
    personaType: 'moment.ryan' | 'atozit'
  ): Promise<void> {
    try {
      console.log(`⚡ 즉시 업데이트 적용: ${personaType}`);
      
      // 글쓰기 스타일 업데이트
      if (updates.writingStyle) {
        await this.updateWritingStyle(personaType, updates.writingStyle);
      }
      
      // 톤 조정
      if (updates.toneAdjustments) {
        await this.adjustTone(personaType, updates.toneAdjustments);
      }
      
      // 어휘 확장
      if (updates.vocabularyExpansion?.length > 0) {
        await this.expandVocabulary(personaType, updates.vocabularyExpansion);
      }
      
      // 응답 패턴 업데이트
      if (updates.responsePatterns) {
        await this.updateResponsePatterns(personaType, updates.responsePatterns);
      }
      
    } catch (error) {
      console.error('즉시 업데이트 적용 실패:', error);
    }
  }

  // 배치 반영 처리
  private static async applyBatchUpdates(
    updates: any,
    personaType: 'moment.ryan' | 'atozit',
    analysis: SessionAnalysisResult
  ): Promise<void> {
    try {
      console.log(`📚 배치 업데이트 적용: ${personaType}`);
      
      // 전문성 지식 업데이트
      if (updates.expertiseKnowledge) {
        await this.updateExpertiseKnowledge(personaType, updates.expertiseKnowledge);
      }
      
      // 성격 특성 업데이트
      if (updates.personalityTraits) {
        await this.updatePersonalityTraits(personaType, updates.personalityTraits);
      }
      
      // 비즈니스 인사이트 업데이트
      if (updates.businessInsights) {
        await this.updateBusinessInsights(personaType, updates.businessInsights);
      }
      
      // 방법론 업데이트
      if (updates.methodologyUpdates) {
        await this.updateMethodology(personaType, updates.methodologyUpdates);
      }
      
    } catch (error) {
      console.error('배치 업데이트 적용 실패:', error);
    }
  }

  // 장기 반영 처리
  private static async applyLongTermUpdates(
    updates: any,
    personaType: 'moment.ryan' | 'atozit'
  ): Promise<void> {
    try {
      console.log(`🔮 장기 업데이트 적용: ${personaType}`);
      
      // 핵심 철학 업데이트 (신중히)
      if (updates.corePhilosophy) {
        await this.updateCorePhilosophy(personaType, updates.corePhilosophy);
      }
      
      // 의사결정 스타일 업데이트
      if (updates.decisionMakingStyle) {
        await this.updateDecisionMakingStyle(personaType, updates.decisionMakingStyle);
      }
      
      // 문제해결 접근법 업데이트
      if (updates.problemSolvingApproach) {
        await this.updateProblemSolvingApproach(personaType, updates.problemSolvingApproach);
      }
      
      // 업계 관점 업데이트
      if (updates.industryPerspective) {
        await this.updateIndustryPerspective(personaType, updates.industryPerspective);
      }
      
    } catch (error) {
      console.error('장기 업데이트 적용 실패:', error);
    }
  }

  // 사용자 학습 반영
  private static async reflectUserLearning(analysis: SessionAnalysisResult): Promise<void> {
    try {
      console.log(`👤 사용자 학습 반영: ${analysis.userId}`);
      
      if (!analysis.userLearningInsights) return;
      
      // 사용자 프로필 업데이트
      await this.updateUserProfile(analysis.userId, analysis);
      
      // 학습 진행도 업데이트
      await this.updateUserLearningProgress(analysis.userId, analysis.userLearningInsights);
      
      // 개인화 추천 업데이트
      await this.updatePersonalizationRecommendations(analysis.userId, analysis);
      
    } catch (error) {
      console.error('사용자 학습 반영 실패:', error);
    }
  }

  // 헬퍼 메서드들
  private static async getSessionById(sessionId: string): Promise<ConversationSession | null> {
    // 실제로는 데이터베이스에서 조회
    return null;
  }

  private static async getSessionMessages(sessionId: string): Promise<ConversationMessage[]> {
    // 실제로는 데이터베이스에서 조회
    return [];
  }

  private static calculateSessionMetrics(
    session: ConversationSession,
    messages: ConversationMessage[]
  ): any {
    const startTime = new Date(session.sessionStartTime).getTime();
    const endTime = session.sessionEndTime ? new Date(session.sessionEndTime).getTime() : Date.now();
    const duration = Math.round((endTime - startTime) / (1000 * 60)); // 분 단위
    
    const userMessages = messages.filter(m => m.role === 'user');
    const avgLength = userMessages.length > 0 
      ? userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length 
      : 0;
    
    return {
      duration,
      messageCount: messages.length,
      averageMessageLength: Math.round(avgLength),
      conversationDepth: this.assessConversationDepth(messages),
      topicConsistency: this.calculateTopicConsistency(messages)
    };
  }

  private static async analyzeContent(messages: ConversationMessage[]): Promise<any> {
    // 실제로는 NLP 분석
    return {
      mainTopics: ['마케팅', '전략'],
      keyInsights: ['데이터 기반 의사결정', '고객 중심 접근'],
      discussedConcepts: ['ROI', 'KPI', '타겟팅'],
      expertiseLevel: 'intermediate',
      emotionalTone: 'positive'
    };
  }

  private static evaluateLearningValue(messages: ConversationMessage[], isAdmin: boolean): any {
    const baseScore = isAdmin ? 80 : 60; // Admin 세션이 더 높은 학습 가치
    
    return {
      overallScore: baseScore,
      knowledgeExtraction: baseScore + 10,
      personalityInsights: baseScore - 10,
      expertiseDiscovery: baseScore + 5,
      writingPatterns: baseScore
    };
  }

  private static async extractPersonaInsights(
    personaType: 'moment.ryan' | 'atozit',
    userMessages: ConversationMessage[],
    isAdmin: boolean
  ): Promise<any> {
    return {
      personaType,
      strengthsRevealed: ['전략적 사고', '실용적 접근'],
      improvementAreas: ['기술적 깊이'],
      newCharacteristics: ['데이터 중시', '고객 지향'],
      communicationPatterns: {
        directness: 0.8,
        enthusiasm: 0.7,
        formality: 0.6
      }
    };
  }

  private static async extractUserLearningInsights(
    userId: string,
    messages: ConversationMessage[]
  ): Promise<any> {
    return {
      learningProgress: 75,
      engagementLevel: 'high',
      satisfactionPrediction: 0.85,
      recommendedNextSteps: ['심화 학습', '실습 경험']
    };
  }

  private static determineLearningPriority(analysis: SessionAnalysisResult): 'low' | 'medium' | 'high' | 'critical' {
    if (analysis.isAdminSession && analysis.learningValue.overallScore > 80) {
      return 'high';
    }
    if (analysis.learningValue.overallScore > 70) {
      return 'medium';
    }
    return 'low';
  }

  // 추출 메서드들 (간략화)
  private static extractWritingStyleUpdates(analysis: SessionAnalysisResult): any {
    return { tone: 'professional', structure: 'detailed' };
  }

  private static extractToneAdjustments(analysis: SessionAnalysisResult): any {
    return { formality: 0.1, enthusiasm: 0.05 };
  }

  private static extractResponsePatterns(analysis: SessionAnalysisResult): any {
    return { preferredLength: 'medium', includeExamples: true };
  }

  private static extractExpertiseUpdates(analysis: SessionAnalysisResult): any {
    return { newKnowledge: analysis.contentAnalysis.keyInsights };
  }

  private static extractPersonalityUpdates(analysis: SessionAnalysisResult): any {
    return { traits: analysis.personaInsights.newCharacteristics };
  }

  private static extractBusinessUpdates(analysis: SessionAnalysisResult): any {
    return { insights: analysis.contentAnalysis.keyInsights };
  }

  private static extractMethodologyUpdates(analysis: SessionAnalysisResult): any {
    return { approaches: ['data-driven', 'customer-centric'] };
  }

  private static extractPhilosophyUpdates(analysis: SessionAnalysisResult): any {
    return { core: 'customer-first' };
  }

  private static extractDecisionStyleUpdates(analysis: SessionAnalysisResult): any {
    return { style: 'analytical' };
  }

  private static extractProblemSolvingUpdates(analysis: SessionAnalysisResult): any {
    return { approach: 'systematic' };
  }

  private static extractIndustryUpdates(analysis: SessionAnalysisResult): any {
    return { perspective: 'digital-first' };
  }

  private static calculateConsistencyScore(analysis: SessionAnalysisResult): number {
    return 0.85;
  }

  private static identifyConflicts(analysis: SessionAnalysisResult): any[] {
    return [];
  }

  private static generateSummaryContent(analysis: SessionAnalysisResult): string {
    return `${analysis.sessionMetrics.messageCount}개 메시지, ${analysis.sessionMetrics.duration}분간의 대화 요약`;
  }

  private static consolidateExtractedKnowledge(analysis: SessionAnalysisResult): any {
    return {
      topics: analysis.contentAnalysis.mainTopics,
      insights: analysis.contentAnalysis.keyInsights,
      concepts: analysis.contentAnalysis.discussedConcepts
    };
  }

  private static consolidateLearningInsights(analysis: SessionAnalysisResult, plan: LearningReflectionPlan): any {
    return {
      learningValue: analysis.learningValue,
      reflectionPlan: plan,
      qualityScore: plan.qualityChecks.confidenceLevel
    };
  }

  private static assessConversationDepth(messages: ConversationMessage[]): 'shallow' | 'medium' | 'deep' {
    if (messages.length > 20) return 'deep';
    if (messages.length > 10) return 'medium';
    return 'shallow';
  }

  private static calculateTopicConsistency(messages: ConversationMessage[]): number {
    return 0.8; // 임시값
  }

  private static async extractRealTimeInsights(
    message: ConversationMessage,
    personaType: 'moment.ryan' | 'atozit'
  ): Promise<any> {
    return {
      confidence: 0.8,
      insights: ['전략적 사고', '실용적 접근']
    };
  }

  private static async updateUserLearningPattern(userId: string, message: ConversationMessage): Promise<void> {
    console.log(`📈 사용자 학습 패턴 업데이트: ${userId}`);
  }

  private static async validateLearningQuality(plan: LearningReflectionPlan, analysis: SessionAnalysisResult): Promise<any> {
    return {
      shouldApplyLongTerm: plan.qualityChecks.confidenceLevel > 0.8,
      qualityScore: plan.qualityChecks.confidenceLevel
    };
  }

  private static async logLearningReflection(plan: LearningReflectionPlan, qualityResult: any): Promise<void> {
    console.log(`📝 학습 반영 로그: ${plan.sessionId} - 품질점수: ${qualityResult.qualityScore}`);
  }

  // 페르소나 업데이트 메서드들 (실제로는 더 복잡한 로직)
  private static async updateWritingStyle(personaType: string, updates: any): Promise<void> {
    console.log(`✍️ 글쓰기 스타일 업데이트: ${personaType}`);
  }

  private static async adjustTone(personaType: string, adjustments: any): Promise<void> {
    console.log(`🎵 톤 조정: ${personaType}`);
  }

  private static async expandVocabulary(personaType: string, newTerms: string[]): Promise<void> {
    console.log(`📚 어휘 확장: ${personaType} - ${newTerms.length}개 용어`);
  }

  private static async updateResponsePatterns(personaType: string, patterns: any): Promise<void> {
    console.log(`🔄 응답 패턴 업데이트: ${personaType}`);
  }

  private static async updateExpertiseKnowledge(personaType: string, knowledge: any): Promise<void> {
    console.log(`🧠 전문성 지식 업데이트: ${personaType}`);
  }

  private static async updatePersonalityTraits(personaType: string, traits: any): Promise<void> {
    console.log(`👤 성격 특성 업데이트: ${personaType}`);
  }

  private static async updateBusinessInsights(personaType: string, insights: any): Promise<void> {
    console.log(`💼 비즈니스 인사이트 업데이트: ${personaType}`);
  }

  private static async updateMethodology(personaType: string, methodology: any): Promise<void> {
    console.log(`⚙️ 방법론 업데이트: ${personaType}`);
  }

  private static async updateCorePhilosophy(personaType: string, philosophy: any): Promise<void> {
    console.log(`🎯 핵심 철학 업데이트: ${personaType}`);
  }

  private static async updateDecisionMakingStyle(personaType: string, style: any): Promise<void> {
    console.log(`🤔 의사결정 스타일 업데이트: ${personaType}`);
  }

  private static async updateProblemSolvingApproach(personaType: string, approach: any): Promise<void> {
    console.log(`🔧 문제해결 접근법 업데이트: ${personaType}`);
  }

  private static async updateIndustryPerspective(personaType: string, perspective: any): Promise<void> {
    console.log(`🏭 업계 관점 업데이트: ${personaType}`);
  }

  private static async updateUserProfile(userId: string, analysis: SessionAnalysisResult): Promise<void> {
    console.log(`👤 사용자 프로필 업데이트: ${userId}`);
  }

  private static async updateUserLearningProgress(userId: string, insights: any): Promise<void> {
    console.log(`📊 사용자 학습 진행도 업데이트: ${userId}`);
  }

  private static async updatePersonalizationRecommendations(userId: string, analysis: SessionAnalysisResult): Promise<void> {
    console.log(`🎯 개인화 추천 업데이트: ${userId}`);
  }

  private static async saveSessionSummary(summary: SessionSummary): Promise<void> {
    console.log(`💾 세션 요약 저장: ${summary.id}`);
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}