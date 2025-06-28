'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Calendar, CheckCircle, AlertCircle, Settings, Lock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { colors, spacing, borderRadius, shadows } from '@/lib/design-system';
import { getAdminFeatures } from '@/lib/admin-utils';

interface SyncStatus {
  lastSync: string;
  nextSync: string;
  autoSyncEnabled: boolean;
  syncHistory: SyncHistoryItem[];
}

interface SyncHistoryItem {
  timestamp: string;
  status: 'success' | 'error';
  updatedFields: string[];
  platforms: string[];
}

const PersonaSyncDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSyncInterval, setAutoSyncInterval] = useState(24);
  const [mailyTestResult, setMailyTestResult] = useState<any>(null);
  const [isTestingMaily, setIsTestingMaily] = useState(false);
  const [adminFeatures, setAdminFeatures] = useState<any>({
    mailyAccess: false,
    personaSync: false,
    userManagement: false
  });
  
  const hasAdminAccess = adminFeatures.personaSync;

  // Admin 권한 확인
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (session?.user?.email) {
        console.log('🔍 세션 정보:', {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image
        });
        
        try {
          const response = await fetch('/api/admin?action=features');
          if (response.ok) {
            const data = await response.json();
            console.log('📋 Admin 기능 조회 결과:', data);
            if (data.success) {
              setAdminFeatures(data.features);
            }
          } else {
            console.warn('⚠️ Admin 기능 조회 실패:', response.status);
            const errorData = await response.json();
            console.warn('오류 상세:', errorData);
          }
        } catch (error) {
          console.error('❌ Admin 권한 확인 오류:', error);
        }
      }
    };

    checkAdminAccess();
  }, [session]);

  // 동기화 상태 조회
  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/persona-sync');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('동기화 상태 조회 실패:', error);
    }
  };

  // 즉시 동기화
  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/persona-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_now' })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ 페르소나 동기화 완료!\n업데이트된 항목: ${result.updatedFields.join(', ')}`);
        fetchSyncStatus();
      } else {
        alert(`❌ 동기화 실패: ${result.errors?.join(', ') || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('수동 동기화 실패:', error);
      alert('동기화 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 자동 동기화 설정
  const handleAutoSyncSetup = async () => {
    try {
      const response = await fetch('/api/persona-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'schedule_auto_sync',
          intervalHours: autoSyncInterval
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ 자동 동기화 설정 완료!\n${autoSyncInterval}시간마다 자동으로 업데이트됩니다.`);
        fetchSyncStatus();
      }
    } catch (error) {
      console.error('자동 동기화 설정 실패:', error);
    }
  };

  // Maily 크롤링 테스트
  const handleMailyTest = async () => {
    setIsTestingMaily(true);
    try {
      const response = await fetch('/api/test-maily');
      const result = await response.json();
      
      setMailyTestResult(result);
      
      if (result.success) {
        alert(`✅ Maily 크롤링 테스트 성공!\n구독자: ${result.data.subscriberCount}명\n최근 이슈: ${result.data.recentIssuesCount}개`);
      } else {
        alert(`❌ Maily 크롤링 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Maily 테스트 실패:', error);
      alert('Maily 테스트 중 오류가 발생했습니다.');
    } finally {
      setIsTestingMaily(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'threads': return '🧵';
      case 'instagram': return '📱';
      case 'newsletter': return '📧';
      default: return '🔗';
    }
  };

  // Admin 권한이 없는 경우 접근 제한 화면 표시
  if (!hasAdminAccess) {
    return (
      <div style={{ 
        padding: spacing[6],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <Card style={{ maxWidth: '500px', textAlign: 'center' }}>
          <CardContent style={{ padding: spacing[8] }}>
            <div style={{ 
              fontSize: '64px',
              marginBottom: spacing[4]
            }}>🔒</div>
            
            <Typography variant="h3" style={{ marginBottom: spacing[3] }}>
              Admin 전용 기능
            </Typography>
            
            <Typography variant="body" color={colors.primary.gray[600]} style={{ marginBottom: spacing[4] }}>
              페르소나 자동 동기화는 Admin 계정에서만 사용할 수 있는 기능입니다.
            </Typography>
            
            <div style={{
              padding: spacing[4],
              backgroundColor: colors.accent.yellow + '10',
              borderRadius: borderRadius.md,
              border: `1px solid ${colors.accent.yellow}30`,
              marginBottom: spacing[4]
            }}>
              <Typography variant="caption" color={colors.primary.gray[700]}>
                <strong>허용된 계정:</strong><br/>
                • gorilla1005@gmail.com (moment.ryan)<br/>
                • atozit 계정 (추후 추가 예정)
              </Typography>
            </div>
            
            <Typography variant="caption" color={colors.primary.gray[500]}>
              이 기능은 실제 Maily 뉴스레터 데이터를 크롤링하여<br/>
              AI 페르소나를 생성하기 위한 전용 도구입니다.
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: spacing[6] }}>
      {/* 디버깅용 세션 정보 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          marginBottom: spacing[4],
          padding: spacing[3],
          background: colors.background.tertiary,
          borderRadius: borderRadius.md,
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <strong>🔍 디버깅 정보:</strong><br/>
          세션 이메일: {session?.user?.email || 'null'}<br/>
          세션 이름: {session?.user?.name || 'null'}<br/>
          Admin 기능: {JSON.stringify(adminFeatures, null, 2)}<br/>
          페르소나 동기화 권한: {hasAdminAccess ? '✅' : '❌'}
        </div>
      )}

      <div style={{ marginBottom: spacing[6] }}>
        <Typography variant="h2" style={{ marginBottom: spacing[2] }}>
          🎭 페르소나 자동 동기화
        </Typography>
        <Typography variant="body" color={colors.primary.gray[600]}>
          실제 SNS 계정과 연동하여 {adminFeatures.displayName || session?.user?.email} 페르소나를 자동으로 업데이트합니다
        </Typography>
        <div style={{
          marginTop: spacing[2],
          display: 'flex',
          gap: spacing[2],
          flexWrap: 'wrap'
        }}>
          <div style={{
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: colors.semantic.success + '15',
            color: colors.semantic.success,
            borderRadius: borderRadius.sm,
            fontSize: '12px'
          }}>
            🔑 {adminFeatures.role === 'super_admin' ? 'Super Admin' : 'Admin'} 계정
          </div>
          <div style={{
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: colors.semantic.info + '15',
            color: colors.semantic.info,
            borderRadius: borderRadius.sm,
            fontSize: '12px'
          }}>
            👤 {adminFeatures.displayName}
          </div>
        </div>
      </div>

      {/* 동기화 컨트롤 */}
      <Card style={{ marginBottom: spacing[6] }}>
        <CardContent>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: spacing[4]
          }}>
            <div>
              <Typography variant="h4" style={{ marginBottom: spacing[1] }}>
                즉시 동기화
              </Typography>
              <Typography variant="body" color={colors.primary.gray[600]}>
                현재 SNS 상태를 바탕으로 페르소나를 업데이트합니다
              </Typography>
            </div>
            
            <Button
              variant="primary"
              onClick={handleManualSync}
              disabled={isLoading}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: spacing[2],
                minWidth: '140px'
              }}
            >
              <RefreshCw size={16} style={{ 
                animation: isLoading ? 'spin 1s linear infinite' : 'none' 
              }} />
              {isLoading ? '동기화 중...' : '지금 동기화'}
            </Button>
          </div>

          {/* 플랫폼 상태 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing[4]
          }}>
            {[
              { platform: 'threads', name: 'Threads', followers: '4.1만', status: 'connected' },
              { platform: 'instagram', name: 'Instagram', followers: '16.5만', status: 'connected' },
              { 
                platform: 'newsletter', 
                name: 'Maily', 
                followers: mailyTestResult?.success ? `${mailyTestResult.data.subscriberCount}명` : '연결 대기',
                status: mailyTestResult?.success ? 'connected' : 'pending'
              }
            ].map((item) => (
              <div key={item.platform} style={{
                padding: spacing[3],
                border: `1px solid ${colors.primary.gray[200]}`,
                borderRadius: borderRadius.md,
                background: colors.background.secondary
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <span style={{ fontSize: '20px' }}>{getPlatformIcon(item.platform)}</span>
                  <div>
                    <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color={colors.primary.gray[600]} style={{ display: 'block' }}>
                      {item.followers} 팔로워
                    </Typography>
                  </div>
                  {item.status === 'connected' ? (
                    <CheckCircle size={16} color={colors.semantic.success} style={{ marginLeft: 'auto' }} />
                  ) : (
                    <AlertCircle size={16} color={colors.primary.gray[400]} style={{ marginLeft: 'auto' }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Maily 테스트 섹션 */}
          <div style={{
            marginTop: spacing[4],
            padding: spacing[4],
            background: colors.background.tertiary,
            borderRadius: borderRadius.md,
            border: `1px solid ${colors.primary.gray[200]}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] }}>
              <div>
                <Typography variant="body" style={{ fontWeight: 'bold', marginBottom: spacing[1] }}>
                  📧 Maily 크롤링 테스트
                </Typography>
                <Typography variant="caption" color={colors.primary.gray[600]}>
                  Maily 뉴스레터 데이터 수집을 테스트합니다
                </Typography>
              </div>
              
              <Button
                variant="secondary"
                onClick={handleMailyTest}
                disabled={isTestingMaily}
                style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}
              >
                <RefreshCw size={16} style={{ 
                  animation: isTestingMaily ? 'spin 1s linear infinite' : 'none' 
                }} />
                {isTestingMaily ? '테스트 중...' : 'Maily 테스트'}
              </Button>
            </div>

            {mailyTestResult && (
              <div style={{
                padding: spacing[3],
                background: mailyTestResult.success ? colors.semantic.success + '10' : colors.semantic.error + '10',
                borderRadius: borderRadius.md,
                border: `1px solid ${mailyTestResult.success ? colors.semantic.success + '30' : colors.semantic.error + '30'}`
              }}>
                {mailyTestResult.success ? (
                  <div>
                    <Typography variant="caption" style={{ fontWeight: 'bold', color: colors.semantic.success, marginBottom: spacing[2], display: 'block' }}>
                      ✅ 크롤링 성공
                    </Typography>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: spacing[3] }}>
                      <div>
                        <Typography variant="caption" color={colors.primary.gray[600]}>구독자 수</Typography>
                        <Typography variant="body" style={{ fontWeight: 'bold' }}>{mailyTestResult.data.subscriberCount}명</Typography>
                      </div>
                      <div>
                        <Typography variant="caption" color={colors.primary.gray[600]}>최근 이슈</Typography>
                        <Typography variant="body" style={{ fontWeight: 'bold' }}>{mailyTestResult.data.recentIssuesCount}개</Typography>
                      </div>
                      <div>
                        <Typography variant="caption" color={colors.primary.gray[600]}>주요 주제</Typography>
                        <Typography variant="body" style={{ fontWeight: 'bold' }}>{mailyTestResult.data.contentThemes?.slice(0, 2).join(', ') || '없음'}</Typography>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Typography variant="caption" style={{ fontWeight: 'bold', color: colors.semantic.error, marginBottom: spacing[1], display: 'block' }}>
                      ❌ 크롤링 실패
                    </Typography>
                    <Typography variant="caption" color={colors.primary.gray[600]}>
                      {mailyTestResult.error}
                    </Typography>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 자동 동기화 설정 */}
      <Card style={{ marginBottom: spacing[6] }}>
        <CardContent>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: spacing[4]
          }}>
            <div>
              <Typography variant="h4" style={{ marginBottom: spacing[1] }}>
                자동 동기화 설정
              </Typography>
              <Typography variant="body" color={colors.primary.gray[600]}>
                정기적으로 페르소나를 업데이트합니다
              </Typography>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
              <select
                value={autoSyncInterval}
                onChange={(e) => setAutoSyncInterval(Number(e.target.value))}
                style={{
                  padding: `${spacing[2]} ${spacing[3]}`,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.primary.gray[300]}`,
                  background: colors.background.primary
                }}
              >
                <option value={6}>6시간마다</option>
                <option value={12}>12시간마다</option>
                <option value={24}>24시간마다</option>
                <option value={72}>3일마다</option>
                <option value={168}>일주일마다</option>
              </select>

              <Button
                variant="secondary"
                onClick={handleAutoSyncSetup}
                style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}
              >
                <Settings size={16} />
                설정 저장
              </Button>
            </div>
          </div>

          {syncStatus && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: spacing[4]
            }}>
              <div style={{
                padding: spacing[3],
                background: colors.background.tertiary,
                borderRadius: borderRadius.md
              }}>
                <Typography variant="caption" color={colors.primary.gray[600]} style={{ display: 'block', marginBottom: spacing[1] }}>
                  마지막 동기화
                </Typography>
                <Typography variant="body" style={{ fontWeight: 'bold' }}>
                  {formatDate(syncStatus.lastSync)}
                </Typography>
              </div>

              <div style={{
                padding: spacing[3],
                background: colors.background.tertiary,
                borderRadius: borderRadius.md
              }}>
                <Typography variant="caption" color={colors.primary.gray[600]} style={{ display: 'block', marginBottom: spacing[1] }}>
                  다음 동기화
                </Typography>
                <Typography variant="body" style={{ fontWeight: 'bold' }}>
                  {formatDate(syncStatus.nextSync)}
                </Typography>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 동기화 히스토리 */}
      {syncStatus?.syncHistory && (
        <Card>
          <CardContent>
            <Typography variant="h4" style={{ marginBottom: spacing[4] }}>
              동기화 히스토리
            </Typography>

            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              {syncStatus.syncHistory.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: spacing[3],
                  border: `1px solid ${colors.primary.gray[200]}`,
                  borderRadius: borderRadius.md,
                  background: item.status === 'success' ? `${colors.semantic.success}10` : `${colors.semantic.error}10`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    {item.status === 'success' ? (
                      <CheckCircle size={20} color={colors.semantic.success} />
                    ) : (
                      <AlertCircle size={20} color={colors.semantic.error} />
                    )}
                    
                    <div>
                      <Typography variant="body" style={{ fontWeight: 'bold', marginBottom: spacing[1] }}>
                        {formatDate(item.timestamp)}
                      </Typography>
                      <Typography variant="caption" color={colors.primary.gray[600]}>
                        업데이트: {item.updatedFields.join(', ')}
                      </Typography>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: spacing[1] }}>
                    {item.platforms.map(platform => (
                      <span key={platform} style={{ fontSize: '16px' }}>
                        {getPlatformIcon(platform)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PersonaSyncDashboard;