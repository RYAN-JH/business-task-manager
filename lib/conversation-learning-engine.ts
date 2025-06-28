// 대화 학습 엔진 - 매 세션마다 대화 내용을 분석하고 마스터 프로필 업데이트
import { MasterUserProfile, MasterProfileManager } from './master-profile-system';
import { WritingStyleAnalyzer, MessageAnalysis } from './writing-style-analyzer';
import { analyzeConversationContext, ConversationMessage } from './conversation-context-system';
import { prisma } from '@/lib/prisma';

export interface ConversationSession {
  sessionId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  messages: ConversationMessage[];
  userMessagesAnalysis: MessageAnalysis[];
  aiResponses: string[];
  userFeedback: SessionFeedback[];
  sessionSummary: SessionSummary;
}

export interface SessionFeedback {
  messageId: string;
  feedback: 'HELPFUL' | 'NOT_HELPFUL' | 'VERY_HELPFUL';
  timestamp: string;
}

export interface SessionSummary {
  totalMessages: number;
  userMessageCount: number;
  aiResponseCount: number;
  mainTopics: string[];
  userEngagementLevel: number; // 0-100
  sessionSatisfaction: number; // 0-100
  keyInsights: string[];
  learnedPatterns: string[];
  contextualProgress: string[];
}

export interface LearningDelta {
  writingStyleChanges: {
    toneShifts: { [key: string]: number };
    newVocabulary: string[];
    patternChanges: string[];
  };
  conversationPatternChanges: {
    topicShiftTrends: string[];
    engagementPatterns: string[];
    responsePreferences: string[];
  };
  contextualLearnings: {
    newPreferences: string[];
    updatedGoals: string[];
    emergingPatterns: string[];
  };
  qualityMetrics: {
    dataRichnessIncrease: number;
    consistencyScore: number;
    predictionImprovement: number;
  };
}

// 대화 학습 엔진
export class ConversationLearningEngine {
  
  // 세션 시작
  static startSession(userId: string, conversationId: string): ConversationSession {
    return {
      sessionId: `session_${Date.now()}`,
      userId,
      startTime: new Date().toISOString(),
      messages: [],
      userMessagesAnalysis: [],
      aiResponses: [],
      userFeedback: [],
      sessionSummary: {
        totalMessages: 0,
        userMessageCount: 0,
        aiResponseCount: 0,
        mainTopics: [],
        userEngagementLevel: 0,
        sessionSatisfaction: 0,
        keyInsights: [],
        learnedPatterns: [],
        contextualProgress: []
      }
    };
  }
  
  // 메시지 추가
  static addMessageToSession(
    session: ConversationSession, 
    message: ConversationMessage,
    aiResponse?: string
  ): ConversationSession {
    const updatedSession = { ...session };
    
    updatedSession.messages.push(message);
    updatedSession.sessionSummary.totalMessages++;
    
    if (message.type === 'USER') {
      const analysis = WritingStyleAnalyzer.analyzeMessage(message.content);
      updatedSession.userMessagesAnalysis.push(analysis);
      updatedSession.sessionSummary.userMessageCount++;
    }
    
    if (aiResponse && message.type === 'USER') {
      updatedSession.aiResponses.push(aiResponse);
      updatedSession.sessionSummary.aiResponseCount++;
    }
    
    return updatedSession;
  }
  
  // 피드백 추가
  static addFeedbackToSession(
    session: ConversationSession,
    messageId: string,
    feedback: SessionFeedback['feedback']
  ): ConversationSession {
    const updatedSession = { ...session };
    
    updatedSession.userFeedback.push({
      messageId,
      feedback,
      timestamp: new Date().toISOString()
    });
    
    return updatedSession;
  }
  
