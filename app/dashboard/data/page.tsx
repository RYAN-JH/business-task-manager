'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Brain, TrendingUp, Database, FileText, Users, MessageSquare, 
  Target, BarChart3, User, Settings, Home, RefreshCw, 
  Activity, Calendar, Zap, Eye, EyeOff
} from 'lucide-react';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { colors, spacing, borderRadius, shadows, typography, animations } from '@/lib/design-system';

interface MasterProfileData {
  profile: {
    userId: string;
    version: number;
    lastUpdated: string;
    profileQuality: {
      dataRichness: number;
      consistencyScore: number;
      completenessScore: number;
    };
    writingStyle: {
      totalMessagesAnalyzed: number;
      averageMessageLength: number;
      tone: {
        formality: number;
        enthusiasm: number;
        directness: number;
        politeness: number;
      };
      frequentWords: { [key: string]: number };
      linguisticTraits: {
        preferredConjunctions: string[];
        preferredFillers: string[];
        sentencePatterns: string[];
      };
      writingPatterns: {
        usesEmojis: boolean;
        usesExclamation: boolean;
        usesEllipsis: boolean;
        usesBrackets: boolean;
        preferredEmojis: string[];
      };
    };
    businessProfile: {
      industry: string;
      businessSize: string;
      primaryGoals: string[];
      challenges: string[];
      expertise: string[];
    };
    contextMemory: {
      personalReferences: any[];
      ongoingProjects: any[];
      importantDates: any[];
      preferences: any[];
    };
    learnedPatterns: any[];
    personalizationInsights: any[];
  };
  stats: {
    totalMessages: number;
    dataRichness: number;
    consistencyScore: number;
    patternCount: number;
    personalizationPoints: number;
  };
}

interface NewsletterIssue {
  title: string;
  publishedAt: string;
  viewCount?: number;
  description?: string;
  url: string;
  ogImage?: string;
  ogDescription?: string;
}

interface SocialData {
  maily?: {
    platform: string;
    username?: string;
    subscriberCount?: number;
    totalIssues?: number;
    displayedCount?: number;
    recentIssues?: NewsletterIssue[];
    allIssues?: NewsletterIssue[];
    status: string;
    error?: string;
    message?: string;
    lastSyncTime?: string;
    fromCache?: boolean;
    adminUser?: string;
  };
  instagram?: {
    platform: string;
    status: string;
    message?: string;
  };
  threads?: {
    platform: string;
    status: string;
    message?: string;
  };
}

