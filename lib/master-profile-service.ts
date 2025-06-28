// 마스터 프로필 통합 관리 서비스
import { MasterUserProfile, MasterProfileManager } from './master-profile-system';
import { ConversationLearningEngine, ConversationSession } from './conversation-learning-engine';
import { PersonalizedWritingEngine, WritingRequest } from './personalized-writing-engine';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// 마스터 프로필 저장 경로
const PROFILES_DIR = path.join(process.cwd(), 'user-profiles');

export class MasterProfileService {
  
  // 마스터 프로필 로드
  static async loadMasterProfile(userId: string): Promise<MasterUserProfile> {
    try {
      // 1. 파일에서 마스터 프로필 로드 시도
      const profilePath = path.join(PROFILES_DIR, `${userId}.json`);
      
      try {
        const profileData = await fs.readFile(profilePath, 'utf-8');
        const masterProfile: MasterUserProfile = JSON.parse(profileData);
        
        // 버전 호환성 체크
        if (masterProfile.version < 1) {
          return await this.migrateLegacyProfile(userId, masterProfile);
        }
        
        console.log('📁 마스터 프로필 로드 완료:', {
          userId,
          version: masterProfile.version,
          dataRichness: masterProfile.profileQuality.dataRichness,
          lastUpdated: masterProfile.lastUpdated
        });
        
        return masterProfile;
        
      } catch (fileError) {
        console.log('📁 마스터 프로필 파일 없음, 새로 생성:', userId);
        
        // 2. 기존 개별 프로필들로부터 마스터 프로필 생성
        const masterProfile = await this.createMasterProfileFromExistingData(userId);
        await this.saveMasterProfile(masterProfile);
        
        return masterProfile;
      }
      
    } catch (error) {
      console.error('마스터 프로필 로드 실패:', error);
      
      // 3. 완전히 새로운 프로필 생성
      const newProfile = MasterProfileManager.createNewProfile(userId);
      await this.saveMasterProfile(newProfile);
      
      return newProfile;
    }
  }
  
  // 마스터 프로필 저장
  static async saveMasterProfile(masterProfile: MasterUserProfile): Promise<void> {
    try {
      // 디렉토리 생성
      await fs.mkdir(PROFILES_DIR, { recursive: true });
      
      // 파일 저장
      const profilePath = path.join(PROFILES_DIR, `${masterProfile.userId}.json`);
      await fs.writeFile(profilePath, JSON.stringify(masterProfile, null, 2), 'utf-8');
      
      console.log('💾 마스터 프로필 저장 완료:', {
        userId: masterProfile.userId,
        version: masterProfile.version,
        fileSize: JSON.stringify(masterProfile).length
      });
      
    } catch (error) {
      console.error('마스터 프로필 저장 실패:', error);
    }
  }
  
  // 대화 세션 시작
  static startConversationSession(userId: string, conversationId: string): ConversationSession {
    return ConversationLearningEngine.startSession(userId, conversationId);
  }
  
  // 대화 세션에 메시지 추가
  static addMessageToSession(
    session: ConversationSession, 
    messageType: 'USER' | 'AI',
    content: string,
    aiResponse?: string
  ): ConversationSession {
    const message = {
      id: `msg_${Date.now()}`,
      type: messageType,
      content,
      createdAt: new Date()
    };
    
    return ConversationLearningEngine.addMessageToSession(session, message, aiResponse);
  }
  
  // 대화 세션 완료 및 학습
  static async completeConversationAndLearn(
    session: ConversationSession,
    userId: string
  ): Promise<MasterUserProfile> {
    
    const currentProfile = await this.loadMasterProfile(userId);
    
    const { updatedProfile, learningDelta } = await ConversationLearningEngine.completeSessionAndLearn(
      session,
      currentProfile
    );
    
    // 업데이트된 프로필 저장
    await this.saveMasterProfile(updatedProfile);
    
    console.log('🎓 대화 학습 및 프로필 업데이트 완료:', {
      userId,
      learningPoints: learningDelta.qualityMetrics.dataRichnessIncrease,
      newPatterns: learningDelta.writingStyleChanges.patternChanges.length,
      styleConfidence: updatedProfile.writingStyle.confidenceScore
    });
    
    return updatedProfile;
  }
  