  // 세션 완료 및 학습
  static async completeSessionAndLearn(
    session: ConversationSession,
    currentMasterProfile: MasterUserProfile
  ): Promise<{ updatedProfile: MasterUserProfile; learningDelta: LearningDelta }> {
    
    // 1. 세션 요약 생성
    const sessionSummary = this.generateSessionSummary(session);
    session.sessionSummary = sessionSummary;
    session.endTime = new Date().toISOString();
    
    // 2. 학습 델타 계산 (변화 분석)
    const learningDelta = this.calculateLearningDelta(session, currentMasterProfile);
    
    // 3. 마스터 프로필 업데이트
    const conversationContext = analyzeConversationContext(session.messages, currentMasterProfile.businessProfile);
    const userMessages = session.messages.filter(m => m.type === 'USER').map(m => m.content);
    
    const updatedProfile = MasterProfileManager.updateProfileFromConversation(
      currentMasterProfile,
      userMessages,
      session.aiResponses,
      conversationContext,
      session.userFeedback
    );
    
    // 4. 세션 데이터 저장
    await this.saveSessionData(session, learningDelta);
    
    // 5. 학습 인사이트 생성
    const insights = this.generateLearningInsights(session, learningDelta);
    await this.saveLearningInsights(session.userId, insights);
    
    console.log('🧠 대화 학습 완료:', {
      sessionId: session.sessionId,
      messagesLearned: session.userMessagesAnalysis.length,
      qualityIncrease: learningDelta.qualityMetrics.dataRichnessIncrease,
      newPatterns: learningDelta.writingStyleChanges.patternChanges.length
    });
    
    return { updatedProfile, learningDelta };
  }
  
  // 세션 요약 생성
  private static generateSessionSummary(session: ConversationSession): SessionSummary {
    const userAnalyses = session.userMessagesAnalysis;
    
    // 주요 주제 추출
    const allTopics = userAnalyses.flatMap(analysis => analysis.topics);
    const topicFreq: { [topic: string]: number } = {};
    allTopics.forEach(topic => {
      topicFreq[topic] = (topicFreq[topic] || 0) + 1;
    });
    const mainTopics = Object.entries(topicFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);
    
    // 사용자 참여도 계산
    const avgMessageLength = userAnalyses.reduce((sum, a) => sum + a.length, 0) / Math.max(userAnalyses.length, 1);
    const engagementLevel = Math.min(100, Math.round(
      (avgMessageLength / 100) * 30 + // 메시지 길이 (30점)
      (userAnalyses.length / 10) * 40 + // 메시지 수 (40점)
      (userAnalyses.reduce((sum, a) => sum + a.patterns.questions, 0) / Math.max(userAnalyses.length, 1)) * 30 // 질문 빈도 (30점)
    ));
    
    // 만족도 계산 (피드백 기반)
    const positiveFeedback = session.userFeedback.filter(f => f.feedback === 'HELPFUL' || f.feedback === 'VERY_HELPFUL').length;
    const totalFeedback = session.userFeedback.length;
    const sessionSatisfaction = totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 50;
    
    // 핵심 인사이트 추출
    const keyInsights = this.extractKeyInsights(userAnalyses);
    const learnedPatterns = this.extractLearnedPatterns(userAnalyses);
    const contextualProgress = this.extractContextualProgress(session);
    
    return {
      totalMessages: session.messages.length,
      userMessageCount: session.userMessagesAnalysis.length,
      aiResponseCount: session.aiResponses.length,
      mainTopics,
      userEngagementLevel: engagementLevel,
      sessionSatisfaction,
      keyInsights,
      learnedPatterns,
      contextualProgress
    };
  }
  
