import fs from 'fs/promises';
import path from 'path';

export interface CachedSocialData {
  timestamp: number;
  data: any;
  lastSyncTime: string;
  version: number;
}

export class SocialDataCache {
  private static instance: SocialDataCache;
  private cacheDir: string;
  private readonly CACHE_DURATION_HOURS = 24;

  private constructor() {
    this.cacheDir = path.join(process.cwd(), 'social-data-cache');
  }

  static getInstance(): SocialDataCache {
    if (!SocialDataCache.instance) {
      SocialDataCache.instance = new SocialDataCache();
    }
    return SocialDataCache.instance;
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.access(this.cacheDir);
    } catch {
      await fs.mkdir(this.cacheDir, { recursive: true });
    }
  }

  private getCacheFilePath(platform: string, userId?: string): string {
    const fileName = userId ? `${platform}_${userId}.json` : `${platform}.json`;
    return path.join(this.cacheDir, fileName);
  }

  async getCachedData(platform: string, userId?: string): Promise<CachedSocialData | null> {
    try {
      await this.ensureCacheDir();
      const filePath = this.getCacheFilePath(platform, userId);
      const data = await fs.readFile(filePath, 'utf-8');
      const cachedData: CachedSocialData = JSON.parse(data);
      
      // 캐시 유효성 검사 (24시간)
      const hoursPassed = (Date.now() - cachedData.timestamp) / (1000 * 60 * 60);
      if (hoursPassed < this.CACHE_DURATION_HOURS) {
        console.log(`📦 캐시된 ${platform} 데이터 사용 (${hoursPassed.toFixed(1)}시간 전 동기화)`);
        return cachedData;
      }
      
      console.log(`⏰ ${platform} 캐시 만료 (${hoursPassed.toFixed(1)}시간 경과)`);
      return null;
    } catch (error) {
      console.log(`📭 ${platform} 캐시 없음`);
      return null;
    }
  }

  async setCachedData(platform: string, data: any, userId?: string): Promise<void> {
    try {
      await this.ensureCacheDir();
      const filePath = this.getCacheFilePath(platform, userId);
      
      const cachedData: CachedSocialData = {
        timestamp: Date.now(),
        data,
        lastSyncTime: new Date().toISOString(),
        version: 1
      };
      
      await fs.writeFile(filePath, JSON.stringify(cachedData, null, 2));
      console.log(`💾 ${platform} 데이터 캐시 저장 완료`);
    } catch (error) {
      console.error(`캐시 저장 실패 (${platform}):`, error);
    }
  }

  async forceClearCache(platform?: string, userId?: string): Promise<void> {
    try {
      await this.ensureCacheDir();
      
      if (platform) {
        const filePath = this.getCacheFilePath(platform, userId);
        await fs.unlink(filePath);
        console.log(`🗑️ ${platform} 캐시 삭제 완료`);
      } else {
        // 모든 캐시 삭제
        const files = await fs.readdir(this.cacheDir);
        for (const file of files) {
          await fs.unlink(path.join(this.cacheDir, file));
        }
        console.log('🗑️ 전체 소셜 데이터 캐시 삭제 완료');
      }
    } catch (error) {
      console.error('캐시 삭제 실패:', error);
    }
  }

  async getCacheStatus(): Promise<{ [platform: string]: CachedSocialData | null }> {
    try {
      await this.ensureCacheDir();
      const files = await fs.readdir(this.cacheDir);
      const status: { [platform: string]: CachedSocialData | null } = {};
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const platform = file.replace('.json', '');
          const filePath = path.join(this.cacheDir, file);
          try {
            const data = await fs.readFile(filePath, 'utf-8');
            status[platform] = JSON.parse(data);
          } catch {
            status[platform] = null;
          }
        }
      }
      
      return status;
    } catch (error) {
      console.error('캐시 상태 확인 실패:', error);
      return {};
    }
  }
}