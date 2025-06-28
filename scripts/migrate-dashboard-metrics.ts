#!/usr/bin/env tsx

// 대시보드 메트릭 마이그레이션 실행 스크립트
// 하드코딩된 메트릭 값들을 실시간 데이터베이스 기반으로 전환

import { DashboardMetricsMigration } from '@/lib/migrations/migrate-dashboard-metrics';

async function main() {
  console.log('🎯 대시보드 메트릭 마이그레이션 스크립트 실행');
  console.log('=' .repeat(60));
  
  try {
    // 전체 마이그레이션 실행
    const result = await DashboardMetricsMigration.runFullMigration();
    
    // 결과 출력
    console.log('\n📋 마이그레이션 결과 요약:');
    console.log('-'.repeat(40));
    
    console.log('\n🔍 분석 결과:');
    console.log(`- 발견된 하드코딩 메트릭: ${result.analysis.length}개`);
    result.analysis.forEach((metric, index) => {
      console.log(`  ${index + 1}. ${metric.name}: ${metric.oldValue} (${metric.location})`);
    });
    
    console.log('\n🚀 마이그레이션 실행:');
    console.log(`- 전환된 메트릭: ${result.migration.migratedMetrics}개`);
    console.log(`- 업데이트된 컴포넌트: ${result.migration.updatedComponents.length}개`);
    if (result.migration.updatedComponents.length > 0) {
      result.migration.updatedComponents.forEach(component => {
        console.log(`  ✅ ${component}`);
      });
    }
    
    if (result.migration.errors.length > 0) {
      console.log(`- 오류: ${result.migration.errors.length}개`);
      result.migration.errors.forEach(error => {
        console.log(`  ❌ ${error}`);
      });
    }
    
    console.log('\n🔍 검증 결과:');
    console.log(`- 검증 통과: ${result.verification.isValid ? '✅ 성공' : '❌ 실패'}`);
    if (result.verification.issues.length > 0) {
      console.log(`- 발견된 이슈: ${result.verification.issues.length}개`);
      result.verification.issues.forEach(issue => {
        console.log(`  ⚠️  ${issue}`);
      });
    }
    
    if (result.verification.metrics) {
      console.log('\n📊 수집된 실시간 메트릭:');
      console.log(`  👥 총 사용자: ${result.verification.metrics.userStats.total}명`);
      console.log(`  🔥 활성 사용자: ${result.verification.metrics.userStats.active}명`);
      console.log(`  🆕 신규 사용자: ${result.verification.metrics.userStats.new}명`);
      console.log(`  🧵 Threads 팔로워: ${result.verification.metrics.socialMedia.threads.toLocaleString()}명`);
      console.log(`  📱 Instagram 팔로워: ${result.verification.metrics.socialMedia.instagram.toLocaleString()}명`);
      console.log(`  ⚡ API 응답시간: ${result.verification.metrics.systemHealth.responseTime}ms`);
      console.log(`  🟢 시스템 가동률: ${result.verification.metrics.systemHealth.uptime}%`);
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (result.verification.isValid && result.migration.errors.length === 0) {
      console.log('🎉 대시보드 메트릭 마이그레이션이 성공적으로 완료되었습니다!');
      console.log('');
      console.log('✅ 변경 사항:');
      console.log('  - 하드코딩된 소셜미디어 팔로워 수 → 실시간 API 기반');
      console.log('  - 정적 사용자 통계 → 데이터베이스 실시간 계산');
      console.log('  - 고정된 시스템 메트릭 → 동적 건강도 체크');
      console.log('');
      console.log('🔄 이제 대시보드의 모든 메트릭이 실시간으로 업데이트됩니다.');
      console.log('📊 메트릭 API 엔드포인트: /api/metrics');
      console.log('');
      process.exit(0);
    } else {
      console.log('⚠️  마이그레이션이 완료되었지만 일부 이슈가 있습니다.');
      console.log('위의 오류나 이슈들을 검토하여 수동으로 해결해주세요.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 마이그레이션 실행 중 심각한 오류 발생:');
    console.error(error);
    console.log('\n🔧 문제 해결 방법:');
    console.log('1. 데이터베이스 연결 상태 확인');
    console.log('2. Prisma 스키마 동기화: npx prisma db push');
    console.log('3. 환경 변수 설정 확인');
    console.log('4. 파일 권한 확인');
    process.exit(1);
  } finally {
    // 정리 작업
    await DashboardMetricsMigration.cleanup();
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}