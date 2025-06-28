import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PersonaService, PersonaContext } from '@/lib/persona-service';
import { AdminService } from '@/lib/admin-service';

// 페르소나 관리 API
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'list':
        // 모든 활성 페르소나 목록 조회
        const personas = await PersonaService.getAllPersonas();
        
        return NextResponse.json({
          success: true,
          personas: personas.filter(p => p.metadata.isActive)
        });

      case 'detail':
        // 특정 페르소나 상세 정보 조회
        const personaId = searchParams.get('personaId');
        
        if (!personaId) {
          return NextResponse.json({
            error: 'Missing personaId parameter'
          }, { status: 400 });
        }

        const persona = await PersonaService.getPersonaById(personaId);
        
        if (!persona) {
          return NextResponse.json({
            error: 'Persona not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          persona: persona
        });

      case 'select_best':
        // AI 기반 최적 페르소나 선택
        const messageTopics = JSON.parse(searchParams.get('topics') || '[]');
        const messageCount = parseInt(searchParams.get('messageCount') || '1');
        const sentiment = searchParams.get('sentiment') as 'positive' | 'neutral' | 'negative' || 'neutral';
        
        const context: PersonaContext = {
          userId: session.user.id,
          currentSession: {
            messageCount,
            topics: messageTopics,
            sentiment
          },
          userProfile: { userId: session.user.id },
          recentInteractions: [] // 실제로는 데이터베이스에서 조회
        };

        const bestPersona = await PersonaService.selectBestPersona(context);
        
        return NextResponse.json({
          success: true,
          recommendedPersona: bestPersona,
          context: {
            messageCount,
            topics: messageTopics,
            sentiment
          }
        });

      case 'performance':
        // 페르소나 성능 분석 (Admin만)
        const isAdmin = await AdminService.isAdminUser(session.user.email!);
        if (!isAdmin) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const performance = await PersonaService.analyzePersonaPerformance();
        
        return NextResponse.json({
          success: true,
          performance: performance
        });

      case 'admin_list':
        // 관리자용 전체 페르소나 목록 (비활성 포함)
        const adminCheck = await AdminService.isAdminUser(session.user.email!);
        if (!adminCheck) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const allPersonas = await PersonaService.getAllPersonas();
        
        return NextResponse.json({
          success: true,
          personas: allPersonas
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Persona API GET error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '페르소나 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 페르소나 업데이트 및 피드백 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'feedback':
        // 페르소나 만족도 피드백
        const { personaId, satisfaction, context } = body;
        
        if (!personaId || satisfaction === undefined) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'personaId와 satisfaction이 필요합니다.'
          }, { status: 400 });
        }

        await PersonaService.updatePersonaSatisfaction(personaId, satisfaction, context);

        return NextResponse.json({
          success: true,
          message: '페르소나 피드백이 저장되었습니다.'
        });

      case 'increment_usage':
        // 페르소나 사용 횟수 증가
        const { personaId: usagePersonaId } = body;
        
        if (!usagePersonaId) {
          return NextResponse.json({
            error: 'Missing personaId'
          }, { status: 400 });
        }

        await PersonaService.incrementPersonaUsage(usagePersonaId);

        return NextResponse.json({
          success: true,
          message: '페르소나 사용 횟수가 업데이트되었습니다.'
        });

      case 'create':
        // 새 페르소나 생성 (Admin만)
        const isAdminCreate = await AdminService.isAdminUser(session.user.email!);
        if (!isAdminCreate) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const { personaData } = body;
        
        if (!personaData || !personaData.name || !personaData.identifier) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'personaData.name과 personaData.identifier가 필요합니다.'
          }, { status: 400 });
        }

        const newPersona = await PersonaService.upsertPersona(personaData);

        return NextResponse.json({
          success: true,
          persona: newPersona,
          message: '페르소나가 생성되었습니다.'
        });

      case 'update':
        // 페르소나 수정 (Admin만)
        const isAdminUpdate = await AdminService.isAdminUser(session.user.email!);
        if (!isAdminUpdate) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const { personaId: updatePersonaId, updates } = body;
        
        if (!updatePersonaId || !updates) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'personaId와 updates가 필요합니다.'
          }, { status: 400 });
        }

        const updatedPersona = await PersonaService.upsertPersona({
          id: updatePersonaId,
          ...updates
        });

        return NextResponse.json({
          success: true,
          persona: updatedPersona,
          message: '페르소나가 수정되었습니다.'
        });

      case 'migrate':
        // 페르소나 데이터 마이그레이션 (Admin만)
        const isAdminMigrate = await AdminService.isAdminUser(session.user.email!);
        if (!isAdminMigrate) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        await PersonaService.migrateExistingPersonas();

        return NextResponse.json({
          success: true,
          message: '페르소나 데이터가 마이그레이션되었습니다.'
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Persona API POST error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '페르소나 관리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 페르소나 삭제/비활성화 API (Admin만)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin 권한 확인
    const isAdmin = await AdminService.isAdminUser(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({
        error: 'Access denied',
        message: 'Admin 권한이 필요합니다.'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get('personaId');

    if (!personaId) {
      return NextResponse.json({
        error: 'Missing personaId parameter'
      }, { status: 400 });
    }

    // 기본 페르소나는 삭제 불가
    const corePersonas = ['general-ai', 'atozit-branding', 'moment-ryan-content'];
    if (corePersonas.includes(personaId)) {
      return NextResponse.json({
        error: 'Cannot delete core persona',
        message: '핵심 페르소나는 삭제할 수 없습니다.'
      }, { status: 400 });
    }

    // 실제로는 페르소나를 삭제하지 않고 비활성화
    await PersonaService.deactivatePersona(personaId);
    
    return NextResponse.json({
      success: true,
      message: '페르소나가 비활성화되었습니다.',
      deactivatedPersonaId: personaId
    });

  } catch (error) {
    console.error('Persona API DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '페르소나 삭제 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}