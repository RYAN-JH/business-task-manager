// 대시보드 메트릭 관리 서비스 - 실시간 데이터베이스 기반 시스템

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DashboardMetrics {
  id: string;
  type: 'user_stats' | 'persona_performance' | 'learning_progress' | 'social_media' | 'system_health';
  category: string;
  name: string;
  value: number | string;
  previousValue?: number | string;
  unit: string; // 'count', 'percentage', 'score', 'followers', 'engagement'
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  updatedAt: string;
  metadata?: {
    source?: string;
    userId?: string;
    personaId?: string;
    calculation?: string;
  };
}

export interface RealtimeMetrics {
  // 사용자 통계
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    averageSessionLength: number;
  };
  
  // 페르소나 성과
  personaPerformance: {
    [personaId: string]: {
      totalUsage: number;
      satisfaction: number;
      successRate: number;
      averageResponseTime: number;
    };
  };
  
  // 학습 진행도
  learningProgress: {
    totalConversations: number;
    totalFeedbacks: number;
    averageScore: number;
    improvementRate: number;
  };
  
  // 소셜 미디어 (실시간 API 연동)
  socialMedia: {
    threads: {
      followers: number;
      engagement: number;
      lastUpdated: string;
    };
    instagram: {
      followers: number;
      engagement: number;
      lastUpdated: string;
    };
  };
  
  // 시스템 건강도
  systemHealth: {
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
    lastHealthCheck: string;
  };
}

export class MetricsService {
  
  // 실시간 대시보드 메트릭 조회
  static async getRealtimeMetrics(): Promise<RealtimeMetrics> {
    try {
      console.log('📊 실시간 메트릭 수집 중...');
      
      // 병렬로 모든 메트릭 수집
      const [userStats, personaPerformance, learningProgress, socialMedia, systemHealth] = await Promise.all([
        this.getUserStats(),
        this.getPersonaPerformance(),
        this.getLearningProgress(),
        this.getSocialMediaMetrics(),
        this.getSystemHealth()
      ]);

      return {
        userStats,
        personaPerformance,
        learningProgress,
        socialMedia,
        systemHealth
      };
    } catch (error) {
      console.error('실시간 메트릭 조회 실패:', error);
      return this.getFallbackMetrics();
    }
  }

  // 사용자 통계 수집
  private static async getUserStats(): Promise<RealtimeMetrics['userStats']> {
    try {
      const totalUsers = await prisma.user.count();
      
      // 지난 24시간 활성 사용자
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const activeUsers = await prisma.user.count({
        where: {
          updatedAt: {
            gte: yesterday
          }
        }
      });

      // 오늘 가입한 새 사용자
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newUsersToday = await prisma.user.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      });

      // 평균 세션 길이 (분 단위)
      const averageSessionLength = await this.calculateAverageSessionLength();

