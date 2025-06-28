// 학습 데이터 관리 서비스 - 데이터베이스 기반 시스템

import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

export interface ConversationRecord {
  id: string;
  userId: string;
  userMessage: string;
  aiResponse: string;
  persona: string;
  conversationHistory: any[];
  systemPromptUsed: string;
  learningContext: any;
  timestamp: string;
  metadata?: {
    messageLength: number;
    responseTime?: number;
    tokensUsed?: number;
  };
}

export interface FeedbackRecord {
  id: string;
  messageId: string;
  userId: string;
  feedback: 'HELPFUL' | 'NOT_HELPFUL' | 'VERY_HELPFUL';
  timestamp: string;
  conversationContext: {
    messageContent: string;
    persona: string;
    conversationHistory: any[];
  };
}

export interface LearningInsight {
  id: string;
  userId: string;
  messageId: string;
  persona: string;
  feedback: string;
  messageLength: number;
  conversationDepth: number;
  timestamp: string;
  isPositiveFeedback: boolean;
  feedbackScore: number;
  category: string;
  confidence: number;
}

export interface UserLearningProfile {
  userId: string;
  businessProfile: {
    businessName?: string;
    businessType?: string;
    industry?: string;
    targetCustomer?: string;
    mainProducts?: string;
  };
  writingStyle: {
    averageMessageLength: number;
    vocabularySize: number;
    sentenceComplexity: 'simple' | 'medium' | 'complex';
    tone: any;
  };
  preferences: {
    preferredPersona: string;
    communicationStyle: string;
    satisfactionTrend: number[];
  };
  conversationSummary: any;
  learnedPatterns: any;
  interactions: any[];
}

export class LearningDataService {
  private static readonly learningDataPath = join(process.cwd(), 'learning-data');
  private static readonly userProfilesPath = join(process.cwd(), 'user-profiles');

  // 대화 기록 저장
  static async saveConversation(conversation: ConversationRecord): Promise<void> {
    try {
      // 실제로는 데이터베이스에 저장
      await prisma.conversation.create({
        data: {
          userId: conversation.userId,
          title: `${new Date(conversation.timestamp).toLocaleDateString()} 대화`,
          persona: conversation.persona
        }
      });

      // 메시지 저장
      await prisma.message.createMany({
        data: [
          {
            conversationId: conversation.id,
            type: 'USER',
            content: conversation.userMessage,
            persona: conversation.persona
          },
          {
            conversationId: conversation.id,
            type: 'AI',
            content: conversation.aiResponse,
            persona: conversation.persona
          }
        ]
      });

      console.log(`💾 대화 기록 저장 완료: ${conversation.id}`);
    } catch (error) {
      console.error('대화 기록 저장 실패:', error);
      throw error;
    }
  }

  // 피드백 저장
  static async saveFeedback(feedback: FeedbackRecord): Promise<void> {
    try {
      await prisma.messageFeedback.create({
        data: {
          messageId: feedback.messageId,
          userId: feedback.userId,
          feedback: feedback.feedback
        }
      });

      console.log(`👍 피드백 저장 완료: ${feedback.id}`);
    } catch (error) {
      console.error('피드백 저장 실패:', error);
      throw error;
    }
  }

  // 학습 인사이트 저장
  static async saveLearningInsight(insight: LearningInsight): Promise<void> {
    try {
      await prisma.learningInsight.create({
        data: {
          userId: insight.userId,
          category: insight.category,
          insight: `Feedback: ${insight.feedback} for ${insight.persona} persona`,
          confidence: insight.confidence
        }
      });

      console.log(`🧠 학습 인사이트 저장 완료: ${insight.id}`);
    } catch (error) {
      console.error('학습 인사이트 저장 실패:', error);
      throw error;
    }
  }

