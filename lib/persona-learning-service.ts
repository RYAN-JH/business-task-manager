// Admin 페르소나 학습 서비스

import { ConversationManager, SessionSummary, PersonaLearningLog } from './conversation-manager';
import { isAdminUser, getAdminDisplayName, getMailyUsernameForAdmin } from './admin-utils';

export interface PersonaLearningConfig {
  personaType: 'moment.ryan' | 'atozit';
  learningPriorities: {
    adminConversations: number; // 1-10 (1이 최고)
    mailyData: number;
    socialMedia: number;
    userFeedback: number;
  };
  updateFrequency: {
    realTimeThreshold: number; // 메시지 개수 기준
    batchProcessing: number; // 시간(분) 기준
  };
  qualityThresholds: {
    minSessionLength: number; // 최소 메시지 개수
    minContentQuality: number; // 0-1 점수
  };
}

export interface PersonaProfile {
  personaType: 'moment.ryan' | 'atozit';
  version: string;
  lastUpdated: string;
  
  // 전문성 영역
  expertise: {
    primaryAreas: string[];
    secondaryAreas: string[];
    knowledgeBase: any[];
    experienceLevel: Record<string, number>; // 영역별 전문성 레벨
  };
  
  // 커뮤니케이션 스타일
  communicationStyle: {
    tone: 'formal' | 'casual' | 'professional' | 'friendly';
    directness: number; // 0-1
    empathy: number; // 0-1
    enthusiasm: number; // 0-1
    technicality: number; // 0-1
  };
  
  // 비즈니스 관점
  businessPerspective: {
    industryFocus: string[];
    problemSolvingApproach: string[];
    decisionMakingStyle: string;
    riskTolerance: number; // 0-1
  };
  
  // 글쓰기 패턴
  writingPattern: {
    averageResponseLength: number;
    preferredStructure: string[];
    commonPhrases: string[];
    questioningStyle: string[];
  };
  
  // 학습 메타데이터
  learningMetadata: {
    totalConversations: number;
    totalMessages: number;
    qualityScore: number;
    confidenceLevel: number;
    lastMajorUpdate: string;
  };
}

export class PersonaLearningService {
  private static readonly LEARNING_CONFIG: Record<string, PersonaLearningConfig> = {
    'moment.ryan': {
      personaType: 'moment.ryan',
      learningPriorities: {
        adminConversations: 1, // 최고 우선순위
        mailyData: 3,
        socialMedia: 4,
        userFeedback: 6
      },
      updateFrequency: {
        realTimeThreshold: 5, // 5개 메시지마다 실시간 업데이트
        batchProcessing: 60 // 1시간마다 배치 처리
      },
      qualityThresholds: {
        minSessionLength: 3,
        minContentQuality: 0.6
      }
    },
    'atozit': {
      personaType: 'atozit',
      learningPriorities: {
        adminConversations: 1,
        mailyData: 2,
        socialMedia: 5,
        userFeedback: 4
      },
      updateFrequency: {
        realTimeThreshold: 3,
        batchProcessing: 45
      },
      qualityThresholds: {
        minSessionLength: 5,
        minContentQuality: 0.7
      }
    }
  };

