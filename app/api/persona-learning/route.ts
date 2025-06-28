import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PersonaLearningService } from '@/lib/persona-learning-service';
import { isAdminUser, getAdminDisplayName } from '@/lib/admin-utils';

// 페르소나 학습 관리 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, personaType, messageContent, sessionId } = body;

    switch (action) {
      case 'initialize_persona':
        // Admin만 페르소나 초기화 가능
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required',
            message: '페르소나 초기화는 Admin 전용입니다.'
          }, { status: 403 });
        }

        if (!personaType || !['moment.ryan', 'atozit'].includes(personaType)) {
          return NextResponse.json({
            error: 'Invalid persona type',
            message: 'moment.ryan 또는 atozit 페르소나만 지원됩니다.'
          }, { status: 400 });
        }

        const initializedProfile = await PersonaLearningService.initializePersonaProfile(personaType);

        return NextResponse.json({
          success: true,
          profile: initializedProfile,
          message: `${personaType} 페르소나가 초기화되었습니다.`
        });

      case 'process_realtime_learning':
        // Admin 대화에서 실시간 학습 처리
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required',
            message: '실시간 학습은 Admin 전용입니다.'
          }, { status: 403 });
        }

        if (!sessionId || !messageContent || !personaType) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'sessionId, messageContent, personaType이 필요합니다.'
          }, { status: 400 });
        }

        await PersonaLearningService.processRealTimeLearning(
          sessionId,
          messageContent,
          personaType,
          session.user.email!
        );

        return NextResponse.json({
          success: true,
          message: '실시간 학습이 처리되었습니다.',
          personaType: personaType,
          adminEmail: session.user.email
        });

      case 'determine_persona_switch':
        // 페르소나 자동 스위칭 판단
        const { userMessage, currentPersona } = body;
        
        if (!userMessage) {
          return NextResponse.json({
            error: 'Missing user message',
            message: 'userMessage가 필요합니다.'
          }, { status: 400 });
        }

        const switchDecision = await PersonaLearningService.determinePersonaSwitch(
          userMessage,
          currentPersona
        );

        return NextResponse.json({
          success: true,
          decision: switchDecision,
          currentPersona: currentPersona,
          userId: session.user.id
        });

      case 'get_learning_stats':
        if (!personaType) {
          return NextResponse.json({
            error: 'Missing persona type',
            message: 'personaType이 필요합니다.'
          }, { status: 400 });
        }

        const stats = await PersonaLearningService.getLearningStats(personaType);

        return NextResponse.json({
          success: true,
          stats: stats,
          personaType: personaType
        });

      case 'trigger_batch_learning':
        // 수동으로 배치 학습 트리거 (개발/테스트 용도)
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required'
          }, { status: 403 });
        }

        const { summaryData } = body;
        if (!summaryData) {
          return NextResponse.json({
            error: 'Missing summary data'
          }, { status: 400 });
        }

        await PersonaLearningService.processBatchLearning(summaryData);

        return NextResponse.json({
          success: true,
          message: '배치 학습이 완료되었습니다.'
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Persona learning API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '페르소나 학습 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 페르소나 학습 상태 조회 API
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const personaType = searchParams.get('personaType') as 'moment.ryan' | 'atozit' | null;

    switch (action) {
      case 'get_all_personas':
        const momentRyanStats = await PersonaLearningService.getLearningStats('moment.ryan');
        const atozitStats = await PersonaLearningService.getLearningStats('atozit');

        return NextResponse.json({
          success: true,
          personas: {
            'moment.ryan': momentRyanStats,
            'atozit': atozitStats
          },
          isAdmin: isAdminUser(session.user?.email),
          adminDisplayName: getAdminDisplayName(session.user?.email)
        });

      case 'get_persona_profile':
        if (!personaType) {
          return NextResponse.json({
            error: 'Missing persona type'
          }, { status: 400 });
        }

        const profile = await PersonaLearningService.getLearningStats(personaType);

        return NextResponse.json({
          success: true,
          profile: profile,
          personaType: personaType
        });

      case 'get_learning_history':
        // 학습 히스토리 조회 (Admin 전용)
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required'
          }, { status: 403 });
        }

        // 실제로는 DB에서 PersonaLearningLog 조회
        const learningHistory = [
          {
            id: '1',
            personaType: personaType,
            sourceType: 'admin_conversation',
            updateType: 'writing_style',
            changeDescription: 'Admin 대화에서 새로운 글쓰기 패턴 학습',
            createdAt: new Date().toISOString(),
            createdBy: session.user.email
          }
        ];

        return NextResponse.json({
          success: true,
          history: learningHistory,
          personaType: personaType,
          totalCount: learningHistory.length
        });

      case 'get_switch_analytics':
        // 페르소나 스위칭 분석 데이터 (Admin 전용)
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required'
          }, { status: 403 });
        }

        // 실제로는 DB에서 PersonaSwitchLog 조회 및 분석
        const switchAnalytics = {
          totalSwitches: 0,
          mostFrequentTriggers: [],
          switchAccuracy: 0.85,
          userSatisfaction: 0.9,
          recentSwitches: []
        };

        return NextResponse.json({
          success: true,
          analytics: switchAnalytics
        });

      default:
        return NextResponse.json({
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Persona learning GET API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '페르소나 학습 상태 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}