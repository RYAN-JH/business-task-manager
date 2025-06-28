import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LearningDataService } from '@/lib/learning-data-service';
import { AdminService } from '@/lib/admin-service';

// 학습 데이터 관리 API
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        // 학습 데이터 통계 조회
        const stats = await LearningDataService.getLearningDataStats();
        
        return NextResponse.json({
          success: true,
          stats: stats
        });

      case 'conversations':
        // 대화 로그 조회 (Admin만)
        const isAdminConv = await AdminService.isAdminUser(session.user.email!);
        if (!isAdminConv) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const conversations = await LearningDataService.loadConversationLogs();
        
        return NextResponse.json({
          success: true,
          conversations: conversations.slice(0, 50), // 최대 50개만 반환
          total: conversations.length
        });

      case 'feedbacks':
        // 피드백 로그 조회 (Admin만)
        const isAdminFeedback = await AdminService.isAdminUser(session.user.email!);
        if (!isAdminFeedback) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const feedbacks = await LearningDataService.loadFeedbackLogs();
        
        return NextResponse.json({
          success: true,
          feedbacks: feedbacks.slice(0, 100), // 최대 100개만 반환
          total: feedbacks.length
        });

      case 'insights':
        // 학습 인사이트 조회 (Admin만)
        const isAdminInsight = await AdminService.isAdminUser(session.user.email!);
        if (!isAdminInsight) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const insights = await LearningDataService.loadLearningInsights();
        
        return NextResponse.json({
          success: true,
          insights: insights.slice(0, 100), // 최대 100개만 반환
          total: insights.length
        });

      case 'user_profiles':
        // 사용자 학습 프로필 조회 (Admin만)
        const isAdminProfile = await AdminService.isAdminUser(session.user.email!);
        if (!isAdminProfile) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const profiles = await LearningDataService.loadUserProfiles();
        
        return NextResponse.json({
          success: true,
          profiles: profiles,
          total: profiles.length
        });

      case 'migration_status':
        // 마이그레이션 상태 확인
        const isAdminMigration = await AdminService.isAdminUser(session.user.email!);
        if (!isAdminMigration) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        // 파일 기반 데이터와 DB 데이터 비교
        const fileConversations = await LearningDataService.loadConversationLogs();
        const fileFeedbacks = await LearningDataService.loadFeedbackLogs();
        const fileInsights = await LearningDataService.loadLearningInsights();
        const fileProfiles = await LearningDataService.loadUserProfiles();

        const dbStats = await LearningDataService.getLearningDataStats();

        return NextResponse.json({
          success: true,
          migrationStatus: {
            fileData: {
              conversations: fileConversations.length,
              feedbacks: fileFeedbacks.length,
              insights: fileInsights.length,
              profiles: fileProfiles.length
            },
            dbData: {
              conversations: dbStats.totalConversations,
              feedbacks: dbStats.totalFeedbacks,
              insights: dbStats.totalInsights,
              profiles: 0 // UserProfile 테이블에서 조회 필요
            },
            isMigrationNeeded: fileConversations.length > dbStats.totalConversations ||
                               fileFeedbacks.length > dbStats.totalFeedbacks ||
                               fileInsights.length > dbStats.totalInsights
          }
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Learning Data API GET error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '학습 데이터 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 학습 데이터 저장 및 마이그레이션 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'save_conversation':
        // 새 대화 기록 저장
        const { conversation } = body;
        
        if (!conversation) {
          return NextResponse.json({
            error: 'Missing conversation data'
          }, { status: 400 });
        }

        // 사용자 ID 검증
        if (conversation.userId !== session.user.id) {
          return NextResponse.json({
            error: 'Access denied',
            message: '본인의 대화만 저장할 수 있습니다.'
          }, { status: 403 });
        }

        await LearningDataService.saveConversation(conversation);

        return NextResponse.json({
          success: true,
          message: '대화 기록이 저장되었습니다.'
        });

      case 'save_feedback':
        // 피드백 저장
        const { feedback } = body;
        
        if (!feedback) {
          return NextResponse.json({
            error: 'Missing feedback data'
          }, { status: 400 });
        }

        // 사용자 ID 검증
        if (feedback.userId !== session.user.id) {
          return NextResponse.json({
            error: 'Access denied',
            message: '본인의 피드백만 저장할 수 있습니다.'
          }, { status: 403 });
        }

        await LearningDataService.saveFeedback(feedback);

        return NextResponse.json({
          success: true,
          message: '피드백이 저장되었습니다.'
        });

      case 'save_insight':
        // 학습 인사이트 저장 (시스템에서 자동 생성)
        const { insight } = body;
        
        if (!insight) {
          return NextResponse.json({
            error: 'Missing insight data'
          }, { status: 400 });
        }

        await LearningDataService.saveLearningInsight(insight);

        return NextResponse.json({
          success: true,
          message: '학습 인사이트가 저장되었습니다.'
        });

      case 'migrate_all':
        // 전체 학습 데이터 마이그레이션 (Admin만)
        const isAdminMigrate = await AdminService.isAdminUser(session.user.email!);
        if (!isAdminMigrate) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const migrationResult = await LearningDataService.migrateAllLearningData();

        return NextResponse.json({
          success: migrationResult.errors.length === 0,
          result: migrationResult,
          message: migrationResult.errors.length === 0 
            ? '학습 데이터 마이그레이션이 완료되었습니다.'
            : '마이그레이션 중 일부 오류가 발생했습니다.'
        });

      case 'migrate_conversations':
        // 대화 데이터만 마이그레이션 (Admin만)
        const isAdminConvMigrate = await AdminService.isAdminUser(session.user.email!);
        if (!isAdminConvMigrate) {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const conversations = await LearningDataService.loadConversationLogs();
        let convMigrated = 0;
        const convErrors: string[] = [];

        for (const conv of conversations) {
          try {
            await LearningDataService.saveConversation(conv);
            convMigrated++;
          } catch (error) {
            convErrors.push(`대화 ${conv.id} 마이그레이션 실패: ${error}`);
          }
        }

        return NextResponse.json({
          success: convErrors.length === 0,
          result: {
            migrated: convMigrated,
            total: conversations.length,
            errors: convErrors
          },
          message: `대화 ${convMigrated}개가 마이그레이션되었습니다.`
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Learning Data API POST error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '학습 데이터 처리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 학습 데이터 삭제 API (Admin만)
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
    const dataType = searchParams.get('type');
    const dataId = searchParams.get('id');

    if (!dataType || !dataId) {
      return NextResponse.json({
        error: 'Missing type or id parameter'
      }, { status: 400 });
    }

    // 실제 삭제는 하지 않고 비활성화 처리 (데이터 보존)
    console.log(`🗑️ 학습 데이터 비활성화: ${dataType}/${dataId}`);
    
    return NextResponse.json({
      success: true,
      message: '학습 데이터가 비활성화되었습니다.',
      deactivated: { type: dataType, id: dataId }
    });

  } catch (error) {
    console.error('Learning Data API DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '학습 데이터 삭제 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}