  // 페르소나 프로필 초기화
  static async initializePersonaProfile(personaType: 'moment.ryan' | 'atozit'): Promise<PersonaProfile> {
    const config = this.LEARNING_CONFIG[personaType];
    const now = new Date().toISOString();
    
    const profile: PersonaProfile = {
      personaType,
      version: '1.0.0',
      lastUpdated: now,
      
      expertise: {
        primaryAreas: this.getDefaultExpertiseAreas(personaType),
        secondaryAreas: [],
        knowledgeBase: [],
        experienceLevel: {}
      },
      
      communicationStyle: {
        tone: personaType === 'moment.ryan' ? 'friendly' : 'professional',
        directness: personaType === 'moment.ryan' ? 0.7 : 0.8,
        empathy: personaType === 'moment.ryan' ? 0.8 : 0.7,
        enthusiasm: personaType === 'moment.ryan' ? 0.9 : 0.6,
        technicality: personaType === 'moment.ryan' ? 0.6 : 0.8
      },
      
      businessPerspective: {
        industryFocus: this.getDefaultIndustryFocus(personaType),
        problemSolvingApproach: [],
        decisionMakingStyle: personaType === 'moment.ryan' ? 'creative' : 'analytical',
        riskTolerance: personaType === 'moment.ryan' ? 0.7 : 0.5
      },
      
      writingPattern: {
        averageResponseLength: 200,
        preferredStructure: [],
        commonPhrases: [],
        questioningStyle: []
      },
      
      learningMetadata: {
        totalConversations: 0,
        totalMessages: 0,
        qualityScore: 0.5,
        confidenceLevel: 0.3,
        lastMajorUpdate: now
      }
    };

    console.log(`🎭 ${personaType} 페르소나 프로필 초기화 완료`);
    return profile;
  }

  // 실시간 학습 처리
  static async processRealTimeLearning(
    sessionId: string,
    messageContent: string,
    personaType: 'moment.ryan' | 'atozit',
    adminEmail: string
  ): Promise<void> {
    try {
      const config = this.LEARNING_CONFIG[personaType];
      
      // 메시지에서 학습 가능한 인사이트 추출
      const insights = await this.extractRealTimeInsights(messageContent, personaType);
      
      if (insights.qualityScore >= config.qualityThresholds.minContentQuality) {
        // 기존 페르소나 프로필 로드
        const currentProfile = await this.loadPersonaProfile(personaType);
        
        // 실시간 인사이트 적용
        const updatedProfile = await this.applyRealTimeInsights(
          currentProfile, 
          insights, 
          adminEmail
        );
        
        // 업데이트된 프로필 저장
        await this.savePersonaProfile(personaType, updatedProfile);
        
        // 학습 로그 기록
        await this.logLearningUpdate(personaType, 'realtime', insights, adminEmail);
        
        console.log(`⚡ ${personaType} 실시간 학습 완료: ${insights.categories.join(', ')}`);
      }
    } catch (error) {
      console.error('실시간 학습 처리 실패:', error);
    }
  }

  // 배치 학습 처리 (세션 종료 시)
  static async processBatchLearning(summary: SessionSummary): Promise<void> {
    try {
      const config = this.LEARNING_CONFIG[summary.personaType];
      
      // 세션 품질 검증
      if (!this.validateSessionQuality(summary, config)) {
        console.log(`📊 세션 품질 미달로 배치 학습 스킵: ${summary.sessionId}`);
        return;
      }

      // 기존 페르소나 프로필 로드
      const currentProfile = await this.loadPersonaProfile(summary.personaType);
      
      // 배치 학습 적용
      const updatedProfile = await this.applyBatchLearning(currentProfile, summary);
      
      // 업데이트된 프로필 저장
      await this.savePersonaProfile(summary.personaType, updatedProfile);
      
      // 학습 로그 기록
      await this.logLearningUpdate(
        summary.personaType, 
        'batch', 
        summary.learningInsights, 
        summary.adminEmail
      );
      
      console.log(`📚 ${summary.personaType} 배치 학습 완료: ${summary.keyTopics.join(', ')}`);
    } catch (error) {
      console.error('배치 학습 처리 실패:', error);
    }
  }