const DataDashboard: React.FC = () => {
  const [masterProfile, setMasterProfile] = useState<MasterProfileData | null>(null);
  const [socialData, setSocialData] = useState<SocialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'master' | 'social' | 'raw'>('overview');
  const [showRawData, setShowRawData] = useState(false);
  const [showAllNewsletters, setShowAllNewsletters] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Load master profile
      setLoadingStep('마스터 프로필 데이터 로딩 중...');
      const masterResponse = await fetch('/api/master-profile');
      if (masterResponse.ok) {
        const masterData = await masterResponse.json();
        setMasterProfile(masterData);
      }

      // Load social data (takes longer due to Maily crawling)
      setLoadingStep('소셜 미디어 데이터 수집 중...');
      const socialUrl = `/api/social-data${forceRefresh ? '?force=true' : ''}`;
      const socialResponse = await fetch(socialUrl);
      if (socialResponse.ok) {
        const socialDataResponse = await socialResponse.json();
        setSocialData(socialDataResponse.data);
      }

    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleShowMoreNewsletters = () => {
    setShowAllNewsletters(true);
  };

  const handleNewsletterClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
          message={loadingStep || '데이터를 불러오는 중...'}
          estimatedTime={7}
          showProgress={true}
          size="large"
          variant="detailed"
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background.secondary,
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
              <Database size={32} color={colors.semantic.info} />
            </div>
            <Typography variant="h1" style={{ margin: 0 }}>
              데이터 대시보드
            </Typography>
          </div>
          
          <Typography variant="body" color={colors.primary.gray[600]} style={{ marginBottom: spacing[8] }}>
            수집된 사용자 데이터, 학습 현황, 마스터 프로필을 확인하세요
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
                ...getTabStyle(activeTab === 'master'),
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}
              onClick={() => setActiveTab('master')}
            >
              <Brain size={16} />
              마스터 프로필
            </button>
            <button 
              style={{
                ...getTabStyle(activeTab === 'social'),
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}
              onClick={() => setActiveTab('social')}
            >
              <Users size={16} />
              소셜 데이터
            </button>
            <button 
              style={{
                ...getTabStyle(activeTab === 'raw'),
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}
              onClick={() => setActiveTab('raw')}
            >
              <FileText size={16} />
              원본 데이터
            </button>
            
            <div style={{ marginLeft: 'auto', display: 'flex', gap: spacing[2] }}>
              <Button variant="secondary" size="sm" onClick={() => loadAllData(true)} leftIcon={<RefreshCw size={16} />}>
                강제 동기화
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
        {activeTab === 'overview' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: spacing[6]
          }}>
            {/* Master Profile Stats */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <div style={{
                    padding: spacing[3],
                    backgroundColor: colors.semantic.info + '15',
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.semantic.info}30`
                  }}>
                    <Brain size={20} color={colors.semantic.info} />
                  </div>
                  <Typography variant="h5" style={{ margin: 0 }}>마스터 프로필</Typography>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ marginBottom: spacing[4] }}>
                  <Typography variant="h3" style={{ margin: 0, marginBottom: spacing[1] }}>
                    v{masterProfile?.profile.version || 0}
                  </Typography>
                  <Typography variant="caption" color={colors.primary.gray[600]}>
                    프로필 버전
                  </Typography>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
                  <div>
                    <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                      데이터 풍부도
                    </Typography>
                    <Typography variant="h6" color={colors.semantic.success}>
                      {masterProfile?.stats.dataRichness || 0}/100
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                      분석 메시지
                    </Typography>
                    <Typography variant="h6" color={colors.semantic.info}>
                      {masterProfile?.stats.totalMessages || 0}개
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                      학습 패턴
                    </Typography>
                    <Typography variant="h6" color={colors.accent.yellow}>
                      {masterProfile?.stats.patternCount || 0}개
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                      일관성 점수
                    </Typography>
                    <Typography variant="h6" color={colors.accent.yellow}>
                      {masterProfile?.stats.consistencyScore || 0}%
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Data Stats */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <div style={{
                    padding: spacing[3],
                    backgroundColor: colors.semantic.success + '15',
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.semantic.success}30`
                  }}>
                    <Activity size={20} color={colors.semantic.success} />
                  </div>
                  <Typography variant="h5" style={{ margin: 0 }}>소셜 미디어</Typography>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                  {socialData?.maily && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                          📧 Maily
                        </Typography>
                        <Typography variant="caption" color={colors.primary.gray[600]}>
                          {socialData.maily.status === 'active' ? 
                            `${socialData.maily.subscriberCount || 0}명 구독자` : 
                            socialData.maily.status === 'access_denied' ?
                            'Admin 전용' :
                            '연결 안됨'
                          }
                        </Typography>
                      </div>
                      <div style={{
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: socialData.maily.status === 'active' ? 
                          colors.semantic.success + '20' : 
                          socialData.maily.status === 'access_denied' ?
                          colors.accent.yellow + '20' :
                          colors.semantic.error + '20',
                        color: socialData.maily.status === 'active' ? 
                          colors.semantic.success : 
                          socialData.maily.status === 'access_denied' ?
                          colors.accent.yellow :
                          colors.semantic.error,
                        borderRadius: borderRadius.base,
                        fontSize: typography.fontSize.xs
                      }}>
                        {socialData.maily.status === 'active' ? '활성' : 
                         socialData.maily.status === 'access_denied' ? '제한됨' : '오류'}
                      </div>
                    </div>
                  )}
                  
                  {socialData?.instagram && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                          📸 Instagram
                        </Typography>
                        <Typography variant="caption" color={colors.primary.gray[600]}>
                          API 연동 예정
                        </Typography>
                      </div>
                      <div style={{
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: colors.accent.yellow + '20',
                        color: colors.accent.yellow,
                        borderRadius: borderRadius.base,
                        fontSize: typography.fontSize.xs
                      }}>
                        대기
                      </div>
                    </div>
                  )}
                  
                  {socialData?.threads && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                          🧵 Threads
                        </Typography>
                        <Typography variant="caption" color={colors.primary.gray[600]}>
                          API 연동 예정
                        </Typography>
                      </div>
                      <div style={{
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: colors.accent.yellow + '20',
                        color: colors.accent.yellow,
                        borderRadius: borderRadius.base,
                        fontSize: typography.fontSize.xs
                      }}>
                        대기
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Writing Style Analysis */}
            {masterProfile?.profile.writingStyle && (
              <Card style={{ gridColumn: 'span 2' }}>
                <CardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    <div style={{
                      padding: spacing[3],
                      backgroundColor: colors.accent.yellow + '15',
                      borderRadius: borderRadius.lg,
                      border: `1px solid ${colors.accent.yellow}30`
                    }}>
                      <Target size={20} color={colors.accent.yellow} />
                    </div>
                    <Typography variant="h5" style={{ margin: 0 }}>글쓰기 스타일 분석</Typography>
                  </div>
                </CardHeader>
                <CardContent>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: spacing[4]
                  }}>
                    <div>
                      <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
                        어투 특성
                      </Typography>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>격식도</span>
                          <span>{masterProfile.profile.writingStyle.tone.formality}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>열정도</span>
                          <span>{masterProfile.profile.writingStyle.tone.enthusiasm}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>직설성</span>
                          <span>{masterProfile.profile.writingStyle.tone.directness}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
                        글쓰기 패턴
                      </Typography>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>이모지 사용</span>
                          <span>{masterProfile.profile.writingStyle.writingPatterns.usesEmojis ? '✓' : '✗'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>느낌표 사용</span>
                          <span>{masterProfile.profile.writingStyle.writingPatterns.usesExclamation ? '✓' : '✗'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>말줄임표 사용</span>
                          <span>{masterProfile.profile.writingStyle.writingPatterns.usesEllipsis ? '✓' : '✗'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
                        주요 특징
                      </Typography>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[1] }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>평균 메시지 길이</span>
                          <span>{masterProfile.profile.writingStyle.averageMessageLength}자</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>자주 쓰는 단어</span>
                          <span>{Object.keys(masterProfile.profile.writingStyle.frequentWords).length}개</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Master Profile Tab */}
        {activeTab === 'master' && masterProfile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <Typography variant="h4" style={{ margin: 0 }}>마스터 프로필 정보</Typography>
                <Typography variant="body" color={colors.primary.gray[600]}>
                  마지막 업데이트: {new Date(masterProfile.profile.lastUpdated).toLocaleString('ko-KR')}
                </Typography>
              </CardHeader>
              <CardContent>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: spacing[6]
                }}>
                  <div>
                    <Typography variant="h6" style={{ marginBottom: spacing[3] }}>기본 정보</Typography>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                      <div>
                        <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                          사용자 ID
                        </Typography>
                        <Typography variant="body" color={colors.primary.gray[600]} style={{ fontFamily: 'monospace' }}>
                          {masterProfile.profile.userId}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                          프로필 버전
                        </Typography>
                        <Typography variant="body" color={colors.primary.gray[600]}>
                          v{masterProfile.profile.version}
                        </Typography>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Typography variant="h6" style={{ marginBottom: spacing[3] }}>품질 지표</Typography>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                      <div>
                        <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                          데이터 풍부도
                        </Typography>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                          <div style={{
                            flex: 1,
                            height: '8px',
                            backgroundColor: colors.primary.gray[200],
                            borderRadius: borderRadius.full,
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${masterProfile.profile.profileQuality.dataRichness}%`,
                              height: '100%',
                              backgroundColor: colors.semantic.success,
                              borderRadius: borderRadius.full
                            }} />
                          </div>
                          <Typography variant="caption" color={colors.primary.gray[600]}>
                            {masterProfile.profile.profileQuality.dataRichness}%
                          </Typography>
                        </div>
                      </div>
                      <div>
                        <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold }}>
                          일관성 점수
                        </Typography>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                          <div style={{
                            flex: 1,
                            height: '8px',
                            backgroundColor: colors.primary.gray[200],
                            borderRadius: borderRadius.full,
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${masterProfile.profile.profileQuality.consistencyScore}%`,
                              height: '100%',
                              backgroundColor: colors.semantic.info,
                              borderRadius: borderRadius.full
                            }} />
                          </div>
                          <Typography variant="caption" color={colors.primary.gray[600]}>
                            {masterProfile.profile.profileQuality.consistencyScore}%
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Profile */}
            {masterProfile.profile.businessProfile && (
              <Card>
                <CardHeader>
                  <Typography variant="h5" style={{ margin: 0 }}>비즈니스 프로필</Typography>
                </CardHeader>
                <CardContent>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: spacing[4]
                  }}>
                    <div>
                      <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
                        업종: {masterProfile.profile.businessProfile.industry || '설정되지 않음'}
                      </Typography>
                      <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
                        규모: {masterProfile.profile.businessProfile.businessSize || '설정되지 않음'}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
                        주요 목표
                      </Typography>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[1] }}>
                        {masterProfile.profile.businessProfile.primaryGoals?.map((goal, index) => (
                          <span key={index} style={{
                            padding: `${spacing[1]} ${spacing[2]}`,
                            backgroundColor: colors.semantic.info + '20',
                            color: colors.semantic.info,
                            borderRadius: borderRadius.base,
                            fontSize: typography.fontSize.xs
                          }}>
                            {goal}
                          </span>
                        )) || <Typography variant="caption" color={colors.primary.gray[500]}>설정된 목표가 없습니다</Typography>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Context Memory */}
            <Card>
              <CardHeader>
                <Typography variant="h5" style={{ margin: 0 }}>컨텍스트 메모리</Typography>
                <Typography variant="body" color={colors.primary.gray[600]}>
                  AI가 기억하고 있는 개인적인 정보와 선호도
                </Typography>
              </CardHeader>
              <CardContent>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: spacing[4]
                }}>
                  <div>
                    <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
                      개인적 참조
                    </Typography>
                    <Typography variant="body" color={colors.primary.gray[600]}>
                      {masterProfile.profile.contextMemory.personalReferences?.length || 0}개 항목
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
                      진행 중 프로젝트
                    </Typography>
                    <Typography variant="body" color={colors.primary.gray[600]}>
                      {masterProfile.profile.contextMemory.ongoingProjects?.length || 0}개 프로젝트
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
                      중요한 날짜
                    </Typography>
                    <Typography variant="body" color={colors.primary.gray[600]}>
                      {masterProfile.profile.contextMemory.importantDates?.length || 0}개 일정
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="body" style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
                      선호도
                    </Typography>
                    <Typography variant="body" color={colors.primary.gray[600]}>
                      {masterProfile.profile.contextMemory.preferences?.length || 0}개 설정
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Social Data Tab */}
        {activeTab === 'social' && socialData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
            {/* Maily Data */}
            {socialData.maily && (
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    <div style={{
                      padding: spacing[3],
                      backgroundColor: colors.semantic.success + '15',
                      borderRadius: borderRadius.lg,
                      border: `1px solid ${colors.semantic.success}30`
                    }}>
                      <MessageSquare size={20} color={colors.semantic.success} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Typography variant="h5" style={{ margin: 0 }}>📧 Maily 뉴스레터</Typography>
                      <Typography variant="body" color={colors.primary.gray[600]}>
                        사용자명: {socialData.maily.username || 'N/A'}
                      </Typography>
                      {socialData.maily.fromCache && (
                        <div style={{ 
                          display: 'inline-block',
                          marginTop: spacing[1],
                          padding: `${spacing[1]} ${spacing[2]}`,
                          backgroundColor: colors.semantic.info + '20',
                          color: colors.semantic.info,
                          borderRadius: borderRadius.sm,
                          fontSize: typography.fontSize.xs
                        }}>
                          💾 캐시된 데이터 (마지막 동기화: {socialData.maily.lastSyncTime ? new Date(socialData.maily.lastSyncTime).toLocaleString('ko-KR') : 'N/A'})
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {socialData.maily.status === 'active' ? (
                    <div>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                        gap: spacing[4],
                        marginBottom: spacing[6]
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <Typography variant="h3" style={{ margin: 0, color: colors.semantic.success }}>
                            {socialData.maily.subscriberCount || 0}
                          </Typography>
                          <Typography variant="caption" color={colors.primary.gray[600]}>
                            구독자
                          </Typography>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <Typography variant="h3" style={{ margin: 0, color: colors.semantic.info }}>
                            {socialData.maily.totalIssues || 0}
                          </Typography>
                          <Typography variant="caption" color={colors.primary.gray[600]}>
                            전체 발행 이슈
                          </Typography>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <Typography variant="h3" style={{ margin: 0, color: colors.accent.yellow }}>
                            {socialData.maily.recentIssues?.length || 0}
                          </Typography>
                          <Typography variant="caption" color={colors.primary.gray[600]}>
                            표시된 이슈
                          </Typography>
                        </div>
                      </div>
                      
                      {socialData.maily.recentIssues && socialData.maily.recentIssues.length > 0 && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] }}>
                            <Typography variant="h6">최근 발행 이슈</Typography>
                            <Typography variant="caption" color={colors.primary.gray[500]}>
                              {socialData.maily.totalIssues > socialData.maily.recentIssues.length ? 
                                `${socialData.maily.recentIssues.length}개 표시 (총 ${socialData.maily.totalIssues}개 중)` :
                                `전체 ${socialData.maily.recentIssues.length}개`
                              }
                            </Typography>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                            {(showAllNewsletters ? socialData.maily.allIssues || socialData.maily.recentIssues : socialData.maily.recentIssues)?.map((issue, index) => (
                              <Card 
                                key={index} 
                                variant="bordered"
                                style={{ 
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  ':hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: shadows.lg
                                  }
                                }}
                                onClick={() => handleNewsletterClick(issue.url)}
                              >
                                <CardContent>
                                  <div style={{ display: 'flex', gap: spacing[3] }}>
                                    {/* OG 이미지 */}
                                    {issue.ogImage && (
                                      <div style={{ 
                                        width: '80px',
                                        height: '80px',
                                        flexShrink: 0,
                                        borderRadius: borderRadius.md,
                                        overflow: 'hidden',
                                        border: `1px solid ${colors.primary.gray[200]}`
                                      }}>
                                        <img 
                                          src={issue.ogImage} 
                                          alt={issue.title}
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                          }}
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                          }}
                                        />
                                      </div>
                                    )}
                                    
                                    {/* 콘텐츠 */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing[2] }}>
                                        <Typography 
                                          variant="body" 
                                          style={{ 
                                            fontWeight: typography.fontWeight.semibold,
                                            lineHeight: '1.4',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                          }}
                                        >
                                          {issue.title}
                                        </Typography>
                                        {issue.viewCount && (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1], flexShrink: 0, marginLeft: spacing[2] }}>
                                            <Eye size={14} color={colors.primary.gray[500]} />
                                            <Typography variant="caption" color={colors.primary.gray[500]}>
                                              {issue.viewCount}
                                            </Typography>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <Typography variant="caption" color={colors.primary.gray[600]} style={{ display: 'block', marginBottom: spacing[2] }}>
                                        {new Date(issue.publishedAt).toLocaleDateString('ko-KR')}
                                      </Typography>
                                      
                                      {(issue.ogDescription || issue.description) && (
                                        <Typography 
                                          variant="caption" 
                                          color={colors.primary.gray[500]}
                                          style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: '1.3'
                                          }}
                                        >
                                          {issue.ogDescription || issue.description}
                                        </Typography>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            
                            {/* 더보기 버튼 */}
                            {!showAllNewsletters && socialData.maily.allIssues && socialData.maily.allIssues.length > (socialData.maily.recentIssues?.length || 0) && (
                              <div style={{ textAlign: 'center', marginTop: spacing[4] }}>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={handleShowMoreNewsletters}
                                  loading={loadingMore}
                                >
                                  더보기 ({socialData.maily.allIssues.length - (socialData.maily.recentIssues?.length || 0)}개 더 있음)
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : socialData.maily.status === 'access_denied' ? (
                    <div style={{ textAlign: 'center', padding: spacing[8] }}>
                      <div style={{ 
                        fontSize: '48px',
                        marginBottom: spacing[4]
                      }}>🔒</div>
                      <Typography variant="h6" color={colors.primary.gray[700]} style={{ marginBottom: spacing[2] }}>
                        Admin 전용 기능
                      </Typography>
                      <Typography variant="body" color={colors.primary.gray[600]} style={{ marginBottom: spacing[2] }}>
                        이 기능은 페르소나 생성을 위한 Admin 전용 기능입니다.
                      </Typography>
                      <Typography variant="caption" color={colors.primary.gray[500]}>
                        현재 허용된 계정: gorilla1005@gmail.com (moment.ryan)<br/>
                        atozit 계정은 추후 추가 예정입니다.
                      </Typography>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: spacing[8] }}>
                      <Typography variant="body" color={colors.semantic.error} style={{ marginBottom: spacing[2] }}>
                        데이터를 불러올 수 없습니다
                      </Typography>
                      <Typography variant="caption" color={colors.primary.gray[600]}>
                        {socialData.maily.error || '알 수 없는 오류가 발생했습니다'}
                      </Typography>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Instagram Placeholder */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <div style={{
                    padding: spacing[3],
                    backgroundColor: colors.accent.yellow + '15',
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.accent.yellow}30`
                  }}>
                    <Users size={20} color={colors.accent.yellow} />
                  </div>
                  <div>
                    <Typography variant="h5" style={{ margin: 0 }}>📸 Instagram</Typography>
                    <Typography variant="body" color={colors.primary.gray[600]}>
                      API 연동 준비 중
                    </Typography>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ textAlign: 'center', padding: spacing[8] }}>
                  <Typography variant="body" color={colors.primary.gray[500]} style={{ marginBottom: spacing[2] }}>
                    Instagram API 연동이 곧 추가됩니다
                  </Typography>
                  <Typography variant="caption" color={colors.primary.gray[400]}>
                    팔로워 수, 최근 게시물, 참여도 등을 확인할 수 있습니다
                  </Typography>
                </div>
              </CardContent>
            </Card>

            {/* Threads Placeholder */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <div style={{
                    padding: spacing[3],
                    backgroundColor: colors.accent.yellow + '15',
                    borderRadius: borderRadius.lg,
                    border: `1px solid ${colors.accent.yellow}30`
                  }}>
                    <MessageSquare size={20} color={colors.accent.yellow} />
                  </div>
                  <div>
                    <Typography variant="h5" style={{ margin: 0 }}>🧵 Threads</Typography>
                    <Typography variant="body" color={colors.primary.gray[600]}>
                      API 연동 준비 중
                    </Typography>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ textAlign: 'center', padding: spacing[8] }}>
                  <Typography variant="body" color={colors.primary.gray[500]} style={{ marginBottom: spacing[2] }}>
                    Threads API 연동이 곧 추가됩니다
                  </Typography>
                  <Typography variant="caption" color={colors.primary.gray[400]}>
                    팔로워 수, 최근 스레드, 참여도 등을 확인할 수 있습니다
                  </Typography>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Raw Data Tab */}
        {activeTab === 'raw' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h4" style={{ margin: 0 }}>원본 데이터 (읽기 전용)</Typography>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowRawData(!showRawData)}
                    leftIcon={showRawData ? <EyeOff size={16} /> : <Eye size={16} />}
                  >
                    {showRawData ? '숨기기' : '보기'}
                  </Button>
                </div>
                <Typography variant="body" color={colors.primary.gray[600]}>
                  시스템에서 수집하고 저장한 실제 데이터를 확인할 수 있습니다
                </Typography>
              </CardHeader>
              {showRawData && (
                <CardContent>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
                    {/* Master Profile Raw Data */}
                    {masterProfile && (
                      <div>
                        <Typography variant="h6" style={{ marginBottom: spacing[3] }}>마스터 프로필 JSON</Typography>
                        <div style={{
                          backgroundColor: colors.primary.gray[900],
                          color: colors.primary.gray[100],
                          padding: spacing[4],
                          borderRadius: borderRadius.lg,
                          fontSize: typography.fontSize.xs,
                          fontFamily: 'monospace',
                          overflow: 'auto',
                          maxHeight: '400px'
                        }}>
                          <pre>{JSON.stringify(masterProfile, null, 2)}</pre>
                        </div>
                      </div>
                    )}

                    {/* Social Data Raw Data */}
                    {socialData && (
                      <div>
                        <Typography variant="h6" style={{ marginBottom: spacing[3] }}>소셜 데이터 JSON</Typography>
                        <div style={{
                          backgroundColor: colors.primary.gray[900],
                          color: colors.primary.gray[100],
                          padding: spacing[4],
                          borderRadius: borderRadius.lg,
                          fontSize: typography.fontSize.xs,
                          fontFamily: 'monospace',
                          overflow: 'auto',
                          maxHeight: '400px'
                        }}>
                          <pre>{JSON.stringify(socialData, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
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

export default DataDashboard;