  // 학습 델타 계산
  private static calculateLearningDelta(
    session: ConversationSession, 
    currentProfile: MasterUserProfile
  ): LearningDelta {
    
    const userAnalyses = session.userMessagesAnalysis;
    
    // 글쓰기 스타일 변화
    const currentStyle = currentProfile.writingStyle;
    const sessionStyle = WritingStyleAnalyzer.buildStyleProfile(userAnalyses);
    
    const toneShifts = {
      formality: sessionStyle.tone.formality - currentStyle.tone.formality,
      enthusiasm: sessionStyle.tone.enthusiasm - currentStyle.tone.enthusiasm,
      directness: sessionStyle.tone.directness - currentStyle.tone.directness,
      politeness: sessionStyle.tone.politeness - currentStyle.tone.politeness
    };
    
    const newVocabulary = Object.keys(sessionStyle.frequentWords)
      .filter(word => !Object.keys(currentStyle.frequentWords).includes(word))
      .slice(0, 10);
    
    const patternChanges = this.detectPatternChanges(currentStyle, sessionStyle);
    
    // 대화 패턴 변화
    const topicShiftTrends = this.analyzeTopicShifts(session);
    const engagementPatterns = this.analyzeEngagementPatterns(session);
    const responsePreferences = this.analyzeResponsePreferences(session);
    
    // 컨텍스트 학습
    const newPreferences = this.extractNewPreferences(session);
    const updatedGoals = this.extractUpdatedGoals(session);
    const emergingPatterns = this.extractEmergingPatterns(session);
    
    // 품질 메트릭
    const oldQuality = currentProfile.profileQuality.dataRichness;
    const newQuality = Math.min(100, oldQuality + Math.min(10, userAnalyses.length));
    
    return {
      writingStyleChanges: {
        toneShifts,
        newVocabulary,
        patternChanges
      },
      conversationPatternChanges: {
        topicShiftTrends,
        engagementPatterns,
        responsePreferences
      },
      contextualLearnings: {
        newPreferences,
        updatedGoals,
        emergingPatterns
      },
      qualityMetrics: {
        dataRichnessIncrease: newQuality - oldQuality,
        consistencyScore: this.calculateConsistencyScore(session),
        predictionImprovement: Math.min(5, userAnalyses.length)
      }
    };
  }
  
  // 핵심 인사이트 추출
  private static extractKeyInsights(userAnalyses: MessageAnalysis[]): string[] {
    const insights: string[] = [];
    
    // 어투 변화 인사이트
    const avgFormality = userAnalyses.reduce((sum, a) => sum + a.tone.formality, 0) / userAnalyses.length;
    if (avgFormality > 70) insights.push('격식 있는 소통을 선호함');
    if (avgFormality < 30) insights.push('캐주얼한 소통을 선호함');
    
    // 참여도 인사이트
    const avgLength = userAnalyses.reduce((sum, a) => sum + a.length, 0) / userAnalyses.length;
    if (avgLength > 100) insights.push('상세한 설명을 제공하는 성향');
    if (avgLength < 30) insights.push('간결한 소통을 선호함');
    
    // 주제 집중도 인사이트
    const topicCounts = userAnalyses.flatMap(a => a.topics);
    const uniqueTopics = new Set(topicCounts);
    if (uniqueTopics.size === 1) insights.push('특정 주제에 집중하는 성향');
    if (uniqueTopics.size > 5) insights.push('다양한 주제에 관심이 많음');
    
    return insights.slice(0, 5);
  }
  
  // 학습된 패턴 추출
  private static extractLearnedPatterns(userAnalyses: MessageAnalysis[]): string[] {
    const patterns: string[] = [];
    
    // 이모지 사용 패턴
    const totalEmojis = userAnalyses.reduce((sum, a) => sum + a.patterns.emojis.length, 0);
    if (totalEmojis > userAnalyses.length) patterns.push('이모지를 적극 활용함');
    
    // 질문 패턴
    const totalQuestions = userAnalyses.reduce((sum, a) => sum + a.patterns.questions, 0);
    if (totalQuestions > userAnalyses.length * 0.5) patterns.push('질문을 자주 활용함');
    
    // 어미 패턴
    const commonEndings = userAnalyses.flatMap(a => a.linguisticFeatures.endings);
    const endingFreq: { [ending: string]: number } = {};
    commonEndings.forEach(ending => {
      endingFreq[ending] = (endingFreq[ending] || 0) + 1;
    });
    const topEnding = Object.entries(endingFreq).sort(([,a], [,b]) => b - a)[0];
    if (topEnding && topEnding[1] > 2) {
      patterns.push(`"${topEnding[0]}" 어미를 자주 사용함`);
    }
    
    return patterns.slice(0, 5);
  }
  