  // 페르소나 자동 스위칭 로직
  static async determinePersonaSwitch(
    userMessage: string,
    currentPersona?: 'moment.ryan' | 'atozit'
  ): Promise<{
    shouldSwitch: boolean;
    recommendedPersona: 'moment.ryan' | 'atozit';
    confidence: number;
    reason: string;
    triggerKeywords: string[];
  }> {
    try {
      // 메시지에서 키워드 추출
      const keywords = this.extractKeywords(userMessage);
      
      // 페르소나별 키워드 매칭 점수 계산
      const momentRyanScore = this.calculatePersonaScore(keywords, 'moment.ryan');
      const atozitScore = this.calculatePersonaScore(keywords, 'atozit');
      
      const recommendedPersona = momentRyanScore > atozitScore ? 'moment.ryan' : 'atozit';
      const confidence = Math.max(momentRyanScore, atozitScore);
      const shouldSwitch = currentPersona !== recommendedPersona && confidence > 0.6;
      
      const triggerKeywords = this.getMatchingKeywords(keywords, recommendedPersona);
      const reason = this.generateSwitchReason(recommendedPersona, triggerKeywords);
      
      return {
        shouldSwitch,
        recommendedPersona,
        confidence,
        reason,
        triggerKeywords
      };
    } catch (error) {
      console.error('페르소나 스위칭 판단 실패:', error);
      return {
        shouldSwitch: false,
        recommendedPersona: currentPersona || 'moment.ryan',
        confidence: 0,
        reason: '판단 실패',
        triggerKeywords: []
      };
    }
  }

  // 학습 통계 조회
  static async getLearningStats(personaType: 'moment.ryan' | 'atozit'): Promise<any> {
    try {
      const profile = await this.loadPersonaProfile(personaType);
      
      return {
        personaType,
        version: profile.version,
        lastUpdated: profile.lastUpdated,
        totalConversations: profile.learningMetadata.totalConversations,
        totalMessages: profile.learningMetadata.totalMessages,
        qualityScore: profile.learningMetadata.qualityScore,
        confidenceLevel: profile.learningMetadata.confidenceLevel,
        expertise: {
          primaryAreas: profile.expertise.primaryAreas,
          knowledgeBaseSize: profile.expertise.knowledgeBase.length,
          experienceLevel: profile.expertise.experienceLevel
        },
        communicationStyle: profile.communicationStyle,
        businessPerspective: profile.businessPerspective,
        writingPattern: profile.writingPattern
      };
    } catch (error) {
      console.error('학습 통계 조회 실패:', error);
      return null;
    }
  }

  // 헬퍼 메서드들
  private static getDefaultExpertiseAreas(personaType: 'moment.ryan' | 'atozit'): string[] {
    switch (personaType) {
      case 'moment.ryan':
        return ['디지털 마케팅', 'SNS 전략', '콘텐츠 기획', '브랜드 스토리텔링'];
      case 'atozit':
        return ['브랜딩', '고객 경험', '경영 전략', '비즈니스 프로세스'];
      default:
        return [];
    }
  }

  private static getDefaultIndustryFocus(personaType: 'moment.ryan' | 'atozit'): string[] {
    switch (personaType) {
      case 'moment.ryan':
        return ['스타트업', '개인 브랜딩', '온라인 비즈니스', '디지털 에이전시'];
      case 'atozit':
        return ['기업 컨설팅', 'IT 서비스', '디지털 트랜스포메이션', 'B2B 솔루션'];
      default:
        return [];
    }
  }

  private static async extractRealTimeInsights(
    content: string, 
    personaType: 'moment.ryan' | 'atozit'
  ): Promise<any> {
    // 실제로는 NLP 분석 또는 AI 모델 사용
    return {
      qualityScore: 0.7,
      categories: ['expertise', 'communication'],
      insights: {
        newTerms: [],
        approaches: [],
        preferences: []
      }
    };
  }

  private static async applyRealTimeInsights(
    profile: PersonaProfile,
    insights: any,
    adminEmail: string
  ): Promise<PersonaProfile> {
    // 실시간 인사이트를 프로필에 적용
    const updatedProfile = { ...profile };
    updatedProfile.lastUpdated = new Date().toISOString();
    updatedProfile.learningMetadata.totalMessages += 1;
    
    return updatedProfile;
  }

