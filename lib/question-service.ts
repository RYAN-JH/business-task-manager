// 질문 시스템 관리 서비스 - 데이터베이스 기반 시스템

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Question {
  id: string;
  category: 'PROFILE' | 'PROACTIVE' | 'FOLLOW_UP' | 'ONBOARDING';
  type: 'BASIC' | 'BUSINESS' | 'BRANDING' | 'CONTENT' | 'STRATEGY';
  persona: 'general' | 'branding' | 'content' | 'all';
  priority: 1 | 2 | 3; // 1이 가장 높음
  
  content: {
    mainQuestion: string;
    followUpQuestions?: string[];
    context?: string;
    expectedInsight?: string;
  };
  
  triggers: {
    keywords?: string[];
    sessionLength?: number;
    userType?: string[];
    previousAnswers?: string[];
  };
  
  metadata: {
    isActive: boolean;
    usage: number;
    effectiveness: number; // 0-1 점수
    lastUsed?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface QuestionTemplate {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  targetPersona: 'general' | 'branding' | 'content' | 'all';
}

export class QuestionService {
  
  // 기본 프로필 수집 질문 조회
  static async getProfileQuestions(
    persona: 'general' | 'branding' | 'content' = 'general',
    priority?: 1 | 2 | 3
  ): Promise<Question[]> {
    try {
      // 실제로는 데이터베이스에서 조회
      // 현재는 기존 하드코딩 데이터를 기반으로 기본값 반환
      return this.getDefaultProfileQuestions(persona, priority);
    } catch (error) {
      console.error('프로필 질문 조회 실패:', error);
      return this.getDefaultProfileQuestions(persona, priority);
    }
  }

  // 기본 프로필 질문 (기존 question-system.ts 기반)
  private static getDefaultProfileQuestions(
    persona: 'general' | 'branding' | 'content',
    priority?: 1 | 2 | 3
  ): Question[] {
    const baseQuestions: Question[] = [
      {
        id: 'business-type',
        category: 'PROFILE',
        type: 'BASIC',
        persona: 'all',
        priority: 1,
        content: {
          mainQuestion: "어떤 형태의 비즈니스를 운영하고 계시나요?",
          context: "비즈니스 형태 파악을 통한 맞춤형 전략 수립",
          expectedInsight: "business_model"
        },
        triggers: {
          keywords: ['비즈니스', '사업', '회사', '업체']
        },
        metadata: {
          isActive: true,
          usage: 0,
          effectiveness: 0.9,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      {
        id: 'target-customer',
        category: 'PROFILE',
        type: 'BASIC',
        persona: 'all',
        priority: 1,
        content: {
          mainQuestion: "주요 타겟 고객층은 누구인가요?",
          context: "타겟 고객 이해를 통한 페르소나 설정",
          expectedInsight: "target_audience"
        },
        triggers: {
          keywords: ['고객', '타겟', '대상', '소비자']
        },
        metadata: {
          isActive: true,
          usage: 0,
          effectiveness: 0.95,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      {
        id: 'main-product',
        category: 'PROFILE',
        type: 'BUSINESS',
        persona: 'all',
        priority: 1,
        content: {
          mainQuestion: "주력 제품이나 서비스는 무엇인가요?",
          context: "핵심 제품/서비스 파악",
          expectedInsight: "core_offering"
        },
        triggers: {
          keywords: ['제품', '서비스', '상품', '솔루션']
        },
        metadata: {
          isActive: true,
          usage: 0,
          effectiveness: 0.9,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      {
        id: 'current-challenge',
        category: 'PROFILE',
        type: 'STRATEGY',
        persona: 'all',
        priority: 1,
        content: {
          mainQuestion: "현재 가장 고민이 되는 과제나 문제는 무엇인가요?",
          context: "현재 당면 과제 파악",
          expectedInsight: "pain_points"
        },
        triggers: {
          keywords: ['문제', '고민', '과제', '어려움', '도전']
        },
        metadata: {
          isActive: true,
          usage: 0,
          effectiveness: 0.92,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    ];

    // 페르소나별 특화 질문 추가
    if (persona === 'branding' || persona === 'general') {
      baseQuestions.push({
        id: 'brand-voice',
        category: 'PROFILE',
        type: 'BRANDING',
        persona: 'branding',
        priority: 2,
        content: {
          mainQuestion: "브랜드가 고객과 소통할 때 어떤 톤앤매너를 선호하시나요?",
          context: "브랜드 보이스 정의",
          expectedInsight: "brand_voice"
        },
        triggers: {
          keywords: ['브랜드', '톤앤매너', '소통', '목소리']
        },
        metadata: {
          isActive: true,
          usage: 0,
          effectiveness: 0.85,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    if (persona === 'content' || persona === 'general') {
      baseQuestions.push({
        id: 'content-goal',
        category: 'PROFILE',
        type: 'CONTENT',
        persona: 'content',
        priority: 2,
        content: {
          mainQuestion: "콘텐츠를 통해 달성하고 싶은 목표는 무엇인가요?",
          context: "콘텐츠 마케팅 목표 설정",
          expectedInsight: "content_objectives"
        },
        triggers: {
          keywords: ['콘텐츠', '마케팅', '홍보', '소셜미디어']
        },
        metadata: {
          isActive: true,
          usage: 0,
          effectiveness: 0.88,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    // 우선순위 필터링
    if (priority) {
      return baseQuestions.filter(q => q.priority === priority);
    }

    return baseQuestions;
  }

  // 능동적 질문 조회 (기존 proactive-questions.ts 기반)
  static async getProactiveQuestions(
    persona: 'moment.ryan' | 'atozit',
    userProfile: any,
    sessionContext: any
  ): Promise<Question[]> {
    try {
      // 실제로는 데이터베이스에서 조회 + 사용자 컨텍스트 분석
      return this.getDefaultProactiveQuestions(persona);
    } catch (error) {
      console.error('능동적 질문 조회 실패:', error);
      return [];
    }
  }

  // 기본 능동적 질문
  private static getDefaultProactiveQuestions(
    persona: 'moment.ryan' | 'atozit'
  ): Question[] {
    if (persona === 'moment.ryan') {
      return [
        {
          id: 'marketing-approach',
          category: 'PROACTIVE',
          type: 'STRATEGY',
          persona: 'content',
          priority: 1,
          content: {
            mainQuestion: "마케팅 전략을 수립할 때 가장 중요하게 생각하는 요소는 무엇인가요?",
            followUpQuestions: [
              "데이터 분석과 직감 중 어느 쪽을 더 신뢰하시나요?",
              "실패한 캠페인에서 얻은 가장 큰 교훈은 무엇인가요?",
              "트렌드를 따라가는 것과 독창성 중 무엇이 더 중요하다고 생각하시나요?"
            ],
            context: "마케팅 철학과 접근 방식 탐구",
            expectedInsight: "marketing_philosophy"
          },
          triggers: {
            keywords: ['마케팅', '전략', '캠페인', '브랜딩'],
            sessionLength: 5
          },
          metadata: {
            isActive: true,
            usage: 0,
            effectiveness: 0.92,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      ];
    } else {
      return [
        {
          id: 'branding-philosophy',
          category: 'PROACTIVE',
          type: 'BRANDING',
          persona: 'branding',
          priority: 1,
          content: {
            mainQuestion: "브랜딩에서 가장 핵심적인 요소는 무엇이라고 생각하시나요?",
            followUpQuestions: [
              "고객과의 감정적 연결을 어떻게 만들어 나가시나요?",
              "브랜드 가치와 상업적 성공 사이의 균형을 어떻게 맞추시나요?",
              "시장 변화에 따라 브랜드를 어떻게 진화시켜 나가시나요?"
            ],
            context: "브랜딩 철학과 전략적 사고 탐구",
            expectedInsight: "branding_philosophy"
          },
          triggers: {
            keywords: ['브랜드', '브랜딩', '정체성', '가치'],
            sessionLength: 5
          },
          metadata: {
            isActive: true,
            usage: 0,
            effectiveness: 0.95,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      ];
    }
  }

  // 스마트 질문 선택 (AI 기반)
  static async selectBestQuestion(
    userContext: {
      recentMessages: string[];
      userProfile: any;
      sessionLength: number;
      persona: string;
    }
  ): Promise<Question | null> {
    try {
      console.log('🤖 AI 기반 최적 질문 선택 중...');
      
      // 1. 사용 가능한 질문들 조회
      const availableQuestions = await this.getProfileQuestions(
        userContext.persona as any
      );

      // 2. 컨텍스트 분석
      const recentContent = userContext.recentMessages.join(' ').toLowerCase();
      
      // 3. 키워드 매칭 및 점수 계산
      const scoredQuestions = availableQuestions.map(question => {
        let score = question.metadata.effectiveness;
        
        // 키워드 매칭 점수
        if (question.triggers.keywords) {
          const keywordMatches = question.triggers.keywords.filter(keyword =>
            recentContent.includes(keyword.toLowerCase())
          ).length;
          score += keywordMatches * 0.3;
        }
        
        // 세션 길이 조건
        if (question.triggers.sessionLength && 
            userContext.sessionLength >= question.triggers.sessionLength) {
          score += 0.2;
        }
        
        // 사용 빈도 조정 (너무 자주 사용된 질문은 점수 감소)
        if (question.metadata.usage > 10) {
          score -= 0.1;
        }

        return { question, score };
      });

      // 4. 가장 높은 점수의 질문 선택
      const best = scoredQuestions
        .filter(item => item.score > 0.5)
        .sort((a, b) => b.score - a.score)[0];

      if (best) {
        // 사용 횟수 증가
        await this.incrementQuestionUsage(best.question.id);
        return best.question;
      }

      return null;
    } catch (error) {
      console.error('AI 질문 선택 실패:', error);
      return null;
    }
  }

  // 질문 효과성 업데이트
  static async updateQuestionEffectiveness(
    questionId: string,
    userFeedback: 'HELPFUL' | 'NOT_HELPFUL' | 'VERY_HELPFUL'
  ): Promise<void> {
    try {
      // 실제로는 데이터베이스 업데이트
      const effectivenessChange = 
        userFeedback === 'VERY_HELPFUL' ? 0.05 :
        userFeedback === 'HELPFUL' ? 0.02 :
        -0.03;

      console.log(`📊 질문 효과성 업데이트: ${questionId} (${effectivenessChange})`);
    } catch (error) {
      console.error('질문 효과성 업데이트 실패:', error);
    }
  }

  // 질문 사용 횟수 증가
  static async incrementQuestionUsage(questionId: string): Promise<void> {
    try {
      // 실제로는 데이터베이스의 usage 카운트 증가
      console.log(`📈 질문 사용 횟수 증가: ${questionId}`);
    } catch (error) {
      console.error('질문 사용 횟수 업데이트 실패:', error);
    }
  }

  // 새 질문 생성 (AI 기반)
  static async generateNewQuestion(
    userProfile: any,
    recentConversation: string[],
    targetInsight: string
  ): Promise<Question | null> {
    try {
      console.log('🎯 AI 기반 새 질문 생성 중...');
      
      // 실제로는 AI API를 통해 질문 생성
      // 현재는 템플릿 기반 예시 반환
      const generatedQuestion: Question = {
        id: `generated-${Date.now()}`,
        category: 'PROACTIVE',
        type: 'STRATEGY',
        persona: 'general',
        priority: 2,
        content: {
          mainQuestion: `${targetInsight}와 관련해서 더 자세히 알고 싶은 부분이 있다면 무엇인가요?`,
          context: "AI 생성 맞춤형 질문",
          expectedInsight: targetInsight
        },
        triggers: {
          keywords: []
        },
        metadata: {
          isActive: true,
          usage: 0,
          effectiveness: 0.7, // 새 질문이므로 중간 점수
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      return generatedQuestion;
    } catch (error) {
      console.error('AI 질문 생성 실패:', error);
      return null;
    }
  }

  // 질문 템플릿 관리
  static async getQuestionTemplates(): Promise<QuestionTemplate[]> {
    try {
      // 실제로는 데이터베이스에서 조회
      return [
        {
          id: 'onboarding-basic',
          name: '기본 온보딩 질문',
          description: '새 사용자를 위한 기본 프로필 수집 질문들',
          questions: await this.getProfileQuestions('general', 1),
          targetPersona: 'general'
        },
        {
          id: 'branding-deep-dive',
          name: '브랜딩 심화 질문',
          description: '브랜딩 전략 수립을 위한 심화 질문들',
          questions: await this.getProfileQuestions('branding'),
          targetPersona: 'branding'
        }
      ];
    } catch (error) {
      console.error('질문 템플릿 조회 실패:', error);
      return [];
    }
  }

  // 질문 데이터 마이그레이션
  static async migrateExistingQuestions(): Promise<void> {
    try {
      console.log('🔄 기존 질문 데이터 마이그레이션 시작...');

      // 기존 question-system.ts 및 proactive-questions.ts 데이터를 
      // 데이터베이스로 이전
      const profileQuestions = await this.getProfileQuestions('general');
      const proactiveQuestions = await this.getProactiveQuestions('moment.ryan', {}, {});

      // 실제로는 데이터베이스에 저장
      console.log(`📋 프로필 질문 ${profileQuestions.length}개 마이그레이션`);
      console.log(`🎯 능동적 질문 ${proactiveQuestions.length}개 마이그레이션`);

      console.log('✅ 질문 데이터 마이그레이션 완료');
    } catch (error) {
      console.error('❌ 질문 데이터 마이그레이션 실패:', error);
      throw error;
    }
  }

  // 연결 종료
  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}