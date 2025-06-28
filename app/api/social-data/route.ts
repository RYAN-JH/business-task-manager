import { NextRequest, NextResponse } from 'next/server';
import { MailyCrawler } from '@/lib/maily-crawler';
import { SocialDataCache } from '@/lib/social-data-cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canAccessMailyData, getMailyUsernameForAdmin } from '@/lib/admin-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const forceRefresh = searchParams.get('force') === 'true';
    
    const cache = SocialDataCache.getInstance();
    let socialData = {};

    // Maily 데이터 가져오기 (Admin 전용)
    if (!platform || platform === 'maily') {
      // Admin 권한 확인
      const userEmail = session.user?.email;
      const hasMailyAccess = canAccessMailyData(userEmail);
      
      if (!hasMailyAccess) {
        console.log('🚫 Maily 접근 거부: Admin 전용 기능');
        socialData = {
          ...socialData,
          maily: {
            platform: 'maily',
            status: 'access_denied',
            error: 'Maily 데이터는 Admin 전용 기능입니다.',
            message: '이 기능은 페르소나 생성을 위한 Admin 전용 기능입니다.',
            lastUpdated: new Date().toISOString()
          }
        };
      } else {
        try {
          const mailyUsername = getMailyUsernameForAdmin(userEmail);
          if (!mailyUsername) {
            throw new Error('유효하지 않은 admin 사용자');
          }
          
          console.log(`🔑 Admin 사용자 Maily 접근: ${userEmail} -> ${mailyUsername}`);
          
          // 캐시 확인 (강제 새로고침이 아닌 경우)
          let mailyData = null;
          if (!forceRefresh) {
            const cachedData = await cache.getCachedData('maily', session.user.id);
            if (cachedData) {
              socialData = {
                ...socialData,
                maily: {
                  ...cachedData.data,
                  lastSyncTime: cachedData.lastSyncTime,
                  fromCache: true
                }
              };
              console.log('📦 Maily 캐시 데이터 사용');
            } else {
              mailyData = await new MailyCrawler(mailyUsername).crawlUserData();
            }
          } else {
            console.log('🔄 Maily 강제 새로고침');
            mailyData = await new MailyCrawler(mailyUsername).crawlUserData();
          }
          
          if (mailyData) {
            const allIssues = mailyData.recentIssues || [];
            const processedIssues = allIssues.map(issue => ({
              title: issue.title,
              publishedAt: issue.publishDate,
              viewCount: issue.viewCount,
              description: issue.excerpt?.substring(0, 100) + '...',
              url: issue.url,
              ogImage: issue.ogImage,
              ogDescription: issue.ogDescription
            }));
            
            const mailyResponse = {
              platform: 'maily',
              username: mailyUsername,
              subscriberCount: mailyData.subscriberCount,
              totalIssues: allIssues.length,
              displayedCount: Math.min(10, allIssues.length),
              allIssues: processedIssues,
              recentIssues: processedIssues.slice(0, 10),
              lastUpdated: new Date().toISOString(),
              status: 'active',
              fromCache: false,
              adminUser: userEmail
            };
            
            // 캐시 저장
            await cache.setCachedData('maily', mailyResponse, session.user.id);
            
            socialData = {
              ...socialData,
              maily: mailyResponse
            };
          }
        } catch (error) {
          console.error('Maily data fetch error:', error);
          socialData = {
            ...socialData,
            maily: {
              platform: 'maily',
              status: 'error',
              error: 'Failed to fetch data',
              lastUpdated: new Date().toISOString()
            }
          };
        }
      }
    }

    // Instagram 데이터 (준비 중)
    if (!platform || platform === 'instagram') {
      socialData = {
        ...socialData,
        instagram: {
          platform: 'instagram',
          status: 'pending',
          message: 'Instagram API integration pending',
          lastUpdated: new Date().toISOString()
        }
      };
    }

    // Threads 데이터 (준비 중)
    if (!platform || platform === 'threads') {
      socialData = {
        ...socialData,
        threads: {
          platform: 'threads',
          status: 'pending',
          message: 'Threads API integration pending',
          lastUpdated: new Date().toISOString()
        }
      };
    }

    return NextResponse.json({ data: socialData });
  } catch (error) {
    console.error('Social data API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}