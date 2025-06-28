import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserService } from '@/lib/user-service';

// 사용자 정보 조회 및 관리 API
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'profile':
        // 현재 사용자 프로필 조회
        const userProfile = await UserService.getOrCreateUserProfile(
          session.user.id,
          session.user.email!,
          session.user.name || undefined,
          session.user.image || undefined
        );

        return NextResponse.json({
          success: true,
          profile: userProfile
        });

      case 'statistics':
        // 사용자 통계 조회
        const statistics = await UserService.calculateUserStatistics(session.user.id);
        
        return NextResponse.json({
          success: true,
          statistics: statistics
        });

      case 'role':
        // 사용자 역할 조회
        const role = await UserService.getUserRole(session.user.id);
        
        return NextResponse.json({
          success: true,
          role: role
        });

      case 'search':
        // 사용자 검색 (관리자만)
        const userRole = await UserService.getUserRole(session.user.id);
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
          return NextResponse.json({
            error: 'Access denied',
            message: '관리자 권한이 필요합니다.'
          }, { status: 403 });
        }

        const query = searchParams.get('query') || '';
        const limit = parseInt(searchParams.get('limit') || '20');
        
        const searchResults = await UserService.searchUsers(query, limit);
        
        return NextResponse.json({
          success: true,
          users: searchResults,
          query: query
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('User API GET error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '사용자 정보 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 사용자 정보 업데이트 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update_preferences':
        // 사용자 선호도 업데이트
        const { preferences } = body;
        
        if (!preferences) {
          return NextResponse.json({
            error: 'Missing preferences',
            message: 'preferences 필드가 필요합니다.'
          }, { status: 400 });
        }

        await UserService.updateUserPreferences(session.user.id, preferences);

        return NextResponse.json({
          success: true,
          message: '사용자 선호도가 업데이트되었습니다.'
        });

      case 'create_session':
        // 새 사용자 세션 생성
        const { personaUsed } = body;
        
        const newSession = await UserService.createUserSession(
          session.user.id,
          personaUsed
        );

        return NextResponse.json({
          success: true,
          session: newSession,
          message: '새 세션이 생성되었습니다.'
        });

      case 'end_session':
        // 사용자 세션 종료
        const { sessionId, satisfaction } = body;
        
        if (!sessionId) {
          return NextResponse.json({
            error: 'Missing sessionId',
            message: 'sessionId가 필요합니다.'
          }, { status: 400 });
        }

        await UserService.endUserSession(sessionId, satisfaction);

        return NextResponse.json({
          success: true,
          message: '세션이 종료되었습니다.'
        });

      case 'update_activity':
        // 사용자 활동 업데이트
        await UserService.updateUserActivity(session.user.id);

        return NextResponse.json({
          success: true,
          message: '사용자 활동이 업데이트되었습니다.'
        });

      case 'increment_message':
        // 메시지 카운트 증가
        const { sessionId: msgSessionId } = body;
        
        if (!msgSessionId) {
          return NextResponse.json({
            error: 'Missing sessionId'
          }, { status: 400 });
        }

        await UserService.incrementMessageCount(msgSessionId);

        return NextResponse.json({
          success: true,
          message: '메시지 카운트가 증가되었습니다.'
        });

      case 'update_statistics':
        // 사용자 통계 업데이트
        const { statistics } = body;
        
        if (!statistics) {
          return NextResponse.json({
            error: 'Missing statistics'
          }, { status: 400 });
        }

        await UserService.updateUserStatistics(session.user.id, statistics);

        return NextResponse.json({
          success: true,
          message: '사용자 통계가 업데이트되었습니다.'
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('User API POST error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '사용자 정보 업데이트 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 사용자 삭제 API (GDPR 준수)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    // 자신의 계정 삭제 또는 관리자 권한 확인
    if (targetUserId && targetUserId !== session.user.id) {
      const userRole = await UserService.getUserRole(session.user.id);
      if (userRole !== 'SUPER_ADMIN') {
        return NextResponse.json({
          error: 'Access denied',
          message: '자신의 계정만 삭제하거나 Super Admin 권한이 필요합니다.'
        }, { status: 403 });
      }
    }

    const userIdToDelete = targetUserId || session.user.id;
    
    await UserService.deleteUser(userIdToDelete);

    return NextResponse.json({
      success: true,
      message: '사용자 계정이 삭제되었습니다.',
      deletedUserId: userIdToDelete
    });

  } catch (error) {
    console.error('User API DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '사용자 삭제 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}