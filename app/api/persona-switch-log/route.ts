import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface PersonaSwitchLog {
  id: string;
  userId: string;
  previousPersona?: string;
  newPersona: string;
  switchReason: string;
  triggerKeywords: string[];
  confidence: number;
  userMessage?: string;
  action: 'accepted' | 'rejected' | 'manual';
  timestamp: string;
}

// 페르소나 스위치 로그 기록 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      previousPersona,
      newPersona,
      switchReason,
      triggerKeywords = [],
      confidence = 0,
      userMessage,
      action = 'manual'
    } = body;

    if (!newPersona || !['moment.ryan', 'atozit'].includes(newPersona)) {
      return NextResponse.json({
        error: 'Invalid persona',
        message: 'moment.ryan 또는 atozit 페르소나만 지원됩니다.'
      }, { status: 400 });
    }

    const logId = generateId();
    const now = new Date().toISOString();

    const switchLog: PersonaSwitchLog = {
      id: logId,
      userId: session.user.id,
      previousPersona,
      newPersona,
      switchReason: switchReason || '사용자 선택',
      triggerKeywords: Array.isArray(triggerKeywords) ? triggerKeywords : [],
      confidence: Math.max(0, Math.min(1, confidence)),
      userMessage,
      action,
      timestamp: now
    };

    // 실제 구현에서는 데이터베이스에 저장
    // await db.personaSwitchLog.create({ data: switchLog });

    console.log(`🔄 페르소나 스위치 로그: ${previousPersona} → ${newPersona} (${action})`);

    // 스위치 통계 업데이트 (백그라운드 처리)
    updateSwitchAnalytics(switchLog).catch(console.error);

    return NextResponse.json({
      success: true,
      logId: logId,
      message: '페르소나 스위치가 기록되었습니다.',
      switchInfo: {
        from: previousPersona,
        to: newPersona,
        reason: switchReason,
        confidence: confidence,
        action: action
      }
    });

  } catch (error) {
    console.error('페르소나 스위치 로그 기록 실패:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '스위치 로그 기록 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 페르소나 스위치 로그 조회 API
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId') || session.user.id;
    const limit = parseInt(searchParams.get('limit') || '50');
    const personaType = searchParams.get('personaType');

    switch (action) {
      case 'get_user_switches':
        // 사용자의 페르소나 스위치 이력 조회
        const userSwitches = await getUserSwitchHistory(userId, limit, personaType);
        
        return NextResponse.json({
          success: true,
          switches: userSwitches,
          totalCount: userSwitches.length,
          userId: userId
        });

      case 'get_switch_analytics':
        // 페르소나 스위치 분석 데이터 조회
        const analytics = await getSwitchAnalytics(userId);
        
        return NextResponse.json({
          success: true,
          analytics: analytics,
          userId: userId
        });

      case 'get_popular_triggers':
        // 인기 스위치 트리거 키워드 조회
        const popularTriggers = await getPopularTriggers(personaType);
        
        return NextResponse.json({
          success: true,
          triggers: popularTriggers,
          personaType: personaType
        });

      case 'get_switch_patterns':
        // 스위치 패턴 분석 (시간대별, 요일별 등)
        const patterns = await getSwitchPatterns(userId);
        
        return NextResponse.json({
          success: true,
          patterns: patterns,
          userId: userId
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: '지원하지 않는 조회 액션입니다.'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('페르소나 스위치 로그 조회 실패:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: '스위치 로그 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 헬퍼 함수들
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function updateSwitchAnalytics(switchLog: PersonaSwitchLog): Promise<void> {
  try {
    // 실제 구현에서는 스위치 통계를 업데이트
    // - 총 스위치 횟수
    // - 페르소나별 사용 빈도
    // - 평균 신뢰도
    // - 인기 트리거 키워드
    // - 스위치 수락/거부율
    
    console.log(`📊 스위치 분석 업데이트: ${switchLog.action} switch to ${switchLog.newPersona}`);
  } catch (error) {
    console.error('스위치 분석 업데이트 실패:', error);
  }
}

async function getUserSwitchHistory(
  userId: string, 
  limit: number, 
  personaType?: string | null
): Promise<PersonaSwitchLog[]> {
  // 실제 구현에서는 데이터베이스에서 조회
  // SELECT * FROM PersonaSwitchLog 
  // WHERE userId = ? AND (personaType IS NULL OR newPersona = ?)
  // ORDER BY timestamp DESC LIMIT ?
  
  const mockSwitches: PersonaSwitchLog[] = [
    {
      id: '1',
      userId: userId,
      previousPersona: 'moment.ryan',
      newPersona: 'atozit',
      switchReason: '브랜딩 관련 질문으로 atozit 페르소나가 더 적합합니다.',
      triggerKeywords: ['브랜딩', '고객경험'],
      confidence: 0.85,
      userMessage: '우리 회사 브랜딩 전략을 어떻게 개선할 수 있을까요?',
      action: 'accepted',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      userId: userId,
      previousPersona: 'atozit',
      newPersona: 'moment.ryan',
      switchReason: 'SNS 마케팅 관련 질문으로 moment.ryan 페르소나가 더 적합합니다.',
      triggerKeywords: ['sns', '마케팅'],
      confidence: 0.92,
      userMessage: '인스타그램 콘텐츠 전략은 어떻게 세워야 하나요?',
      action: 'accepted',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  return personaType 
    ? mockSwitches.filter(s => s.newPersona === personaType).slice(0, limit)
    : mockSwitches.slice(0, limit);
}

async function getSwitchAnalytics(userId: string): Promise<any> {
  // 실제 구현에서는 데이터베이스 집계 쿼리
  return {
    totalSwitches: 15,
    acceptanceRate: 0.78,
    averageConfidence: 0.82,
    personaUsage: {
      'moment.ryan': 0.6,
      'atozit': 0.4
    },
    mostCommonTriggers: [
      { keyword: '마케팅', count: 8 },
      { keyword: '브랜딩', count: 6 },
      { keyword: 'SNS', count: 5 }
    ],
    switchPatterns: {
      byHour: Array(24).fill(0).map((_, i) => ({ hour: i, count: Math.floor(Math.random() * 5) })),
      byDayOfWeek: ['월', '화', '수', '목', '금', '토', '일'].map(day => ({ 
        day, 
        count: Math.floor(Math.random() * 10) 
      }))
    }
  };
}

async function getPopularTriggers(personaType?: string | null): Promise<any[]> {
  const allTriggers = {
    'moment.ryan': [
      { keyword: '마케팅', count: 25, confidence: 0.88 },
      { keyword: 'SNS', count: 22, confidence: 0.92 },
      { keyword: '콘텐츠', count: 18, confidence: 0.85 },
      { keyword: '캠페인', count: 15, confidence: 0.80 }
    ],
    'atozit': [
      { keyword: '브랜딩', count: 30, confidence: 0.90 },
      { keyword: '고객경험', count: 20, confidence: 0.87 },
      { keyword: '경영전략', count: 18, confidence: 0.92 },
      { keyword: '비즈니스', count: 16, confidence: 0.85 }
    ]
  };

  if (personaType && allTriggers[personaType as keyof typeof allTriggers]) {
    return allTriggers[personaType as keyof typeof allTriggers];
  }

  return [...allTriggers['moment.ryan'], ...allTriggers['atozit']]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

async function getSwitchPatterns(userId: string): Promise<any> {
  // 실제 구현에서는 시간대별, 요일별 스위치 패턴 분석
  return {
    timeOfDay: {
      morning: 0.3,    // 9-12시
      afternoon: 0.4,  // 12-18시
      evening: 0.2,    // 18-22시
      night: 0.1       // 22-9시
    },
    dayOfWeek: {
      weekday: 0.7,
      weekend: 0.3
    },
    sessionLength: {
      short: 0.4,      // < 5분
      medium: 0.4,     // 5-20분
      long: 0.2        // > 20분
    }
  };
}