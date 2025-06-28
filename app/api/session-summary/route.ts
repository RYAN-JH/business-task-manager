import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SessionSummaryService } from '@/lib/session-summary-service';
import { isAdminUser, getAdminDisplayName } from '@/lib/admin-utils';

// 세션 요약 및 학습 반영 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'generate_session_summary':
        // 세션 종료 시 요약 생성
        const { sessionId } = body;

        if (!sessionId) {
          return NextResponse.json({
            error: 'Missing sessionId',
            message: 'sessionId가 필요합니다.'
          }, { status: 400 });
        }

        console.log(`📋 세션 요약 생성 요청: ${sessionId} by ${session.user.email}`);

        const summary = await SessionSummaryService.generateSessionSummary(sessionId);

        return NextResponse.json({
          success: true,
          summary: {
            id: summary.id,
            sessionId: summary.sessionId,
            personaType: summary.personaType,
            keyTopics: summary.keyTopics,
            expertiseAreas: summary.expertiseAreas,
            summaryContent: summary.summaryContent,
            createdAt: summary.createdAt
          },
          message: '세션 요약이 생성되고 학습에 반영되었습니다.',
          userId: session.user.id,
          adminEmail: session.user.email
        });

      case 'process_realtime_learning':
        // 실시간 학습 처리 (메시지별)
        const { sessionId: rtSessionId, messageData } = body;

        if (!rtSessionId || !messageData) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'sessionId와 messageData가 필요합니다.'
          }, { status: 400 });
        }

        await SessionSummaryService.processRealTimeLearning(rtSessionId, messageData);

        return NextResponse.json({
          success: true,
          message: '실시간 학습이 처리되었습니다.',
          sessionId: rtSessionId,
          messageId: messageData.id
        });

      case 'trigger_manual_summary':
        // 수동 요약 트리거 (개발/테스트 용도)
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required',
            message: '수동 요약은 Admin 전용입니다.'
          }, { status: 403 });
        }

        const { targetSessionId, forceRegenerate } = body;

        if (!targetSessionId) {
          return NextResponse.json({
            error: 'Missing targetSessionId'
          }, { status: 400 });
        }

        const manualSummary = await SessionSummaryService.generateSessionSummary(targetSessionId);

        return NextResponse.json({
          success: true,
          summary: manualSummary,
          message: '수동 요약이 생성되었습니다.',
          triggeredBy: session.user.email
        });

      case 'validate_learning_quality':
        // 학습 품질 검증
        const { summaryId } = body;

        if (!summaryId) {
          return NextResponse.json({
            error: 'Missing summaryId'
          }, { status: 400 });
        }

        const qualityResult = await this.validateSummaryQuality(summaryId);

        return NextResponse.json({
          success: true,
          qualityResult: qualityResult,
          summaryId: summaryId
        });

      case 'batch_process_sessions':
        // 여러 세션 일괄 처리 (Admin 전용)
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required'
          }, { status: 403 });
        }

        const { sessionIds, processingOptions } = body;

        if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
          return NextResponse.json({
            error: 'Invalid sessionIds',
            message: '유효한 sessionIds 배열이 필요합니다.'
          }, { status: 400 });
        }

        const batchResults = await this.processBatchSessions(sessionIds, processingOptions);

        return NextResponse.json({
          success: true,
          results: batchResults,
          processedCount: sessionIds.length,
          triggeredBy: session.user.email
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Session summary API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '세션 요약 처리 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }

  // 헬퍼 메서드들
  private static async validateSummaryQuality(summaryId: string): Promise<any> {
    // 실제로는 데이터베이스에서 요약 조회 후 품질 검증
    return {
      summaryId,
      qualityScore: 0.85,
      consistencyCheck: true,
      conflictDetection: false,
      recommendedActions: ['정상 품질', '추가 조치 불필요'],
      validationTimestamp: new Date().toISOString()
    };
  }

  private static async processBatchSessions(sessionIds: string[], options: any): Promise<any[]> {
    const results = [];
    
    for (const sessionId of sessionIds) {
      try {
        const summary = await SessionSummaryService.generateSessionSummary(sessionId);
        results.push({
          sessionId,
          success: true,
          summaryId: summary.id,
          processingTime: Date.now()
        });
      } catch (error) {
        results.push({
          sessionId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }
}

// 세션 요약 조회 및 통계 API
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'get_session_summaries':
        // 사용자의 세션 요약 목록 조회
        const limit = parseInt(searchParams.get('limit') || '20');
        const personaType = searchParams.get('personaType') as 'moment.ryan' | 'atozit' | null;
        
        const summaries = await this.getUserSessionSummaries(session.user.id, limit, personaType);

        return NextResponse.json({
          success: true,
          summaries: summaries,
          totalCount: summaries.length,
          userId: session.user.id
        });

      case 'get_summary_details':
        // 특정 요약 상세 조회
        const summaryId = searchParams.get('summaryId');
        
        if (!summaryId) {
          return NextResponse.json({
            error: 'Missing summaryId'
          }, { status: 400 });
        }

        const summaryDetails = await this.getSummaryDetails(summaryId, session.user.id);

        return NextResponse.json({
          success: true,
          summary: summaryDetails,
          summaryId: summaryId
        });

      case 'get_learning_analytics':
        // 학습 분석 데이터 조회
        const timeRange = searchParams.get('timeRange') || '7d';
        const analytics = await this.getLearningAnalytics(session.user.id, timeRange);

        return NextResponse.json({
          success: true,
          analytics: analytics,
          timeRange: timeRange,
          userId: session.user.id
        });

      case 'get_persona_evolution':
        // 페르소나 진화 과정 조회 (Admin 전용)
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required'
          }, { status: 403 });
        }

        const targetPersona = searchParams.get('personaType') as 'moment.ryan' | 'atozit';
        const evolutionData = await this.getPersonaEvolution(targetPersona);

        return NextResponse.json({
          success: true,
          evolution: evolutionData,
          personaType: targetPersona,
          adminEmail: session.user.email
        });

      case 'get_quality_metrics':
        // 학습 품질 메트릭 조회 (Admin 전용)
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required'
          }, { status: 403 });
        }

        const qualityMetrics = await this.getQualityMetrics();

        return NextResponse.json({
          success: true,
          metrics: qualityMetrics,
          generatedAt: new Date().toISOString()
        });

      case 'get_session_insights':
        // 세션별 인사이트 조회
        const targetSessionId = searchParams.get('sessionId');
        
        if (!targetSessionId) {
          return NextResponse.json({
            error: 'Missing sessionId'
          }, { status: 400 });
        }

        const insights = await this.getSessionInsights(targetSessionId, session.user.id);

        return NextResponse.json({
          success: true,
          insights: insights,
          sessionId: targetSessionId
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 조회 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Session summary GET API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '세션 요약 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }

  // 헬퍼 메서드들
  private static async getUserSessionSummaries(
    userId: string, 
    limit: number, 
    personaType?: string | null
  ): Promise<any[]> {
    // 실제로는 데이터베이스에서 조회
    return [
      {
        id: '1',
        sessionId: 'session1',
        personaType: personaType || 'moment.ryan',
        keyTopics: ['마케팅 전략', 'SNS 운영'],
        expertiseAreas: ['디지털 마케팅', '콘텐츠 기획'],
        summaryContent: '마케팅 전략 수립에 대한 30분간의 심화 대화',
        learningValue: 85,
        createdAt: new Date().toISOString(),
        appliedToPersona: true
      }
    ];
  }

  private static async getSummaryDetails(summaryId: string, userId: string): Promise<any> {
    // 실제로는 데이터베이스에서 상세 조회
    return {
      id: summaryId,
      sessionId: 'session1',
      personaType: 'moment.ryan',
      summaryContent: '상세한 세션 요약 내용...',
      extractedKnowledge: {
        concepts: ['ROI', 'KPI', '타겟팅'],
        insights: ['데이터 기반 의사결정', '고객 중심 접근'],
        methodologies: ['린 스타트업', '애자일 마케팅']
      },
      learningInsights: {
        writingStyle: { tone: 'professional', structure: 'detailed' },
        personalityTraits: ['분석적', '실용적'],
        businessPerspective: ['성장 중심', '효율성 추구']
      },
      qualityMetrics: {
        overallScore: 85,
        knowledgeExtraction: 90,
        personalityInsights: 80,
        expertiseDiscovery: 85
      },
      appliedChanges: [
        { type: 'writing_style', description: '응답 구조 개선' },
        { type: 'expertise', description: '마케팅 지식 확장' },
        { type: 'personality', description: '분석적 성향 강화' }
      ]
    };
  }

  private static async getLearningAnalytics(userId: string, timeRange: string): Promise<any> {
    // 실제로는 복잡한 분석 쿼리
    return {
      sessionCount: 12,
      totalLearningTime: 180, // 분
      averageSessionQuality: 82,
      topTopics: ['마케팅', '전략', '콘텐츠'],
      learningTrend: [75, 78, 80, 82, 85], // 최근 5일 품질 점수
      personaUsage: {
        'moment.ryan': 8,
        'atozit': 4
      },
      knowledgeGrowth: {
        conceptsLearned: 45,
        expertiseAreas: 3,
        personalityInsights: 12
      },
      timeDistribution: {
        morning: 0.2,
        afternoon: 0.4,
        evening: 0.3,
        night: 0.1
      }
    };
  }

  private static async getPersonaEvolution(personaType: 'moment.ryan' | 'atozit' | null): Promise<any> {
    // 실제로는 페르소나 변화 추적 데이터
    return {
      personaType,
      evolutionTimeline: [
        {
          date: '2024-01-01',
          version: '1.0',
          changes: ['초기 설정'],
          qualityScore: 60
        },
        {
          date: '2024-01-15',
          version: '1.1',
          changes: ['글쓰기 스타일 개선', '전문성 강화'],
          qualityScore: 75
        },
        {
          date: '2024-02-01',
          version: '1.2',
          changes: ['성격 특성 정제', '비즈니스 인사이트 확장'],
          qualityScore: 85
        }
      ],
      currentMetrics: {
        expertise: 0.88,
        personality: 0.82,
        consistency: 0.90,
        userSatisfaction: 0.86
      },
      upcomingChanges: [
        '의사결정 스타일 보완',
        '업계 전망 업데이트',
        '커뮤니케이션 패턴 최적화'
      ]
    };
  }

  private static async getQualityMetrics(): Promise<any> {
    // 실제로는 전체 시스템 품질 메트릭
    return {
      overallQuality: 0.84,
      sessionQualityDistribution: {
        excellent: 0.35,
        good: 0.45,
        average: 0.15,
        poor: 0.05
      },
      learningEffectiveness: {
        adminSessions: 0.92,
        userSessions: 0.78,
        realTimeLearning: 0.81,
        batchLearning: 0.89
      },
      consistencyMetrics: {
        personaConsistency: 0.87,
        responseQuality: 0.83,
        knowledgeIntegration: 0.85
      },
      improvementAreas: [
        '실시간 학습 정확도 향상',
        '사용자 세션 품질 개선',
        '지식 통합 프로세스 최적화'
      ]
    };
  }

  private static async getSessionInsights(sessionId: string, userId: string): Promise<any> {
    // 실제로는 세션별 상세 인사이트
    return {
      sessionId,
      duration: 25, // 분
      messageCount: 18,
      topicFlow: [
        { topic: '마케팅 전략', messages: 8, startTime: 0 },
        { topic: 'SNS 운영', messages: 6, startTime: 12 },
        { topic: '성과 측정', messages: 4, startTime: 20 }
      ],
      learningMoments: [
        {
          timestamp: '2024-02-01T10:15:00Z',
          type: 'knowledge_extraction',
          content: 'ROI 계산 방법론에 대한 새로운 인사이트',
          impact: 'high'
        },
        {
          timestamp: '2024-02-01T10:22:00Z',
          type: 'personality_insight',
          content: '분석적 접근을 선호하는 성향 발견',
          impact: 'medium'
        }
      ],
      qualityBreakdown: {
        contentDepth: 0.85,
        expertiseRelevance: 0.88,
        responseClarity: 0.82,
        userEngagement: 0.90
      },
      recommendedFollowUp: [
        '마케팅 ROI 심화 학습',
        '실제 사례 연구',
        'A/B 테스트 방법론'
      ]
    };
  }
}