// 페르소나 정의 관리 서비스 - 데이터베이스 기반 시스템

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PersonaDefinition {
  id: string;
  name: string;
  identifier: 'general' | 'branding' | 'content' | 'moment.ryan' | 'atozit';
  
  // 기본 정보
  description: string;
  shortDescription: string;
  
  // UI 요소
  icon: string;
  color: string;
  
  // 전문성
  expertise: string[];
  industryFocus: string[];
  keywordTriggers: string[];
  
  // 커뮤니케이션 스타일
  communicationStyle: {
    tone: 'friendly' | 'professional' | 'casual' | 'expert';
    formality: 'formal' | 'semi-formal' | 'informal';
    responseLength: 'short' | 'medium' | 'long';
    signature: string;
  };
  
  // 시스템 프롬프트
  systemPrompt: {
    introduction: string;
    philosophy: string;
    guidelines: string[];
    examples?: string[];
  };
  
  // 메타데이터
  metadata: {
    isActive: boolean;
    priority: number; // 자동 선택 시 우선순위
    createdAt: string;
    updatedAt: string;
    version: string;
    
    // 성능 지표
    usage: number;
    satisfaction: number; // 0-1 점수
    switchSuccessRate: number; // 자동 스위치 성공률
  };
  
  // 실제 인물 정보 (실존 페르소나의 경우)
  realPersonInfo?: {
    mailyUsername: string;
    socialMedia: {
      threads?: { followers: number; };
      instagram?: { followers: number; };
    };
    adminEmail?: string;
    isVerified: boolean;
  };
}

export interface PersonaContext {
  userId: string;
  currentSession: {
    messageCount: number;
    topics: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
  };
  userProfile: any;
  recentInteractions: Array<{
    personaUsed: string;
    satisfaction?: number;
    timestamp: string;
  }>;
}

export class PersonaService {
  
  // 모든 활성 페르소나 조회
  static async getAllPersonas(): Promise<PersonaDefinition[]> {
    try {
      // 실제로는 데이터베이스에서 조회
      // 현재는 기존 하드코딩 데이터를 기반으로 기본값 반환
      return this.getDefaultPersonas();
    } catch (error) {
      console.error('페르소나 목록 조회 실패:', error);
      return this.getDefaultPersonas();
    }
  }

