'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, Brain, TrendingUp, CheckCircle, AlertCircle,
  BarChart3, Zap, Eye, Calendar, Filter, Download, RefreshCw,
  Star, MessageSquare, Target, Lightbulb, Award
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { colors, spacing, borderRadius, shadows } from '@/lib/design-system';

interface SessionSummary {
  id: string;
  sessionId: string;
  personaType: 'moment.ryan' | 'atozit';
  keyTopics: string[];
  expertiseAreas: string[];
  summaryContent: string;
  learningValue: number;
  createdAt: string;
  appliedToPersona: boolean;
}

interface LearningAnalytics {
  sessionCount: number;
  totalLearningTime: number;
  averageSessionQuality: number;
  topTopics: string[];
  learningTrend: number[];
  personaUsage: Record<string, number>;
  knowledgeGrowth: {
    conceptsLearned: number;
    expertiseAreas: number;
    personalityInsights: number;
  };
  timeDistribution: Record<string, number>;
}

interface SessionInsight {
  sessionId: string;
  duration: number;
  messageCount: number;
  topicFlow: Array<{
    topic: string;
    messages: number;
    startTime: number;
  }>;
  learningMoments: Array<{
    timestamp: string;
    type: string;
    content: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  qualityBreakdown: Record<string, number>;
  recommendedFollowUp: string[];
}

const SessionSummaryDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<any>(null);
  const [sessionInsights, setSessionInsights] = useState<SessionInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summaries' | 'analytics' | 'insights'>('summaries');
  const [filters, setFilters] = useState({
    personaType: 'all',
    timeRange: '7d',
    qualityThreshold: 0
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session, filters]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 병렬로 데이터 요청
      const [summariesRes, analyticsRes] = await Promise.all([
        fetch(`/api/session-summary?action=get_session_summaries&limit=20&personaType=${filters.personaType !== 'all' ? filters.personaType : ''}`),
        fetch(`/api/session-summary?action=get_learning_analytics&timeRange=${filters.timeRange}`)
      ]);

      const [summariesData, analyticsData] = await Promise.all([
        summariesRes.json(),
        analyticsRes.json()
      ]);

      if (summariesData.success) {
        setSummaries(summariesData.summaries.filter((s: SessionSummary) => 
          s.learningValue >= filters.qualityThreshold
        ));
      }
      
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }

    } catch (error) {
      console.error('대시보드 데이터 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummaryClick = async (summary: SessionSummary) => {
    try {
      const [detailsRes, insightsRes] = await Promise.all([
        fetch(`/api/session-summary?action=get_summary_details&summaryId=${summary.id}`),
        fetch(`/api/session-summary?action=get_session_insights&sessionId=${summary.sessionId}`)
      ]);

      const [detailsData, insightsData] = await Promise.all([
        detailsRes.json(),
        insightsRes.json()
      ]);

      if (detailsData.success) {
        setSelectedSummary(detailsData.summary);
      }
      
      if (insightsData.success) {
        setSessionInsights(insightsData.insights);
      }

    } catch (error) {
      console.error('세션 상세 정보 조회 실패:', error);
    }
  };

  const getPersonaInfo = (persona: string) => {
    return persona === 'moment.ryan' 
      ? { name: 'Moment Ryan', icon: '🎯', color: colors.accent.blue }
      : { name: 'AtoZ IT', icon: '🏢', color: colors.accent.purple };
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return colors.semantic.success;
    if (score >= 60) return colors.semantic.warning;
    return colors.semantic.error;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  const generateSessionReport = async (summaryId: string) => {
    try {
      // 실제로는 PDF 또는 다른 형식으로 리포트 생성
      alert('리포트 생성 기능은 준비 중입니다.');
    } catch (error) {
      console.error('리포트 생성 실패:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: spacing[6] }}>
        <LoadingSpinner message="세션 요약 데이터를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div style={{ padding: spacing[6] }}>
      {/* 헤더 */}
      <div style={{ marginBottom: spacing[6] }}>
        <Typography variant="h2" style={{ marginBottom: spacing[2] }}>
          📋 세션 요약 & 학습 분석
        </Typography>
        <Typography variant="body" color={colors.primary.gray[600]}>
          AI 페르소나 학습 과정의 상세 분석 및 품질 관리
        </Typography>
      </div>

      {/* 필터 및 컨트롤 */}
      <Card style={{ marginBottom: spacing[6] }}>
        <CardContent>
          <div style={{ 
            display: 'flex', 
            gap: spacing[4], 
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <Filter size={16} color={colors.primary.gray[600]} />
              <Typography variant="caption">필터:</Typography>
            </div>
            
            <select
              value={filters.personaType}
              onChange={(e) => setFilters(prev => ({ ...prev, personaType: e.target.value }))}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.primary.gray[300]}`,
                background: colors.background.primary
              }}
            >
              <option value="all">모든 페르소나</option>
              <option value="moment.ryan">Moment Ryan</option>
              <option value="atozit">AtoZ IT</option>
            </select>

            <select
              value={filters.timeRange}
              onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.primary.gray[300]}`,
                background: colors.background.primary
              }}
            >
              <option value="1d">최근 1일</option>
              <option value="7d">최근 7일</option>
              <option value="30d">최근 30일</option>
              <option value="90d">최근 90일</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <Typography variant="caption">품질 임계값:</Typography>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.qualityThreshold}
                onChange={(e) => setFilters(prev => ({ ...prev, qualityThreshold: parseInt(e.target.value) }))}
                style={{ width: '100px' }}
              />
              <Typography variant="caption">{filters.qualityThreshold}점</Typography>
            </div>

            <Button
              variant="secondary"
              onClick={fetchDashboardData}
              style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}
            >
              <RefreshCw size={16} />
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <div style={{ 
        display: 'flex', 
        gap: spacing[2], 
        marginBottom: spacing[6],
        borderBottom: `1px solid ${colors.primary.gray[200]}`,
        paddingBottom: spacing[3]
      }}>
        {[
          { key: 'summaries', label: '세션 요약', icon: FileText },
          { key: 'analytics', label: '학습 분석', icon: BarChart3 },
          { key: 'insights', label: '인사이트', icon: Lightbulb }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeTab === key ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(key as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2]
            }}
          >
            <Icon size={16} />
            {label}
          </Button>
        ))}
      </div>

      {/* 세션 요약 탭 */}
      {activeTab === 'summaries' && (
        <div>
          {summaries.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: selectedSummary ? '1fr 1fr' : '1fr', gap: spacing[4] }}>
              {/* 요약 목록 */}
              <div>
                <Typography variant="h4" style={{ marginBottom: spacing[4] }}>
                  📋 세션 요약 목록 ({summaries.length})
                </Typography>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                  {summaries.map((summary) => {
                    const personaInfo = getPersonaInfo(summary.personaType);
                    const qualityColor = getQualityColor(summary.learningValue);
                    
                    return (
                      <Card
                        key={summary.id}
                        style={{
                          cursor: 'pointer',
                          border: selectedSummary?.id === summary.id 
                            ? `2px solid ${colors.accent.blue}` 
                            : `1px solid ${colors.primary.gray[200]}`,
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleSummaryClick(summary)}
                      >
                        <CardContent>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[2] }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                              <span style={{ fontSize: '20px' }}>{personaInfo.icon}</span>
                              <Typography variant="body" style={{ fontWeight: 'bold', color: personaInfo.color }}>
                                {personaInfo.name}
                              </Typography>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                              <div style={{
                                padding: `${spacing[1]} ${spacing[2]}`,
                                backgroundColor: qualityColor + '20',
                                color: qualityColor,
                                borderRadius: borderRadius.sm,
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                품질 {summary.learningValue}점
                              </div>
                              
                              {summary.appliedToPersona ? (
                                <CheckCircle size={16} color={colors.semantic.success} />
                              ) : (
                                <AlertCircle size={16} color={colors.semantic.warning} />
                              )}
                            </div>
                          </div>
                          
                          <Typography variant="body" style={{ marginBottom: spacing[2] }}>
                            {summary.summaryContent}
                          </Typography>
                          
                          <div style={{ marginBottom: spacing[2] }}>
                            <Typography variant="caption" color={colors.primary.gray[600]} style={{ marginBottom: spacing[1], display: 'block' }}>
                              주요 주제
                            </Typography>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[1] }}>
                              {summary.keyTopics.slice(0, 3).map((topic, index) => (
                                <span key={index} style={{
                                  padding: `${spacing[1]} ${spacing[2]}`,
                                  backgroundColor: personaInfo.color + '20',
                                  color: personaInfo.color,
                                  borderRadius: borderRadius.sm,
                                  fontSize: '12px'
                                }}>
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color={colors.primary.gray[500]}>
                              {new Date(summary.createdAt).toLocaleString('ko-KR')}
                            </Typography>
                            
                            <Button
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                generateSessionReport(summary.id);
                              }}
                              style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}
                            >
                              <Download size={14} />
                              리포트
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* 선택된 요약 상세 */}
              {selectedSummary && (
                <div>
                  <Typography variant="h4" style={{ marginBottom: spacing[4] }}>
                    🔍 세션 상세 분석
                  </Typography>
                  
                  <Card style={{ marginBottom: spacing[4] }}>
                    <CardHeader>
                      <Typography variant="h4">요약 정보</Typography>
                    </CardHeader>
                    <CardContent>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4], marginBottom: spacing[4] }}>
                        <div>
                          <Typography variant="caption" color={colors.primary.gray[600]}>전체 품질 점수</Typography>
                          <Typography variant="h3" style={{ color: getQualityColor(selectedSummary.qualityMetrics.overallScore) }}>
                            {selectedSummary.qualityMetrics.overallScore}점
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="caption" color={colors.primary.gray[600]}>학습 반영 상태</Typography>
                          <Typography variant="body" style={{ 
                            color: selectedSummary.appliedToPersona ? colors.semantic.success : colors.semantic.warning 
                          }}>
                            {selectedSummary.appliedToPersona ? '반영 완료' : '반영 대기'}
                          </Typography>
                        </div>
                      </div>
                      
                      <Typography variant="body" color={colors.primary.gray[700]}>
                        {selectedSummary.summaryContent}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* 품질 메트릭 */}
                  <Card style={{ marginBottom: spacing[4] }}>
                    <CardHeader>
                      <Typography variant="h4">품질 메트릭</Typography>
                    </CardHeader>
                    <CardContent>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing[3] }}>
                        {Object.entries(selectedSummary.qualityMetrics).map(([key, value]) => (
                          <div key={key}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[1] }}>
                              <Typography variant="caption">{key}</Typography>
                              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                                {value as number}점
                              </Typography>
                            </div>
                            <div style={{
                              width: '100%',
                              height: '6px',
                              backgroundColor: colors.primary.gray[200],
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${value as number}%`,
                                height: '100%',
                                backgroundColor: getQualityColor(value as number),
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 적용된 변경사항 */}
                  <Card>
                    <CardHeader>
                      <Typography variant="h4">적용된 학습 변경사항</Typography>
                    </CardHeader>
                    <CardContent>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                        {selectedSummary.appliedChanges.map((change: any, index: number) => (
                          <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing[2],
                            padding: spacing[2],
                            backgroundColor: colors.background.secondary,
                            borderRadius: borderRadius.md
                          }}>
                            <CheckCircle size={16} color={colors.semantic.success} />
                            <div>
                              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                                {change.type}
                              </Typography>
                              <Typography variant="caption" color={colors.primary.gray[600]} style={{ display: 'block' }}>
                                {change.description}
                              </Typography>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent style={{ textAlign: 'center', padding: spacing[8] }}>
                <div style={{ fontSize: '64px', marginBottom: spacing[4] }}>📋</div>
                <Typography variant="h4" style={{ marginBottom: spacing[2] }}>
                  세션 요약이 없습니다
                </Typography>
                <Typography variant="body" color={colors.primary.gray[600]}>
                  아직 분석된 세션이 없거나 필터 조건에 맞는 요약이 없습니다.
                </Typography>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 학습 분석 탭 */}
      {activeTab === 'analytics' && analytics && (
        <div>
          <Typography variant="h4" style={{ marginBottom: spacing[4] }}>
            📊 학습 분석 대시보드
          </Typography>

          {/* 주요 지표 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing[4],
            marginBottom: spacing[6]
          }}>
            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <MessageSquare size={24} color={colors.accent.blue} />
                  <div>
                    <Typography variant="caption" color={colors.primary.gray[600]}>총 세션 수</Typography>
                    <Typography variant="h4">{analytics.sessionCount}</Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Clock size={24} color={colors.accent.green} />
                  <div>
                    <Typography variant="caption" color={colors.primary.gray[600]}>총 학습 시간</Typography>
                    <Typography variant="h4">{formatDuration(analytics.totalLearningTime)}</Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Star size={24} color={colors.accent.yellow} />
                  <div>
                    <Typography variant="caption" color={colors.primary.gray[600]}>평균 품질</Typography>
                    <Typography variant="h4">{analytics.averageSessionQuality}점</Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Brain size={24} color={colors.accent.purple} />
                  <div>
                    <Typography variant="caption" color={colors.primary.gray[600]}>학습된 개념</Typography>
                    <Typography variant="h4">{analytics.knowledgeGrowth.conceptsLearned}</Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 차트 및 상세 분석 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
            <Card>
              <CardHeader>
                <Typography variant="h4">페르소나 사용 분포</Typography>
              </CardHeader>
              <CardContent>
                {Object.entries(analytics.personaUsage).map(([persona, count]) => {
                  const personaInfo = getPersonaInfo(persona);
                  const percentage = (count / analytics.sessionCount) * 100;
                  
                  return (
                    <div key={persona} style={{ marginBottom: spacing[3] }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[1] }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                          <span>{personaInfo.icon}</span>
                          <Typography variant="caption">{personaInfo.name}</Typography>
                        </div>
                        <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                          {count}회 ({percentage.toFixed(1)}%)
                        </Typography>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: colors.primary.gray[200],
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: personaInfo.color,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Typography variant="h4">인기 주제</Typography>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                  {analytics.topTopics.map((topic, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      padding: spacing[2],
                      backgroundColor: colors.background.secondary,
                      borderRadius: borderRadius.md
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: colors.accent.blue,
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </div>
                      <Typography variant="body">{topic}</Typography>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 인사이트 탭 */}
      {activeTab === 'insights' && sessionInsights && (
        <div>
          <Typography variant="h4" style={{ marginBottom: spacing[4] }}>
            💡 세션 인사이트
          </Typography>

          <Card>
            <CardHeader>
              <Typography variant="h4">학습 순간들</Typography>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                {sessionInsights.learningMoments.map((moment, index) => {
                  const impactColor = moment.impact === 'high' ? colors.semantic.success :
                                    moment.impact === 'medium' ? colors.semantic.warning :
                                    colors.primary.gray[500];
                  
                  return (
                    <div key={index} style={{
                      padding: spacing[3],
                      border: `1px solid ${colors.primary.gray[200]}`,
                      borderRadius: borderRadius.md,
                      borderLeft: `4px solid ${impactColor}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[2] }}>
                        <Typography variant="caption" style={{ fontWeight: 'bold', color: impactColor }}>
                          {moment.type.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Typography variant="caption" color={colors.primary.gray[500]}>
                          {new Date(moment.timestamp).toLocaleTimeString('ko-KR')}
                        </Typography>
                      </div>
                      <Typography variant="body">{moment.content}</Typography>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SessionSummaryDashboard;