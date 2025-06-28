// 마스터 프로필 시스템 - 사용자별 종합 학습 데이터 관리
import { WritingStyleProfile, MessageAnalysis, WritingStyleAnalyzer } from './writing-style-analyzer';
import { UserProfile } from './question-system';
import { ConversationContext } from './conversation-context-system';

export interface MasterUserProfile {
  // 기본 정보
  userId: string;
  createdAt: string;
  lastUpdated: string;
  version: number;
  
  // 비즈니스 프로필 (기존)
  businessProfile: UserProfile;
  
  // 글쓰기 스타일 프로필 (신규)
  writingStyle: WritingStyleProfile;
  
  // 대화 히스토리 요약
  conversationSummary: {
    totalConversations: number;
    totalMessages: number;
    averageSessionLength: number;
    lastConversationDate: string;
    topDiscussedTopics: { [topic: string]: number };
    conversationEvolution: ConversationEvolutionPoint[];
  };
  
  // 학습된 패턴
  learnedPatterns: {
    preferredResponseLength: 'short' | 'medium' | 'long';
    preferredDetailLevel: 'overview' | 'detailed' | 'comprehensive';
    interactionStyle: 'formal' | 'casual' | 'friendly' | 'professional';
    feedbackPatterns: {
      positiveResponses: string[];
      negativeIndicators: string[];
      engagementTriggers: string[];
    };
  };
  
  // 개인화 인사이트
  personalizationInsights: {
    communicationPreferences: {
      directness: number; // 0-100
      supportiveness: number; // 0-100
      technicalDepth: number; // 0-100
      creativityLevel: number; // 0-100
    };
    motivationFactors: string[];
    painPoints: string[];
    successPatterns: string[];
    avoidancePatterns: string[];
  };
  
  // 컨텍스트 기억
  contextMemory: {
    ongoingProjects: ContextProject[];
    previousSolutions: ContextSolution[];
    personalReferences: ContextReference[];
    goalTracker: ContextGoal[];
  };
  
  // 품질 메트릭
  profileQuality: {
    dataRichness: number; // 0-100
    consistencyScore: number; // 0-100
    predictionAccuracy: number; // 0-100
    lastQualityCheck: string;
  };
}

export interface ConversationEvolutionPoint {
  date: string;
  topicsShift: string[];
  styleChanges: {
    formalityChange: number;
    enthusiasmChange: number;
    complexityChange: number;
  };
  newPatterns: string[];
}

export interface ContextProject {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'paused';
  createdAt: string;
  lastMentioned: string;
  relatedTopics: string[];
  keyDecisions: string[];
}

export interface ContextSolution {
  id: string;
  problem: string;
  solution: string;
  effectiveness: number; // 0-100
  context: string;
  createdAt: string;
  reusable: boolean;
}

export interface ContextReference {
  id: string;
  type: 'preference' | 'constraint' | 'goal' | 'context';
  content: string;
  relevance: number; // 0-100
  lastUsed: string;
  frequency: number;
}

export interface ContextGoal {
  id: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'achieved' | 'abandoned';
  progress: number; // 0-100
  milestones: string[];
  createdAt: string;
  deadline?: string;
}

// 마스터 프로필 관리 클래스
export class MasterProfileManager {
  
  // 새로운 마스터 프로필 생성
  static createNewProfile(userId: string): MasterUserProfile {
    return {
      userId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      version: 1,
      businessProfile: {
        lastUpdated: new Date().toISOString(),
        completionLevel: 0
      },
      writingStyle: WritingStyleAnalyzer.buildStyleProfile([]),
      conversationSummary: {
        totalConversations: 0,
        totalMessages: 0,
        averageSessionLength: 0,
        lastConversationDate: '',
        topDiscussedTopics: {},
        conversationEvolution: []
      },
      learnedPatterns: {
        preferredResponseLength: 'medium',
        preferredDetailLevel: 'detailed',
        interactionStyle: 'professional',
        feedbackPatterns: {
          positiveResponses: [],
          negativeIndicators: [],
          engagementTriggers: []
        }
      },
      personalizationInsights: {
        communicationPreferences: {
          directness: 50,
          supportiveness: 50,
          technicalDepth: 50,
          creativityLevel: 50
        },
        motivationFactors: [],
        painPoints: [],
        successPatterns: [],
        avoidancePatterns: []
      },
      contextMemory: {
        ongoingProjects: [],
        previousSolutions: [],
        personalReferences: [],
        goalTracker: []
      },
      profileQuality: {
        dataRichness: 0,
        consistencyScore: 100,
        predictionAccuracy: 50,
        lastQualityCheck: new Date().toISOString()
      }
    };
  }
  