  // 컨텍스트 진행 상황 추출
  private static extractContextualProgress(session: ConversationSession): string[] {
    const progress: string[] = [];
    
    // 프로젝트 진행 감지
    const messages = session.messages.filter(m => m.type === 'USER').map(m => m.content);
    const projectKeywords = ['완성', '진행', '시작', '끝', '런칭', '오픈'];
    
    messages.forEach(message => {
      projectKeywords.forEach(keyword => {
        if (message.includes(keyword)) {
          progress.push(`${keyword} 관련 활동 진행`);
        }
      });
    });
    
    // 목표 달성 감지
    const achievementKeywords = ['성공', '달성', '완료', '해결'];
    messages.forEach(message => {
      achievementKeywords.forEach(keyword => {
        if (message.includes(keyword)) {
          progress.push(`${keyword} 상황 보고`);
        }
      });
    });
    
    return [...new Set(progress)].slice(0, 3);
  }
  
  // 패턴 변화 감지
  private static detectPatternChanges(oldStyle: any, newStyle: any): string[] {
    const changes: string[] = [];
    
    // 이모지 사용 변화
    if (newStyle.writingPatterns.usesEmojis && !oldStyle.writingPatterns.usesEmojis) {
      changes.push('이모지 사용 시작');
    }
    
    // 문장 복잡도 변화
    if (newStyle.sentenceComplexity !== oldStyle.sentenceComplexity) {
      changes.push(`문장 복잡도 ${oldStyle.sentenceComplexity} → ${newStyle.sentenceComplexity}`);
    }
    
    return changes;
  }
  
  // 보조 메서드들
  private static analyzeTopicShifts(session: ConversationSession): string[] {
    const topics = session.userMessagesAnalysis.flatMap(a => a.topics);
    const uniqueTopics = [...new Set(topics)];
    return uniqueTopics.length > 3 ? ['다양한 주제 전환'] : ['주제 집중'];
  }
  
  private static analyzeEngagementPatterns(session: ConversationSession): string[] {
    const avgLength = session.userMessagesAnalysis.reduce((sum, a) => sum + a.length, 0) / session.userMessagesAnalysis.length;
    return avgLength > 100 ? ['높은 참여도'] : ['간결한 소통'];
  }
  
  private static analyzeResponsePreferences(session: ConversationSession): string[] {
    // 피드백 기반 선호도 분석
    const positiveCount = session.userFeedback.filter(f => f.feedback === 'HELPFUL' || f.feedback === 'VERY_HELPFUL').length;
    return positiveCount > session.userFeedback.length * 0.7 ? ['현재 응답 스타일 선호'] : ['응답 스타일 개선 필요'];
  }
  
  private static extractNewPreferences(session: ConversationSession): string[] {
    const userMessages = session.messages.filter(m => m.type === 'USER').map(m => m.content);
    const preferenceKeywords = ['좋아', '선호', '원해', '바라'];
    
    const preferences: string[] = [];
    userMessages.forEach(message => {
      preferenceKeywords.forEach(keyword => {
        if (message.includes(keyword)) {
          preferences.push(message.substring(0, 50) + '...');
        }
      });
    });
    
    return preferences.slice(0, 3);
  }
  
  private static extractUpdatedGoals(session: ConversationSession): string[] {
    const userMessages = session.messages.filter(m => m.type === 'USER').map(m => m.content);
    const goalKeywords = ['목표', '계획', '하고 싶', '이루고 싶'];
    
    const goals: string[] = [];
    userMessages.forEach(message => {
      goalKeywords.forEach(keyword => {
        if (message.includes(keyword)) {
          goals.push(message.substring(0, 50) + '...');
        }
      });
    });
    
    return goals.slice(0, 3);
  }
  
