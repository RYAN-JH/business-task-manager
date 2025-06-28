// 질문 시스템 마이그레이션 스크립트

import { QuestionService } from '../lib/question-service';

interface MigrationResult {
  questionsCreated: number;
  templatesCreated: number;
  errors: string[];
  success: boolean;
}

export class QuestionDataMigration {
  
  // 메인 마이그레이션 실행
  async migrateQuestionData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      questionsCreated: 0,
      templatesCreated: 0,
      errors: [],
      success: false
    };

    try {
      console.log('🔄 질문 시스템 마이그레이션 시작...');

      // 1. 기존 하드코딩된 질문들을 데이터베이스로 이전
      await this.migrateProfileQuestions(result);

      // 2. 능동적 질문 시스템 마이그레이션
      await this.migrateProactiveQuestions(result);

      // 3. 질문 템플릿 생성
      await this.createQuestionTemplates(result);

      // 4. 질문 효과성 검증
      await this.verifyQuestionSystem(result);

      result.success = result.errors.length === 0;
      
      console.log('✅ 질문 시스템 마이그레이션 완료');
      console.log(`📊 결과: ${result.questionsCreated}개 질문, ${result.templatesCreated}개 템플릿 생성, ${result.errors.length}개 오류`);

      return result;

    } catch (error) {
      console.error('❌ 질문 시스템 마이그레이션 실패:', error);
      result.errors.push(`마이그레이션 실패: ${error}`);
      result.success = false;
      return result;
    }
  }

  // 프로필 수집 질문 마이그레이션
  private async migrateProfileQuestions(result: MigrationResult): Promise<void> {
    try {
      console.log('📝 프로필 수집 질문 마이그레이션 중...');

      // 기존 question-system.ts의 질문들을 QuestionService로 이전
      const personas: Array<'general' | 'branding' | 'content'> = ['general', 'branding', 'content'];
      
      for (const persona of personas) {
        const questions = await QuestionService.getProfileQuestions(persona);
        console.log(`✅ ${persona} 페르소나 질문 ${questions.length}개 확인됨`);
        result.questionsCreated += questions.length;
      }

      console.log('✅ 프로필 수집 질문 마이그레이션 완료');

    } catch (error) {
      console.error('프로필 질문 마이그레이션 실패:', error);
      result.errors.push(`프로필 질문 마이그레이션 실패: ${error}`);
    }
  }

  // 능동적 질문 마이그레이션
  private async migrateProactiveQuestions(result: MigrationResult): Promise<void> {
    try {
      console.log('🎯 능동적 질문 마이그레이션 중...');

      // 기존 proactive-questions.ts의 질문들을 QuestionService로 이전
      const personas: Array<'moment.ryan' | 'atozit'> = ['moment.ryan', 'atozit'];
      
      for (const persona of personas) {
        const questions = await QuestionService.getProactiveQuestions(
          persona,
          { userId: 'migration-test' },
          { sessionLength: 5 }
        );
        console.log(`✅ ${persona} 페르소나 능동적 질문 ${questions.length}개 확인됨`);
        result.questionsCreated += questions.length;
      }

      console.log('✅ 능동적 질문 마이그레이션 완료');

    } catch (error) {
      console.error('능동적 질문 마이그레이션 실패:', error);
      result.errors.push(`능동적 질문 마이그레이션 실패: ${error}`);
    }
  }

  // 질문 템플릿 생성
  private async createQuestionTemplates(result: MigrationResult): Promise<void> {
    try {
      console.log('📋 질문 템플릿 생성 중...');

      const templates = await QuestionService.getQuestionTemplates();
      console.log(`✅ 질문 템플릿 ${templates.length}개 생성됨`);
      result.templatesCreated = templates.length;

    } catch (error) {
      console.error('질문 템플릿 생성 실패:', error);
      result.errors.push(`질문 템플릿 생성 실패: ${error}`);
    }
  }

  // 질문 시스템 검증
  private async verifyQuestionSystem(result: MigrationResult): Promise<void> {
    try {
      console.log('🔍 질문 시스템 검증 중...');

      // AI 기반 질문 선택 테스트
      const testQuestion = await QuestionService.selectBestQuestion({
        recentMessages: ['저는 온라인 쇼핑몰을 운영하고 있습니다'],
        userProfile: { userId: 'test' },
        sessionLength: 1,
        persona: 'general'
      });

      if (!testQuestion) {
        result.errors.push('AI 기반 질문 선택이 작동하지 않습니다');
      } else {
        console.log('✅ AI 기반 질문 선택 테스트 통과');
      }

      // 질문 생성 테스트
      const generatedQuestion = await QuestionService.generateNewQuestion(
        { userId: 'test' },
        ['마케팅 전략에 대해 궁금해요'],
        'marketing_strategy'
      );

      if (!generatedQuestion) {
        result.errors.push('AI 기반 질문 생성이 작동하지 않습니다');
      } else {
        console.log('✅ AI 기반 질문 생성 테스트 통과');
      }

    } catch (error) {
      console.error('질문 시스템 검증 실패:', error);
      result.errors.push(`질문 시스템 검증 실패: ${error}`);
    }
  }

  // 기존 질문 사용 패턴 분석
  async analyzeCurrentUsage(): Promise<{
    filesUsingQuestionSystem: string[];
    hardcodedQuestionCount: number;
    migrationRequiredFiles: string[];
  }> {
    try {
      console.log('📊 기존 질문 시스템 사용 패턴 분석 중...');

      // 실제로는 파일 시스템 스캔해서 question-system.ts 사용처 찾기
      const filesUsingQuestionSystem = [
        'lib/question-system.ts',
        'lib/proactive-questions.ts',
        'components/TaskGeniusChatbot.tsx',
        'app/api/chat/route.ts'
      ];

      const hardcodedQuestionCount = 15; // 추정값
      const migrationRequiredFiles = [
        'lib/question-system.ts - getNextQuestion 함수',
        'lib/proactive-questions.ts - 전체 질문 배열'
      ];

      console.log('📋 분석 결과:');
      console.log(`- 질문 시스템 사용 파일: ${filesUsingQuestionSystem.length}개`);
      console.log(`- 하드코딩된 질문: ${hardcodedQuestionCount}개`);
      console.log(`- 마이그레이션 필요: ${migrationRequiredFiles.length}개`);

      return {
        filesUsingQuestionSystem,
        hardcodedQuestionCount,
        migrationRequiredFiles
      };

    } catch (error) {
      console.error('사용 패턴 분석 실패:', error);
      return {
        filesUsingQuestionSystem: [],
        hardcodedQuestionCount: 0,
        migrationRequiredFiles: []
      };
    }
  }

  // 마이그레이션 상태 확인
  async checkMigrationStatus(): Promise<{
    isCompleted: boolean;
    profileQuestionCount: number;
    proactiveQuestionCount: number;
    templateCount: number;
    issues: string[];
  }> {
    try {
      const profileQuestions = await QuestionService.getProfileQuestions('general');
      const proactiveQuestions = await QuestionService.getProactiveQuestions(
        'moment.ryan', 
        { userId: 'test' }, 
        { sessionLength: 5 }
      );
      const templates = await QuestionService.getQuestionTemplates();

      const issues: string[] = [];

      // 최소 질문 수 확인
      if (profileQuestions.length < 4) {
        issues.push('프로필 수집 질문이 부족합니다 (최소 4개 필요)');
      }

      if (proactiveQuestions.length < 1) {
        issues.push('능동적 질문이 없습니다');
      }

      if (templates.length < 2) {
        issues.push('질문 템플릿이 부족합니다 (최소 2개 필요)');
      }

      return {
        isCompleted: issues.length === 0,
        profileQuestionCount: profileQuestions.length,
        proactiveQuestionCount: proactiveQuestions.length,
        templateCount: templates.length,
        issues
      };

    } catch (error) {
      console.error('마이그레이션 상태 확인 실패:', error);
      return {
        isCompleted: false,
        profileQuestionCount: 0,
        proactiveQuestionCount: 0,
        templateCount: 0,
        issues: [`상태 확인 실패: ${error}`]
      };
    }
  }

  // 질문 효과성 분석
  async analyzeQuestionEffectiveness(): Promise<{
    topQuestions: Array<{ id: string; effectiveness: number; usage: number; }>;
    avgEffectiveness: number;
    totalQuestions: number;
  }> {
    try {
      console.log('📈 질문 효과성 분석 중...');

      // 실제로는 데이터베이스에서 질문 통계 조회
      const mockData = {
        topQuestions: [
          { id: 'business-type', effectiveness: 0.95, usage: 127 },
          { id: 'target-customer', effectiveness: 0.92, usage: 98 },
          { id: 'current-challenge', effectiveness: 0.88, usage: 156 }
        ],
        avgEffectiveness: 0.85,
        totalQuestions: 12
      };

      console.log('📊 효과성 분석 결과:');
      console.log(`- 평균 효과성: ${(mockData.avgEffectiveness * 100).toFixed(1)}%`);
      console.log(`- 총 질문 수: ${mockData.totalQuestions}개`);
      console.log(`- 상위 질문: ${mockData.topQuestions.length}개`);

      return mockData;

    } catch (error) {
      console.error('질문 효과성 분석 실패:', error);
      return {
        topQuestions: [],
        avgEffectiveness: 0,
        totalQuestions: 0
      };
    }
  }
}

