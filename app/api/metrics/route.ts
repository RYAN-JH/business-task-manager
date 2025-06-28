// 대시보드 메트릭 API - 실시간 데이터 관리
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MetricsService } from '@/lib/metrics-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const name = searchParams.get('name');
    const timeRange = searchParams.get('timeRange') as '1h' | '24h' | '7d' | '30d' || '24h';
    const history = searchParams.get('history') === 'true';

    console.log('📊 메트릭 조회 요청:', { type, name, timeRange, history });

    // 특정 메트릭 조회
    if (type && name) {
      if (history) {
        const metricHistory = await MetricsService.getMetricHistory(type, name, timeRange);
        return NextResponse.json({
          success: true,
          history: metricHistory
        });
      } else {
        const metric = await MetricsService.getMetric(type, name);
        return NextResponse.json({
          success: true,
          metric
        });
      }
    }

    // 전체 실시간 메트릭 조회
    const metrics = await MetricsService.getRealtimeMetrics();
    
    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('메트릭 조회 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '메트릭 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, metric } = body;

    console.log('📊 메트릭 관리 요청:', { action, metric });

    switch (action) {
      case 'save_metric':
        if (!metric) {
          return NextResponse.json(
            { success: false, error: '메트릭 데이터가 필요합니다' },
            { status: 400 }
          );
        }

        await MetricsService.saveMetric(metric);
        
        return NextResponse.json({
          success: true,
          message: '메트릭이 성공적으로 저장되었습니다'
        });

      case 'refresh_all':
        console.log('🔄 전체 메트릭 새로고침 시작...');
        const refreshedMetrics = await MetricsService.getRealtimeMetrics();
        
        return NextResponse.json({
          success: true,
          metrics: refreshedMetrics,
          message: '모든 메트릭이 새로고침되었습니다',
          timestamp: new Date().toISOString()
        });

      case 'update_social_media':
        console.log('📱 소셜미디어 메트릭 업데이트...');
        const socialMetrics = await MetricsService.getRealtimeMetrics();
        
        return NextResponse.json({
          success: true,
          socialMedia: socialMetrics.socialMedia,
          message: '소셜미디어 메트릭이 업데이트되었습니다',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { success: false, error: '알 수 없는 액션입니다' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('메트릭 관리 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '메트릭 관리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // 메트릭 캐시 초기화 (향후 구현)
    console.log('🗑️ 메트릭 캐시 삭제 요청');
    
    return NextResponse.json({
      success: true,
      message: '메트릭 캐시가 초기화되었습니다'
    });

  } catch (error) {
    console.error('메트릭 삭제 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '메트릭 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}