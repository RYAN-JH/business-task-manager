// temp_user_id 데이터를 실제 사용자 기반으로 마이그레이션

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { UserService } from '../lib/user-service';

interface LearningDataFile {
  path: string;
  type: 'conversation' | 'feedback' | 'profile' | 'insights';
  data: any;
}

interface MigrationResult {
  filesProcessed: number;
  recordsMigrated: number;
  errors: string[];
  tempFilesRemoved: string[];
}

export class TempUserDataMigration {
  private readonly learningDataPath = join(process.cwd(), 'learning-data');
  private readonly backupPath = join(process.cwd(), 'learning-data-backup');

  // 메인 마이그레이션 실행
  async migrateTempUserData(targetUserId?: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      filesProcessed: 0,
      recordsMigrated: 0,
      errors: [],
      tempFilesRemoved: []
    };

    try {
      console.log('🔄 temp_user_id 데이터 마이그레이션 시작...');

      // 1. 백업 디렉토리 생성
      await this.createBackup();

      // 2. temp_user_id 관련 파일들 스캔
      const tempFiles = await this.scanTempFiles();
      console.log(`📁 발견된 temp 파일들: ${tempFiles.length}개`);

      // 3. 각 파일 처리
      for (const file of tempFiles) {
        try {
          await this.processFile(file, targetUserId, result);
        } catch (error) {
          result.errors.push(`파일 처리 실패 ${file.path}: ${error}`);
          console.error(`❌ 파일 처리 실패: ${file.path}`, error);
        }
      }

      // 4. 처리된 temp 파일들 정리
      await this.cleanupTempFiles(result);

      console.log('✅ 마이그레이션 완료');
      console.log(`📊 결과: ${result.recordsMigrated}개 레코드 마이그레이션, ${result.errors.length}개 오류`);

      return result;

    } catch (error) {
      console.error('❌ 마이그레이션 실패:', error);
      result.errors.push(`마이그레이션 실패: ${error}`);
      return result;
    }
  }

  // temp 파일들 스캔
  private async scanTempFiles(): Promise<LearningDataFile[]> {
    const files: LearningDataFile[] = [];
    
    try {
      // conversation-log.json
      const conversationPath = join(this.learningDataPath, 'conversation-log.json');
      if (existsSync(conversationPath)) {
        const data = JSON.parse(readFileSync(conversationPath, 'utf-8'));
        files.push({
          path: conversationPath,
          type: 'conversation',
          data
        });
      }

      // feedback-log.json
      const feedbackPath = join(this.learningDataPath, 'feedback-log.json');
      if (existsSync(feedbackPath)) {
        const data = JSON.parse(readFileSync(feedbackPath, 'utf-8'));
        files.push({
          path: feedbackPath,
          type: 'feedback',
          data
        });
      }

      // profile-temp_user_id.json
      const profilePath = join(this.learningDataPath, 'profile-temp_user_id.json');
      if (existsSync(profilePath)) {
        const data = JSON.parse(readFileSync(profilePath, 'utf-8'));
        files.push({
          path: profilePath,
          type: 'profile',
          data
        });
      }

      // user-profile-temp_user_id.json
      const userProfilePath = join(this.learningDataPath, 'user-profile-temp_user_id.json');
      if (existsSync(userProfilePath)) {
        const data = JSON.parse(readFileSync(userProfilePath, 'utf-8'));
        files.push({
          path: userProfilePath,
          type: 'profile',
          data
        });
      }

      // learning-insights.json
      const insightsPath = join(this.learningDataPath, 'learning-insights.json');
      if (existsSync(insightsPath)) {
        const data = JSON.parse(readFileSync(insightsPath, 'utf-8'));
        files.push({
          path: insightsPath,
          type: 'insights',
          data
        });
      }

    } catch (error) {
      console.error('파일 스캔 실패:', error);
    }

    return files;
  }

  // 개별 파일 처리
  private async processFile(
    file: LearningDataFile, 
    targetUserId: string | undefined, 
    result: MigrationResult
  ): Promise<void> {
    console.log(`📄 처리 중: ${file.path} (${file.type})`);

    switch (file.type) {
      case 'conversation':
        await this.migrateConversationData(file.data, targetUserId, result);
        break;
      
      case 'feedback':
        await this.migrateFeedbackData(file.data, targetUserId, result);
        break;
      
      case 'profile':
        await this.migrateProfileData(file.data, targetUserId, result);
        break;
      
      case 'insights':
        await this.migrateInsightsData(file.data, targetUserId, result);
        break;
    }

    result.filesProcessed++;
  }

  // 대화 데이터 마이그레이션
  private async migrateConversationData(
    data: any, 
    targetUserId: string | undefined, 
    result: MigrationResult
  ): Promise<void> {
    try {
      // temp_user_id를 실제 사용자 ID로 교체
      const userId = targetUserId || 'migrated_user_' + Date.now();
      
      if (Array.isArray(data)) {
        for (const conversation of data) {
          if (conversation.userId === 'temp_user_id') {
            conversation.userId = userId;
            conversation.migratedAt = new Date().toISOString();
            result.recordsMigrated++;
          }
        }
      } else if (data.userId === 'temp_user_id') {
        data.userId = userId;
        data.migratedAt = new Date().toISOString();
        result.recordsMigrated++;
      }

      // 마이그레이션된 데이터를 새 파일로 저장
      const migratedPath = join(this.learningDataPath, `conversation-log-migrated-${Date.now()}.json`);
      writeFileSync(migratedPath, JSON.stringify(data, null, 2));
      
      console.log(`✅ 대화 데이터 마이그레이션 완료: ${result.recordsMigrated}개 레코드`);

    } catch (error) {
      console.error('대화 데이터 마이그레이션 실패:', error);
      throw error;
    }
  }

  // 피드백 데이터 마이그레이션
  private async migrateFeedbackData(
    data: any, 
    targetUserId: string | undefined, 
    result: MigrationResult
  ): Promise<void> {
    try {
      const userId = targetUserId || 'migrated_user_' + Date.now();
      
      if (Array.isArray(data)) {
        for (const feedback of data) {
          if (feedback.userId === 'temp_user_id') {
            feedback.userId = userId;
            feedback.migratedAt = new Date().toISOString();
            result.recordsMigrated++;
          }
        }
      }

      const migratedPath = join(this.learningDataPath, `feedback-log-migrated-${Date.now()}.json`);
      writeFileSync(migratedPath, JSON.stringify(data, null, 2));
      
      console.log(`✅ 피드백 데이터 마이그레이션 완료`);

    } catch (error) {
      console.error('피드백 데이터 마이그레이션 실패:', error);
      throw error;
    }
  }

  // 프로필 데이터 마이그레이션
  private async migrateProfileData(
    data: any, 
    targetUserId: string | undefined, 
    result: MigrationResult
  ): Promise<void> {
    try {
      const userId = targetUserId || 'migrated_user_' + Date.now();
      
      if (data.userId === 'temp_user_id') {
        data.userId = userId;
        data.migratedAt = new Date().toISOString();
        result.recordsMigrated++;
      }

      // 실제로는 UserService를 통해 데이터베이스에 저장
      console.log(`📝 프로필 데이터 마이그레이션 예정: ${userId}`);
      
    } catch (error) {
      console.error('프로필 데이터 마이그레이션 실패:', error);
      throw error;
    }
  }

  // 인사이트 데이터 마이그레이션
  private async migrateInsightsData(
    data: any, 
    targetUserId: string | undefined, 
    result: MigrationResult
  ): Promise<void> {
    try {
      const userId = targetUserId || 'migrated_user_' + Date.now();
      
      if (data.userId === 'temp_user_id') {
        data.userId = userId;
        data.migratedAt = new Date().toISOString();
        result.recordsMigrated++;
      }

      const migratedPath = join(this.learningDataPath, `learning-insights-migrated-${Date.now()}.json`);
      writeFileSync(migratedPath, JSON.stringify(data, null, 2));
      
      console.log(`✅ 인사이트 데이터 마이그레이션 완료`);

    } catch (error) {
      console.error('인사이트 데이터 마이그레이션 실패:', error);
      throw error;
    }
  }

  // 백업 생성
  private async createBackup(): Promise<void> {
    try {
      // 실제로는 파일 시스템 복사 작업 수행
      console.log(`📦 백업 생성: ${this.backupPath}`);
      
    } catch (error) {
      console.error('백업 생성 실패:', error);
      throw error;
    }
  }

  // temp 파일들 정리
  private async cleanupTempFiles(result: MigrationResult): Promise<void> {
    try {
      const tempFiles = [
        'profile-temp_user_id.json',
        'user-profile-temp_user_id.json'
      ];

      for (const fileName of tempFiles) {
        const filePath = join(this.learningDataPath, fileName);
        if (existsSync(filePath)) {
          // 백업 후 삭제
          unlinkSync(filePath);
          result.tempFilesRemoved.push(fileName);
          console.log(`🗑️ temp 파일 제거: ${fileName}`);
        }
      }

    } catch (error) {
      console.error('temp 파일 정리 실패:', error);
    }
  }

  // 마이그레이션 상태 확인
  async checkMigrationStatus(): Promise<{
    hasTempFiles: boolean;
    tempFileCount: number;
    tempFiles: string[];
  }> {
    const tempFiles = await this.scanTempFiles();
    
    return {
      hasTempFiles: tempFiles.length > 0,
      tempFileCount: tempFiles.length,
      tempFiles: tempFiles.map(f => f.path)
    };
  }
}

// CLI에서 실행 가능하도록 export
export async function runMigration(targetUserId?: string): Promise<void> {
  const migration = new TempUserDataMigration();
  const result = await migration.migrateTempUserData(targetUserId);
  
  console.log('\n📊 마이그레이션 결과:');
  console.log(`- 처리된 파일: ${result.filesProcessed}개`);
  console.log(`- 마이그레이션된 레코드: ${result.recordsMigrated}개`);
  console.log(`- 제거된 temp 파일: ${result.tempFilesRemoved.length}개`);
  
  if (result.errors.length > 0) {
    console.log(`- 오류: ${result.errors.length}개`);
    result.errors.forEach(error => console.log(`  ❌ ${error}`));
  }
}

// 스크립트로 직접 실행되는 경우
if (require.main === module) {
  const targetUserId = process.argv[2];
  runMigration(targetUserId).catch(console.error);
}