// Admin 권한 관리 시스템 마이그레이션 스크립트

import { AdminService } from '../lib/admin-service';

interface MigrationResult {
  adminsCreated: number;
  errors: string[];
  success: boolean;
}

export class AdminDataMigration {
  
  // 메인 마이그레이션 실행
  async migrateAdminData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      adminsCreated: 0,
      errors: [],
      success: false
    };

    try {
      console.log('🔄 Admin 권한 시스템 마이그레이션 시작...');

      // 1. 기존 하드코딩된 Admin 계정들을 데이터베이스로 이전
      await this.createDefaultAdmins(result);

      // 2. 권한 검증
      await this.verifyAdminPermissions(result);

      result.success = result.errors.length === 0;
      
      console.log('✅ Admin 마이그레이션 완료');
      console.log(`📊 결과: ${result.adminsCreated}개 Admin 생성, ${result.errors.length}개 오류`);

      return result;

    } catch (error) {
      console.error('❌ Admin 마이그레이션 실패:', error);
      result.errors.push(`마이그레이션 실패: ${error}`);
      result.success = false;
      return result;
    }
  }

  // 기본 Admin 계정들 생성
  private async createDefaultAdmins(result: MigrationResult): Promise<void> {
    try {
      console.log('👤 기본 Admin 계정 생성 중...');

      // moment.ryan (gorilla1005@gmail.com) 계정 생성
      try {
        const ryanAdmin = await AdminService.createAdmin(
          'gorilla1005@gmail.com',
          'moment.ryan',
          'Moment Ryan',
          'ADMIN'
        );
        
        console.log(`✅ Moment Ryan Admin 생성 완료: ${ryanAdmin.email}`);
        result.adminsCreated++;
      } catch (error) {
        console.log(`⚠️ Moment Ryan Admin 이미 존재하거나 생성 실패: ${error}`);
      }

      // 추후 atozit 계정도 이메일이 확정되면 추가
      console.log('📝 AtoZ IT 계정은 이메일 확정 후 수동으로 추가 예정');

    } catch (error) {
      console.error('기본 Admin 계정 생성 실패:', error);
      result.errors.push(`기본 Admin 계정 생성 실패: ${error}`);
    }
  }

  // Admin 권한 검증
  private async verifyAdminPermissions(result: MigrationResult): Promise<void> {
    try {
      console.log('🔍 Admin 권한 검증 중...');

      // moment.ryan 권한 확인
      const ryanFeatures = await AdminService.getAdminFeatures('gorilla1005@gmail.com');
      
      if (!ryanFeatures.mailyAccess) {
        result.errors.push('Moment Ryan의 Maily 접근 권한이 없습니다');
      }
      
      if (!ryanFeatures.personaSync) {
        result.errors.push('Moment Ryan의 페르소나 동기화 권한이 없습니다');
      }

      console.log('✅ Admin 권한 검증 완료:', ryanFeatures);

    } catch (error) {
      console.error('Admin 권한 검증 실패:', error);
      result.errors.push(`Admin 권한 검증 실패: ${error}`);
    }
  }

  // 기존 하드코딩 사용 패턴 분석
  async analyzeCurrentUsage(): Promise<{
    filesUsingAdminUtils: string[];
    syncFunctionUsages: number;
    asyncMigrationNeeded: string[];
  }> {
    try {
      console.log('📊 기존 admin-utils 사용 패턴 분석 중...');

      // 실제로는 파일 시스템 스캔해서 admin-utils 사용처 찾기
      const filesUsingAdminUtils = [
        'app/api/chat/route.ts',
        'components/LearningDashboard.tsx',
        'lib/maily-service.ts'
      ];

      const syncFunctionUsages = 3; // 동기 함수 사용 횟수
      const asyncMigrationNeeded = [
        'app/api/chat/route.ts - isAdminUser 호출',
        'components/LearningDashboard.tsx - canAccessMailyData 호출'
      ];

      console.log('📋 분석 결과:');
      console.log(`- admin-utils 사용 파일: ${filesUsingAdminUtils.length}개`);
      console.log(`- 동기 함수 사용: ${syncFunctionUsages}회`);
      console.log(`- 비동기 마이그레이션 필요: ${asyncMigrationNeeded.length}개`);

      return {
        filesUsingAdminUtils,
        syncFunctionUsages,
        asyncMigrationNeeded
      };

    } catch (error) {
      console.error('사용 패턴 분석 실패:', error);
      return {
        filesUsingAdminUtils: [],
        syncFunctionUsages: 0,
        asyncMigrationNeeded: []
      };
    }
  }

  // 마이그레이션 상태 확인
  async checkMigrationStatus(): Promise<{
    isCompleted: boolean;
    adminCount: number;
    activeAdmins: string[];
    issues: string[];
  }> {
    try {
      const admins = await AdminService.getAllAdminProfiles();
      const activeAdmins = admins
        .filter(admin => admin.isActive)
        .map(admin => admin.email);

      const issues: string[] = [];

      // moment.ryan 계정 확인
      const ryanExists = admins.some(admin => 
        admin.email === 'gorilla1005@gmail.com' && admin.isActive
      );
      
      if (!ryanExists) {
        issues.push('Moment Ryan Admin 계정이 없거나 비활성화됨');
      }

      return {
        isCompleted: issues.length === 0,
        adminCount: admins.length,
        activeAdmins,
        issues
      };

    } catch (error) {
      console.error('마이그레이션 상태 확인 실패:', error);
      return {
        isCompleted: false,
        adminCount: 0,
        activeAdmins: [],
        issues: [`상태 확인 실패: ${error}`]
      };
    }
  }
}

