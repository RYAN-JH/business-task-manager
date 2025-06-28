// 사용자 프로필 관리 서비스
import { prisma } from '@/lib/prisma';
import { UserProfile } from '@/lib/question-system';

// 사용자 프로필 로드
export async function loadUserProfile(userId: string): Promise<UserProfile> {
  try {
    const profile = await prisma.userProfile.findFirst({
      where: { userId }
    });

    if (!profile) {
      // 기본 프로필 생성
      const defaultProfile: UserProfile = {
        lastUpdated: new Date().toISOString(),
        completionLevel: 0
      };
      return defaultProfile;
    }

    // JSON 파싱 처리
    const parsedProfile: UserProfile = {
      businessType: profile.businessType || undefined,
      targetCustomer: profile.targetCustomer || undefined,
      mainProducts: profile.mainProducts || undefined,
      currentChallenges: profile.currentChallenges ? JSON.parse(profile.currentChallenges) : undefined,
      industry: profile.industry || undefined,
      companySize: profile.companySize || undefined,
      experienceLevel: profile.experienceLevel || undefined,
      preferredPersona: profile.preferredPersona || undefined,
      communicationStyle: profile.communicationStyle || undefined,
      responseLength: profile.responseLength || undefined,
      brandVoice: profile.brandVoice || undefined,
      competitiveAdvantage: profile.competitiveAdvantage || undefined,
      brandValues: profile.brandValues ? JSON.parse(profile.brandValues) : undefined,
      lastUpdated: profile.lastUpdated?.toISOString() || new Date().toISOString(),
      completionLevel: profile.completionLevel || 0
    };

    return parsedProfile;
  } catch (error) {
    console.error('사용자 프로필 로드 실패:', error);
    // 에러 시 기본 프로필 반환
    return {
      lastUpdated: new Date().toISOString(),
      completionLevel: 0
    };
  }
}

// 사용자 프로필 저장
export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  try {
    const profileData = {
      userId,
      businessType: profile.businessType || null,
      targetCustomer: profile.targetCustomer || null,
      mainProducts: profile.mainProducts || null,
      currentChallenges: profile.currentChallenges ? JSON.stringify(profile.currentChallenges) : null,
      industry: profile.industry || null,
      companySize: profile.companySize || null,
      experienceLevel: profile.experienceLevel || null,
      preferredPersona: profile.preferredPersona || null,
      communicationStyle: profile.communicationStyle || null,
      responseLength: profile.responseLength || null,
      brandVoice: profile.brandVoice || null,
      competitiveAdvantage: profile.competitiveAdvantage || null,
      brandValues: profile.brandValues ? JSON.stringify(profile.brandValues) : null,
      completionLevel: profile.completionLevel || 0,
      lastUpdated: new Date()
    };

    await prisma.userProfile.upsert({
      where: { userId },
      update: profileData,
      create: profileData
    });

    console.log('사용자 프로필 저장 완료:', userId);
  } catch (error) {
    console.error('사용자 프로필 저장 실패:', error);
  }
}

// 질문 기록 저장
export async function saveQuestion(userId: string, questionId: string, question: string): Promise<void> {
  try {
    await prisma.questionLog.create({
      data: {
        userId,
        questionId,
        question,
        asked: true,
        askedAt: new Date()
      }
    });
  } catch (error) {
    console.error('질문 기록 저장 실패:', error);
  }
}

// 최근 질문한 내역 확인
export async function getRecentQuestions(userId: string, hours: number = 24): Promise<string[]> {
  try {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);

    const recentQuestions = await prisma.questionLog.findMany({
      where: {
        userId,
        asked: true,
        askedAt: {
          gte: cutoff
        }
      },
      select: {
        questionId: true
      }
    });

    return recentQuestions.map(q => q.questionId);
  } catch (error) {
    console.error('최근 질문 조회 실패:', error);
    return [];
  }
}