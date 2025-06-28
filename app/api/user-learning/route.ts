import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserPersonaLearningService, UserInteraction } from '@/lib/user-persona-learning';

// 일반 사용자 학습 시스템 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'record_interaction':
        // 사용자 상호작용 기록
        const { 
          sessionId, 
          personaUsed, 
          userMessage, 
          aiResponse, 
          userFeedback,
          interactionMetrics 
        } = body;

        if (!sessionId || !personaUsed || !userMessage || !aiResponse) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'sessionId, personaUsed, userMessage, aiResponse가 필요합니다.'
          }, { status: 400 });
        }

        const interaction: UserInteraction = {
          id: generateId(),
          userId: session.user.id,
          sessionId,
          personaUsed,
          userMessage,
          aiResponse,
          userFeedback,
          interactionMetrics: interactionMetrics || {
            responseTime: 0,
            messageLength: userMessage.length,
            complexity: 'medium',
            topicCategory: 'general',
            satisfactionPrediction: 0.7
          },
          timestamp: new Date().toISOString()
        };

        await UserPersonaLearningService.recordUserInteraction(interaction);

        return NextResponse.json({
          success: true,
          interactionId: interaction.id,
          message: '상호작용이 기록되었습니다.',
          userId: session.user.id
        });

      case 'get_persona_recommendation':
        // 사용자 맞춤 페르소나 추천
        const { userMessage: messageForRecommendation, currentContext } = body;

        if (!messageForRecommendation) {
          return NextResponse.json({
            error: 'Missing user message',
            message: 'userMessage가 필요합니다.'
          }, { status: 400 });
        }

        const recommendation = await UserPersonaLearningService.recommendPersonaForUser(
          session.user.id,
          messageForRecommendation,
          currentContext
        );

        return NextResponse.json({
          success: true,
          recommendation: recommendation,
          userId: session.user.id,
          timestamp: new Date().toISOString()
        });

      case 'submit_feedback':
        // 사용자 피드백 제출
        const { interactionId, feedback } = body;

        if (!interactionId || !feedback) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'interactionId와 feedback이 필요합니다.'
          }, { status: 400 });
        }

        if (typeof feedback.helpful !== 'boolean' || 
            typeof feedback.rating !== 'number' || 
            feedback.rating < 1 || feedback.rating > 5) {
          return NextResponse.json({
            error: 'Invalid feedback format',
            message: 'helpful(boolean)과 rating(1-5)이 필요합니다.'
          }, { status: 400 });
        }

        await UserPersonaLearningService.processFeedback(
          session.user.id,
          interactionId,
          feedback
        );

        return NextResponse.json({
          success: true,
          message: '피드백이 제출되었습니다.',
          interactionId: interactionId
        });

      case 'set_learning_goal':
        // 학습 목표 설정
        const { goalData } = body;

        if (!goalData || !goalData.description || !goalData.goalType) {
          return NextResponse.json({
            error: 'Missing goal data',
            message: 'goalType과 description이 필요합니다.'
          }, { status: 400 });
        }

        const goalId = await UserPersonaLearningService.setUserLearningGoal(
          session.user.id,
          goalData
        );

        return NextResponse.json({
          success: true,
          goalId: goalId,
          message: '학습 목표가 설정되었습니다.'
        });

      case 'update_learning_progress':
        // 학습 진행도 업데이트
        const { goalId: progressGoalId, progressData } = body;

        if (!progressGoalId || !progressData) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'goalId와 progressData가 필요합니다.'
          }, { status: 400 });
        }

        await UserPersonaLearningService.updateLearningProgress(
          session.user.id,
          progressGoalId,
          progressData
        );

        return NextResponse.json({
          success: true,
          message: '학습 진행도가 업데이트되었습니다.',
          goalId: progressGoalId
        });

      case 'initialize_user_profile':
        // 사용자 프로필 초기화 (신규 사용자)
        const userProfile = await UserPersonaLearningService.initializeUserProfile(session.user.id);

        return NextResponse.json({
          success: true,
          profile: userProfile,
          message: '사용자 프로필이 초기화되었습니다.'
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('User learning API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '사용자 학습 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 사용자 학습 정보 조회 API
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'get_user_profile':
        // 사용자 프로필 조회
        try {
          const profile = await UserPersonaLearningService.initializeUserProfile(session.user.id);
          // 실제로는 기존 프로필을 로드
          
          return NextResponse.json({
            success: true,
            profile: profile,
            userId: session.user.id
          });
        } catch (error) {
          // 프로필이 없으면 초기화
          const newProfile = await UserPersonaLearningService.initializeUserProfile(session.user.id);
          
          return NextResponse.json({
            success: true,
            profile: newProfile,
            isNewProfile: true,
            userId: session.user.id
          });
        }

      case 'get_personalized_style':
        // 개인화된 응답 스타일 조회
        const style = await UserPersonaLearningService.getPersonalizedResponseStyle(session.user.id);

        return NextResponse.json({
          success: true,
          style: style,
          userId: session.user.id
        });

      case 'get_growth_analysis':
        // 사용자 성장 분석 조회
        const growthAnalysis = await UserPersonaLearningService.analyzeUserGrowth(session.user.id);

        return NextResponse.json({
          success: true,
          analysis: growthAnalysis,
          userId: session.user.id
        });

      case 'get_learning_goals':
        // 학습 목표 목록 조회
        const goals = await this.getUserLearningGoals(session.user.id);

        return NextResponse.json({
          success: true,
          goals: goals,
          userId: session.user.id
        });

      case 'get_interaction_history':
        // 상호작용 이력 조회
        const limit = parseInt(searchParams.get('limit') || '20');
        const history = await this.getUserInteractionHistory(session.user.id, limit);

        return NextResponse.json({
          success: true,
          history: history,
          totalCount: history.length,
          userId: session.user.id
        });

      case 'get_persona_affinities':
        // 페르소나 친화도 조회
        const affinities = await this.getUserPersonaAffinities(session.user.id);

        return NextResponse.json({
          success: true,
          affinities: affinities,
          userId: session.user.id
        });

      case 'get_learning_stats':
        // 학습 통계 조회
        const stats = await this.getUserLearningStats(session.user.id);

        return NextResponse.json({
          success: true,
          stats: stats,
          userId: session.user.id
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 조회 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('User learning GET API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '사용자 학습 정보 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }

  // 헬퍼 메서드들
  private static async getUserLearningGoals(userId: string): Promise<any[]> {
    // 실제로는 데이터베이스에서 조회
    return [
      {
        id: '1',
        goalType: 'skill_development',
        description: '마케팅 전략 수립 능력 향상',
        priority: 'high',
        status: 'active',
        progressMetrics: {
          currentLevel: 65,
          milestones: ['기본 개념 학습', '사례 분석'],
          blockers: []
        },
        targetPersona: 'moment.ryan',
        createdAt: new Date().toISOString()
      }
    ];
  }

  private static async getUserInteractionHistory(userId: string, limit: number): Promise<any[]> {
    // 실제로는 데이터베이스에서 조회
    return [
      {
        id: '1',
        sessionId: 'session1',
        personaUsed: 'moment.ryan',
        userMessage: '마케팅 전략을 어떻게 세워야 하나요?',
        aiResponse: '마케팅 전략 수립 시 고려할 주요 요소들을 설명드리겠습니다...',
        userFeedback: {
          helpful: true,
          rating: 4,
          comment: '도움이 되었습니다'
        },
        timestamp: new Date().toISOString()
      }
    ];
  }

  private static async getUserPersonaAffinities(userId: string): Promise<any> {
    // 실제로는 데이터베이스에서 조회
    return {
      'moment.ryan': {
        affinityScore: 0.75,
        successfulInteractions: 12,
        preferredTopics: ['마케팅', '콘텐츠', 'SNS'],
        satisfactionRating: 4.2
      },
      'atozit': {
        affinityScore: 0.65,
        successfulInteractions: 8,
        preferredTopics: ['브랜딩', '전략'],
        satisfactionRating: 4.0
      }
    };
  }

  private static async getUserLearningStats(userId: string): Promise<any> {
    // 실제로는 데이터베이스 집계 쿼리
    return {
      totalInteractions: 25,
      totalSessions: 8,
      averageSatisfaction: 4.1,
      learningStage: 'developing',
      strongAreas: ['의사소통', '문제 해결'],
      improvementAreas: ['기술적 깊이', '데이터 분석'],
      preferredPersona: 'moment.ryan',
      growthRate: 15.5, // 월 성장률 %
      streakDays: 7,
      lastActivityDate: new Date().toISOString()
    };
  }
}

// 유틸리티 함수
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}