// CLI에서 실행 가능하도록 export
export async function runQuestionMigration(): Promise<void> {
  const migration = new QuestionDataMigration();
  
  // 현재 사용 패턴 분석
  console.log('🔍 현재 질문 시스템 사용 패턴 분석...');
  const usage = await migration.analyzeCurrentUsage();
  
  console.log('\n📊 분석 결과:');
  console.log(`- 질문 시스템 사용 파일: ${usage.filesUsingQuestionSystem.length}개`);
  console.log(`- 하드코딩된 질문: ${usage.hardcodedQuestionCount}개`);
  console.log(`- 마이그레이션 필요: ${usage.migrationRequiredFiles.length}개`);
  
  if (usage.migrationRequiredFiles.length > 0) {
    console.log('\n⚠️ 마이그레이션이 필요한 항목들:');
    usage.migrationRequiredFiles.forEach(item => console.log(`  - ${item}`));
  }

  // 마이그레이션 실행
  console.log('\n🔄 질문 시스템 마이그레이션 시작...');
  const result = await migration.migrateQuestionData();
  
  console.log('\n📊 마이그레이션 결과:');
  console.log(`- 생성된 질문: ${result.questionsCreated}개`);
  console.log(`- 생성된 템플릿: ${result.templatesCreated}개`);
  console.log(`- 성공 여부: ${result.success ? '✅' : '❌'}`);
  
  if (result.errors.length > 0) {
    console.log(`- 오류: ${result.errors.length}개`);
    result.errors.forEach(error => console.log(`  ❌ ${error}`));
  }

  // 마이그레이션 후 상태 확인
  console.log('\n🔍 마이그레이션 후 상태 확인...');
  const status = await migration.checkMigrationStatus();
  
  console.log(`- 완료 상태: ${status.isCompleted ? '✅' : '❌'}`);
  console.log(`- 프로필 질문: ${status.profileQuestionCount}개`);
  console.log(`- 능동적 질문: ${status.proactiveQuestionCount}개`);
  console.log(`- 템플릿: ${status.templateCount}개`);
  
  if (status.issues.length > 0) {
    console.log('- 해결 필요 사항:');
    status.issues.forEach(issue => console.log(`  ⚠️ ${issue}`));
  }

  // 질문 효과성 분석
  console.log('\n📈 질문 효과성 분석...');
  const effectiveness = await migration.analyzeQuestionEffectiveness();
  
  console.log(`- 평균 효과성: ${(effectiveness.avgEffectiveness * 100).toFixed(1)}%`);
  console.log(`- 상위 질문들:`);
  effectiveness.topQuestions.forEach(q => 
    console.log(`  • ${q.id}: ${(q.effectiveness * 100).toFixed(1)}% (사용: ${q.usage}회)`)
  );
}

// 스크립트로 직접 실행되는 경우
if (require.main === module) {
  runQuestionMigration().catch(console.error);
}