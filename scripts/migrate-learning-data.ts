// 학습 데이터 저장소 마이그레이션 스크립트

import { LearningDataService } from '../lib/learning-data-service';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface MigrationResult {
  conversationsMigrated: number;
  feedbacksMigrated: number;
  insightsMigrated: number;
  profilesMigrated: number;
  totalFileSize: number;
  errors: string[];
  success: boolean;
}

export class LearningDataMigration {
  private readonly learningDataPath = join(process.cwd(), 'learning-data');
  private readonly userProfilesPath = join(process.cwd(), 'user-profiles');
  private readonly socialDataPath = join(process.cwd(), 'social-data-cache');

  // 메인 마이그레이션 실행
  async migrateLearningData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      conversationsMigrated: 0,
      feedbacksMigrated: 0,
      insightsMigrated: 0,
      profilesMigrated: 0,
      totalFileSize: 0,
      errors: [],
      success: false
    };

    try {
      console.log('🔄 학습 데이터 저장소 마이그레이션 시작...');

      // 1. 파일 크기 분석
      await this.analyzeFileSize(result);

      // 2. 핵심 학습 데이터 마이그레이션
      await this.migrateCoreData(result);

      // 3. 사용자 프로필 데이터 마이그레이션
      await this.migrateUserProfiles(result);

      // 4. 소셜 데이터 캐시 처리
      await this.processSocialDataCache(result);

      // 5. 마이그레이션 검증
      await this.verifyMigration(result);

      result.success = result.errors.length === 0;
      
      console.log('✅ 학습 데이터 마이그레이션 완료');
      console.log(`📊 결과: 대화 ${result.conversationsMigrated}개, 피드백 ${result.feedbacksMigrated}개, 인사이트 ${result.insightsMigrated}개, 프로필 ${result.profilesMigrated}개`);
      console.log(`💾 총 파일 크기: ${(result.totalFileSize / 1024 / 1024).toFixed(2)} MB`);

      return result;

    } catch (error) {
      console.error('❌ 학습 데이터 마이그레이션 실패:', error);
      result.errors.push(`마이그레이션 실패: ${error}`);
      result.success = false;
      return result;
    }
  }

  // 파일 크기 분석
  private async analyzeFileSize(result: MigrationResult): Promise<void> {
    try {
      console.log('📊 학습 데이터 파일 크기 분석 중...');

      const directories = [
        { path: this.learningDataPath, name: 'learning-data' },
        { path: this.userProfilesPath, name: 'user-profiles' },
        { path: this.socialDataPath, name: 'social-data-cache' }
      ];

      for (const dir of directories) {
        if (existsSync(dir.path)) {
          const files = readdirSync(dir.path);
          let dirSize = 0;

          for (const file of files) {
            if (file.endsWith('.json')) {
              const filePath = join(dir.path, file);
              const stats = statSync(filePath);
              dirSize += stats.size;
              console.log(`  ${file}: ${(stats.size / 1024).toFixed(1)} KB`);
            }
          }

          result.totalFileSize += dirSize;
          console.log(`📁 ${dir.name}: ${(dirSize / 1024).toFixed(1)} KB`);
        }
      }

      console.log(`📊 총 파일 크기: ${(result.totalFileSize / 1024 / 1024).toFixed(2)} MB`);

    } catch (error) {
      console.error('파일 크기 분석 실패:', error);
      result.errors.push(`파일 크기 분석 실패: ${error}`);
    }
  }

  // 핵심 학습 데이터 마이그레이션
  private async migrateCoreData(result: MigrationResult): Promise<void> {
    try {
      console.log('💾 핵심 학습 데이터 마이그레이션 중...');

      // 대화 로그 마이그레이션
      try {
        const conversations = await LearningDataService.loadConversationLogs();
        console.log(`📝 발견된 대화 로그: ${conversations.length}개`);
        
        for (const conversation of conversations) {
          await LearningDataService.saveConversation(conversation);
          result.conversationsMigrated++;
        }
        console.log(`✅ 대화 로그 ${result.conversationsMigrated}개 마이그레이션 완료`);
      } catch (error) {
        result.errors.push(`대화 로그 마이그레이션 실패: ${error}`);
      }

      // 피드백 로그 마이그레이션
      try {
        const feedbacks = await LearningDataService.loadFeedbackLogs();
        console.log(`👍 발견된 피드백: ${feedbacks.length}개`);
        
        for (const feedback of feedbacks) {
          await LearningDataService.saveFeedback(feedback);
          result.feedbacksMigrated++;
        }
        console.log(`✅ 피드백 ${result.feedbacksMigrated}개 마이그레이션 완료`);
      } catch (error) {
        result.errors.push(`피드백 마이그레이션 실패: ${error}`);
      }

      // 학습 인사이트 마이그레이션
      try {
        const insights = await LearningDataService.loadLearningInsights();
        console.log(`🧠 발견된 학습 인사이트: ${insights.length}개`);
        
        for (const insight of insights) {
          await LearningDataService.saveLearningInsight(insight);
          result.insightsMigrated++;
        }
        console.log(`✅ 학습 인사이트 ${result.insightsMigrated}개 마이그레이션 완료`);
      } catch (error) {
        result.errors.push(`학습 인사이트 마이그레이션 실패: ${error}`);
      }

    } catch (error) {
      console.error('핵심 학습 데이터 마이그레이션 실패:', error);
      result.errors.push(`핵심 데이터 마이그레이션 실패: ${error}`);
    }
  }

  // 사용자 프로필 데이터 마이그레이션
  private async migrateUserProfiles(result: MigrationResult): Promise<void> {
    try {
      console.log('👤 사용자 프로필 데이터 마이그레이션 중...');

      const profiles = await LearningDataService.loadUserProfiles();
      console.log(`📋 발견된 사용자 프로필: ${profiles.length}개`);

      for (const profile of profiles) {
        await LearningDataService.saveUserLearningProfile(profile);
        result.profilesMigrated++;
      }

      console.log(`✅ 사용자 프로필 ${result.profilesMigrated}개 마이그레이션 완료`);

    } catch (error) {
      console.error('사용자 프로필 마이그레이션 실패:', error);
      result.errors.push(`사용자 프로필 마이그레이션 실패: ${error}`);
    }
  }

  // 소셜 데이터 캐시 처리
  private async processSocialDataCache(result: MigrationResult): Promise<void> {
    try {
      console.log('📱 소셜 데이터 캐시 처리 중...');

      if (existsSync(this.socialDataPath)) {
        const files = readdirSync(this.socialDataPath);
        const socialFiles = files.filter(f => f.endsWith('.json'));
        
        console.log(`📱 발견된 소셜 데이터 캐시 파일: ${socialFiles.length}개`);
        
        // 소셜 데이터는 별도 캐시 시스템으로 처리 (현재는 로그만)
        for (const file of socialFiles) {
          console.log(`📄 소셜 데이터 파일: ${file}`);
        }

        console.log('✅ 소셜 데이터 캐시 처리 완료 (별도 시스템으로 관리)');
      } else {
        console.log('📱 소셜 데이터 캐시 디렉토리 없음');
      }

    } catch (error) {
      console.error('소셜 데이터 캐시 처리 실패:', error);
      result.errors.push(`소셜 데이터 캐시 처리 실패: ${error}`);
    }
  }

  // 마이그레이션 검증
  private async verifyMigration(result: MigrationResult): Promise<void> {
    try {
      console.log('🔍 마이그레이션 검증 중...');

      // 데이터베이스 통계 확인
      const stats = await LearningDataService.getLearningDataStats();
      
      console.log('📊 마이그레이션 후 DB 통계:');
      console.log(`- 총 대화: ${stats.totalConversations}개`);
      console.log(`- 총 피드백: ${stats.totalFeedbacks}개`);
      console.log(`- 총 인사이트: ${stats.totalInsights}개`);
      console.log(`- 평균 만족도: ${(stats.avgSatisfactionScore * 100).toFixed(1)}%`);

      // 상위 페르소나 성과
      console.log('🏆 상위 페르소나 성과:');
      stats.topPersonas.forEach((persona, index) => {
        console.log(`  ${index + 1}. ${persona.persona}: 사용 ${persona.usage}회, 만족도 ${(persona.satisfaction * 100).toFixed(1)}%`);
      });

      // 마이그레이션 데이터 수와 DB 데이터 수 비교
      if (result.conversationsMigrated > 0 && stats.totalConversations === 0) {
        result.errors.push('대화 데이터가 데이터베이스에 정상적으로 저장되지 않았습니다');
      }

      if (result.feedbacksMigrated > 0 && stats.totalFeedbacks === 0) {
        result.errors.push('피드백 데이터가 데이터베이스에 정상적으로 저장되지 않았습니다');
      }

      if (result.errors.length === 0) {
        console.log('✅ 마이그레이션 검증 완료');
      } else {
        console.log('⚠️ 마이그레이션 검증 중 문제 발견');
      }

    } catch (error) {
      console.error('마이그레이션 검증 실패:', error);
      result.errors.push(`마이그레이션 검증 실패: ${error}`);
    }
  }

  // 현재 학습 데이터 사용 패턴 분석
  async analyzeCurrentUsage(): Promise<{
    fileDataSummary: {
      totalFiles: number;
      totalSizeMB: number;
      largestFiles: Array<{ name: string; sizeMB: number; }>;
    };
    dataBreakdown: {
      conversations: number;
      feedbacks: number;
      insights: number;
      profiles: number;
    };
    migrationComplexity: 'low' | 'medium' | 'high';
  }> {
    try {
      console.log('📊 현재 학습 데이터 사용 패턴 분석 중...');

      let totalFiles = 0;
      let totalSize = 0;
      const largestFiles: Array<{ name: string; sizeMB: number; }> = [];

      // 파일 크기 분석
      const directories = [this.learningDataPath, this.userProfilesPath, this.socialDataPath];
      
      for (const dir of directories) {
        if (existsSync(dir)) {
          const files = readdirSync(dir);
          
          for (const file of files) {
            if (file.endsWith('.json')) {
              const filePath = join(dir, file);
              const stats = statSync(filePath);
              totalFiles++;
              totalSize += stats.size;
              
              largestFiles.push({
                name: file,
                sizeMB: stats.size / 1024 / 1024
              });
            }
          }
        }
      }

      // 상위 3개 큰 파일
      largestFiles.sort((a, b) => b.sizeMB - a.sizeMB);
      const topFiles = largestFiles.slice(0, 3);

      // 데이터 개수 분석
      const conversations = await LearningDataService.loadConversationLogs();
      const feedbacks = await LearningDataService.loadFeedbackLogs();
      const insights = await LearningDataService.loadLearningInsights();
      const profiles = await LearningDataService.loadUserProfiles();

      // 복잡도 계산
      let migrationComplexity: 'low' | 'medium' | 'high' = 'low';
      
      if (totalSize > 50 * 1024 * 1024) { // 50MB 이상
        migrationComplexity = 'high';
      } else if (totalSize > 10 * 1024 * 1024) { // 10MB 이상
        migrationComplexity = 'medium';
      }

      const result = {
        fileDataSummary: {
          totalFiles,
          totalSizeMB: totalSize / 1024 / 1024,
          largestFiles: topFiles
        },
        dataBreakdown: {
          conversations: conversations.length,
          feedbacks: feedbacks.length,
          insights: insights.length,
          profiles: profiles.length
        },
        migrationComplexity
      };

      console.log('📋 분석 결과:');
      console.log(`- 총 파일: ${result.fileDataSummary.totalFiles}개`);
      console.log(`- 총 크기: ${result.fileDataSummary.totalSizeMB.toFixed(2)} MB`);
      console.log(`- 대화: ${result.dataBreakdown.conversations}개`);
      console.log(`- 피드백: ${result.dataBreakdown.feedbacks}개`);
      console.log(`- 인사이트: ${result.dataBreakdown.insights}개`);
      console.log(`- 프로필: ${result.dataBreakdown.profiles}개`);
      console.log(`- 복잡도: ${result.migrationComplexity}`);

      return result;

    } catch (error) {
      console.error('사용 패턴 분석 실패:', error);
      return {
        fileDataSummary: { totalFiles: 0, totalSizeMB: 0, largestFiles: [] },
        dataBreakdown: { conversations: 0, feedbacks: 0, insights: 0, profiles: 0 },
        migrationComplexity: 'low'
      };
    }
  }

  // 마이그레이션 상태 확인
  async checkMigrationStatus(): Promise<{
    isCompleted: boolean;
    fileDataExists: boolean;
    dbDataExists: boolean;
    migrationNeeded: boolean;
    recommendations: string[];
  }> {
    try {
      // 파일 데이터 존재 확인
      const conversations = await LearningDataService.loadConversationLogs();
      const feedbacks = await LearningDataService.loadFeedbackLogs();
      const insights = await LearningDataService.loadLearningInsights();
      
      const fileDataExists = conversations.length > 0 || feedbacks.length > 0 || insights.length > 0;

      // DB 데이터 존재 확인
      const stats = await LearningDataService.getLearningDataStats();
      const dbDataExists = stats.totalConversations > 0 || stats.totalFeedbacks > 0 || stats.totalInsights > 0;

      // 마이그레이션 필요 여부
      const migrationNeeded = fileDataExists && (
        conversations.length > stats.totalConversations ||
        feedbacks.length > stats.totalFeedbacks ||
        insights.length > stats.totalInsights
      );

      // 권장사항
      const recommendations: string[] = [];
      
      if (migrationNeeded) {
        recommendations.push('파일 기반 학습 데이터를 데이터베이스로 마이그레이션하세요');
      }
      
      if (fileDataExists && dbDataExists) {
        recommendations.push('마이그레이션 후 파일 데이터를 백업하고 정리하세요');
      }
      
      if (!fileDataExists && !dbDataExists) {
        recommendations.push('학습 데이터가 없습니다. 시스템 사용 후 데이터가 축적됩니다');
      }

      return {
        isCompleted: !migrationNeeded,
        fileDataExists,
        dbDataExists,
        migrationNeeded,
        recommendations
      };

    } catch (error) {
      console.error('마이그레이션 상태 확인 실패:', error);
      return {
        isCompleted: false,
        fileDataExists: false,
        dbDataExists: false,
        migrationNeeded: true,
        recommendations: ['마이그레이션 상태 확인에 실패했습니다']
      };
    }
  }
}

