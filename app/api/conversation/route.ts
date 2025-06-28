import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ConversationManager, ConversationUtils } from '@/lib/conversation-manager';
import { isAdminUser, getAdminDisplayName } from '@/lib/admin-utils';

// 대화 세션 관리 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, sessionId, message, personaType } = body;

    switch (action) {
      case 'start_session':
        // Admin만 학습 세션 시작 가능
        if (!isAdminUser(session.user?.email)) {
          return NextResponse.json({
            error: 'Admin required',
            message: '페르소나 학습 세션은 Admin 전용입니다.'
          }, { status: 403 });
        }

        const newSession = await ConversationManager.startConversationSession(
          session.user.id,
          session.user.email!,
          personaType || 'moment.ryan'
        );

        return NextResponse.json({
          success: true,
          session: newSession,
          message: `${getAdminDisplayName(session.user.email)} 페르소나 학습 세션이 시작되었습니다.`
        });

      case 'save_message':
        if (!sessionId || !message) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'sessionId와 message가 필요합니다.'
          }, { status: 400 });
        }

        const savedMessage = await ConversationManager.saveMessage(
          sessionId,
          body.role || 'user',
          message,
          body.messageType || 'chat',
          body.learningPriority || 5,
          body.metadata
        );

        return NextResponse.json({
          success: true,
          message: savedMessage,
          messageId: savedMessage.id
        });

      case 'end_session':
        if (!sessionId) {
          return NextResponse.json({
            error: 'Missing sessionId',
            message: 'sessionId가 필요합니다.'
          }, { status: 400 });
        }

        const summary = await ConversationManager.endConversationSession(sessionId);

        return NextResponse.json({
          success: true,
          summary: summary,
          message: '세션이 종료되고 학습에 반영되었습니다.'
        });

      case 'get_active_session':
        const activeSession = await ConversationUtils.getActiveSession(session.user.id);
        
        return NextResponse.json({
          success: true,
          activeSession: activeSession
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Conversation API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '대화 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 대화 세션 조회 API
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sessionId = searchParams.get('sessionId');
    const personaType = searchParams.get('personaType') as 'moment.ryan' | 'atozit' | null;
    const limit = parseInt(searchParams.get('limit') || '10');

    switch (action) {
      case 'get_sessions':
        const sessions = await ConversationUtils.getUserSessions(session.user.id, limit);
        
        return NextResponse.json({
          success: true,
          sessions: sessions,
          totalCount: sessions.length
        });

      case 'get_session_details':
        if (!sessionId) {
          return NextResponse.json({
            error: 'Missing sessionId'
          }, { status: 400 });
        }

        // 세션 상세 정보 조회 (실제로는 DB에서 조회)
        return NextResponse.json({
          success: true,
          session: null, // 실제 구현에서는 DB에서 조회한 세션 정보
          messages: [] // 실제 구현에서는 세션의 메시지들
        });

      case 'get_learning_stats':
        if (!personaType) {
          return NextResponse.json({
            error: 'Missing personaType'
          }, { status: 400 });
        }

        const stats = await ConversationUtils.getLearningStats(personaType);
        
        return NextResponse.json({
          success: true,
          stats: stats,
          personaType: personaType
        });

      case 'search_sessions':
        const query = searchParams.get('query') || '';
        const adminEmail = searchParams.get('adminEmail');
        
        const searchResults = await ConversationUtils.searchSessions(
          query, 
          personaType || undefined, 
          adminEmail || undefined
        );

        return NextResponse.json({
          success: true,
          sessions: searchResults,
          query: query,
          filters: { personaType, adminEmail }
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 조회 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Conversation GET API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '대화 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}