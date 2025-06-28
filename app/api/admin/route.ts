import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/lib/admin-service';

// Admin 관리 API
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'profile':
        // 현재 사용자의 Admin 프로필 조회
        const adminProfile = await AdminService.getAdminProfile(session.user.email);
        
        if (!adminProfile) {
          return NextResponse.json({
            error: 'Not an admin user',
            message: 'Admin 권한이 없습니다.'
          }, { status: 403 });
        }

        return NextResponse.json({
          success: true,
          profile: adminProfile
        });

      case 'features':
        // Admin 기능 목록 조회
        const features = await AdminService.getAdminFeatures(session.user.email);
        
        return NextResponse.json({
          success: true,
          features: features
        });

      case 'all':
        // 모든 Admin 목록 조회 (Super Admin만)
        const userFeatures = await AdminService.getAdminFeatures(session.user.email);
        if (userFeatures.role !== 'SUPER_ADMIN') {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Super Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const allAdmins = await AdminService.getAllAdminProfiles();
        
        return NextResponse.json({
          success: true,
          admins: allAdmins
        });

      case 'check':
        // Admin 권한 확인
        const isAdmin = await AdminService.isAdminUser(session.user.email);
        
        return NextResponse.json({
          success: true,
          isAdmin: isAdmin,
          email: session.user.email
        });

      case 'maily_username':
        // Maily 사용자명 조회
        const mailyUsername = await AdminService.getMailyUsernameForAdmin(session.user.email);
        
        return NextResponse.json({
          success: true,
          mailyUsername: mailyUsername
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Admin API GET error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Admin 정보 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// Admin 생성 및 관리 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create':
        // 새 Admin 생성 (Super Admin만)
        const userFeatures = await AdminService.getAdminFeatures(session.user.email);
        if (userFeatures.role !== 'SUPER_ADMIN') {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Super Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const { email, mailyUsername, displayName, role } = body;
        
        if (!email || !mailyUsername || !displayName) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'email, mailyUsername, displayName이 필요합니다.'
          }, { status: 400 });
        }

        const newAdmin = await AdminService.createAdmin(
          email,
          mailyUsername,
          displayName,
          role || 'ADMIN'
        );

        return NextResponse.json({
          success: true,
          admin: newAdmin,
          message: 'Admin이 생성되었습니다.'
        });

      case 'update_permissions':
        // Admin 권한 업데이트 (Super Admin만)
        const adminFeatures = await AdminService.getAdminFeatures(session.user.email);
        if (adminFeatures.role !== 'SUPER_ADMIN') {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Super Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        const { targetEmail, permissions } = body;
        
        if (!targetEmail || !permissions) {
          return NextResponse.json({
            error: 'Missing required fields',
            message: 'targetEmail과 permissions가 필요합니다.'
          }, { status: 400 });
        }

        await AdminService.updateAdminPermissions(targetEmail, permissions);

        return NextResponse.json({
          success: true,
          message: 'Admin 권한이 업데이트되었습니다.'
        });

      case 'migrate':
        // 기존 Admin 데이터 마이그레이션
        const migrateFeatures = await AdminService.getAdminFeatures(session.user.email);
        if (migrateFeatures.role !== 'SUPER_ADMIN') {
          return NextResponse.json({
            error: 'Access denied',
            message: 'Super Admin 권한이 필요합니다.'
          }, { status: 403 });
        }

        await AdminService.migrateExistingAdmins();

        return NextResponse.json({
          success: true,
          message: '기존 Admin 데이터가 마이그레이션되었습니다.'
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Admin API POST error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Admin 관리 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// Admin 삭제/비활성화 API
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Super Admin 권한 확인
    const userFeatures = await AdminService.getAdminFeatures(session.user.email);
    if (userFeatures.role !== 'SUPER_ADMIN') {
      return NextResponse.json({
        error: 'Access denied',
        message: 'Super Admin 권한이 필요합니다.'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetEmail = searchParams.get('email');

    if (!targetEmail) {
      return NextResponse.json({
        error: 'Missing email parameter',
        message: 'email 파라미터가 필요합니다.'
      }, { status: 400 });
    }

    // 자기 자신을 삭제하는 것 방지
    if (targetEmail === session.user.email) {
      return NextResponse.json({
        error: 'Cannot delete yourself',
        message: '자신의 Admin 권한을 제거할 수 없습니다.'
      }, { status: 400 });
    }

    await AdminService.deactivateAdmin(targetEmail);

    return NextResponse.json({
      success: true,
      message: 'Admin 권한이 제거되었습니다.',
      deactivatedEmail: targetEmail
    });

  } catch (error) {
    console.error('Admin API DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Admin 삭제 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}