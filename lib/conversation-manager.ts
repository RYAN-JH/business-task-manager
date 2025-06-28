// Admin 페르소나 학습을 위한 대화 관리 시스템

export interface ConversationSession {
  id: string;
  userId: string;
  adminEmail?: string;
  personaType: 'moment.ryan' | 'atozit';
  sessionStartTime: string;
  sessionEndTime?: string;
  totalMessages: number;
  sessionStatus: 'active' | 'completed' | 'summarized';
  sessionTitle?: string;
  sessionContext?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  sessionId: string;
  messageIndex: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageType: 'chat' | 'proactive_question' | 'expertise_extraction';
  timestamp: string;
  metadata?: any;
  learningPriority: number; // 1-10, 1이 최고 우선순위
  extractedInsights?: any;
}

export interface SessionSummary {
  id: string;
  sessionId: string;
  personaType: 'moment.ryan' | 'atozit';
  adminEmail: string;
  summaryContent: string;
  extractedKnowledge: any;
  learningInsights: any;
  keyTopics: string[];
  expertiseAreas: string[];
  personalityTraits: any;
  writingStyleAnalysis: any;
  businessInsights: any;
  createdAt: string;
  appliedToPersona: boolean;
  appliedAt?: string;
}

export interface PersonaLearningLog {
  id: string;
  personaType: 'moment.ryan' | 'atozit';
  sourceType: 'admin_conversation' | 'maily_data' | 'social_media' | 'manual_update';
  sourceId?: string;
  updateType: 'writing_style' | 'expertise' | 'personality' | 'business_knowledge' | 'full_sync';
  previousData?: any;
  newData?: any;
  changeDescription?: string;
  learningPriority: number;
  createdAt: string;
  createdBy?: string;
}

export class ConversationManager {
  // 새로운 대화 세션 시작
  static async startConversationSession(
    userId: string, 
    adminEmail: string, 
    personaType: 'moment.ryan' | 'atozit'
  ): Promise<ConversationSession> {
    try {
      // SQLite에 새 세션 생성
      const sessionId = this.generateId();
      const now = new Date().toISOString();
      
      const session: ConversationSession = {
        id: sessionId,
        userId,
        adminEmail,
        personaType,
        sessionStartTime: now,
        totalMessages: 0,
        sessionStatus: 'active',
        sessionTitle: this.generateSessionTitle(personaType),
        sessionContext: {
          userAgent: globalThis.navigator?.userAgent || 'Unknown',
          startedFrom: 'chat_interface',
          initialPersona: personaType
        },
        createdAt: now,
        updatedAt: now
      };

      console.log(`🎯 새 Admin 대화 세션 시작: ${personaType} - ${adminEmail}`);
      
      // 실제 구현에서는 여기서 데이터베이스에 저장
      // await db.conversationSession.create({ data: session });
      
      return session;
    } catch (error) {
      console.error('대화 세션 시작 실패:', error);
      throw error;
    }
  }

