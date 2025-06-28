import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PersonaSyncManager, PersonaAutoSync } from '@/lib/persona-sync-system';
import { canSyncPersona, getAdminDisplayName } from '@/lib/admin-utils';

// 페르소나 동기화 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'sync_now':
        // 페르소나 동기화 권한 확인
        const canSync = canSyncPersona(session.user?.email);
        const adminDisplayName = getAdminDisplayName(session.user?.email);
        
        if (!canSync) {
          return NextResponse.json({
            success: false,
            message: '페르소나 동기화는 Admin 전용 기능입니다.',
            error: 'access_denied',
            adminRequired: true
          }, { status: 403 });
        }
        
        console.log(`🎭 페르소나 동기화 시작: ${adminDisplayName} (${session.user?.email})`);
        
        // 즉시 동기화
        const syncResult = await PersonaSyncManager.syncPersonaFromSocialMedia(session.user.id);
        
        return NextResponse.json({
          success: syncResult.success,
          message: syncResult.success ? `페르소나 동기화 완료 (${adminDisplayName})` : '동기화 실패',
          updatedFields: syncResult.updatedFields,
          insights: syncResult.insights,
          errors: syncResult.errors,
          adminUser: session.user?.email,
          adminDisplayName: adminDisplayName
        });

      case 'schedule_auto_sync':
        // 자동 동기화 스케줄링
        const { intervalHours = 24 } = body;
        await PersonaAutoSync.scheduleSync(session.user.id, intervalHours);
        
        return NextResponse.json({
          success: true,
          message: `${intervalHours}시간마다 자동 동기화 예약됨`
        });

      case 'get_sync_status':
        // 동기화 상태 확인
        return NextResponse.json({
          success: true,
          lastSync: new Date().toISOString(), // 실제로는 DB에서 조회
          nextSync: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          autoSyncEnabled: true
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Persona sync API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 동기화 상태 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 동기화 히스토리 조회 (실제 구현에서는 DB에서)
    return NextResponse.json({
      syncHistory: [
        {
          timestamp: new Date().toISOString(),
          status: 'success',
          updatedFields: ['글쓰기 스타일', '전문 분야', '팔로워 수'],
          platforms: ['threads', 'instagram', 'newsletter']
        }
      ],
      nextScheduledSync: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      autoSyncSettings: {
        enabled: true,
        interval: 24,
        platforms: ['threads', 'instagram', 'newsletter']
      }
    });

  } catch (error) {
    console.error('Persona sync status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}