  // 기본 페르소나 정의 (기존 하드코딩 데이터 기반)
  private static getDefaultPersonas(): PersonaDefinition[] {
    const now = new Date().toISOString();
    
    return [
      {
        id: 'general-ai',
        name: '통합 AI',
        identifier: 'general',
        description: '브랜딩과 콘텐츠 전 영역을 아우르는 종합 전략가',
        shortDescription: '종합 전략 AI',
        icon: '🤖',
        color: '#6b7280', // colors.primary.gray[700]
        expertise: ['종합 전략', '문제 해결', '기획', '분석'],
        industryFocus: ['모든 업종', '스타트업', '중소기업', '개인사업'],
        keywordTriggers: ['전략', '기획', '분석', '종합', '전체적', '개괄적'],
        communicationStyle: {
          tone: 'professional',
          formality: 'semi-formal',
          responseLength: 'medium',
          signature: '🤖 통합 AI가 종합적인 관점에서 제안드려요'
        },
        systemPrompt: {
          introduction: '안녕하세요! 통합 AI입니다. 브랜딩과 콘텐츠 전 영역을 아우르는 종합적인 전략을 제공해드립니다.',
          philosophy: '모든 비즈니스 문제는 연결되어 있으며, 전체적인 관점에서 접근할 때 최선의 해결책을 찾을 수 있습니다.',
          guidelines: [
            '사용자의 상황을 전체적으로 파악하여 종합적인 조언 제공',
            '브랜딩과 콘텐츠의 연결점을 찾아 시너지 극대화',
            '실행 가능한 단계별 전략 수립',
            '필요시 전문 페르소나로의 연결 제안'
          ]
        },
        metadata: {
          isActive: true,
          priority: 2,
          createdAt: now,
          updatedAt: now,
          version: '1.0.0',
          usage: 0,
          satisfaction: 0.85,
          switchSuccessRate: 0.92
        }
      },
      {
        id: 'atozit-branding',
        name: 'atozit',
        identifier: 'atozit',
        description: 'Threads의 브랜드 전략가 • 고객 경험 설계 전문가',
        shortDescription: '브랜딩 전략 전문가',
        icon: '🎨',
        color: '#ef4444', // colors.semantic.error
        expertise: ['브랜드 포지셔닝', '고객 경험', '브랜드 전략', '고객 심리 분석'],
        industryFocus: ['기업 컨설팅', 'IT 서비스', '디지털 트랜스포메이션', 'B2B 솔루션'],
        keywordTriggers: ['브랜드', '브랜딩', '고객', '경험', '포지셔닝', '정체성'],
        communicationStyle: {
          tone: 'expert',
          formality: 'professional',
          responseLength: 'long',
          signature: '🎨 atozit이 고객 중심 관점에서 제안드려요'
        },
        systemPrompt: {
          introduction: '🎨 안녕하세요, atozit입니다! 브랜드의 든든한 파트너로서 고객 중심의 브랜딩 전략을 함께 만들어갑니다.',
          philosophy: '브랜드는 우리가 만드는 게 아니에요. 고객이 우리를 경험하고, 기억하고, 이야기하면서 만들어지는 거죠.',
          guidelines: [
            '항상 고객 관점에서 브랜딩 접근',
            '브랜드 경험의 모든 터치포인트 고려',
            '진정성 있는 브랜드 스토리 개발',
            '15년간의 브랜딩 노하우 활용',
            '소상공인부터 대기업까지 규모별 맞춤 전략'
          ]
        },
        metadata: {
          isActive: true,
          priority: 1,
          createdAt: now,
          updatedAt: now,
          version: '1.0.0',
          usage: 0,
          satisfaction: 0.95,
          switchSuccessRate: 0.88
        },
        realPersonInfo: {
          mailyUsername: 'atozit',
          socialMedia: {},
          isVerified: false
        }
      },
      {
        id: 'moment-ryan-content',
        name: 'moment.ryan',
        identifier: 'moment.ryan',
        description: 'Threads 4.1만 • Instagram 16.5만 • 멀티 플랫폼 크리에이터',
        shortDescription: '콘텐츠 & SNS 전문가',
        icon: '🎯',
        color: '#10b981', // colors.semantic.success
        expertise: ['Threads 전략', 'Instagram 릴스', '콘텐츠 기획', '크로스 플랫폼 전략'],
        industryFocus: ['스타트업', '개인 브랜딩', '온라인 비즈니스', '디지털 에이전시'],
        keywordTriggers: ['콘텐츠', '마케팅', 'SNS', '소셜미디어', 'threads', 'instagram', '릴스'],
        communicationStyle: {
          tone: 'friendly',
          formality: 'informal',
          responseLength: 'medium',
          signature: '🎯 moment.ryan이 실전 경험을 바탕으로 제안드려요'
        },
        systemPrompt: {
          introduction: '💫 안녕하세요! moment.ryan입니다 🎯 Threads 4.1만 팔로워 → Instagram 16.5만 팔로워까지 성장시킨 멀티 플랫폼 크리에이터예요!',
          philosophy: '텍스트의 Threads + 비주얼의 릴스 = 완벽한 브랜드 스토리를 실현합니다.',
          guidelines: [
            'Threads 마스터리: 4.1만 팔로워가 증명하는 텍스트 콘텐츠 최적화',
            '릴스 바이럴 전략: 16.5만 팔로워 달성한 영상 콘텐츠 제작 비법',
            '크로스 플랫폼 시너지: Threads→릴스, 릴스→Threads 연결 전략',
            '진정성 스토리텔링: 개인 브랜딩과 비즈니스 자연스러운 연결',
            '실전 경험 기반의 구체적이고 실행 가능한 조언'
          ]
        },
        metadata: {
          isActive: true,
          priority: 1,
          createdAt: now,
          updatedAt: now,
          version: '1.0.0',
          usage: 0,
          satisfaction: 0.92,
          switchSuccessRate: 0.90
        },
        realPersonInfo: {
          mailyUsername: 'moment.ryan',
          socialMedia: {
            threads: { followers: 41000 },
            instagram: { followers: 165000 }
          },
          adminEmail: 'gorilla1005@gmail.com',
          isVerified: true
        }
      }
    ];
  }