  // 대화 메시지 저장
  static async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    messageType: 'chat' | 'proactive_question' | 'expertise_extraction' = 'chat',
    learningPriority: number = 5,
    metadata?: any
  ): Promise<ConversationMessage> {
    try {
      const messageId = this.generateId();
      const now = new Date().toISOString();
      
      // 현재 세션의 메시지 개수 조회 (실제로는 DB에서)
      const messageIndex = await this.getNextMessageIndex(sessionId);
      
      const message: ConversationMessage = {
        id: messageId,
        sessionId,
        messageIndex,
        role,
        content,
        messageType,
        timestamp: now,
        metadata,
        learningPriority,
        extractedInsights: await this.extractInsights(content, role)
      };

      // Admin 메시지의 경우 학습 우선순위를 높게 설정
      if (role === 'user' && await this.isAdminSession(sessionId)) {
        message.learningPriority = Math.min(message.learningPriority, 3);
      }

      console.log(`💬 메시지 저장: ${role} - 우선순위 ${message.learningPriority}`);
      
      // 실제 구현에서는 여기서 데이터베이스에 저장
      // await db.conversationMessage.create({ data: message });
      
      // 세션의 총 메시지 수 업데이트
      await this.updateSessionMessageCount(sessionId);
      
      return message;
    } catch (error) {
      console.error('메시지 저장 실패:', error);
      throw error;
    }
  }

  // 대화 세션 종료
  static async endConversationSession(sessionId: string): Promise<SessionSummary> {
    try {
      const now = new Date().toISOString();
      
      // 세션 정보 조회
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('세션을 찾을 수 없습니다.');
      }

      // 세션의 모든 메시지 조회
      const messages = await this.getSessionMessages(sessionId);
      
      // 세션 상태를 'completed'로 업데이트
      await this.updateSessionStatus(sessionId, 'completed', now);
      
      // 세션 요약 생성
      const summary = await this.generateSessionSummary(session, messages);
      
      console.log(`📋 세션 요약 생성 완료: ${session.personaType} - ${messages.length}개 메시지`);
      
      // 페르소나 학습에 반영 (백그라운드에서 실행)
      this.applyLearningToPersona(summary).catch(console.error);
      
      return summary;
    } catch (error) {
      console.error('세션 종료 실패:', error);
      throw error;
    }
  }

  // 세션 요약 생성
  private static async generateSessionSummary(
    session: ConversationSession, 
    messages: ConversationMessage[]
  ): Promise<SessionSummary> {
    try {
      const adminMessages = messages.filter(m => m.role === 'user');
      const assistantMessages = messages.filter(m => m.role === 'assistant');
      
      // AI를 사용한 대화 분석 (실제로는 OpenAI API 호출)
      const analysis = await this.analyzeConversation(messages, session.personaType);
      
      const summaryId = this.generateId();
      const now = new Date().toISOString();
      
      const summary: SessionSummary = {
        id: summaryId,
        sessionId: session.id,
        personaType: session.personaType,
        adminEmail: session.adminEmail!,
        summaryContent: analysis.overallSummary,
        extractedKnowledge: analysis.knowledgeExtraction,
        learningInsights: analysis.learningInsights,
        keyTopics: analysis.keyTopics,
        expertiseAreas: analysis.expertiseAreas,
        personalityTraits: analysis.personalityTraits,
        writingStyleAnalysis: analysis.writingStyle,
        businessInsights: analysis.businessInsights,
        createdAt: now,
        appliedToPersona: false
      };

      // 실제 구현에서는 여기서 데이터베이스에 저장
      // await db.sessionSummary.create({ data: summary });
      
      return summary;
    } catch (error) {
      console.error('세션 요약 생성 실패:', error);
      throw error;
    }
  }

  // AI를 사용한 대화 분석
  private static async analyzeConversation(
    messages: ConversationMessage[], 
    personaType: 'moment.ryan' | 'atozit'
  ): Promise<any> {
    try {
      const conversationText = messages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      // 페르소나별 분석 프롬프트 설정
      const analysisPrompt = this.getAnalysisPrompt(personaType);
      
      // 실제로는 OpenAI API 호출하여 분석
      const analysis = {
        overallSummary: `${personaType} 페르소나의 ${messages.length}개 메시지 대화 요약`,
        knowledgeExtraction: {
          technicalKnowledge: [],
          industryInsights: [],
          methodologies: [],
          tools: [],
          concepts: []
        },
        learningInsights: {
          strengths: [],
          expertiseGaps: [],
          communicationStyle: {},
          preferredApproaches: []
        },
        keyTopics: this.extractKeyTopics(conversationText),
        expertiseAreas: this.identifyExpertiseAreas(conversationText, personaType),
        personalityTraits: {
          communicationStyle: 'direct',
          enthusiasm: 0.8,
          technical_depth: 0.9,
          business_focus: 0.7
        },
        writingStyle: {
          averageMessageLength: this.calculateAverageLength(messages),
          preferredTerms: [],
          tone: 'professional',
          complexity: 'high'
        },
        businessInsights: {
          industryFocus: [],
          challenges: [],
          opportunities: [],
          priorities: []
        }
      };

      return analysis;
    } catch (error) {
      console.error('대화 분석 실패:', error);
      throw error;
    }
  }

  // 페르소나에 학습 내용 반영
  private static async applyLearningToPersona(summary: SessionSummary): Promise<void> {
    try {
      console.log(`🧠 페르소나 학습 반영 시작: ${summary.personaType}`);
      
      // 기존 마스터 프로필 로드
      const masterProfile = await this.loadMasterProfile(summary.personaType);
      
      // 학습 내용을 마스터 프로필에 통합
      const updatedProfile = await this.integrateLearning(masterProfile, summary);
      
      // 업데이트된 프로필 저장
      await this.saveMasterProfile(summary.personaType, updatedProfile);
      
      // 학습 로그 기록
      await this.logPersonaLearning(summary);
      
      // 요약의 appliedToPersona 플래그 업데이트
      await this.markSummaryAsApplied(summary.id);
      
      console.log(`✅ 페르소나 학습 반영 완료: ${summary.personaType}`);
    } catch (error) {
      console.error('페르소나 학습 반영 실패:', error);
      throw error;
    }
  }

  // 헬퍼 메서드들
  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private static generateSessionTitle(personaType: string): string {
    const now = new Date();
    const timeStr = now.toLocaleString('ko-KR', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${personaType} 학습 세션 - ${timeStr}`;
  }

  private static async getNextMessageIndex(sessionId: string): Promise<number> {
    // 실제로는 DB에서 해당 세션의 마지막 메시지 인덱스 조회
    return 1; // 임시값
  }

  private static async isAdminSession(sessionId: string): Promise<boolean> {
    // 실제로는 DB에서 세션 정보 조회하여 admin 여부 확인
    return true; // 임시값
  }

  private static async extractInsights(content: string, role: string): Promise<any> {
    // 메시지에서 인사이트 추출 (키워드, 감정, 의도 등)
    return {
      keywords: [],
      sentiment: 'neutral',
      intent: 'information',
      complexity: 'medium'
    };
  }

  private static async updateSessionMessageCount(sessionId: string): Promise<void> {
    // 실제로는 DB의 세션 레코드 업데이트
    console.log(`메시지 카운트 업데이트: ${sessionId}`);
  }

  private static async getSession(sessionId: string): Promise<ConversationSession | null> {
    // 실제로는 DB에서 세션 조회
    return null;
  }

  private static async getSessionMessages(sessionId: string): Promise<ConversationMessage[]> {
    // 실제로는 DB에서 해당 세션의 모든 메시지 조회
    return [];
  }

  private static async updateSessionStatus(
    sessionId: string, 
    status: 'active' | 'completed' | 'summarized', 
    endTime?: string
  ): Promise<void> {
    // 실제로는 DB의 세션 상태 업데이트
    console.log(`세션 상태 업데이트: ${sessionId} -> ${status}`);
  }

  private static getAnalysisPrompt(personaType: 'moment.ryan' | 'atozit'): string {
    const basePrompt = `다음 대화를 분석하여 ${personaType} 페르소나의 특성을 추출하세요:`;
    
    switch (personaType) {
      case 'moment.ryan':
        return basePrompt + `
        특히 다음 영역에 집중하세요:
        - 마케팅 전략 및 콘텐츠 기획 전문성
        - SNS 운영 및 디지털 마케팅 인사이트
        - 창의적 사고와 트렌드 분석 능력
        - 실용적이고 실행 가능한 솔루션 제시 스타일`;
      
      case 'atozit':
        return basePrompt + `
        특히 다음 영역에 집중하세요:
        - 브랜딩 및 고객 경험 전문성
        - 경영 전략 및 비즈니스 개발 인사이트
        - 시스템적 사고와 프로세스 최적화
        - 구조적이고 논리적인 문제 해결 스타일`;
      
      default:
        return basePrompt;
    }
  }

  private static extractKeyTopics(text: string): string[] {
    // 실제로는 NLP를 사용하여 주요 토픽 추출
    return ['마케팅', '콘텐츠', '전략'];
  }

  private static identifyExpertiseAreas(text: string, personaType: string): string[] {
    // 페르소나 타입에 따른 전문 분야 식별
    const baseAreas = personaType === 'moment.ryan' 
      ? ['디지털 마케팅', 'SNS 전략', '콘텐츠 기획']
      : ['브랜딩', '고객 경험', '경영 전략'];
    
    return baseAreas;
  }

  private static calculateAverageLength(messages: ConversationMessage[]): number {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return 0;
    
    const totalLength = userMessages.reduce((sum, m) => sum + m.content.length, 0);
    return Math.round(totalLength / userMessages.length);
  }

  private static async loadMasterProfile(personaType: string): Promise<any> {
    // 기존 마스터 프로필 로드
    return {};
  }

  private static async integrateLearning(masterProfile: any, summary: SessionSummary): Promise<any> {
    // 학습 내용을 기존 프로필에 통합
    return masterProfile;
  }

  private static async saveMasterProfile(personaType: string, profile: any): Promise<void> {
    // 업데이트된 프로필 저장
    console.log(`마스터 프로필 저장: ${personaType}`);
  }

  private static async logPersonaLearning(summary: SessionSummary): Promise<void> {
    // 페르소나 학습 로그 기록
    const log: PersonaLearningLog = {
      id: this.generateId(),
      personaType: summary.personaType,
      sourceType: 'admin_conversation',
      sourceId: summary.id,
      updateType: 'full_sync',
      changeDescription: `Admin 대화 세션 ${summary.sessionId}에서 학습`,
      learningPriority: 2, // Admin 대화는 높은 우선순위
      createdAt: new Date().toISOString(),
      createdBy: summary.adminEmail
    };

    console.log(`📝 페르소나 학습 로그 기록: ${summary.personaType}`);
  }

  private static async markSummaryAsApplied(summaryId: string): Promise<void> {
    // 요약의 appliedToPersona 플래그를 true로 업데이트
    console.log(`요약 적용 완료 표시: ${summaryId}`);
  }
}

// 대화 세션 관리 유틸리티
export const ConversationUtils = {
  // 현재 활성 세션 조회
  async getActiveSession(userId: string): Promise<ConversationSession | null> {
    // 실제로는 DB에서 조회
    return null;
  },

  // 사용자의 모든 세션 조회
  async getUserSessions(userId: string, limit: number = 10): Promise<ConversationSession[]> {
    // 실제로는 DB에서 조회
    return [];
  },

  // 세션 검색
  async searchSessions(
    query: string, 
    personaType?: 'moment.ryan' | 'atozit',
    adminEmail?: string
  ): Promise<ConversationSession[]> {
    // 실제로는 DB에서 검색
    return [];
  },

  // 학습 통계 조회
  async getLearningStats(personaType: 'moment.ryan' | 'atozit'): Promise<any> {
    return {
      totalSessions: 0,
      totalMessages: 0,
      learningProgress: 0,
      lastUpdate: new Date().toISOString()
    };
  }
};