// 사용자 관리 서비스 - temp_user_id 완전 제거

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  
  // 확장 프로필 정보
  profile: {
    displayName?: string;
    bio?: string;
    preferences: {
      theme: 'light' | 'dark' | 'auto';
      language: 'ko' | 'en';
      notifications: boolean;
      defaultPersona: 'moment.ryan' | 'atozit' | 'auto';
    };
    statistics: {
      totalConversations: number;
      totalMessages: number;
      averageSatisfaction: number;
      joinedAt: string;
      lastActiveAt: string;
    };
  };
}

export interface UserSession {
  userId: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  messageCount: number;
  personaUsed?: 'moment.ryan' | 'atozit';
  satisfaction?: number;
  status: 'active' | 'completed' | 'abandoned';
}

export class UserService {
  
  // 사용자 프로필 조회 또는 생성
  static async getOrCreateUserProfile(
    userId: string, 
    email: string, 
    name?: string, 
    image?: string
  ): Promise<UserProfile> {
    try {
      // 기존 사용자 조회
      let user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          accounts: true
        }
      });

      // 사용자가 없으면 생성
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: email,
            name: name,
            image: image,
            role: 'USER' // 기본 역할
          },
          include: {
            accounts: true
          }
        });

        console.log(`👤 새 사용자 생성: ${email} (${userId})`);
      } else {
        // 기존 사용자 정보 업데이트
        if (user.email !== email || user.name !== name || user.image !== image) {
          user = await prisma.user.update({
            where: { id: userId },
            data: {
              email: email,
              name: name,
              image: image
            },
            include: {
              accounts: true
            }
          });
        }
      }

      // 확장 프로필 조회 또는 생성
      let extendedProfile = await this.getExtendedProfile(userId);
      if (!extendedProfile) {
        extendedProfile = await this.createExtendedProfile(userId);
      }

      return {
        id: user.id,
        email: user.email!,
        name: user.name || undefined,
        image: user.image || undefined,
        role: user.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
        profile: extendedProfile
      };

    } catch (error) {
      console.error('사용자 프로필 조회/생성 실패:', error);
      throw error;
    }
  }

  // 확장 프로필 조회
  static async getExtendedProfile(userId: string): Promise<any> {
    try {
      // 실제로는 UserProfile 테이블에서 조회
      // 현재는 기본값 반환
      return {
        displayName: undefined,
        bio: undefined,
        preferences: {
          theme: 'light' as const,
          language: 'ko' as const,
          notifications: true,
          defaultPersona: 'auto' as const
        },
        statistics: {
          totalConversations: 0,
          totalMessages: 0,
          averageSatisfaction: 0,
          joinedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('확장 프로필 조회 실패:', error);
      return null;
    }
  }

  // 확장 프로필 생성
  static async createExtendedProfile(userId: string): Promise<any> {
    try {
      const now = new Date().toISOString();
      
      const profile = {
        displayName: undefined,
        bio: undefined,
        preferences: {
          theme: 'light' as const,
          language: 'ko' as const,
          notifications: true,
          defaultPersona: 'auto' as const
        },
        statistics: {
          totalConversations: 0,
          totalMessages: 0,
          averageSatisfaction: 0,
          joinedAt: now,
          lastActiveAt: now
        }
      };

      // 실제로는 UserProfile 테이블에 저장
      console.log(`📝 확장 프로필 생성: ${userId}`);
      
      return profile;
    } catch (error) {
      console.error('확장 프로필 생성 실패:', error);
      throw error;
    }
  }

  // 사용자 활동 업데이트
  static async updateUserActivity(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          updatedAt: new Date()
        }
      });

      // 확장 프로필의 lastActiveAt도 업데이트
      // 실제로는 UserProfile 테이블 업데이트
      
    } catch (error) {
      console.error('사용자 활동 업데이트 실패:', error);
    }
  }

  // 사용자 통계 업데이트
  static async updateUserStatistics(
    userId: string, 
    updates: {
      conversationCount?: number;
      messageCount?: number;
      satisfactionRating?: number;
    }
  ): Promise<void> {
    try {
      // 실제로는 UserProfile 테이블의 statistics 필드 업데이트
      console.log(`📊 사용자 통계 업데이트: ${userId}`, updates);
      
    } catch (error) {
      console.error('사용자 통계 업데이트 실패:', error);
    }
  }

  // 사용자 세션 생성
  static async createUserSession(
    userId: string,
    personaUsed?: 'moment.ryan' | 'atozit'
  ): Promise<UserSession> {
    try {
      const sessionId = this.generateSessionId();
      const now = new Date().toISOString();

      const session: UserSession = {
        userId,
        sessionId,
        startTime: now,
        messageCount: 0,
        personaUsed,
        status: 'active'
      };

      // 실제로는 UserSession 테이블에 저장
      console.log(`🔄 사용자 세션 생성: ${sessionId} for ${userId}`);
      
      return session;
    } catch (error) {
      console.error('사용자 세션 생성 실패:', error);
      throw error;
    }
  }

  // 사용자 세션 종료
  static async endUserSession(
    sessionId: string,
    satisfaction?: number
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // 실제로는 UserSession 테이블 업데이트
      console.log(`✅ 사용자 세션 종료: ${sessionId}, 만족도: ${satisfaction}`);
      
    } catch (error) {
      console.error('사용자 세션 종료 실패:', error);
    }
  }

  // 사용자 세션 메시지 카운트 증가
  static async incrementMessageCount(sessionId: string): Promise<void> {
    try {
      // 실제로는 UserSession 테이블의 messageCount 증가
      console.log(`📈 메시지 카운트 증가: ${sessionId}`);
      
    } catch (error) {
      console.error('메시지 카운트 증가 실패:', error);
    }
  }

  // 사용자 선호도 업데이트
  static async updateUserPreferences(
    userId: string,
    preferences: {
      theme?: 'light' | 'dark' | 'auto';
      language?: 'ko' | 'en';
      notifications?: boolean;
      defaultPersona?: 'moment.ryan' | 'atozit' | 'auto';
    }
  ): Promise<void> {
    try {
      // 실제로는 UserProfile 테이블의 preferences 필드 업데이트
      console.log(`⚙️ 사용자 선호도 업데이트: ${userId}`, preferences);
      
    } catch (error) {
      console.error('사용자 선호도 업데이트 실패:', error);
    }
  }

  // 사용자 역할 확인
  static async getUserRole(userId: string): Promise<'USER' | 'ADMIN' | 'SUPER_ADMIN'> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      return (user?.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN') || 'USER';
    } catch (error) {
      console.error('사용자 역할 조회 실패:', error);
      return 'USER';
    }
  }

  // 사용자 검색
  static async searchUsers(
    query: string,
    limit: number = 20
  ): Promise<UserProfile[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      const profiles: UserProfile[] = [];
      for (const user of users) {
        const extendedProfile = await this.getExtendedProfile(user.id);
        profiles.push({
          id: user.id,
          email: user.email!,
          name: user.name || undefined,
          image: user.image || undefined,
          role: user.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
          profile: extendedProfile || await this.createExtendedProfile(user.id)
        });
      }

      return profiles;
    } catch (error) {
      console.error('사용자 검색 실패:', error);
      return [];
    }
  }

  // 사용자 삭제 (GDPR 준수)
  static async deleteUser(userId: string): Promise<void> {
    try {
      // 관련 데이터 모두 삭제
      await prisma.user.delete({
        where: { id: userId }
      });

      console.log(`🗑️ 사용자 삭제 완료: ${userId}`);
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      throw error;
    }
  }

  // 헬퍼 메서드
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // 사용자 통계 계산
  static async calculateUserStatistics(userId: string): Promise<any> {
    try {
      // 실제로는 여러 테이블에서 집계 쿼리
      return {
        totalConversations: 0,
        totalMessages: 0,
        averageSatisfaction: 0,
        mostUsedPersona: 'moment.ryan',
        averageSessionLength: 15, // 분
        lastActiveDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('사용자 통계 계산 실패:', error);
      return null;
    }
  }

  // 데이터베이스 연결 종료
  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}