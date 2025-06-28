// Admin 권한 관리 유틸리티 - 데이터베이스 기반으로 전환

import { AdminService } from './admin-service';

export interface AdminProfile {
  email: string;
  mailyUsername: string;
  displayName: string;
  role: 'admin' | 'super_admin';
  permissions: {
    mailyAccess: boolean;
    personaSync: boolean;
    userManagement: boolean;
  };
}

// 레거시 함수들 - AdminService로 위임
export async function findAdminProfile(email?: string | null): Promise<AdminProfile | null> {
  if (!email) return null;
  
  try {
    const profile = await AdminService.getAdminProfile(email);
    if (!profile) return null;

    // AdminService 형식을 레거시 형식으로 변환
    return {
      email: profile.email,
      mailyUsername: profile.mailyUsername,
      displayName: profile.displayName,
      role: profile.role.toLowerCase() as 'admin' | 'super_admin',
      permissions: {
        mailyAccess: profile.permissions.mailyAccess,
        personaSync: profile.permissions.personaSync,
        userManagement: profile.permissions.userManagement
      }
    };
  } catch (error) {
    console.error('Admin 프로필 조회 실패:', error);
    return null;
  }
}

export async function isAdminUser(email?: string | null): Promise<boolean> {
  if (!email) return false;
  
  try {
    return await AdminService.isAdminUser(email);
  } catch (error) {
    console.error('Admin 권한 확인 실패:', error);
    return false;
  }
}

export async function getMailyUsernameForAdmin(email?: string | null): Promise<string | null> {
  if (!email) return null;
  
  try {
    return await AdminService.getMailyUsernameForAdmin(email);
  } catch (error) {
    console.error('Maily 사용자명 조회 실패:', error);
    return null;
  }
}

export async function getAdminDisplayName(email?: string | null): Promise<string | null> {
  if (!email) return null;
  
  try {
    const profile = await AdminService.getAdminProfile(email);
    return profile?.displayName || null;
  } catch (error) {
    console.error('Admin 표시명 조회 실패:', error);
    return null;
  }
}

export async function canAccessMailyData(email?: string | null): Promise<boolean> {
  if (!email) return false;
  
  try {
    return await AdminService.canAccessMailyData(email);
  } catch (error) {
    console.error('Maily 접근 권한 확인 실패:', error);
    return false;
  }
}

export async function canSyncPersona(email?: string | null): Promise<boolean> {
  if (!email) return false;
  
  try {
    return await AdminService.canSyncPersona(email);
  } catch (error) {
    console.error('페르소나 동기화 권한 확인 실패:', error);
    return false;
  }
}

export async function canManageUsers(email?: string | null): Promise<boolean> {
  if (!email) return false;
  
  try {
    return await AdminService.canManageUsers(email);
  } catch (error) {
    console.error('사용자 관리 권한 확인 실패:', error);
    return false;
  }
}

export async function getAdminFeatures(email?: string | null): Promise<{
  mailyAccess: boolean;
  personaSync: boolean;
  userManagement: boolean;
  role?: 'admin' | 'super_admin';
  displayName?: string;
}> {
  if (!email) {
    return {
      mailyAccess: false,
      personaSync: false,
      userManagement: false
    };
  }
  
  try {
    const features = await AdminService.getAdminFeatures(email);
    
    return {
      mailyAccess: features.mailyAccess,
      personaSync: features.personaSync,
      userManagement: features.userManagement,
      role: features.role?.toLowerCase() as 'admin' | 'super_admin' | undefined,
      displayName: features.displayName
    };
  } catch (error) {
    console.error('Admin 기능 조회 실패:', error);
    return {
      mailyAccess: false,
      personaSync: false,
      userManagement: false
    };
  }
}

// 데이터베이스 기반 함수들
export async function addAtozitAdmin(email: string): Promise<void> {
  try {
    await AdminService.createAdmin(
      email,
      'atozit',
      'AtoZ IT',
      'SUPER_ADMIN'
    );
    console.log(`✅ AtoZ IT admin 계정 추가됨: ${email}`);
  } catch (error) {
    console.error('AtoZ IT admin 계정 추가 실패:', error);
    throw error;
  }
}

export async function getAllAdminProfiles(): Promise<AdminProfile[]> {
  try {
    const profiles = await AdminService.getAllAdminProfiles();
    
    // AdminService 형식을 레거시 형식으로 변환
    return profiles.map(profile => ({
      email: profile.email,
      mailyUsername: profile.mailyUsername,
      displayName: profile.displayName,
      role: profile.role.toLowerCase() as 'admin' | 'super_admin',
      permissions: {
        mailyAccess: profile.permissions.mailyAccess,
        personaSync: profile.permissions.personaSync,
        userManagement: profile.permissions.userManagement
      }
    }));
  } catch (error) {
    console.error('Admin 프로필 목록 조회 실패:', error);
    return [];
  }
}

// 동기 버전 함수들 (레거시 호환을 위해 유지)
// 주의: 이 함수들은 async 함수로 변환할 수 없는 레거시 코드에서만 사용

const FALLBACK_ADMIN_PROFILES: AdminProfile[] = [
  {
    email: 'gorilla1005@gmail.com',
    mailyUsername: 'moment.ryan',
    displayName: 'Moment Ryan',
    role: 'admin',
    permissions: {
      mailyAccess: true,
      personaSync: true,
      userManagement: false
    }
  }
];

export function findAdminProfileSync(email?: string | null): AdminProfile | null {
  if (!email) return null;
  
  console.warn('⚠️ findAdminProfileSync는 deprecated입니다. findAdminProfile을 사용하세요.');
  const normalizedEmail = email.toLowerCase();
  return FALLBACK_ADMIN_PROFILES.find(profile => 
    profile.email.toLowerCase() === normalizedEmail
  ) || null;
}

export function isAdminUserSync(email?: string | null): boolean {
  console.warn('⚠️ isAdminUserSync는 deprecated입니다. isAdminUser를 사용하세요.');
  return findAdminProfileSync(email) !== null;
}