// CLI에서 실행 가능하도록 export
export async function runLearningDataMigration(): Promise<void> {
  const migration = new LearningDataMigration();
  
  // 현재 사용 패턴 분석
  console.log('🔍 현재 학습 데이터 사용 패턴 분석...');
  const usage = await migration.analyzeCurrentUsage();
  
  console.log('\n📊 분석 결과:');
  console.log(`- 총 파일: ${usage.fileDataSummary.totalFiles}개 (${usage.fileDataSummary.totalSizeMB.toFixed(2)} MB)`);
  console.log(`- 대화: ${usage.dataBreakdown.conversations}개`);
  console.log(`- 피드백: ${usage.dataBreakdown.feedbacks}개`);
  console.log(`- 인사이트: ${usage.dataBreakdown.insights}개`);
  console.log(`- 마이그레이션 복잡도: ${usage.migrationComplexity}`);
  
  if (usage.fileDataSummary.largestFiles.length > 0) {
    console.log('\n📁 가장 큰 파일들:');
    usage.fileDataSummary.largestFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name}: ${file.sizeMB.toFixed(2)} MB`);
    });
  }

  // 마이그레이션 상태 확인
  console.log('\n🔍 마이그레이션 상태 확인...');
  const status = await migration.checkMigrationStatus();
  
  console.log(`- 파일 데이터 존재: ${status.fileDataExists ? '✅' : '❌'}`);
  console.log(`- DB 데이터 존재: ${status.dbDataExists ? '✅' : '❌'}`);
  console.log(`- 마이그레이션 필요: ${status.migrationNeeded ? '⚠️' : '✅'}`);
  
  if (status.recommendations.length > 0) {
    console.log('\n💡 권장사항:');
    status.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }

  // 마이그레이션 실행 (필요한 경우)
  if (status.migrationNeeded) {
    console.log('\n🔄 학습 데이터 마이그레이션 시작...');
    const result = await migration.migrateLearningData();
    
    console.log('\n📊 마이그레이션 결과:');
    console.log(`- 대화: ${result.conversationsMigrated}개`);
    console.log(`- 피드백: ${result.feedbacksMigrated}개`);
    console.log(`- 인사이트: ${result.insightsMigrated}개`);
    console.log(`- 프로필: ${result.profilesMigrated}개`);
    console.log(`- 성공 여부: ${result.success ? '✅' : '❌'}`);
    
    if (result.errors.length > 0) {
      console.log(`- 오류: ${result.errors.length}개`);
      result.errors.forEach(error => console.log(`  ❌ ${error}`));
    }
  } else {
    console.log('\n✅ 마이그레이션이 이미 완료되었거나 필요하지 않습니다.');
  }
}

// 스크립트로 직접 실행되는 경우
if (require.main === module) {
  runLearningDataMigration().catch(console.error);
}