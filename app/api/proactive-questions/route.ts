import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProactiveQuestionService, QuestionContext } from '@/lib/proactive-questions';
import { isAdminUser, getAdminDisplayName } from '@/lib/admin-utils';

// 능동적 질문 관리 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'get_proactive_question':
        // Admin만 능동적 질문 시스템 사용 가능
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required',
            message: '능동적 질문 시스템은 Admin 전용입니다.'
          }, { status: 403 });
        }

        const { personaType, sessionId, messageCount, recentTopics, lastQuestionTime } = body;

        if (!personaType || !['moment.ryan', 'atozit'].includes(personaType)) {
          return NextResponse.json({
            error: 'Invalid persona type',
            message: 'moment.ryan 또는 atozit 페르소나만 지원됩니다.'
          }, { status: 400 });
        }

        const context: QuestionContext = {
          sessionId: sessionId || 'unknown',
          messageCount: messageCount || 0,
          recentTopics: Array.isArray(recentTopics) ? recentTopics : [],
          lastQuestionTime,
          adminEmail: session.user.email!,
          conversationFlow: this.determineConversationFlow(messageCount)
        };

        const selectedQuestion = await ProactiveQuestionService.selectProactiveQuestion(
          context,
          personaType
        );

        if (!selectedQuestion) {
          return NextResponse.json({
            success: true,
            hasQuestion: false,
            message: '현재 상황에 적합한 질문이 없습니다.'
          });
        }

        return NextResponse.json({
          success: true,
          hasQuestion: true,
          question: {
            id: selectedQuestion.id,
            text: selectedQuestion.questionText,
            category: selectedQuestion.category,
            expectedInsights: selectedQuestion.expectedInsights,
            personaType: selectedQuestion.personaType
          },
          context: context,
          adminEmail: session.user.email
        });

      case 'generate_followup':
        // 후속 질문 생성
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required'
          }, { status: 403 });
        }

        const { originalQuestionId, adminResponse, questionContext } = body;

        if (!originalQuestionId || !adminResponse) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'originalQuestionId와 adminResponse가 필요합니다.'
          }, { status: 400 });
        }

        // 원본 질문 정보 조회 (실제로는 DB에서)
        const originalQuestion = await this.getQuestionById(originalQuestionId);
        if (!originalQuestion) {
          return NextResponse.json({
            error: 'Question not found'
          }, { status: 404 });
        }

        const followUpQuestion = await ProactiveQuestionService.generateFollowUpQuestion(
          originalQuestion,
          adminResponse,
          questionContext
        );

        if (!followUpQuestion) {
          return NextResponse.json({
            success: true,
            hasFollowUp: false,
            message: '추가 후속 질문이 없습니다.'
          });
        }

        return NextResponse.json({
          success: true,
          hasFollowUp: true,
          followUpQuestion: followUpQuestion,
          originalQuestionId: originalQuestionId
        });

      case 'record_question_response':
        // 질문 응답 기록 및 분석
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required'
          }, { status: 403 });
        }

        const { questionId, response, extractedInsights } = body;

        if (!questionId || !response) {
          return NextResponse.json({
            error: 'Missing required fields'
          }, { status: 400 });
        }

        // 질문 효과성 분석
        await ProactiveQuestionService.analyzeQuestionEffectiveness(
          questionId,
          response,
          extractedInsights || []
        );

        return NextResponse.json({
          success: true,
          message: '질문 응답이 기록되었습니다.',
          questionId: questionId
        });

      case 'add_question_template':
        // 새 질문 템플릿 추가 (Super Admin 전용)
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Super Admin required'
          }, { status: 403 });
        }

        const { questionTemplate } = body;
        if (!questionTemplate) {
          return NextResponse.json({
            error: 'Missing question template'
          }, { status: 400 });
        }

        const newQuestionId = await ProactiveQuestionService.addQuestionTemplate({
          ...questionTemplate,
          createdBy: session.user.email
        });

        return NextResponse.json({
          success: true,
          questionId: newQuestionId,
          message: '새 질문 템플릿이 추가되었습니다.'
        });

      default:
        return NextResponse.json({
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Proactive questions API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '능동적 질문 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }

  // 대화 흐름 판단 헬퍼 메서드
  private static determineConversationFlow(messageCount: number): 'initial' | 'deepening' | 'exploration' | 'synthesis' {
    if (messageCount <= 5) return 'initial';
    if (messageCount <= 15) return 'deepening';
    if (messageCount <= 30) return 'exploration';
    return 'synthesis';
  }

  // 질문 ID로 질문 조회 헬퍼 메서드
  private static async getQuestionById(questionId: string): Promise<any> {
    // 실제로는 데이터베이스에서 조회
    // SELECT * FROM ProactiveQuestionTemplate WHERE id = questionId
    return null; // 임시
  }
}

// 능동적 질문 조회 및 통계 API
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin만 접근 가능
    if (!isAdminUser(session.user?.email)) {
      return NextResponse.json({
        error: 'Admin required'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const personaType = searchParams.get('personaType') as 'moment.ryan' | 'atozit' | null;

    switch (action) {
      case 'get_question_templates':
        // 질문 템플릿 목록 조회
        const templates = await this.getQuestionTemplates(personaType);
        
        return NextResponse.json({
          success: true,
          templates: templates,
          personaType: personaType,
          totalCount: templates.length
        });

      case 'get_question_stats':
        // 질문 사용 통계 조회
        const stats = await this.getQuestionStatistics(personaType);
        
        return NextResponse.json({
          success: true,
          stats: stats,
          personaType: personaType
        });

      case 'get_question_history':
        // 질문 히스토리 조회
        const history = await this.getQuestionHistory(session.user.email!, personaType);
        
        return NextResponse.json({
          success: true,
          history: history,
          adminEmail: session.user.email
        });

      case 'get_effectiveness_report':
        // 질문 효과성 리포트 조회
        const report = await this.getEffectivenessReport(personaType);
        
        return NextResponse.json({
          success: true,
          report: report,
          personaType: personaType
        });

      default:
        return NextResponse.json({
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Proactive questions GET API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '능동적 질문 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }

  // 헬퍼 메서드들
  private static async getQuestionTemplates(personaType?: string | null): Promise<any[]> {
    // 실제로는 데이터베이스에서 조회
    return [
      {
        id: '1',
        personaType: personaType || 'moment.ryan',
        category: 'expertise',
        questionText: '마케팅 전략 수립 시 가장 중요한 요소는?',
        isActive: true,
        usageCount: 5,
        lastUsed: new Date().toISOString()
      }
    ];
  }

  private static async getQuestionStatistics(personaType?: string | null): Promise<any> {
    // 실제로는 데이터베이스 집계 쿼리
    return {
      totalQuestions: 20,
      activeQuestions: 18,
      totalUsage: 150,
      averageResponseLength: 180,
      categoryDistribution: {
        expertise: 8,
        personality: 4,
        business: 6,
        methodology: 2
      },
      effectivenessScore: 0.82
    };
  }

  private static async getQuestionHistory(adminEmail: string, personaType?: string | null): Promise<any[]> {
    // 실제로는 데이터베이스에서 조회
    return [
      {
        id: '1',
        questionId: 'q1',
        questionText: '마케팅 전략 수립 시 가장 중요한 요소는?',
        response: '데이터 기반 의사결정과 고객 인사이트를 가장 중요하게 생각합니다.',
        timestamp: new Date().toISOString(),
        effectiveness: 0.85
      }
    ];
  }

  private static async getEffectivenessReport(personaType?: string | null): Promise<any> {
    // 실제로는 복잡한 분석 쿼리
    return {
      overallEffectiveness: 0.78,
      bestPerformingCategories: ['expertise', 'business'],
      improvementAreas: ['writing_style'],
      responseQualityTrend: [0.7, 0.75, 0.8, 0.82, 0.78],
      insightGenerationRate: 0.85,
      adminEngagementLevel: 0.9
    };
  }
}