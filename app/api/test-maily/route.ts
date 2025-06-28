import { NextRequest, NextResponse } from 'next/server';
import { MailyCrawler } from '@/lib/maily-crawler';

// Maily 크롤링 테스트 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || process.env.MAILY_USERNAME || 'moment-ryan';

    console.log(`🧪 Maily 크롤링 테스트 시작: ${username}`);

    // 1. 사용자명 유효성 검사
    if (!MailyCrawler.validateUsername(username)) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 사용자명입니다',
        username
      }, { status: 400 });
    }

    // 2. 페이지 접근 가능성 테스트
    const isAccessible = await MailyCrawler.testCrawling(username);
    if (!isAccessible) {
      return NextResponse.json({
        success: false,
        error: 'Maily 페이지에 접근할 수 없습니다',
        username,
        url: `https://maily.so/${username}`
      }, { status: 404 });
    }

    // 3. 실제 크롤링 실행
    const crawler = new MailyCrawler(username);
    const mailyData = await crawler.crawlUserData();

    // 4. 결과 반환
    return NextResponse.json({
      success: true,
      message: 'Maily 크롤링 성공',
      data: {
        username,
        url: `https://maily.so/${username}`,
        profile: mailyData.profileInfo,
        subscriberCount: mailyData.subscriberCount,
        recentIssuesCount: mailyData.recentIssues.length,
        contentThemes: mailyData.contentThemes,
        engagement: mailyData.engagement,
        lastUpdated: mailyData.lastUpdated,
        
        // 샘플 이슈 (처음 2개만)
        sampleIssues: mailyData.recentIssues.slice(0, 2).map(issue => ({
          title: issue.title,
          excerpt: issue.excerpt,
          publishDate: issue.publishDate,
          topics: issue.topics,
          url: issue.url
        }))
      }
    });

  } catch (error) {
    console.error('Maily 크롤링 테스트 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Maily 크롤링 중 오류 발생',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// POST 요청으로 특정 사용자명 테스트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({
        success: false,
        error: '사용자명이 필요합니다'
      }, { status: 400 });
    }

    // GET 요청과 동일한 로직 수행
    const url = new URL(request.url);
    url.searchParams.set('username', username);
    
    const testRequest = new NextRequest(url.toString(), {
      method: 'GET',
      headers: request.headers
    });

    return await GET(testRequest);

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '요청 처리 중 오류 발생',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}