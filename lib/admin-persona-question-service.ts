// Admin 페르소나 강화 질문 관리 서비스 - 데이터베이스 + Claude AI 하이브리드

import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface AdminPersonaQuestionData {
  id: string;
  personaType: 'moment.ryan' | 'atozit';
  category: 'strategy' | 'content' | 'challenge' | 'general';
  questionText: string;
  triggerKeywords: string[];
  userContext: string;
  usageCount: number;
  successRate: number;
  lastUsed?: string;
  generatedBy: 'claude' | 'manual' | 'hybrid';
  sourceMessage?: string;
  responseQuality?: number;
  isActive: boolean;
}

export interface QuestionGenerationContext {
  userMessage: string;
  personaType: 'moment.ryan' | 'atozit';
  conversationHistory: string[];
  adminEmail: string;
  previousQuestions: string[];
}

export class AdminPersonaQuestionService {

  // Claude AI를 통한 동적 질문 생성
  static async generatePersonaQuestion(context: QuestionGenerationContext): Promise<string | null> {
    try {
      console.log('🤖 Claude AI를 통한 Admin 페르소나 질문 생성 시작...');
      
      const personaPrompt = this.getPersonaPrompt(context.personaType);
      const categoryAnalysis = this.analyzeMessageCategory(context.userMessage);
      
      const systemPrompt = `당신은 ${context.personaType} 페르소나를 강화하기 위한 전문적인 질문을 생성하는 AI입니다.

${personaPrompt}

목표: Admin 사용자가 일반 고객들과 상담할 때 사용할 페르소나를 더욱 풍성하고 전문적으로 만들기 위한 질문을 생성해야 합니다.

대화 맥락:
- 사용자 메시지: "${context.userMessage}"
- 카테고리: ${categoryAnalysis.category}
- 이전 질문들: ${context.previousQuestions.join(', ') || '없음'}

생성 규칙:
1. 일반적인 비즈니스 조언이 아닌, Admin의 전문성과 철학을 탐구하는 질문
2. 페르소나 고도화에 직접적으로 도움이 되는 심층적 질문
3. Admin의 경험, 방법론, 철학을 이끌어내는 질문
4. 50-100자 내외의 자연스러운 한국어 질문

응답 형식: 질문 텍스트만 반환 (설명이나 부가 내용 없이)`;

      const userPrompt = `사용자가 "${context.userMessage}"라고 했습니다. 
이 상황에서 ${context.personaType} 페르소나를 강화할 수 있는 전문적인 질문을 생성해주세요.

예시 형태:
- "콘텐츠 전략 수립 시 창의성과 데이터를 어떻게 균형있게 활용하시나요?"
- "브랜드 아이덴티티 구축에서 가장 중요하게 생각하는 원칙은 무엇인가요?"
- "고객과의 신뢰 관계를 구축하는 당신만의 방법론이 있나요?"`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        temperature: 0.8,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const generatedQuestion = response.content[0]?.type === 'text' ? response.content[0].text.trim() : null;
      
      if (generatedQuestion) {
        console.log('✅ Claude AI 질문 생성 성공:', generatedQuestion.substring(0, 50) + '...');
        
        // 생성된 질문을 데이터베이스에 저장
        await this.saveGeneratedQuestion({
          personaType: context.personaType,
          category: categoryAnalysis.category,
          questionText: generatedQuestion,
          triggerKeywords: categoryAnalysis.keywords,
          userContext: context.userMessage,
          sourceMessage: context.userMessage,
          generatedBy: 'claude'
        });
        
        return generatedQuestion;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Claude AI 질문 생성 실패:', error);
      return null;
    }
  }

  // 페르소나별 프롬프트
  private static getPersonaPrompt(personaType: 'moment.ryan' | 'atozit'): string {
    if (personaType === 'moment.ryan') {
      return `Moment Ryan 페르소나:
- 디지털 마케팅 전문가이자 콘텐츠 크리에이터
- Threads 4.1만, Instagram 16.5만 팔로워 보유
- 데이터 기반의 창의적 마케팅 전략으로 유명
- SNS 마케팅, 콘텐츠 전략, 브랜드 스토리텔링 전문
- 실무 중심의 실용적 조언을 제공하는 스타일`;
    } else {
      return `AtoZ IT 페르소나:
- 브랜딩 및 비즈니스 전략 전문가
- 종합적인 브랜드 컨설팅 경험 보유
- 브랜드 아이덴티티, 고객 경험 설계, 비즈니스 성장 전문
- 체계적이고 전략적인 접근 방식으로 유명
- 장기적 브랜드 가치 창출에 중점을 두는 스타일`;
    }
  }

  // 메시지 카테고리 분석
  private static analyzeMessageCategory(message: string): { category: string; keywords: string[] } {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('전략') || lowerMessage.includes('계획') || lowerMessage.includes('방향')) {
      return { category: 'strategy', keywords: ['전략', '계획', '방향', '목표'] };
    } else if (lowerMessage.includes('콘텐츠') || lowerMessage.includes('브랜딩') || lowerMessage.includes('메시지')) {
      return { category: 'content', keywords: ['콘텐츠', '브랜딩', '메시지', '크리에이티브'] };
    } else if (lowerMessage.includes('어려') || lowerMessage.includes('문제') || lowerMessage.includes('고민') || 
               lowerMessage.includes('힘들') || lowerMessage.includes('모르겠') || lowerMessage.includes('막막')) {
      return { category: 'challenge', keywords: ['문제해결', '어려움', '고민', '도전'] };
    } else {
      return { category: 'general', keywords: ['일반', '기본', '전반적'] };
    }
  }