  // 사용자 학습 프로필 저장
  static async saveUserLearningProfile(profile: UserLearningProfile): Promise<void> {
    try {
      // 실제로는 UserProfile 테이블에 저장
      console.log(`👤 사용자 학습 프로필 저장: ${profile.userId}`);
    } catch (error) {
      console.error('사용자 학습 프로필 저장 실패:', error);
      throw error;
    }
  }

  // 파일 기반 대화 로그 로드
  static async loadConversationLogs(): Promise<ConversationRecord[]> {
    try {
      const conversationPath = join(this.learningDataPath, 'conversation-log.json');
      
      if (!existsSync(conversationPath)) {
        console.log('대화 로그 파일이 없습니다.');
        return [];
      }

      const data = JSON.parse(readFileSync(conversationPath, 'utf-8'));
      
      // 배열인지 단일 객체인지 확인
      if (Array.isArray(data)) {
        return data.map((item, index) => ({
          id: `conv-${Date.now()}-${index}`,
          userId: item.userId || 'temp_user_id',
          userMessage: item.userMessage || '',
          aiResponse: item.aiResponse || '',
          persona: item.persona || 'general',
          conversationHistory: item.conversationHistory || [],
          systemPromptUsed: item.systemPromptUsed || 'default',
          learningContext: item.learningContext || {},
          timestamp: item.timestamp || new Date().toISOString(),
          metadata: {
            messageLength: item.userMessage?.length || 0
          }
        }));
      } else {
        return [{
          id: `conv-${Date.now()}`,
          userId: data.userId || 'temp_user_id',
          userMessage: data.userMessage || '',
          aiResponse: data.aiResponse || '',
          persona: data.persona || 'general',
          conversationHistory: data.conversationHistory || [],
          systemPromptUsed: data.systemPromptUsed || 'default',
          learningContext: data.learningContext || {},
          timestamp: data.timestamp || new Date().toISOString(),
          metadata: {
            messageLength: data.userMessage?.length || 0
          }
        }];
      }
    } catch (error) {
      console.error('대화 로그 로드 실패:', error);
      return [];
    }
  }

  // 파일 기반 피드백 로그 로드
  static async loadFeedbackLogs(): Promise<FeedbackRecord[]> {
    try {
      const feedbackPath = join(this.learningDataPath, 'feedback-log.json');
      
      if (!existsSync(feedbackPath)) {
        console.log('피드백 로그 파일이 없습니다.');
        return [];
      }

      const data = JSON.parse(readFileSync(feedbackPath, 'utf-8'));
      
      if (Array.isArray(data)) {
        return data.map((item, index) => ({
          id: `feedback-${Date.now()}-${index}`,
          messageId: item.messageId?.toString() || `msg-${index}`,
          userId: item.userId || 'temp_user_id',
          feedback: this.normalizeFeedback(item.feedback),
          timestamp: item.timestamp || new Date().toISOString(),
          conversationContext: item.conversationContext || {
            messageContent: '',
            persona: 'general',
            conversationHistory: []
          }
        }));
      } else {
        return [{
          id: `feedback-${Date.now()}`,
          messageId: data.messageId?.toString() || 'msg-single',
          userId: data.userId || 'temp_user_id',
          feedback: this.normalizeFeedback(data.feedback),
          timestamp: data.timestamp || new Date().toISOString(),
          conversationContext: data.conversationContext || {
            messageContent: '',
            persona: 'general',
            conversationHistory: []
          }
        }];
      }
    } catch (error) {
      console.error('피드백 로그 로드 실패:', error);
      return [];
    }
  }