  // 대화를 통한 프로필 업데이트
  static updateProfileFromConversation(
    masterProfile: MasterUserProfile,
    userMessages: string[],
    aiResponses: string[],
    conversationContext: ConversationContext,
    userFeedback?: { messageId: string, feedback: string }[]
  ): MasterUserProfile {
    
    const updatedProfile = { ...masterProfile };
    
    // 1. 글쓰기 스타일 업데이트
    const messageAnalyses = userMessages.map(msg => WritingStyleAnalyzer.analyzeMessage(msg));
    updatedProfile.writingStyle = WritingStyleAnalyzer.buildStyleProfile(messageAnalyses);
    
    // 2. 대화 요약 업데이트
    updatedProfile.conversationSummary.totalMessages += userMessages.length;
    updatedProfile.conversationSummary.lastConversationDate = new Date().toISOString();
    updatedProfile.conversationSummary.averageSessionLength = 
      (updatedProfile.conversationSummary.averageSessionLength + userMessages.length) / 2;
    
    // 주제별 빈도 업데이트
    const topics = messageAnalyses.flatMap(analysis => analysis.topics);
    topics.forEach(topic => {
      updatedProfile.conversationSummary.topDiscussedTopics[topic] = 
        (updatedProfile.conversationSummary.topDiscussedTopics[topic] || 0) + 1;
    });
    
    // 3. 학습된 패턴 업데이트
    updatedProfile.learnedPatterns = this.updateLearnedPatterns(
      updatedProfile.learnedPatterns, 
      messageAnalyses, 
      aiResponses, 
      userFeedback
    );
    
    // 4. 개인화 인사이트 업데이트
    updatedProfile.personalizationInsights = this.updatePersonalizationInsights(
      updatedProfile.personalizationInsights,
      messageAnalyses,
      conversationContext
    );
    
    // 5. 컨텍스트 메모리 업데이트
    updatedProfile.contextMemory = this.updateContextMemory(
      updatedProfile.contextMemory,
      userMessages,
      conversationContext
    );
    
    // 6. 품질 메트릭 업데이트
    updatedProfile.profileQuality = this.calculateProfileQuality(updatedProfile);
    
    // 7. 진화 포인트 기록
    this.recordEvolutionPoint(updatedProfile, messageAnalyses);
    
    updatedProfile.lastUpdated = new Date().toISOString();
    updatedProfile.version += 1;
    
    return updatedProfile;
  }
  
  // 학습된 패턴 업데이트
  private static updateLearnedPatterns(
    currentPatterns: MasterUserProfile['learnedPatterns'],
    messageAnalyses: MessageAnalysis[],
    aiResponses: string[],
    userFeedback?: { messageId: string, feedback: string }[]
  ): MasterUserProfile['learnedPatterns'] {
    
    const updated = { ...currentPatterns };
    
    // 선호하는 응답 길이 학습
    const avgMessageLength = messageAnalyses.reduce((sum, m) => sum + m.length, 0) / messageAnalyses.length;
    if (avgMessageLength < 50) updated.preferredResponseLength = 'short';
    else if (avgMessageLength > 150) updated.preferredResponseLength = 'long';
    else updated.preferredResponseLength = 'medium';
    
    // 상세도 선호 학습
    const detailIndicators = messageAnalyses.flatMap(m => m.extractedWords)
      .filter(word => ['자세히', '구체적', '상세', '정확히', '명확히'].includes(word));
    if (detailIndicators.length > 2) updated.preferredDetailLevel = 'comprehensive';
    
    // 상호작용 스타일 학습
    const avgFormality = messageAnalyses.reduce((sum, m) => sum + m.tone.formality, 0) / messageAnalyses.length;
    const avgPoliteness = messageAnalyses.reduce((sum, m) => sum + m.tone.politeness, 0) / messageAnalyses.length;
    
    if (avgFormality > 70 && avgPoliteness > 70) updated.interactionStyle = 'formal';
    else if (avgFormality < 30) updated.interactionStyle = 'casual';
    else if (avgPoliteness > 60) updated.interactionStyle = 'friendly';
    else updated.interactionStyle = 'professional';
    
    // 피드백 패턴 학습
    if (userFeedback) {
      userFeedback.forEach(fb => {
        if (fb.feedback === 'HELPFUL' || fb.feedback === 'VERY_HELPFUL') {
          // 긍정적 피드백 패턴 추출 (AI 응답에서)
          const responsePhrases = aiResponses.flatMap(response => 
            response.split(/[.!?]+/).slice(0, 3) // 첫 3문장
          );
          updated.feedbackPatterns.positiveResponses.push(...responsePhrases.slice(0, 2));
        }
      });
    }
    
    return updated;
  }
  