  private static extractEmergingPatterns(session: ConversationSession): string[] {
    // 새로운 패턴 감지 로직
    const patterns: string[] = [];
    
    const emojiCount = session.userMessagesAnalysis.reduce((sum, a) => sum + a.patterns.emojis.length, 0);
    if (emojiCount > session.userMessagesAnalysis.length) {
      patterns.push('이모지 사용 증가');
    }
    
    return patterns;
  }
  
  private static calculateConsistencyScore(session: ConversationSession): number {
    // 일관성 점수 계산
    const analyses = session.userMessagesAnalysis;
    if (analyses.length < 2) return 100;
    
    const toneVariation = this.calculateToneVariation(analyses);
    return Math.max(0, 100 - (toneVariation * 2));
  }
  
  private static calculateToneVariation(analyses: MessageAnalysis[]): number {
    const tones = analyses.map(a => a.tone);
    const avgTone = {
      formality: tones.reduce((sum, t) => sum + t.formality, 0) / tones.length,
      enthusiasm: tones.reduce((sum, t) => sum + t.enthusiasm, 0) / tones.length,
      directness: tones.reduce((sum, t) => sum + t.directness, 0) / tones.length,
      politeness: tones.reduce((sum, t) => sum + t.politeness, 0) / tones.length
    };
    
    const variations = tones.map(tone => 
      Math.abs(tone.formality - avgTone.formality) +
      Math.abs(tone.enthusiasm - avgTone.enthusiasm) +
      Math.abs(tone.directness - avgTone.directness) +
      Math.abs(tone.politeness - avgTone.politeness)
    );
    
    return variations.reduce((sum, v) => sum + v, 0) / variations.length;
  }
  
  // 데이터 저장 메서드들
  private static async saveSessionData(session: ConversationSession, delta: LearningDelta): Promise<void> {
    try {
      // 세션 데이터를 JSON으로 저장 (간단한 구현)
      console.log('세션 데이터 저장:', {
        sessionId: session.sessionId,
        userId: session.userId,
        messageCount: session.messages.length,
        learningPoints: delta.qualityMetrics.dataRichnessIncrease
      });
      
      // 실제 구현에서는 데이터베이스나 파일 시스템에 저장
      
    } catch (error) {
      console.error('세션 데이터 저장 실패:', error);
    }
  }
  
  private static async saveLearningInsights(userId: string, insights: string[]): Promise<void> {
    try {
      // 학습 인사이트를 데이터베이스에 저장
      for (const insight of insights) {
        await prisma.learningInsight.create({
          data: {
            userId,
            category: 'conversation_learning',
            insight,
            confidence: 0.8
          }
        });
      }
    } catch (error) {
      console.error('학습 인사이트 저장 실패:', error);
    }
  }
  
  private static generateLearningInsights(session: ConversationSession, delta: LearningDelta): string[] {
    const insights: string[] = [];
    
    // 스타일 변화 인사이트
    Object.entries(delta.writingStyleChanges.toneShifts).forEach(([aspect, change]) => {
      if (Math.abs(change) > 10) {
        insights.push(`${aspect} 스타일이 ${change > 0 ? '증가' : '감소'}했습니다 (${Math.abs(change)}점)`);
      }
    });
    
    // 새로운 어휘 인사이트
    if (delta.writingStyleChanges.newVocabulary.length > 0) {
      insights.push(`새로운 어휘 ${delta.writingStyleChanges.newVocabulary.length}개를 학습했습니다`);
    }
    
    // 품질 개선 인사이트
    if (delta.qualityMetrics.dataRichnessIncrease > 0) {
      insights.push(`프로필 품질이 ${delta.qualityMetrics.dataRichnessIncrease}점 향상되었습니다`);
    }
    
    return insights;
  }
}