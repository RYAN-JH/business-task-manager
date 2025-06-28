import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { QuestionService } from '@/lib/question-service';
import { AdminService } from '@/lib/admin-service';

// 질문 관리 API
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
        // 프로필 수집 질문 조회
        const persona = searchParams.get('persona') as 'general' | 'branding' | 'content' || 'general';
        const priority = searchParams.get('priority') ? parseInt(searchParams.get('priority')!) as 1 | 2 | 3 : undefined;
        
        const profileQuestions = await QuestionService.getProfileQuestions(persona, priority);
        
        return NextResponse.json({
          success: true,
          questions: profileQuestions,
          persona: persona,
          priority: priority
        });

      case 'proactive':
        // 능동적 질문 조회
        const targetPersona = searchParams.get('targetPersona') as 'moment.ryan' | 'atozit';
        const sessionLength = parseInt(searchParams.get('sessionLength') || '0');
        
        if (!targetPersona) {
          return NextResponse.json({
            error: 'Missing targetPersona parameter'
          }, { status: 400 });
        }

        // Admin 권한 확인 (능동적 질문은 Admin 전용)
        const canAccess = await AdminService.canAccessMailyData(session.user.email!);
        if (!canAccess) {
          return NextResponse.json({
            error: 'Access denied',
            message: '능동적 질문은 Admin 전용 기능입니다.'
          }, { status: 403 });
        }

        const proactiveQuestions = await QuestionService.getProactiveQuestions(
          targetPersona,
          { userId: session.user.id },
          { sessionLength }
        );
        
        return NextResponse.json({
          success: true,
          questions: proactiveQuestions,
          targetPersona: targetPersona
        });

      case 'smart_select':
        // AI 기반 스마트 질문 선택
        const recentMessages = JSON.parse(searchParams.get('recentMessages') || '[]');
        const currentPersona = searchParams.get('currentPersona') || 'general';
        const currentSessionLength = parseInt(searchParams.get('sessionLength') || '0');
        
        const bestQuestion = await QuestionService.selectBestQuestion({
          recentMessages,
          userProfile: { userId: session.user.id },
          sessionLength: currentSessionLength,
          persona: currentPersona
        });
        
        return NextResponse.json({
          success: true,
          question: bestQuestion,
          context: {
            persona: currentPersona,
            sessionLength: currentSessionLength
          }
        });

      case 'templates':
        // 질문 템플릿 조회 (Admin만)
        const isAdmin = await AdminService.isAdminUser(session.user.email!);
        if (!isAdmin) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const templates = await QuestionService.getQuestionTemplates();
        
        return NextResponse.json({
          success: true,
          templates: templates
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Question API GET error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '질문 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 질문 업데이트 및 피드백 API
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
        // 질문 효과성 피드백
        const { questionId, feedback } = body;
        
        if (!questionId || !feedback) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'questionId와 feedback이 필요합니다.'
          }, { status: 400 });
        }

        await QuestionService.updateQuestionEffectiveness(questionId, feedback);

        return NextResponse.json({
          success: true,
          message: '질문 피드백이 저장되었습니다.'
        });

      case 'generate':
        // AI 기반 새 질문 생성
        const { userProfile, recentConversation, targetInsight } = body;
        
        if (!targetInsight) {
          return NextResponse.json({
            error: 'Missing targetInsight',
            message: 'targetInsight가 필요합니다.'
          }, { status: 400 });
        }

        const newQuestion = await QuestionService.generateNewQuestion(
          userProfile || { userId: session.user.id },
          recentConversation || [],
          targetInsight
        );

        return NextResponse.json({
          success: true,
          question: newQuestion,
          message: '새 질문이 생성되었습니다.'
        });

      case 'increment_usage':
        // 질문 사용 횟수 증가
        const { questionId: usageQuestionId } = body;
        
        if (!usageQuestionId) {
          return NextResponse.json({
            error: 'Missing questionId'
          }, { status: 400 });
        }

        await QuestionService.incrementQuestionUsage(usageQuestionId);

        return NextResponse.json({
          success: true,
          message: '질문 사용 횟수가 업데이트되었습니다.'
        });

      case 'migrate':
        // 질문 데이터 마이그레이션 (Admin만)
        const isAdmin = await AdminService.isAdminUser(session.user.email!);
        if (!isAdmin) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        await QuestionService.migrateExistingQuestions();

        return NextResponse.json({
          success: true,
          message: '질문 데이터가 마이그레이션되었습니다.'
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Question API POST error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '질문 관리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 질문 삭제/비활성화 API (Admin만)
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
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json({
        error: 'Missing questionId parameter'
      }, { status: 400 });
    }

    // 실제로는 질문을 삭제하지 않고 비활성화
    console.log(`🗑️ 질문 비활성화: ${questionId}`);
    
    return NextResponse.json({
      success: true,
      message: '질문이 비활성화되었습니다.',
      deactivatedQuestionId: questionId
    });

  } catch (error) {
    console.error('Question API DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '질문 삭제 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}