  // 개인화 인사이트 업데이트
  private static updatePersonalizationInsights(
    currentInsights: MasterUserProfile['personalizationInsights'],
    messageAnalyses: MessageAnalysis[],
    conversationContext: ConversationContext
  ): MasterUserProfile['personalizationInsights'] {
    
    const updated = { ...currentInsights };
    
    // 소통 선호도 업데이트
    const avgTone = messageAnalyses.reduce((acc, m) => ({
      directness: acc.directness + m.tone.directness,
      enthusiasm: acc.enthusiasm + m.tone.enthusiasm,
      formality: acc.formality + m.tone.formality,
      politeness: acc.politeness + m.tone.politeness
    }), { directness: 0, enthusiasm: 0, formality: 0, politeness: 0 });
    
    const messageCount = messageAnalyses.length;
    updated.communicationPreferences = {
      directness: Math.round(avgTone.directness / messageCount),
      supportiveness: Math.round(avgTone.politeness / messageCount),
      technicalDepth: this.inferTechnicalDepth(messageAnalyses),
      creativityLevel: this.inferCreativityLevel(messageAnalyses)
    };
    
    // 동기 요인 추출
    const motivationKeywords = ['성장', '개선', '향상', '성공', '목표', '발전', '확장'];
    const motivationWords = messageAnalyses.flatMap(m => m.extractedWords)
      .filter(word => motivationKeywords.includes(word));
    updated.motivationFactors = [...new Set([...updated.motivationFactors, ...motivationWords])].slice(0, 10);
    
    // 고민 포인트 추출
    const painKeywords = ['어려움', '문제', '힘들', '고민', '걱정', '부족', '막힘'];
    const painWords = messageAnalyses.flatMap(m => m.extractedWords)
      .filter(word => painKeywords.some(pain => word.includes(pain)));
    updated.painPoints = [...new Set([...updated.painPoints, ...painWords])].slice(0, 10);
    
    return updated;
  }
  
  // 컨텍스트 메모리 업데이트
  private static updateContextMemory(
    currentMemory: MasterUserProfile['contextMemory'],
    userMessages: string[],
    conversationContext: ConversationContext
  ): MasterUserProfile['contextMemory'] {
    
    const updated = { ...currentMemory };
    
    // 진행 중인 프로젝트 감지
    const projectKeywords = ['프로젝트', '런칭', '오픈', '시작', '계획', '준비'];
    userMessages.forEach(message => {
      projectKeywords.forEach(keyword => {
        if (message.includes(keyword)) {
          const projectName = this.extractProjectName(message);
          if (projectName) {
            const existingProject = updated.ongoingProjects.find(p => p.name === projectName);
            if (!existingProject) {
              updated.ongoingProjects.push({
                id: `proj_${Date.now()}`,
                name: projectName,
                description: message.substring(0, 100),
                status: 'planning',
                createdAt: new Date().toISOString(),
                lastMentioned: new Date().toISOString(),
                relatedTopics: conversationContext.conversationFlow,
                keyDecisions: []
              });
            } else {
              existingProject.lastMentioned = new Date().toISOString();
            }
          }
        }
      });
    });
    
    // 개인적 선호도 및 제약사항 추출
    const preferenceIndicators = ['좋아', '선호', '싫어', '피하고 싶', '중요한'];
    userMessages.forEach(message => {
      preferenceIndicators.forEach(indicator => {
        if (message.includes(indicator)) {
          updated.personalReferences.push({
            id: `ref_${Date.now()}`,
            type: message.includes('좋아') || message.includes('선호') ? 'preference' : 'constraint',
            content: message,
            relevance: 100,
            lastUsed: new Date().toISOString(),
            frequency: 1
          });
        }
      });
    });
    
    // 최대 항목 수 제한
    updated.ongoingProjects = updated.ongoingProjects.slice(-10);
    updated.personalReferences = updated.personalReferences.slice(-20);
    
    return updated;
  }
  