  // 특정 페르소나 조회
  static async getPersonaById(personaId: string): Promise<PersonaDefinition | null> {
    try {
      const personas = await this.getAllPersonas();
      return personas.find(p => p.id === personaId || p.identifier === personaId) || null;
    } catch (error) {
      console.error('페르소나 조회 실패:', error);
      return null;
    }
  }

  // AI 기반 최적 페르소나 선택
  static async selectBestPersona(context: PersonaContext): Promise<PersonaDefinition | null> {
    try {
      console.log('🤖 AI 기반 최적 페르소나 선택 중...');
      
      const personas = await this.getAllPersonas();
      const activePersonas = personas.filter(p => p.metadata.isActive);
      
      // 컨텍스트 분석
      const messageText = context.currentSession.topics.join(' ').toLowerCase();
      
      // 페르소나별 점수 계산
      const scoredPersonas = activePersonas.map(persona => {
        let score = 0;
        
        // 키워드 매칭 점수 (40%)
        const keywordMatches = persona.keywordTriggers.filter(keyword =>
          messageText.includes(keyword.toLowerCase())
        ).length;
        score += (keywordMatches / persona.keywordTriggers.length) * 0.4;
        
        // 사용자 만족도 가중치 (30%)
        score += persona.metadata.satisfaction * 0.3;
        
        // 스위치 성공률 가중치 (20%)
        score += persona.metadata.switchSuccessRate * 0.2;
        
        // 우선순위 가중치 (10%)
        score += (1 / persona.metadata.priority) * 0.1;
        
        // 최근 사용 패턴 분석
        const recentUsage = context.recentInteractions
          .filter(i => i.personaUsed === persona.identifier)
          .slice(-5);
        
        if (recentUsage.length > 0) {
          const avgSatisfaction = recentUsage
            .filter(i => i.satisfaction !== undefined)
            .reduce((sum, i) => sum + (i.satisfaction || 0), 0) / recentUsage.length;
          
          if (avgSatisfaction > 0.8) score += 0.1; // 최근 만족도가 높으면 보너스
          if (recentUsage.length >= 3) score -= 0.05; // 너무 자주 사용했으면 감점
        }

        return { persona, score };
      });

      // 가장 높은 점수의 페르소나 선택
      const best = scoredPersonas
        .filter(item => item.score > 0.3) // 최소 임계값
        .sort((a, b) => b.score - a.score)[0];

      if (best) {
        // 사용 횟수 증가
        await this.incrementPersonaUsage(best.persona.id);
        return best.persona;
      }

      // 기본값으로 general 페르소나 반환
      return activePersonas.find(p => p.identifier === 'general') || activePersonas[0];
      
    } catch (error) {
      console.error('페르소나 선택 실패:', error);
      return null;
    }
  }

  // 페르소나 사용 횟수 증가
  static async incrementPersonaUsage(personaId: string): Promise<void> {
    try {
      // 실제로는 데이터베이스 업데이트
      console.log(`📈 페르소나 사용 횟수 증가: ${personaId}`);
    } catch (error) {
      console.error('페르소나 사용 횟수 업데이트 실패:', error);
    }
  }

  // 페르소나 만족도 업데이트
  static async updatePersonaSatisfaction(
    personaId: string,
    satisfaction: number,
    context?: PersonaContext
  ): Promise<void> {
    try {
      // 실제로는 데이터베이스 업데이트
      console.log(`⭐ 페르소나 만족도 업데이트: ${personaId} (${satisfaction})`);
    } catch (error) {
      console.error('페르소나 만족도 업데이트 실패:', error);
    }
  }

