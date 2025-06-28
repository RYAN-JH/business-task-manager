import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { addAtozitAdmin, canManageUsers, getAllAdminProfiles } from '@/lib/admin-utils';

// AtoZ IT admin 계정 추가 API (Super Admin 전용)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자 관리 권한 확인
    const canManage = canManageUsers(session.user?.email);
    
    if (!canManage) {
      return NextResponse.json({
        error: 'Insufficient permissions',
        message: '사용자 관리 권한이 필요합니다. Super Admin만 이 기능을 사용할 수 있습니다.'
      }, { status: 403 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({
        error: 'Invalid email',
        message: '유효한 이메일 주소를 입력해주세요.'
      }, { status: 400 });
    }

    // AtoZ IT 계정 추가
    addAtozitAdmin(email);

    return NextResponse.json({
      success: true,
      message: `AtoZ IT admin 계정이 추가되었습니다: ${email}`,
      addedAccount: {
        email: email,
        mailyUsername: 'atozit',
        displayName: 'AtoZ IT',
        role: 'super_admin'
      },
      currentAdmins: getAllAdminProfiles()
    });

  } catch (error) {
    console.error('AtoZ IT 계정 추가 실패:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '계정 추가 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 현재 admin 목록 조회 (Admin 이상 권한 필요)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 기본 admin 권한 확인
    const canManage = canManageUsers(session.user?.email);
    
    if (!canManage) {
      return NextResponse.json({
        error: 'Insufficient permissions',
        message: 'Admin 권한이 필요합니다.'
      }, { status: 403 });
    }

    const adminProfiles = getAllAdminProfiles();

    return NextResponse.json({
      success: true,
      adminProfiles: adminProfiles,
      totalAdmins: adminProfiles.length
    });

  } catch (error) {
    console.error('Admin 목록 조회 실패:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Admin 목록 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}