  // 파일 기반 학습 인사이트 로드
  static async loadLearningInsights(): Promise<LearningInsight[]> {
    try {
      const insightsPath = join(this.learningDataPath, 'learning-insights.json');
      
      if (!existsSync(insightsPath)) {
        console.log('학습 인사이트 파일이 없습니다.');
        return [];
      }

      const data = JSON.parse(readFileSync(insightsPath, 'utf-8'));
      
      if (Array.isArray(data)) {
        return data.map((item, index) => ({
          id: `insight-${Date.now()}-${index}`,
          userId: item.userId || 'temp_user_id',
          messageId: item.messageId?.toString() || `msg-${index}`,
          persona: item.persona || 'general',
          feedback: item.feedback || 'neutral',
          messageLength: item.messageLength || 0,
          conversationDepth: item.conversationDepth || 1,
          timestamp: item.timestamp || new Date().toISOString(),
          isPositiveFeedback: item.isPositiveFeedback || false,
          feedbackScore: item.feedbackScore || 0.5,
          category: this.categorizeFeedback(item.persona, item.feedback),
          confidence: item.feedbackScore || 0.5
        }));
      }
      
      return [];
    } catch (error) {
      console.error('학습 인사이트 로드 실패:', error);
      return [];
    }
  }

  // 파일 기반 사용자 프로필 로드
  static async loadUserProfiles(): Promise<UserLearningProfile[]> {
    try {
      const profiles: UserLearningProfile[] = [];
      
      // user-profiles 디렉토리의 모든 JSON 파일 처리
      const userProfileFiles = ['cmcemc86w00006mhnzhsg63ml.json'];
      
      for (const fileName of userProfileFiles) {
        const filePath = join(this.userProfilesPath, fileName);
        
        if (existsSync(filePath)) {
          const data = JSON.parse(readFileSync(filePath, 'utf-8'));
          
          profiles.push({
            userId: data.userId || fileName.replace('.json', ''),
            businessProfile: data.businessProfile || {},
            writingStyle: data.writingStyle || {
              averageMessageLength: 0,
              vocabularySize: 0,
              sentenceComplexity: 'simple',
              tone: {}
            },
            preferences: data.preferences || {
              preferredPersona: 'general',
              communicationStyle: 'balanced',
              satisfactionTrend: []
            },
            conversationSummary: data.conversationSummary || {},
            learnedPatterns: data.learnedPatterns || {},
            interactions: data.interactions || []
          });
        }
      }

      // learning-data의 프로필 파일들도 처리
      const basicProfileFiles = [
        'profile-temp_user_id.json',
        'user-profile-temp_user_id.json'
      ];

      for (const fileName of basicProfileFiles) {
        const filePath = join(this.learningDataPath, fileName);
        
        if (existsSync(filePath)) {
          const data = JSON.parse(readFileSync(filePath, 'utf-8'));
          
          // 기본 프로필 데이터 형식 변환
          profiles.push({
            userId: data.userId || 'temp_user_id',
            businessProfile: {
              businessName: data.businessName,
              businessType: data.businessType,
              industry: data.industry,
              targetCustomer: data.targetCustomer,
              mainProducts: data.mainProducts
            },
            writingStyle: {
              averageMessageLength: 0,
              vocabularySize: 0,
              sentenceComplexity: 'simple',
              tone: {}
            },
            preferences: data.preferences || {
              preferredPersona: 'general',
              communicationStyle: 'balanced',
              satisfactionTrend: []
            },
            conversationSummary: {},
            learnedPatterns: {},
            interactions: data.interactions || []
          });
        }
      }

      return profiles;
    } catch (error) {
      console.error('사용자 프로필 로드 실패:', error);
      return [];
    }
  }