  // 품질 메트릭 계산
  private static calculateProfileQuality(profile: MasterUserProfile): MasterUserProfile['profileQuality'] {
    const businessCompletion = profile.businessProfile.completionLevel || 0;
    const writingDataRichness = Math.min(100, profile.writingStyle.totalMessagesAnalyzed * 2);
    const conversationRichness = Math.min(100, profile.conversationSummary.totalMessages);
    const contextRichness = Math.min(100, 
      (profile.contextMemory.ongoingProjects.length * 10) +
      (profile.contextMemory.personalReferences.length * 5) +
      (profile.personalizationInsights.motivationFactors.length * 10)
    );
    
    const dataRichness = Math.round((businessCompletion + writingDataRichness + conversationRichness + contextRichness) / 4);
    
    return {
      dataRichness,
      consistencyScore: profile.writingStyle.confidenceScore,
      predictionAccuracy: Math.min(100, dataRichness), // 간단한 추정
      lastQualityCheck: new Date().toISOString()
    };
  }
  
  // 진화 포인트 기록
  private static recordEvolutionPoint(profile: MasterUserProfile, messageAnalyses: MessageAnalysis[]): void {
    // 최근 진화 포인트와 비교하여 변화 감지
    const lastEvolution = profile.conversationSummary.conversationEvolution.slice(-1)[0];
    
    if (!lastEvolution || this.shouldRecordNewEvolution(lastEvolution, messageAnalyses)) {
      const newEvolution: ConversationEvolutionPoint = {
        date: new Date().toISOString(),
        topicsShift: [...new Set(messageAnalyses.flatMap(m => m.topics))],
        styleChanges: this.calculateStyleChanges(profile.writingStyle, messageAnalyses),
        newPatterns: this.detectNewPatterns(messageAnalyses)
      };
      
      profile.conversationSummary.conversationEvolution.push(newEvolution);
      
      // 최대 20개 진화 포인트 유지
      if (profile.conversationSummary.conversationEvolution.length > 20) {
        profile.conversationSummary.conversationEvolution = 
          profile.conversationSummary.conversationEvolution.slice(-20);
      }
    }
  }
  
  // 보조 메서드들
  private static inferTechnicalDepth(messageAnalyses: MessageAnalysis[]): number {
    const technicalTerms = ['api', '시스템', '데이터', '분석', '최적화', '자동화', '플랫폼'];
    const technicalCount = messageAnalyses.flatMap(m => m.extractedWords)
      .filter(word => technicalTerms.some(term => word.includes(term))).length;
    return Math.min(100, technicalCount * 10);
  }
  
  private static inferCreativityLevel(messageAnalyses: MessageAnalysis[]): number {
    const creativeIndicators = messageAnalyses.reduce((count, m) => 
      count + m.patterns.emojis.length + (m.patterns.exclamations > 0 ? 1 : 0), 0);
    return Math.min(100, creativeIndicators * 5);
  }
  
  private static extractProjectName(message: string): string | null {
    // 간단한 프로젝트명 추출 로직
    const words = message.split(' ');
    const projectIndex = words.findIndex(word => ['프로젝트', '런칭', '오픈'].includes(word));
    if (projectIndex > 0) {
      return words[projectIndex - 1];
    }
    return null;
  }
  
  private static shouldRecordNewEvolution(lastEvolution: ConversationEvolutionPoint, messageAnalyses: MessageAnalysis[]): boolean {
    const daysSinceLastEvolution = (Date.now() - new Date(lastEvolution.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastEvolution > 7; // 일주일마다 진화 포인트 기록
  }
  
  private static calculateStyleChanges(currentStyle: WritingStyleProfile, messageAnalyses: MessageAnalysis[]): ConversationEvolutionPoint['styleChanges'] {
    const currentAvgTone = messageAnalyses.reduce((acc, m) => ({
      formality: acc.formality + m.tone.formality,
      enthusiasm: acc.enthusiasm + m.tone.enthusiasm,
      directness: acc.directness + m.tone.directness
    }), { formality: 0, enthusiasm: 0, directness: 0 });
    
    const messageCount = messageAnalyses.length;
    return {
      formalityChange: Math.round(currentAvgTone.formality / messageCount) - currentStyle.tone.formality,
      enthusiasmChange: Math.round(currentAvgTone.enthusiasm / messageCount) - currentStyle.tone.enthusiasm,
      complexityChange: 0 // 추후 구현
    };
  }
  
  private static detectNewPatterns(messageAnalyses: MessageAnalysis[]): string[] {
    // 새로운 패턴 감지 로직 (간단한 버전)
    const patterns: string[] = [];
    
    const emojiUsage = messageAnalyses.reduce((sum, m) => sum + m.patterns.emojis.length, 0);
    if (emojiUsage > messageAnalyses.length) {
      patterns.push('increased_emoji_usage');
    }
    
    return patterns;
  }
}