  // 개인화된 글쓰기 생성
  static async generatePersonalizedContent(
    userId: string,
    request: WritingRequest
  ) {
    const masterProfile = await this.loadMasterProfile(userId);
    
    return PersonalizedWritingEngine.generatePersonalizedContent(request, masterProfile);
  }
  
  // 기존 데이터로부터 마스터 프로필 생성
  private static async createMasterProfileFromExistingData(userId: string): Promise<MasterUserProfile> {
    
    console.log('🔄 기존 데이터로부터 마스터 프로필 생성 중...');
    
    // 기본 마스터 프로필 생성
    const masterProfile = MasterProfileManager.createNewProfile(userId);
    
    try {
      // 1. 기존 사용자 프로필 로드
      const existingProfile = await prisma.userProfile.findFirst({
        where: { userId }
      });
      
      if (existingProfile) {
        masterProfile.businessProfile = {
          businessType: existingProfile.businessType || undefined,
          targetCustomer: existingProfile.targetCustomer || undefined,
          mainProducts: existingProfile.mainProducts || undefined,
          currentChallenges: existingProfile.currentChallenges ? 
            JSON.parse(existingProfile.currentChallenges) : undefined,
          industry: existingProfile.industry || undefined,
          companySize: existingProfile.companySize || undefined,
          experienceLevel: existingProfile.experienceLevel || undefined,
          preferredPersona: existingProfile.preferredPersona || undefined,
          communicationStyle: existingProfile.communicationStyle || undefined,
          responseLength: existingProfile.responseLength || undefined,
          brandVoice: existingProfile.brandVoice || undefined,
          competitiveAdvantage: existingProfile.competitiveAdvantage || undefined,
          brandValues: existingProfile.brandValues ? 
            JSON.parse(existingProfile.brandValues) : undefined,
          completionLevel: existingProfile.completionLevel || 0,
          lastUpdated: existingProfile.lastUpdated?.toISOString() || new Date().toISOString()
        };
        
        console.log('✅ 기존 비즈니스 프로필 통합 완료');
      }
      
      // 2. 기존 대화 내역으로부터 글쓰기 스타일 분석
      const recentMessages = await prisma.message.findMany({
        where: {
          conversation: {
            userId
          },
          type: 'USER'
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // 최근 100개 메시지
      });
      
      if (recentMessages.length > 0) {
        console.log(`📝 ${recentMessages.length}개 기존 메시지로 글쓰기 스타일 분석 중...`);
        
        // 가상의 대화 세션 생성하여 학습
        let tempSession = ConversationLearningEngine.startSession(userId, 'migration');
        
        recentMessages.reverse().forEach(msg => {
          tempSession = ConversationLearningEngine.addMessageToSession(
            tempSession,
            {
              id: msg.id,
              type: 'USER',
              content: msg.content,
              createdAt: msg.createdAt
            }
          );
        });
        
        // 마스터 프로필 업데이트 (학습 없이)
        const conversationContext = {
          currentTopic: '일반상담',
          conversationFlow: ['migration'],
          userIntent: '정보 요청',
          previousQuestions: [],
          userSentiment: 'neutral' as const,
          conversationLength: recentMessages.length,
          isFirstTime: false
        };
        
        const updatedProfile = MasterProfileManager.updateProfileFromConversation(
          masterProfile,
          recentMessages.map(m => m.content),
          [], // AI 응답 없음
          conversationContext
        );
        
        console.log('✅ 기존 메시지 분석 완료 - 글쓰기 스타일 학습됨');
        return updatedProfile;
      }
      
    } catch (error) {
      console.error('기존 데이터 통합 중 오류:', error);
    }
    
    console.log('✅ 새로운 마스터 프로필 생성 완료');
    return masterProfile;
  }
  
  // 레거시 프로필 마이그레이션
  private static async migrateLegacyProfile(
    userId: string, 
    legacyProfile: any
  ): Promise<MasterUserProfile> {
    
    console.log('🔄 레거시 프로필 마이그레이션 중...');
    
    const newProfile = MasterProfileManager.createNewProfile(userId);
    
    // 기존 데이터가 있다면 복사
    if (legacyProfile.businessProfile) {
      newProfile.businessProfile = legacyProfile.businessProfile;
    }
    
    if (legacyProfile.writingStyle) {
      newProfile.writingStyle = legacyProfile.writingStyle;
    }
    
    newProfile.version = 1;
    newProfile.lastUpdated = new Date().toISOString();
    
    await this.saveMasterProfile(newProfile);
    
    console.log('✅ 레거시 프로필 마이그레이션 완료');
    return newProfile;
  }
  
  // 프로필 품질 리포트 생성
  static async generateProfileQualityReport(userId: string): Promise<{
    overall: number;
    breakdown: {
      businessProfile: number;
      writingStyle: number;
      conversationHistory: number;
      contextMemory: number;
    };
    recommendations: string[];
  }> {
    
    const masterProfile = await this.loadMasterProfile(userId);
    
    const businessScore = masterProfile.businessProfile.completionLevel || 0;
    const writingScore = Math.min(100, masterProfile.writingStyle.totalMessagesAnalyzed * 2);
    const conversationScore = Math.min(100, masterProfile.conversationSummary.totalMessages);
    const contextScore = Math.min(100, 
      masterProfile.contextMemory.ongoingProjects.length * 20 +
      masterProfile.contextMemory.personalReferences.length * 5
    );
    
    const overall = Math.round((businessScore + writingScore + conversationScore + contextScore) / 4);
    
    const recommendations: string[] = [];
    
    if (businessScore < 50) recommendations.push('비즈니스 정보를 더 자세히 제공해주세요');
    if (writingScore < 30) recommendations.push('더 많은 대화를 통해 글쓰기 스타일을 학습할 수 있습니다');
    if (conversationScore < 20) recommendations.push('정기적인 대화로 컨텍스트를 풍부하게 만들어주세요');
    if (contextScore < 30) recommendations.push('진행 중인 프로젝트나 개인적 선호도를 더 공유해주세요');
    
    return {
      overall,
      breakdown: {
        businessProfile: businessScore,
        writingStyle: writingScore,
        conversationHistory: conversationScore,
        contextMemory: contextScore
      },
      recommendations
    };
  }
  
  // 프로필 백업
  static async backupProfile(userId: string): Promise<string> {
    const masterProfile = await this.loadMasterProfile(userId);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${userId}_backup_${timestamp}.json`;
    const backupPath = path.join(PROFILES_DIR, 'backups', backupFileName);
    
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.writeFile(backupPath, JSON.stringify(masterProfile, null, 2), 'utf-8');
    
    console.log('💾 프로필 백업 완료:', backupPath);
    return backupPath;
  }
  
  // 프로필 통계
  static async getProfileStats(): Promise<{
    totalProfiles: number;
    averageQuality: number;
    topPerformers: Array<{ userId: string; quality: number }>;
  }> {
    
    try {
      const files = await fs.readdir(PROFILES_DIR);
      const profileFiles = files.filter(f => f.endsWith('.json') && !f.includes('backup'));
      
      const profiles: Array<{ userId: string; quality: number }> = [];
      
      for (const file of profileFiles) {
        try {
          const profileData = await fs.readFile(path.join(PROFILES_DIR, file), 'utf-8');
          const profile: MasterUserProfile = JSON.parse(profileData);
          profiles.push({
            userId: profile.userId,
            quality: profile.profileQuality.dataRichness
          });
        } catch (error) {
          console.warn(`프로필 파일 읽기 실패: ${file}`, error);
        }
      }
      
      const averageQuality = profiles.reduce((sum, p) => sum + p.quality, 0) / profiles.length;
      const topPerformers = profiles
        .sort((a, b) => b.quality - a.quality)
        .slice(0, 10);
      
      return {
        totalProfiles: profiles.length,
        averageQuality: Math.round(averageQuality),
        topPerformers
      };
      
    } catch (error) {
      console.error('프로필 통계 생성 실패:', error);
      return {
        totalProfiles: 0,
        averageQuality: 0,
        topPerformers: []
      };
    }
  }
}