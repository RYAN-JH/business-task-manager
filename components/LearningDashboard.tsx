'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, TrendingUp, Users, MessageSquare, Target, BarChart3, User, Settings, Save, CheckCircle, Home } from 'lucide-react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { colors, spacing, borderRadius, shadows, typography, animations } from '@/lib/design-system';

interface LearningStats {
  totalInteractions: number;
  positiveRate: number;
  averageScore: number;
  personaStats?: {
    [key: string]: {
      count: number;
      averageScore: number;
    };
  };
  lastUpdated: string;
}

interface UserProfile {
  userId: string;
  preferences?: {
    preferredPersona?: string;
    communicationStyle?: string;
    satisfactionTrend?: Array<{
      date: string;
      score: number;
    }>;
  };
  interactions?: any[];
}

const LearningDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'user' | 'profile'>('overview');

  useEffect(() => {
    if (session?.user?.id) {
      loadLearningData();
    }
  }, [session]);

  const loadLearningData = async () => {
    try {
      setLoading(true);
      
      // 전체 통계 로드
      setLoadingStep('학습 통계 데이터 로딩 중...');
      const statsResponse = await fetch('/api/feedback');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('📊 로드된 통계 데이터:', statsData);
        
        // 기본값으로 안전하게 설정
        const safeStats = {
          totalInteractions: statsData.analysis?.total || 0,
          positiveRate: statsData.analysis ? 
            Math.round(((statsData.analysis.helpful + statsData.analysis.veryHelpful) / Math.max(statsData.analysis.total, 1)) * 100) : 0,
          averageScore: 75, // 기본값
          personaStats: statsData.analysis?.byPersona || {},
          lastUpdated: statsData.lastUpdated || new Date().toISOString()
        };
        
        setStats(safeStats);
      } else {
        console.error('통계 데이터 로드 실패:', statsResponse.status);
        // 기본 더미 데이터
        setStats({
          totalInteractions: 0,
          positiveRate: 0,
          averageScore: 0,
          personaStats: {},
          lastUpdated: new Date().toISOString()
        });
      }
      
      // 사용자 프로필 로드
      setLoadingStep('사용자 프로필 데이터 로딩 중...');
      const profileResponse = await fetch(`/api/feedback?userId=${session?.user?.id}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData);
      }
      
    } catch (error) {
      console.error('학습 데이터 로드 실패:', error);
      // 에러 발생 시 기본 데이터 설정
      setStats({
        totalInteractions: 0,
        positiveRate: 0,
        averageScore: 0,
        personaStats: {},
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // 로그인 확인
  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background.secondary,
        fontFamily: typography.fontFamily.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card className="glass-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
          <CardContent style={{ padding: spacing[8] }}>
            <User size={64} color={colors.primary.gray[400]} style={{ margin: '0 auto', marginBottom: spacing[4] }} />
            <Typography variant="h3" style={{ marginBottom: spacing[2] }}>
              로그인이 필요합니다
            </Typography>
            <Typography variant="body" color={colors.primary.gray[600]} style={{ marginBottom: spacing[4] }}>
              학습 대시보드를 사용하려면 먼저 로그인해주세요.
            </Typography>
            <Link href="/auth/signin">
              <Button variant="primary">로그인하기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: colors.background.secondary,
        fontFamily: typography.fontFamily.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LoadingSpinner
          message={loadingStep || '학습 데이터를 불러오는 중...'}
          estimatedTime={3}
          showProgress={true}
          size="large"
          variant="default"
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: typography.fontFamily.primary
    }}>
      <Container style={{ padding: `${spacing[12]} ${spacing[6]}` }}>
        {/* Header */}
        <div style={{
          marginBottom: spacing[12],
          borderBottom: `1px solid ${colors.primary.gray[200]}`,
          paddingBottom: spacing[6]
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] }}>
            <div style={{
              padding: spacing[3],
              backgroundColor: colors.semantic.info + '15',
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.semantic.info}30`
            }}>
              <Brain size={32} color={colors.semantic.info} />
            </div>
            <Typography variant="h1" style={{ margin: 0 }}>
              TaskGenius 학습 시스템
            </Typography>
          </div>
          
          <Typography variant="body" color={colors.primary.gray[600]} style={{ marginBottom: spacing[8] }}>
            AI가 사용자와의 대화를 통해 어떻게 학습하고 성장하는지 확인해보세요
          </Typography>
          
          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: spacing[1],
            backgroundColor: colors.background.primary,
            borderRadius: borderRadius.lg,
            padding: spacing[1],
            border: `1px solid ${colors.primary.gray[200]}`,
            boxShadow: shadows.sm,
            flexWrap: 'wrap'
          }}>
            <button 
              style={{
                ...getTabStyle(activeTab === 'overview'),
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={16} />
              전체 현황
            </button>
            <button 
              style={{
                ...getTabStyle(activeTab === 'user'),
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}
              onClick={() => setActiveTab('user')}
            >
              <Users size={16} />
              개인 프로필
            </button>
            <button 
              style={{
                ...getTabStyle(activeTab === 'profile'),
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} />
              프로필 설정
            </button>
            
            <div style={{ marginLeft: 'auto', display: 'flex', gap: spacing[2] }}>
              <Button variant="secondary" size="sm" onClick={loadLearningData}>
                새로고침
              </Button>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm" leftIcon={<Home size={16} />}>
                  홈으로
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: spacing[6]
          }}>
            {/* 총 상호작용 */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <div style={{
                    padding: spacing[3],
                    backgroundColor: colors.semantic.info + '15',
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.semantic.info}30`
                  }}>
                    <MessageSquare size={20} color={colors.semantic.info} />
                  </div>
                  <Typography variant="h5" style={{ margin: 0 }}>총 상호작용</Typography>
                </div>
              </CardHeader>
              <CardContent>
                <Typography variant="h2" style={{ margin: 0, marginBottom: spacing[2] }}>
                  {stats?.totalInteractions || 0}
                </Typography>
                <Typography variant="caption" color={colors.primary.gray[600]}>
                  AI와의 총 대화 수
                </Typography>
              </CardContent>
            </Card>

            {/* 사용자 만족도 */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <div style={{
                    padding: spacing[3],
                    backgroundColor: colors.semantic.success + '15',
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.semantic.success}30`
                  }}>
                    <TrendingUp size={20} color={colors.semantic.success} />
                  </div>
                  <Typography variant="h5" style={{ margin: 0 }}>사용자 만족도</Typography>
                </div>
              </CardHeader>
              <CardContent>
                <Typography variant="h2" style={{ margin: 0, marginBottom: spacing[2] }}>
                  {stats?.positiveRate || 0}%
                </Typography>
                <Typography variant="caption" color={colors.primary.gray[600]} style={{ marginBottom: spacing[3] }}>
                  긍정적 피드백 비율
                </Typography>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: colors.primary.gray[200],
                  borderRadius: borderRadius.full,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${stats?.positiveRate || 0}%`,
                    height: '100%',
                    backgroundColor: colors.semantic.success,
                    borderRadius: borderRadius.full,
                    transition: animations.transition.slow
                  }} />
                </div>
              </CardContent>
            </Card>

            {/* 평균 점수 */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <div style={{
                    padding: spacing[3],
                    backgroundColor: colors.accent.yellow + '15',
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.accent.yellow}50`
                  }}>
                    <Target size={20} color={colors.accent.yellow} />
                  </div>
                  <Typography variant="h5" style={{ margin: 0 }}>평균 점수</Typography>
                </div>
              </CardHeader>
              <CardContent>
                <Typography variant="h2" style={{ margin: 0, marginBottom: spacing[2] }}>
                  {stats?.averageScore || 0}/100
                </Typography>
                <Typography variant="caption" color={colors.primary.gray[600]} style={{ marginBottom: spacing[3] }}>
                  조언 품질 점수
                </Typography>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: colors.primary.gray[200],
                  borderRadius: borderRadius.full,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${stats?.averageScore || 0}%`,
                    height: '100%',
                    backgroundColor: colors.accent.yellow,
                    borderRadius: borderRadius.full,
                    transition: animations.transition.slow
                  }} />
                </div>
              </CardContent>
            </Card>

            {/* 페르소나별 성과 */}
            <Card style={{ gridColumn: 'span 2' }}>
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <div style={{
                    padding: spacing[3],
                    backgroundColor: colors.semantic.error + '15',
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.semantic.error}30`
                  }}>
                    <BarChart3 size={20} color={colors.semantic.error} />
                  </div>
                  <Typography variant="h5" style={{ margin: 0 }}>페르소나별 성과</Typography>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: spacing[4]
                }}>
                  {stats.personaStats && Object.entries(stats.personaStats).map(([persona, data]) => (
                    <Card key={persona} variant="bordered">
                      <CardContent>
                        <Typography variant="h6" style={{ marginBottom: spacing[3] }}>
                          {persona === 'branding' ? '🎨 브랜딩 전문가' : 
                           persona === 'content' ? '🎯 콘텐츠 전문가' : 
                           '🤖 통합 AI'}
                        </Typography>
                        <Typography variant="caption" color={colors.primary.gray[600]} style={{ display: 'block', marginBottom: spacing[1] }}>
                          상호작용: {data.count}회
                        </Typography>
                        <Typography variant="caption" color={colors.primary.gray[600]}>
                          평균 점수: {Math.round(data.averageScore * 100)}/100
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                  {(!stats.personaStats || Object.keys(stats.personaStats).length === 0) && (
                    <Card variant="bordered">
                      <CardContent style={{ textAlign: 'center' }}>
                        <Typography variant="body" color={colors.primary.gray[500]}>
                          아직 상호작용이 없습니다
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Tab */}
        {activeTab === 'user' && userProfile && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: spacing[6]
          }}>
            {/* 개인 프로필 */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <div style={{
                    padding: spacing[3],
                    backgroundColor: colors.semantic.error + '15',
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.semantic.error}30`
                  }}>
                    <Users size={20} color={colors.semantic.error} />
                  </div>
                  <Typography variant="h5" style={{ margin: 0 }}>개인 프로필</Typography>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ marginBottom: spacing[3] }}>
                  <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                    선호 전문가: {' '}
                    <span style={{ fontWeight: typography.fontWeight.normal, color: colors.primary.gray[600] }}>
                      {userProfile.preferences?.preferredPersona === 'branding' ? '🎨 브랜딩 전문가' :
                       userProfile.preferences?.preferredPersona === 'content' ? '🎯 콘텐츠 전문가' :
                       '🤖 적응형'}
                    </span>
                  </Typography>
                </div>
                <div style={{ marginBottom: spacing[3] }}>
                  <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                    대화 스타일: {' '}
                    <span style={{ fontWeight: typography.fontWeight.normal, color: colors.primary.gray[600] }}>
                      {userProfile.preferences?.communicationStyle || '설정되지 않음'}
                    </span>
                  </Typography>
                </div>
                <div>
                  <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                    총 상호작용: {' '}
                    <span style={{ fontWeight: typography.fontWeight.normal, color: colors.primary.gray[600] }}>
                      {userProfile.interactions?.length || 0}회
                    </span>
                  </Typography>
                </div>
              </CardContent>
            </Card>

            {/* 만족도 추이 */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <div style={{
                    padding: spacing[3],
                    backgroundColor: colors.semantic.info + '15',
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.semantic.info}30`
                  }}>
                    <TrendingUp size={20} color={colors.semantic.info} />
                  </div>
                  <Typography variant="h5" style={{ margin: 0 }}>만족도 추이</Typography>
                </div>
              </CardHeader>
              <CardContent>
                {userProfile.preferences?.satisfactionTrend && userProfile.preferences.satisfactionTrend.length > 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'end', 
                    gap: spacing[1], 
                    height: '60px'
                  }}>
                    {userProfile.preferences?.satisfactionTrend?.slice(-10).map((trend, index) => (
                      <div 
                        key={index}
                        style={{
                          flex: 1,
                          height: `${trend.score * 100}%`,
                          backgroundColor: colors.semantic.info,
                          borderRadius: borderRadius.base,
                          minHeight: '6px'
                        }}
                        title={`점수: ${Math.round(trend.score * 100)}/100`}
                      />
                    ))}
                  </div>
                ) : (
                  <Typography variant="body" color={colors.primary.gray[500]}>
                    아직 충분한 데이터가 없습니다
                  </Typography>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <Typography variant="h3" style={{ margin: 0 }}>프로필 관리</Typography>
              <Typography variant="body" color={colors.primary.gray[600]}>
                AI 학습을 위한 개인화 설정을 관리할 수 있습니다
              </Typography>
            </CardHeader>
            <CardContent>
              <div style={{ textAlign: 'center', padding: spacing[12] }}>
                <div style={{
                  padding: spacing[6],
                  backgroundColor: colors.primary.gray[100],
                  borderRadius: borderRadius.lg,
                  marginBottom: spacing[6],
                  display: 'inline-block'
                }}>
                  <Settings size={48} color={colors.primary.gray[500]} />
                </div>
                <Typography variant="h4" style={{ marginBottom: spacing[3] }}>
                  프로필 설정 준비 중
                </Typography>
                <Typography variant="body" color={colors.primary.gray[600]} style={{ marginBottom: spacing[8] }}>
                  개인화된 AI 경험을 위한 상세 프로필 설정 기능이 곧 추가됩니다.
                  <br />
                  현재는 대화를 통해 AI가 자동으로 학습하고 있습니다.
                </Typography>
                <Link href="/chat" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" leftIcon={<MessageSquare size={16} />}>
                    AI와 대화하며 학습시키기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {!stats && !loading && (
          <Card style={{ textAlign: 'center' }}>
            <CardContent style={{ padding: spacing[12] }}>
              <Brain size={64} color={colors.primary.gray[400]} style={{ marginBottom: spacing[4] }} />
              <Typography variant="h4" style={{ marginBottom: spacing[2] }}>
                학습 데이터가 없습니다
              </Typography>
              <Typography variant="body" color={colors.primary.gray[600]} style={{ marginBottom: spacing[8] }}>
                AI와 대화하고 피드백을 남겨주시면 학습 진행 상황을 확인할 수 있습니다.
              </Typography>
              <Link href="/chat" style={{ textDecoration: 'none' }}>
                <Button variant="primary" leftIcon={<MessageSquare size={16} />}>
                  AI와 대화 시작하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Tab style helper function
const getTabStyle = (isActive: boolean) => ({
  padding: `${spacing[3]} ${spacing[5]}`,
  borderRadius: borderRadius.md,
  border: 'none',
  cursor: 'pointer',
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  transition: animations.transition.base,
  background: isActive ? colors.primary.black : 'transparent',
  color: isActive ? colors.primary.white : colors.primary.gray[600],
  fontFamily: typography.fontFamily.primary,
  minWidth: '120px',
  textAlign: 'center' as const,
  boxShadow: isActive ? shadows.md : 'none',
});

export default LearningDashboard;