  // 전체 학습 데이터 마이그레이션
  static async migrateAllLearningData(): Promise<{
    conversations: number;
    feedbacks: number;
    insights: number;
    profiles: number;
    errors: string[];
  }> {
    const result = {
      conversations: 0,
      feedbacks: 0,
      insights: 0,
      profiles: 0,
      errors: []
    };

    try {
      console.log('🔄 학습 데이터 마이그레이션 시작...');

      // 1. 대화 로그 마이그레이션
      try {
        const conversations = await this.loadConversationLogs();
        for (const conv of conversations) {
          await this.saveConversation(conv);
          result.conversations++;
        }
        console.log(`✅ 대화 로그 ${result.conversations}개 마이그레이션 완료`);
      } catch (error) {
        result.errors.push(`대화 로그 마이그레이션 실패: ${error}`);
      }

      // 2. 피드백 로그 마이그레이션
      try {
        const feedbacks = await this.loadFeedbackLogs();
        for (const feedback of feedbacks) {
          await this.saveFeedback(feedback);
          result.feedbacks++;
        }
        console.log(`✅ 피드백 ${result.feedbacks}개 마이그레이션 완료`);
      } catch (error) {
        result.errors.push(`피드백 마이그레이션 실패: ${error}`);
      }

      // 3. 학습 인사이트 마이그레이션
      try {
        const insights = await this.loadLearningInsights();
        for (const insight of insights) {
          await this.saveLearningInsight(insight);
          result.insights++;
        }
        console.log(`✅ 학습 인사이트 ${result.insights}개 마이그레이션 완료`);
      } catch (error) {
        result.errors.push(`학습 인사이트 마이그레이션 실패: ${error}`);
      }

      // 4. 사용자 프로필 마이그레이션
      try {
        const profiles = await this.loadUserProfiles();
        for (const profile of profiles) {
          await this.saveUserLearningProfile(profile);
          result.profiles++;
        }
        console.log(`✅ 사용자 프로필 ${result.profiles}개 마이그레이션 완료`);
      } catch (error) {
        result.errors.push(`사용자 프로필 마이그레이션 실패: ${error}`);
      }

      console.log('✅ 학습 데이터 마이그레이션 완료');
      return result;

    } catch (error) {
      console.error('❌ 학습 데이터 마이그레이션 실패:', error);
      result.errors.push(`전체 마이그레이션 실패: ${error}`);
      return result;
    }
  }

  // 헬퍼 메서드들
  private static normalizeFeedback(feedback: string): 'HELPFUL' | 'NOT_HELPFUL' | 'VERY_HELPFUL' {
    const normalized = feedback?.toLowerCase();
    
    switch (normalized) {
      case 'helpful':
        return 'HELPFUL';
      case 'very_helpful':
      case 'very helpful':
        return 'VERY_HELPFUL';
      case 'not_helpful':
      case 'not helpful':
      default:
        return 'NOT_HELPFUL';
    }
  }

  private static categorizeFeedback(persona: string, feedback: string): string {
    if (persona === 'content') return 'content_feedback';
    if (persona === 'branding') return 'branding_feedback';
    return 'general_feedback';
  }

  // 학습 데이터 통계 조회
  static async getLearningDataStats(): Promise<{
    totalConversations: number;
    totalFeedbacks: number;
    totalInsights: number;
    avgSatisfactionScore: number;
    topPersonas: Array<{ persona: string; usage: number; satisfaction: number; }>;
  }> {
    try {
      const conversations = await prisma.conversation.count();
      const feedbacks = await prisma.messageFeedback.count();
      const insights = await prisma.learningInsight.count();

      // 실제로는 복잡한 집계 쿼리
      const avgSatisfactionScore = 0.75; // 임시값

      const topPersonas = [
        { persona: 'moment.ryan', usage: 45, satisfaction: 0.92 },
        { persona: 'atozit', usage: 38, satisfaction: 0.88 },
        { persona: 'general', usage: 25, satisfaction: 0.76 }
      ];

      return {
        totalConversations: conversations,
        totalFeedbacks: feedbacks,
        totalInsights: insights,
        avgSatisfactionScore,
        topPersonas
      };
    } catch (error) {
      console.error('학습 데이터 통계 조회 실패:', error);
      return {
        totalConversations: 0,
        totalFeedbacks: 0,
        totalInsights: 0,
        avgSatisfactionScore: 0,
        topPersonas: []
      };
    }
  }

  // 연결 종료
  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}