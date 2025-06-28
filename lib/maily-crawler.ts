// Maily 뉴스레터 크롤링 시스템
import * as cheerio from 'cheerio';

export interface MailyData {
  subscriberCount: number;
  recentIssues: MailyIssue[];
  profileInfo: MailyProfile;
  engagement: MailyEngagement;
  contentThemes: string[];
  lastUpdated: string;
}

export interface MailyIssue {
  id: string;
  title: string;
  content: string;
  publishDate: string;
  viewCount?: number;
  likeCount?: number;
  url: string;
  excerpt: string;
  topics: string[];
  ogImage?: string;
  ogDescription?: string;
}

export interface MailyProfile {
  username: string;
  displayName: string;
  bio: string;
  profileImage?: string;
  joinDate?: string;
  totalIssues: number;
}

export interface MailyEngagement {
  averageViews: number;
  averageLikes: number;
  engagementRate: number;
  growthRate: number;
  topPerformingIssues: string[];
}

export class MailyCrawler {
  private baseUrl = 'https://maily.so';
  private userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  constructor(private username: string) {}

  // 메인 크롤링 함수
  async crawlUserData(): Promise<MailyData> {
    console.log(`📧 Maily 크롤링 시작: ${this.username}`);
    
    try {
      // 1. 프로필 페이지 크롤링
      const profileData = await this.crawlProfile();
      
      // 2. 최근 이슈들 크롤링
      const recentIssues = await this.crawlRecentIssues();
      
      // 3. 개별 이슈 상세 정보 크롤링
      const detailedIssues = await this.crawlIssueDetails(recentIssues);
      
      // 4. 데이터 분석 및 통계 계산
      const engagement = this.calculateEngagement(detailedIssues);
      const themes = this.extractContentThemes(detailedIssues);
      
      return {
        subscriberCount: profileData.subscriberCount || 0,
        recentIssues: detailedIssues,
        profileInfo: profileData.profile,
        engagement,
        contentThemes: themes,
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Maily 크롤링 실패:', error);
      throw error;
    }
  }

  // 프로필 페이지 크롤링
  private async crawlProfile(): Promise<{
    profile: MailyProfile;
    subscriberCount?: number;
  }> {
    const profileUrl = `${this.baseUrl}/${this.username}`;
    console.log(`📄 프로필 크롤링: ${profileUrl}`);
    
    try {
      const response = await fetch(profileUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Maily 페이지 구조 분석하여 데이터 추출
      const profile: MailyProfile = {
        username: this.username,
        displayName: this.extractDisplayName($),
        bio: this.extractBio($),
        profileImage: this.extractProfileImage($),
        joinDate: this.extractJoinDate($),
        totalIssues: this.extractTotalIssues($)
      };

      const subscriberCount = this.extractSubscriberCount($);

      console.log('✅ 프로필 크롤링 완료:', { 
        displayName: profile.displayName,
        totalIssues: profile.totalIssues,
        subscriberCount 
      });

      return { profile, subscriberCount };

    } catch (error) {
      console.error('프로필 크롤링 실패:', error);
      throw error;
    }
  }

  // 최근 이슈 목록 크롤링
  private async crawlRecentIssues(): Promise<Partial<MailyIssue>[]> {
    const profileUrl = `${this.baseUrl}/${this.username}`;
    console.log(`📑 이슈 목록 크롤링: ${profileUrl}`);
    
    try {
      const response = await fetch(profileUrl, {
        headers: { 'User-Agent': this.userAgent }
      });

      const html = await response.text();
      const $ = cheerio.load(html);

      // 디버깅: HTML 구조 분석
      console.log('📊 페이지 구조 분석:');
      console.log(`- 전체 링크 수: ${$('a').length}`);
      console.log(`- 제목 태그 수: ${$('h1, h2, h3, h4, h5, h6').length}`);
      console.log(`- div 태그 수: ${$('div').length}`);
      
      // 링크 중에서 뉴스레터 같은 패턴 찾기
      const links = $('a');
      console.log('🔗 발견된 링크들:');
      links.each((i, el) => {
        if (i < 20) { // 처음 20개만
          const text = $(el).text().trim();
          const href = $(el).attr('href');
          if (text && text.length > 2 && text.length < 100) {
            console.log(`  - "${text}" -> ${href}`);
          }
        }
      });

      const issues: Partial<MailyIssue>[] = [];

      // Maily 뉴스레터 링크 패턴 기반으로 직접 추출
      console.log('🎯 Maily 뉴스레터 링크 추출 시작');
      
      $('a').each((index, element) => {
        const $el = $(element);
        const href = $el.attr('href');
        const titleText = $el.text().trim();
        
        // Maily 뉴스레터 링크 패턴: /moment.ryan/posts/xxxxx 또는 https://maily.so/moment.ryan/posts/xxxxx
        const isNewsletterLink = href && (
          href.includes('/posts/') || 
          (href.startsWith('https://maily.so/') && href.includes('/posts/'))
        );
        
        if (isNewsletterLink && titleText && titleText.length > 10) {
          // 제목에서 카테고리 부분 제거하고 실제 제목만 추출
          const lines = titleText.split('\n').map(line => line.trim()).filter(line => line);
          let cleanTitle = '';
          
          if (lines.length >= 2) {
            // 첫 번째 줄이 카테고리, 두 번째 줄이 실제 제목인 경우가 많음
            cleanTitle = lines[1] || lines[0];
          } else {
            cleanTitle = lines[0] || titleText;
          }
          
          // 너무 짧거나 의미없는 제목 제외
          if (cleanTitle.length > 5 && cleanTitle.length < 150) {
            const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
            
            const issue: Partial<MailyIssue> = {
              id: href.split('/').pop() || `issue_${issues.length}`,
              title: cleanTitle,
              excerpt: lines.length > 2 ? lines[2] : '', // 세 번째 줄이 있으면 발췌문으로 사용
              publishDate: new Date().toISOString(), // 실제로는 페이지에서 추출해야 함
              url: fullUrl,
              viewCount: 0,
              likeCount: 0
            };

            issues.push(issue);
            console.log(`✅ 뉴스레터 발견: "${cleanTitle}" -> ${fullUrl}`);
          }
        }
      });
      
      console.log(`📧 총 ${issues.length}개 뉴스레터 발견`);

      console.log(`✅ 이슈 목록 크롤링 완료: ${issues.length}개`);
      return issues;

    } catch (error) {
      console.error('이슈 목록 크롤링 실패:', error);
      return [];
    }
  }

  // 개별 이슈 상세 정보 크롤링
  private async crawlIssueDetails(issues: Partial<MailyIssue>[]): Promise<MailyIssue[]> {
    console.log(`📖 이슈 상세 정보 크롤링 시작: ${issues.length}개`);
    
    const detailedIssues: MailyIssue[] = [];

    // 전체 이슈 상세 크롤링 (단, 서버 부하를 고려해 최대 50개로 제한)
    const maxCrawl = Math.min(issues.length, 50);
    console.log(`📖 전체 이슈 크롤링: ${maxCrawl}개 (총 ${issues.length}개 중)`);
    
    for (const issue of issues.slice(0, maxCrawl)) {
      if (!issue.url) continue;

      try {
        await this.delay(1000); // 1초 딜레이 (서버 부하 방지)
        
        const response = await fetch(issue.url, {
          headers: { 'User-Agent': this.userAgent }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const detailedIssue: MailyIssue = {
          id: issue.id || this.generateIssueId(issue.url),
          title: issue.title || this.extractDetailedTitle($),
          content: this.extractIssueContent($),
          excerpt: issue.excerpt || this.extractDetailedExcerpt($),
          publishDate: issue.publishDate || this.extractDetailedPublishDate($),
          url: issue.url,
          viewCount: issue.viewCount || this.extractDetailedViewCount($),
          likeCount: issue.likeCount || this.extractDetailedLikeCount($),
          topics: this.extractIssueTopics($),
          ogImage: this.extractOgImage($),
          ogDescription: this.extractOgDescription($)
        };

        detailedIssues.push(detailedIssue);
        console.log(`✅ 이슈 상세 크롤링 완료: ${detailedIssue.title}`);

      } catch (error) {
        console.error(`이슈 상세 크롤링 실패 (${issue.url}):`, error);
      }
    }

    return detailedIssues;
  }

  // 데이터 추출 헬퍼 메서드들
  private extractDisplayName($: cheerio.Root): string {
    return $('h1, .profile-name, .author-name, [data-testid="profile-name"]').first().text().trim() || this.username;
  }

  private extractBio($: cheerio.Root): string {
    return $('.bio, .description, .profile-bio, [data-testid="profile-bio"]').first().text().trim() || '';
  }

  private extractProfileImage($: cheerio.Root): string | undefined {
    const src = $('img[class*="profile"], img[class*="avatar"], .profile-image img').first().attr('src');
    return src ? this.resolveUrl(src) : undefined;
  }

  private extractJoinDate($: cheerio.Root): string | undefined {
    const joinText = $('.join-date, .member-since, [data-testid="join-date"]').first().text();
    return joinText || undefined;
  }

  private extractTotalIssues($: cheerio.Root): number {
    // Maily 페이지에서 이슈 개수 추출을 위한 다양한 셀렉터 시도
    const selectors = [
      '.issue-count', '.total-issues', '[data-testid="issue-count"]',
      '.newsletter-count', '.post-count', '.article-count',
      'span:contains("개")', 'div:contains("편")', 'p:contains("편")',
      '.count', '.num', '.number'
    ];
    
    for (const selector of selectors) {
      const text = $(selector).text();
      const match = text.match(/(\d+)/);
      if (match && parseInt(match[1], 10) > 0) {
        console.log(`✅ 이슈 개수 발견 (${selector}): ${match[1]}`);
        return parseInt(match[1], 10);
      }
    }
    
    // 전체 텍스트에서 "편", "개", "issue" 등의 키워드와 함께 나오는 숫자 찾기
    const bodyText = $('body').text();
    const patterns = [
      /(\d+)\s*편/g,
      /(\d+)\s*개/g,
      /(\d+)\s*issues?/gi,
      /(\d+)\s*newsletters?/gi,
      /(\d+)\s*posts?/gi
    ];
    
    for (const pattern of patterns) {
      const matches = [...bodyText.matchAll(pattern)];
      if (matches.length > 0) {
        const num = parseInt(matches[0][1], 10);
        if (num > 0) {
          console.log(`✅ 패턴에서 이슈 개수 발견: ${num}`);
          return num;
        }
      }
    }
    
    return 0;
  }

  private extractSubscriberCount($: cheerio.Root): number | undefined {
    const subscriberText = $('.subscriber-count, .followers, [data-testid="subscriber-count"]').first().text();
    
    // "1.2K", "15.3K", "2.1M" 형태 파싱
    const match = subscriberText.match(/([\d.]+)([KM]?)/i);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2]?.toUpperCase();
      
      if (unit === 'K') return Math.round(num * 1000);
      if (unit === 'M') return Math.round(num * 1000000);
      return Math.round(num);
    }
    
    return undefined;
  }

  private extractIssueId($el: cheerio.Cheerio): string {
    return $el.attr('data-id') || $el.find('[data-id]').attr('data-id') || '';
  }

  private extractIssueTitle($el: cheerio.Cheerio): string {
    return $el.find('h2, h3, .title, .issue-title, [data-testid="issue-title"]').first().text().trim();
  }

  private extractIssueExcerpt($el: cheerio.Cheerio): string {
    return $el.find('.excerpt, .summary, .description, p').first().text().trim().substring(0, 200);
  }

  private extractPublishDate($el: cheerio.Cheerio): string {
    const dateText = $el.find('.date, .publish-date, time, [data-testid="publish-date"]').first().text().trim();
    return dateText || new Date().toISOString();
  }

  private extractIssueUrl($el: cheerio.Cheerio): string {
    const href = $el.find('a').first().attr('href') || $el.attr('href') || '';
    return this.resolveUrl(href);
  }

  private extractViewCount($el: cheerio.Cheerio): number | undefined {
    const viewText = $el.find('.view-count, .views, [data-testid="view-count"]').first().text();
    const match = viewText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private extractLikeCount($el: cheerio.Cheerio): number | undefined {
    const likeText = $el.find('.like-count, .likes, [data-testid="like-count"]').first().text();
    const match = likeText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  // 상세 페이지 전용 추출 메서드들
  private extractDetailedTitle($: cheerio.Root): string {
    return $('h1, .article-title, .issue-title').first().text().trim();
  }

  private extractIssueContent($: cheerio.Root): string {
    const content = $('.content, .article-content, .issue-content, main').first();
    
    // HTML 태그 제거하고 텍스트만 추출
    content.find('script, style, nav, header, footer').remove();
    return content.text().trim().substring(0, 2000); // 처음 2000자만
  }

  private extractDetailedExcerpt($: cheerio.Root): string {
    return $('.excerpt, .summary, .lead').first().text().trim().substring(0, 200);
  }

  private extractDetailedPublishDate($: cheerio.Root): string {
    return $('time, .publish-date, .date').first().attr('datetime') || 
           $('time, .publish-date, .date').first().text().trim() || 
           new Date().toISOString();
  }

  private extractDetailedViewCount($: cheerio.Root): number | undefined {
    const viewText = $('.view-count, .stats .views').first().text();
    const match = viewText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private extractDetailedLikeCount($: cheerio.Root): number | undefined {
    const likeText = $('.like-count, .stats .likes').first().text();
    const match = likeText.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private extractIssueTopics($: cheerio.Root): string[] {
    const topics: string[] = [];
    
    $('.tag, .topic, .category, .hashtag').each((_, el) => {
      const topic = $(el).text().trim();
      if (topic) topics.push(topic);
    });

    // 콘텐츠에서 키워드 추출
    const content = this.extractIssueContent($);
    const keywords = this.extractKeywordsFromContent(content);
    
    return [...new Set([...topics, ...keywords])].slice(0, 10);
  }

  // 유틸리티 메서드들
  private resolveUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return this.baseUrl + url;
    return url;
  }

  private generateIssueId(url: string): string {
    return url.split('/').pop() || `issue_${Date.now()}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private extractKeywordsFromContent(content: string): string[] {
    const keywords = ['브랜딩', '마케팅', '콘텐츠', '전략', '성장', '스타트업', '비즈니스', '디자인', '개발', 'AI'];
    return keywords.filter(keyword => content.includes(keyword));
  }

  // OG 이미지 추출
  private extractOgImage($: cheerio.Root): string | undefined {
    const ogImage = $('meta[property="og:image"]').attr('content') ||
                   $('meta[name="twitter:image"]').attr('content') ||
                   $('meta[property="twitter:image"]').attr('content') ||
                   $('meta[name="image"]').attr('content');
    return ogImage ? this.resolveUrl(ogImage) : undefined;
  }

  // OG 설명 추출
  private extractOgDescription($: cheerio.Root): string | undefined {
    const ogDesc = $('meta[property="og:description"]').attr('content') ||
                  $('meta[name="description"]').attr('content') ||
                  $('meta[name="twitter:description"]').attr('content');
    return ogDesc || undefined;
  }

  // 분석 메서드들
  private calculateEngagement(issues: MailyIssue[]): MailyEngagement {
    const validIssues = issues.filter(issue => issue.viewCount && issue.likeCount);
    
    if (validIssues.length === 0) {
      return {
        averageViews: 0,
        averageLikes: 0,
        engagementRate: 0,
        growthRate: 0,
        topPerformingIssues: []
      };
    }

    const totalViews = validIssues.reduce((sum, issue) => sum + (issue.viewCount || 0), 0);
    const totalLikes = validIssues.reduce((sum, issue) => sum + (issue.likeCount || 0), 0);
    
    const averageViews = Math.round(totalViews / validIssues.length);
    const averageLikes = Math.round(totalLikes / validIssues.length);
    const engagementRate = averageViews > 0 ? Math.round((averageLikes / averageViews) * 100) : 0;

    // 상위 성과 이슈들
    const topPerforming = validIssues
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 3)
      .map(issue => issue.title);

    return {
      averageViews,
      averageLikes,
      engagementRate,
      growthRate: 0, // 계산 복잡하므로 일단 0
      topPerformingIssues: topPerforming
    };
  }

  private extractContentThemes(issues: MailyIssue[]): string[] {
    const allTopics = issues.flatMap(issue => issue.topics);
    const topicCount: { [topic: string]: number } = {};
    
    allTopics.forEach(topic => {
      topicCount[topic] = (topicCount[topic] || 0) + 1;
    });

    return Object.entries(topicCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([topic]) => topic);
  }

  // 정적 메서드: 사용자명 유효성 검사
  static validateUsername(username: string): boolean {
    return /^[a-zA-Z0-9._-]+$/.test(username) && username.length >= 3 && username.length <= 30;
  }

  // 정적 메서드: 크롤링 테스트
  static async testCrawling(username: string): Promise<boolean> {
    try {
      const crawler = new MailyCrawler(username);
      const profileUrl = `https://maily.so/${username}`;
      
      const response = await fetch(profileUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': crawler.userAgent }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
}