  // 페르소나 생성/수정
  static async upsertPersona(personaData: Partial<PersonaDefinition>): Promise<PersonaDefinition> {
    try {
      console.log('💫 페르소나 생성/수정:', personaData.name);
      
      // 실제로는 데이터베이스에 저장
      const now = new Date().toISOString();
      const newPersona: PersonaDefinition = {
        id: personaData.id || `persona-${Date.now()}`,
        name: personaData.name || '새 페르소나',
        identifier: personaData.identifier || 'custom',
        description: personaData.description || '',
        shortDescription: personaData.shortDescription || '',
        icon: personaData.icon || '🎭',
        color: personaData.color || '#6b7280',
        expertise: personaData.expertise || [],
        industryFocus: personaData.industryFocus || [],
        keywordTriggers: personaData.keywordTriggers || [],
        communicationStyle: personaData.communicationStyle || {
          tone: 'professional',
          formality: 'semi-formal',
          responseLength: 'medium',
          signature: '새 페르소나입니다'
        },
        systemPrompt: personaData.systemPrompt || {
          introduction: '안녕하세요!',
          philosophy: '도움이 되는 조언을 드리겠습니다.',
          guidelines: ['친절하고 정확한 정보 제공']
        },
        metadata: {
          isActive: true,
          priority: personaData.metadata?.priority || 3,
          createdAt: personaData.metadata?.createdAt || now,
          updatedAt: now,
          version: '1.0.0',
          usage: 0,
          satisfaction: 0.7,
          switchSuccessRate: 0.8
        },
        realPersonInfo: personaData.realPersonInfo
      };

      return newPersona;
    } catch (error) {
      console.error('페르소나 생성/수정 실패:', error);
      throw error;
    }
  }

  // 페르소나 비활성화
  static async deactivatePersona(personaId: string): Promise<void> {
    try {
      // 실제로는 데이터베이스에서 isActive를 false로 변경
      console.log(`🚫 페르소나 비활성화: ${personaId}`);
    } catch (error) {
      console.error('페르소나 비활성화 실패:', error);
      throw error;
    }
  }

  // 페르소나 성능 분석
  static async analyzePersonaPerformance(): Promise<{
    totalPersonas: number;
    activePersonas: number;
    avgSatisfaction: number;
    topPersonas: Array<{ id: string; name: string; satisfaction: number; usage: number; }>;
  }> {
    try {
      const personas = await this.getAllPersonas();
      const activePersonas = personas.filter(p => p.metadata.isActive);
      
      const avgSatisfaction = activePersonas.reduce(
        (sum, p) => sum + p.metadata.satisfaction, 0
      ) / activePersonas.length;

      const topPersonas = activePersonas
        .sort((a, b) => b.metadata.satisfaction - a.metadata.satisfaction)
        .slice(0, 3)
        .map(p => ({
          id: p.id,
          name: p.name,
          satisfaction: p.metadata.satisfaction,
          usage: p.metadata.usage
        }));

      return {
        totalPersonas: personas.length,
        activePersonas: activePersonas.length,
        avgSatisfaction,
        topPersonas
      };
    } catch (error) {
      console.error('페르소나 성능 분석 실패:', error);
      return {
        totalPersonas: 0,
        activePersonas: 0,
        avgSatisfaction: 0,
        topPersonas: []
      };
    }
  }

  // 기존 하드코딩된 페르소나 데이터 마이그레이션
  static async migrateExistingPersonas(): Promise<void> {
    try {
      console.log('🔄 기존 페르소나 데이터 마이그레이션 시작...');

      const defaultPersonas = this.getDefaultPersonas();
      
      for (const persona of defaultPersonas) {
        await this.upsertPersona(persona);
        console.log(`✅ 페르소나 마이그레이션: ${persona.name}`);
      }

      console.log('✅ 페르소나 데이터 마이그레이션 완료');
    } catch (error) {
      console.error('❌ 페르소나 데이터 마이그레이션 실패:', error);
      throw error;
    }
  }

  // 연결 종료
  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}