  // 생성된 질문을 데이터베이스에 저장
  private static async saveGeneratedQuestion(questionData: {
    personaType: 'moment.ryan' | 'atozit';
    category: string;
    questionText: string;
    triggerKeywords: string[];
    userContext: string;
    sourceMessage: string;
    generatedBy: 'claude' | 'manual' | 'hybrid';
  }): Promise<void> {
    try {
      await prisma.adminPersonaQuestion.create({
        data: {
          personaType: questionData.personaType,
          category: questionData.category,
          questionText: questionData.questionText,
          triggerKeywords: JSON.stringify(questionData.triggerKeywords),
          userContext: questionData.userContext,
          sourceMessage: questionData.sourceMessage,
          generatedBy: questionData.generatedBy,
          isActive: true
        }
      });
      
      console.log('💾 생성된 질문 데이터베이스 저장 완료');
    } catch (error) {
      console.error('❌ 질문 저장 실패:', error);
    }
  }

  // 데이터베이스에서 적절한 기존 질문 찾기
  static async findExistingQuestion(context: QuestionGenerationContext): Promise<AdminPersonaQuestionData | null> {
    try {
      const categoryAnalysis = this.analyzeMessageCategory(context.userMessage);
      
      // 같은 페르소나 타입과 카테고리에서 활성화된 질문 중 
      // 최근에 사용되지 않은 질문 우선 선택
      const existingQuestion = await prisma.adminPersonaQuestion.findFirst({
        where: {
          personaType: context.personaType,
          category: categoryAnalysis.category,
          isActive: true,
          NOT: {
            questionText: {
              in: context.previousQuestions
            }
          }
        },
        orderBy: [
          { successRate: 'desc' },
          { usageCount: 'asc' },
          { lastUsed: 'asc' }
        ]
      });

      if (existingQuestion) {
        return {
          id: existingQuestion.id,
          personaType: existingQuestion.personaType as 'moment.ryan' | 'atozit',
          category: existingQuestion.category as 'strategy' | 'content' | 'challenge' | 'general',
          questionText: existingQuestion.questionText,
          triggerKeywords: existingQuestion.triggerKeywords ? JSON.parse(existingQuestion.triggerKeywords) : [],
          userContext: existingQuestion.userContext || '',
          usageCount: existingQuestion.usageCount,
          successRate: existingQuestion.successRate,
          lastUsed: existingQuestion.lastUsed?.toISOString(),
          generatedBy: existingQuestion.generatedBy as 'claude' | 'manual' | 'hybrid',
          sourceMessage: existingQuestion.sourceMessage || undefined,
          responseQuality: existingQuestion.responseQuality || undefined,
          isActive: existingQuestion.isActive
        };
      }

      return null;
    } catch (error) {
      console.error('❌ 기존 질문 조회 실패:', error);
      return null;
    }
  }

  // 질문 사용 기록 업데이트
  static async recordQuestionUsage(questionId: string): Promise<void> {
    try {
      await prisma.adminPersonaQuestion.update({
        where: { id: questionId },
        data: {
          usageCount: { increment: 1 },
          lastUsed: new Date()
        }
      });
      
      console.log('📝 질문 사용 기록 업데이트 완료:', questionId);
    } catch (error) {
      console.error('❌ 질문 사용 기록 실패:', error);
    }
  }

  // Admin 응답을 받은 후 질문 품질 평가 및 업데이트
  static async updateQuestionQuality(questionId: string, adminResponse: string): Promise<void> {
    try {
      // 응답 품질 분석
      const qualityScore = this.analyzeResponseQuality(adminResponse);
      
      // 데이터베이스 업데이트
      await prisma.adminPersonaQuestion.update({
        where: { id: questionId },
        data: {
          responseQuality: qualityScore,
          successRate: qualityScore // 간단히 품질 점수를 성공률로 사용
        }
      });
      
      console.log(`📊 질문 품질 업데이트: ${questionId} - 점수: ${qualityScore}`);
    } catch (error) {
      console.error('❌ 질문 품질 업데이트 실패:', error);
    }
  }

  // 응답 품질 분석 (간단한 휴리스틱)
  private static analyzeResponseQuality(response: string): number {
    let score = 0;
    
    // 길이 점수 (50-300자가 적정)
    const length = response.length;
    if (length >= 50 && length <= 300) score += 30;
    else if (length > 300) score += 20;
    else score += 10;
    
    // 구체성 점수
    const hasExamples = response.includes('예를 들어') || response.includes('예시') || response.includes('경험');
    if (hasExamples) score += 25;
    
    // 전문성 점수
    const professionalTerms = ['전략', '방법론', '프로세스', '시스템', '철학', '원칙'];
    const termCount = professionalTerms.filter(term => response.includes(term)).length;
    score += Math.min(termCount * 10, 30);
    
    // 개인화 점수
    const personalIndicators = ['제가', '저는', '개인적으로', '경험상'];
    const personalCount = personalIndicators.filter(indicator => response.includes(indicator)).length;
    score += Math.min(personalCount * 5, 15);
    
    return Math.min(100, score);
  }

  // 통계 조회
  static async getQuestionStats(personaType?: 'moment.ryan' | 'atozit'): Promise<any> {
    try {
      const where = personaType ? { personaType } : {};
      
      const stats = await prisma.adminPersonaQuestion.aggregate({
        where,
        _count: { id: true },
        _avg: { successRate: true, usageCount: true },
        _max: { usageCount: true }
      });
      
      return {
        totalQuestions: stats._count.id,
        averageSuccessRate: stats._avg.successRate || 0,
        averageUsageCount: stats._avg.usageCount || 0,
        maxUsageCount: stats._max.usageCount || 0
      };
    } catch (error) {
      console.error('❌ 질문 통계 조회 실패:', error);
      return null;
    }
  }

  // 연결 종료
  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}