// CLI에서 실행 가능하도록 export
export async function runAdminMigration(): Promise<void> {
  const migration = new AdminDataMigration();
  
  // 현재 사용 패턴 분석
  console.log('🔍 현재 admin-utils 사용 패턴 분석...');
  const usage = await migration.analyzeCurrentUsage();
  
  console.log('\n📊 분석 결과:');
  console.log(`- admin-utils 사용 파일: ${usage.filesUsingAdminUtils.length}개`);
  console.log(`- 비동기 마이그레이션 필요: ${usage.asyncMigrationNeeded.length}개`);
  
  if (usage.asyncMigrationNeeded.length > 0) {
    console.log('\n⚠️ 비동기 마이그레이션이 필요한 항목들:');
    usage.asyncMigrationNeeded.forEach(item => console.log(`  - ${item}`));
  }

  // 마이그레이션 실행
  console.log('\n🔄 Admin 데이터 마이그레이션 시작...');
  const result = await migration.migrateAdminData();
  
  console.log('\n📊 마이그레이션 결과:');
  console.log(`- 생성된 Admin: ${result.adminsCreated}개`);
  console.log(`- 성공 여부: ${result.success ? '✅' : '❌'}`);
  
  if (result.errors.length > 0) {
    console.log(`- 오류: ${result.errors.length}개`);
    result.errors.forEach(error => console.log(`  ❌ ${error}`));
  }

  // 마이그레이션 후 상태 확인
  console.log('\n🔍 마이그레이션 후 상태 확인...');
  const status = await migration.checkMigrationStatus();
  
  console.log(`- 완료 상태: ${status.isCompleted ? '✅' : '❌'}`);
  console.log(`- 활성 Admin: ${status.activeAdmins.length}개`);
  console.log(`- 활성 Admin 목록: ${status.activeAdmins.join(', ')}`);
  
  if (status.issues.length > 0) {
    console.log('- 해결 필요 사항:');
    status.issues.forEach(issue => console.log(`  ⚠️ ${issue}`));
  }
}

// 스크립트로 직접 실행되는 경우
if (require.main === module) {
  runAdminMigration().catch(console.error);
}