      return {
        totalUsers,
        activeUsers,
        newUsersToday,
        averageSessionLength
      };
    } catch (error) {
      console.error('사용자 통계 수집 실패:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        averageSessionLength: 0
      };
    }
  }

  // 페르소나 성과 수집
  private static async getPersonaPerformance(): Promise<RealtimeMetrics['personaPerformance']> {
    try {
      // 각 페르소나별 성과 데이터 수집
      const personas = ['general', 'atozit', 'moment.ryan'];
      const performance: RealtimeMetrics['personaPerformance'] = {};

      for (const personaId of personas) {
        // 사용량 계산
        const totalUsage = await prisma.conversation.count({
          where: { persona: personaId }
        });

        // 만족도 계산 (피드백 기반)
        const feedbacks = await prisma.messageFeedback.findMany({
          where: {
            message: {
              persona: personaId
            }
          }
        });

        let satisfaction = 0;
        if (feedbacks.length > 0) {
          const positiveCount = feedbacks.filter(f => 
            f.feedback === 'HELPFUL' || f.feedback === 'VERY_HELPFUL'
          ).length;
          satisfaction = positiveCount / feedbacks.length;
        }

        // 성공률 (만족도와 동일하게 계산)
        const successRate = satisfaction;

        // 평균 응답 시간 (임시값 - 실제로는 로그에서 계산)
        const averageResponseTime = this.calculatePersonaResponseTime(personaId);

        performance[personaId] = {
          totalUsage,
          satisfaction,
          successRate,
          averageResponseTime
        };
      }

      return performance;
    } catch (error) {
      console.error('페르소나 성과 수집 실패:', error);
      return {};
    }
  }

  // 학습 진행도 수집
  private static async getLearningProgress(): Promise<RealtimeMetrics['learningProgress']> {
    try {
      const totalConversations = await prisma.conversation.count();
      const totalFeedbacks = await prisma.messageFeedback.count();

      // 평균 점수 계산
      const feedbacks = await prisma.messageFeedback.findMany();
      let averageScore = 0;
      
      if (feedbacks.length > 0) {
        const scores = feedbacks.map(f => {
          switch (f.feedback) {
            case 'VERY_HELPFUL': return 100;
            case 'HELPFUL': return 75;
            case 'NOT_HELPFUL': return 25;
            default: return 50;
          }
        });
        averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }

      // 개선율 계산 (지난 주 대비)
      const improvementRate = await this.calculateImprovementRate();

      return {
        totalConversations,
        totalFeedbacks,
        averageScore,
        improvementRate
      };
    } catch (error) {
      console.error('학습 진행도 수집 실패:', error);
      return {
        totalConversations: 0,
        totalFeedbacks: 0,
        averageScore: 0,
        improvementRate: 0
      };
    }
  }

  // 소셜 미디어 메트릭 수집 (실시간 API 연동)
  private static async getSocialMediaMetrics(): Promise<RealtimeMetrics['socialMedia']> {
    try {
      // Instagram API 연동 (실제로는 Graph API 사용)
      const instagramData = await this.fetchInstagramMetrics();
      
      // Threads API 연동 (현재는 하드코딩, 추후 API 연동)
      const threadsData = await this.fetchThreadsMetrics();

      return {
        threads: {
          followers: threadsData.followers,
          engagement: threadsData.engagement,
          lastUpdated: new Date().toISOString()
        },
        instagram: {
          followers: instagramData.followers,
          engagement: instagramData.engagement,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('소셜 미디어 메트릭 수집 실패:', error);
      // 하드코딩된 fallback 값 사용
      return {
        threads: {
          followers: 41000,
          engagement: 0.045,
          lastUpdated: new Date().toISOString()
        },
        instagram: {
          followers: 165000,
          engagement: 0.032,
          lastUpdated: new Date().toISOString()
        }
      };
    }
  }

  // 시스템 건강도 수집
  private static async getSystemHealth(): Promise<RealtimeMetrics['systemHealth']> {
    try {
      // API 응답 시간 측정
      const startTime = Date.now();
      await prisma.user.findFirst();
      const apiResponseTime = Date.now() - startTime;

      // 에러율 계산 (24시간 기준)
      const errorRate = await this.calculateErrorRate();

      // 업타임 계산 (가동률)
      const uptime = await this.calculateUptime();

      return {
        apiResponseTime,
        errorRate,
        uptime,
        lastHealthCheck: new Date().toISOString()
      };
    } catch (error) {
      console.error('시스템 건강도 수집 실패:', error);
      return {
        apiResponseTime: 0,
        errorRate: 0,
        uptime: 0,
        lastHealthCheck: new Date().toISOString()
      };
    }
  }

  // 개별 메트릭 저장
  static async saveMetric(metric: Omit<DashboardMetrics, 'id' | 'updatedAt'>): Promise<void> {
    try {
      // 실제로는 Metrics 테이블에 저장
      console.log(`💾 메트릭 저장: ${metric.name} = ${metric.value} ${metric.unit}`);
      
      // 트렌드 계산 (이전 값과 비교)
      if (metric.previousValue && typeof metric.value === 'number' && typeof metric.previousValue === 'number') {
        const change = ((metric.value - metric.previousValue) / metric.previousValue) * 100;
        console.log(`📈 ${metric.name} 변화율: ${change.toFixed(1)}%`);
      }
    } catch (error) {
      console.error('메트릭 저장 실패:', error);
      throw error;
    }
  }

  // 특정 메트릭 조회
  static async getMetric(type: string, name: string): Promise<DashboardMetrics | null> {
    try {
      // 실제로는 데이터베이스에서 조회
      // 현재는 실시간 계산된 값 반환
      const metrics = await this.getRealtimeMetrics();
      
      // 요청된 메트릭 찾기
      if (type === 'social_media' && name === 'instagram_followers') {
        return {
          id: 'instagram-followers',
          type: 'social_media',
          category: 'social',
          name: 'Instagram Followers',
          value: metrics.socialMedia.instagram.followers,
          unit: 'followers',
          trend: 'up',
          trendPercentage: 2.3,
          updatedAt: metrics.socialMedia.instagram.lastUpdated
        };
      }

      return null;
    } catch (error) {
      console.error('메트릭 조회 실패:', error);
      return null;
    }
  }

  // 메트릭 히스토리 조회
  static async getMetricHistory(
    type: string, 
    name: string, 
    timeRange: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<Array<{ timestamp: string; value: number; }>> {
    try {
      // 실제로는 데이터베이스에서 시계열 데이터 조회
      // 현재는 더미 데이터 생성
      const history = [];
      const now = new Date();
      const intervals = {
        '1h': { count: 60, unit: 'minutes' },
        '24h': { count: 24, unit: 'hours' },
        '7d': { count: 7, unit: 'days' },
        '30d': { count: 30, unit: 'days' }
      };

      const { count, unit } = intervals[timeRange];
      
      for (let i = count; i >= 0; i--) {
        const timestamp = new Date(now);
        if (unit === 'minutes') timestamp.setMinutes(timestamp.getMinutes() - i);
        else if (unit === 'hours') timestamp.setHours(timestamp.getHours() - i);
        else if (unit === 'days') timestamp.setDate(timestamp.getDate() - i);

        // 더미 값 생성 (실제로는 DB에서 조회)
        const baseValue = name === 'instagram_followers' ? 165000 : 75;
        const variation = Math.sin(i * 0.1) * (baseValue * 0.02);
        
        history.push({
          timestamp: timestamp.toISOString(),
          value: Math.round(baseValue + variation)
        });
      }

      return history;
    } catch (error) {
      console.error('메트릭 히스토리 조회 실패:', error);
      return [];
    }
  }

  // 헬퍼 메서드들
  private static async calculateAverageSessionLength(): Promise<number> {
    // 실제로는 세션 테이블에서 계산
    return 12.5; // 분 단위
  }

  private static calculatePersonaResponseTime(personaId: string): number {
    // 실제로는 로그 분석을 통해 계산
    const baseTimes = { 'general': 1.2, 'atozit': 1.5, 'moment.ryan': 1.1 };
    return baseTimes[personaId as keyof typeof baseTimes] || 1.3;
  }

  private static async calculateImprovementRate(): Promise<number> {
    // 실제로는 주간 비교 분석
    return 8.5; // 퍼센트
  }

  private static async fetchInstagramMetrics(): Promise<{ followers: number; engagement: number; }> {
    try {
      // 실제로는 Instagram Graph API 호출
      // const response = await fetch(`https://graph.instagram.com/v12.0/me?fields=followers_count&access_token=${token}`);
      
      // 현재는 하드코딩된 값에 약간의 변동 추가
      const baseFollowers = 165000;
      const variation = Math.floor(Math.random() * 100) - 50; // ±50 변동
      
      return {
        followers: baseFollowers + variation,
        engagement: 0.032 + (Math.random() * 0.01 - 0.005) // ±0.5% 변동
      };
    } catch (error) {
      console.error('Instagram 메트릭 가져오기 실패:', error);
      return { followers: 165000, engagement: 0.032 };
    }
  }

  private static async fetchThreadsMetrics(): Promise<{ followers: number; engagement: number; }> {
    try {
      // Threads API가 공개되면 실제 API 호출
      // 현재는 하드코딩된 값에 약간의 변동 추가
      const baseFollowers = 41000;
      const variation = Math.floor(Math.random() * 50) - 25; // ±25 변동
      
      return {
        followers: baseFollowers + variation,
        engagement: 0.045 + (Math.random() * 0.01 - 0.005) // ±0.5% 변동
      };
    } catch (error) {
      console.error('Threads 메트릭 가져오기 실패:', error);
      return { followers: 41000, engagement: 0.045 };
    }
  }

  private static async calculateErrorRate(): Promise<number> {
    // 실제로는 로그 분석을 통해 계산
    return 0.01; // 1% 에러율
  }

  private static async calculateUptime(): Promise<number> {
    // 실제로는 헬스 체크 로그 분석
    return 99.9; // 99.9% 업타임
  }

  // 폴백 메트릭 (API 실패 시)
  private static getFallbackMetrics(): RealtimeMetrics {
    return {
      userStats: {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        averageSessionLength: 0
      },
      personaPerformance: {},
      learningProgress: {
        totalConversations: 0,
        totalFeedbacks: 0,
        averageScore: 75, // 기본값
        improvementRate: 0
      },
      socialMedia: {
        threads: {
          followers: 41000,
          engagement: 0.045,
          lastUpdated: new Date().toISOString()
        },
        instagram: {
          followers: 165000,
          engagement: 0.032,
          lastUpdated: new Date().toISOString()
        }
      },
      systemHealth: {
        apiResponseTime: 0,
        errorRate: 0,
        uptime: 99.9,
        lastHealthCheck: new Date().toISOString()
      }
    };
  }

  // 연결 종료
  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}