  private static validateSessionQuality(
    summary: SessionSummary, 
    config: PersonaLearningConfig
  ): boolean {
    // 세션 품질 검증 로직
    return summary.keyTopics.length >= config.qualityThresholds.minSessionLength;
  }

  private static async applyBatchLearning(
    profile: PersonaProfile,
    summary: SessionSummary
  ): Promise<PersonaProfile> {
    // 배치 학습 내용을 프로필에 적용
    const updatedProfile = { ...profile };
    
    // 전문성 영역 업데이트
    if (summary.expertiseAreas.length > 0) {
      updatedProfile.expertise.primaryAreas = [
        ...new Set([...profile.expertise.primaryAreas, ...summary.expertiseAreas])
      ];
    }
    
    // 커뮤니케이션 스타일 업데이트
    if (summary.personalityTraits) {
      Object.assign(updatedProfile.communicationStyle, summary.personalityTraits);
    }
    
    // 비즈니스 관점 업데이트
    if (summary.businessInsights) {
      updatedProfile.businessPerspective.industryFocus = [
        ...new Set([
          ...profile.businessPerspective.industryFocus,
          ...(summary.businessInsights.industryFocus || [])
        ])
      ];
    }
    
    // 메타데이터 업데이트
    updatedProfile.learningMetadata.totalConversations += 1;
    updatedProfile.learningMetadata.lastMajorUpdate = new Date().toISOString();
    updatedProfile.lastUpdated = new Date().toISOString();
    
    return updatedProfile;
  }

  private static extractKeywords(text: string): string[] {
    // 실제로는 더 정교한 키워드 추출 로직
    const keywords = text.toLowerCase().split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 10);
    
    return keywords;
  }

  private static calculatePersonaScore(keywords: string[], personaType: 'moment.ryan' | 'atozit'): number {
    const personaKeywords = {
      'moment.ryan': ['마케팅', '콘텐츠', 'sns', '브랜드', '캠페인', '소셜미디어', '인플루언서', '트렌드'],
      'atozit': ['브랜딩', '고객', '경영', '전략', '비즈니스', '프로세스', '서비스', '컨설팅']
    };
    
    const relevantKeywords = personaKeywords[personaType];
    const matches = keywords.filter(keyword => 
      relevantKeywords.some(pk => keyword.includes(pk) || pk.includes(keyword))
    );
    
    return matches.length / keywords.length;
  }

  private static getMatchingKeywords(keywords: string[], personaType: 'moment.ryan' | 'atozit'): string[] {
    const personaKeywords = {
      'moment.ryan': ['마케팅', '콘텐츠', 'sns'],
      'atozit': ['브랜딩', '고객', '경영']
    };
    
    return keywords.filter(keyword => 
      personaKeywords[personaType].some(pk => keyword.includes(pk))
    );
  }

  private static generateSwitchReason(personaType: 'moment.ryan' | 'atozit', keywords: string[]): string {
    return `${keywords.join(', ')} 관련 질문으로 ${personaType} 페르소나가 더 적합합니다.`;
  }

  private static async loadPersonaProfile(personaType: 'moment.ryan' | 'atozit'): Promise<PersonaProfile> {
    // 실제로는 데이터베이스에서 로드
    return this.initializePersonaProfile(personaType);
  }

  private static async savePersonaProfile(personaType: 'moment.ryan' | 'atozit', profile: PersonaProfile): Promise<void> {
    // 실제로는 데이터베이스에 저장
    console.log(`💾 ${personaType} 페르소나 프로필 저장 완료`);
  }

  private static async logLearningUpdate(
    personaType: 'moment.ryan' | 'atozit',
    updateType: string,
    insights: any,
    adminEmail: string
  ): Promise<void> {
    // 학습 로그 기록
    console.log(`📝 ${personaType} 학습 로그 기록: ${updateType} by ${adminEmail}`);
  }
}