// Admin 권한 관리 서비스 - 데이터베이스 기반 시스템

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AdminProfile {
  id: string;
  email: string;
  mailyUsername: string;  
  displayName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  permissions: {
    mailyAccess: boolean;
    personaSync: boolean;
    userManagement: boolean;
    analytics: boolean;
    systemConfig: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class AdminService {
  
  // Admin 프로필 조회 (이메일 기반)
  static async getAdminProfile(email: string): Promise<AdminProfile | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { 
          email: email.toLowerCase(),
          role: { in: ['ADMIN', 'SUPER_ADMIN'] }
        }
      });

      if (!user) return null;

      // 실제로는 AdminProfile 테이블에서 추가 정보 조회
      // 현재는 User 테이블의 role 정보를 기반으로 기본 프로필 생성
      return this.createAdminProfileFromUser(user);
    } catch (error) {
      console.error('Admin 프로필 조회 실패:', error);
      return null;
    }
  }

  // 사용자를 User 데이터에서 AdminProfile로 변환
  private static createAdminProfileFromUser(user: any): AdminProfile {
    const isRyan = user.email.toLowerCase() === 'gorilla1005@gmail.com';
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    return {
      id: user.id,
      email: user.email,
      mailyUsername: isRyan ? 'moment.ryan' : 'atozit',
      displayName: isRyan ? 'Moment Ryan' : user.name || 'Admin User',
      role: user.role as 'ADMIN' | 'SUPER_ADMIN',
      permissions: {
        mailyAccess: true,
        personaSync: true,
        userManagement: isSuperAdmin,
        analytics: isSuperAdmin,
        systemConfig: isSuperAdmin
      },
      isActive: true,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString()
    };
  }

  // Admin 여부 확인
  static async isAdminUser(email: string): Promise<boolean> {
    try {
      const profile = await this.getAdminProfile(email);
      return profile !== null && profile.isActive;
    } catch (error) {
      console.error('Admin 권한 확인 실패:', error);
      return false;
    }
  }

  // Admin 사용자를 데이터베이스에 등록
  static async createAdmin(
    email: string,
    mailyUsername: string,
    displayName: string,
    role: 'ADMIN' | 'SUPER_ADMIN' = 'ADMIN'
  ): Promise<AdminProfile> {
    try {
      // 먼저 User 테이블에서 사용자 찾기/생성
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        // 사용자가 없으면 생성
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name: displayName,
            role: role
          }
        });
        console.log(`👤 새 Admin 사용자 생성: ${email}`);
      } else {
        // 기존 사용자를 Admin으로 승격
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            role: role,
            name: displayName
          }
        });
        console.log(`⬆️ 사용자 Admin 승격: ${email}`);
      }

      // 실제로는 AdminProfile 테이블에 추가 정보 저장
      console.log(`🔧 Admin 프로필 설정: mailyUsername=${mailyUsername}`);

      return this.createAdminProfileFromUser(user);
    } catch (error) {
      console.error('Admin 생성 실패:', error);
      throw error;
    }
  }

  // Admin 권한 업데이트
  static async updateAdminPermissions(
    email: string,
    permissions: Partial<AdminProfile['permissions']>
  ): Promise<void> {
    try {
      // 실제로는 AdminProfile 테이블의 permissions 필드 업데이트
      console.log(`⚙️ Admin 권한 업데이트: ${email}`, permissions);
    } catch (error) {
      console.error('Admin 권한 업데이트 실패:', error);
      throw error;
    }
  }

  // Admin 비활성화
  static async deactivateAdmin(email: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { role: 'USER' }
      });

      console.log(`🚫 Admin 권한 제거: ${email}`);
    } catch (error) {
      console.error('Admin 비활성화 실패:', error);
      throw error;
    }
  }

  // 모든 Admin 목록 조회
  static async getAllAdminProfiles(): Promise<AdminProfile[]> {
    try {
      const adminUsers = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'SUPER_ADMIN'] }
        },
        orderBy: { createdAt: 'asc' }
      });

      return adminUsers.map(user => this.createAdminProfileFromUser(user));
    } catch (error) {
      console.error('Admin 목록 조회 실패:', error);
      return [];
    }
  }

  // Maily 접근 권한 확인
  static async canAccessMailyData(email: string): Promise<boolean> {
    try {
      const profile = await this.getAdminProfile(email);
      return profile?.permissions.mailyAccess && profile.isActive || false;
    } catch (error) {
      console.error('Maily 접근 권한 확인 실패:', error);
      return false;
    }
  }

  // 페르소나 동기화 권한 확인
  static async canSyncPersona(email: string): Promise<boolean> {
    try {
      const profile = await this.getAdminProfile(email);
      return profile?.permissions.personaSync && profile.isActive || false;
    } catch (error) {
      console.error('페르소나 동기화 권한 확인 실패:', error);
      return false;
    }
  }

  // 사용자 관리 권한 확인
  static async canManageUsers(email: string): Promise<boolean> {
    try {
      const profile = await this.getAdminProfile(email);
      return profile?.permissions.userManagement && profile.isActive || false;
    } catch (error) {
      console.error('사용자 관리 권한 확인 실패:', error);
      return false;
    }
  }

  // Admin 이메일로 Maily 사용자명 조회
  static async getMailyUsernameForAdmin(email: string): Promise<string | null> {
    try {
      const profile = await this.getAdminProfile(email);
      return profile?.mailyUsername || null;
    } catch (error) {
      console.error('Maily 사용자명 조회 실패:', error);
      return null;
    }
  }

  // Admin 기능 전체 조회 (편의 함수)
  static async getAdminFeatures(email: string): Promise<{
    mailyAccess: boolean;
    personaSync: boolean;
    userManagement: boolean;
    analytics: boolean;
    systemConfig: boolean;
    role?: 'ADMIN' | 'SUPER_ADMIN';
    displayName?: string;
    mailyUsername?: string;
  }> {
    try {
      const profile = await this.getAdminProfile(email);
      
      if (!profile || !profile.isActive) {
        return {
          mailyAccess: false,
          personaSync: false,
          userManagement: false,
          analytics: false,
          systemConfig: false
        };
      }
      
      return {
        mailyAccess: profile.permissions.mailyAccess,
        personaSync: profile.permissions.personaSync,
        userManagement: profile.permissions.userManagement,
        analytics: profile.permissions.analytics,
        systemConfig: profile.permissions.systemConfig,
        role: profile.role,
        displayName: profile.displayName,
        mailyUsername: profile.mailyUsername
      };
    } catch (error) {
      console.error('Admin 기능 조회 실패:', error);
      return {
        mailyAccess: false,
        personaSync: false,
        userManagement: false,
        analytics: false,
        systemConfig: false
      };
    }
  }

  // Admin 데이터 마이그레이션 (기존 하드코딩 데이터 이전)
  static async migrateExistingAdmins(): Promise<void> {
    try {
      console.log('🔄 기존 Admin 데이터 마이그레이션 시작...');

      // moment.ryan (gorilla1005@gmail.com) 등록
      await this.createAdmin(
        'gorilla1005@gmail.com',
        'moment.ryan',
        'Moment Ryan',
        'ADMIN'
      );

      // 추후 atozit 계정이 있다면 추가
      // await this.createAdmin('atozit@example.com', 'atozit', 'AtoZ IT', 'SUPER_ADMIN');

      console.log('✅ Admin 데이터 마이그레이션 완료');
    } catch (error) {
      console.error('❌ Admin 데이터 마이그레이션 실패:', error);
      throw error;
    }
  }

  // 연결 종료
  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}