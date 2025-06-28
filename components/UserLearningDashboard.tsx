'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Target, Brain, Star, BarChart3, Award, 
  MessageSquare, Heart, Zap, Calendar, CheckCircle,
  ArrowUp, ArrowDown, Users, BookOpen, Lightbulb
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { colors, spacing, borderRadius, shadows } from '@/lib/design-system';

interface UserLearningStats {
  totalInteractions: number;
  totalSessions: number;
  averageSatisfaction: number;
  learningStage: 'initial' | 'developing' | 'mature' | 'advanced';
  strongAreas: string[];
  improvementAreas: string[];
  preferredPersona: 'moment.ryan' | 'atozit';
  growthRate: number;
  streakDays: number;
  lastActivityDate: string;
}

interface PersonaAffinity {
  affinityScore: number;
  successfulInteractions: number;
  preferredTopics: string[];
  satisfactionRating: number;
}

interface LearningGoal {
  id: string;
  goalType: 'skill_development' | 'problem_solving' | 'knowledge_building' | 'decision_support';
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'achieved' | 'paused';
  progressMetrics: {
    currentLevel: number;
    milestones: string[];
    blockers: string[];
  };
  targetPersona?: 'moment.ryan' | 'atozit';
  createdAt: string;
  targetDate?: string;
}

interface GrowthAnalysis {
  overallProgress: number;
  strongAreas: string[];
  improvementAreas: string[];
  recommendedActions: string[];
  nextMilestones: any[];
}

const UserLearningDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserLearningStats | null>(null);
  const [affinities, setAffinities] = useState<Record<string, PersonaAffinity> | null>(null);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [growthAnalysis, setGrowthAnalysis] = useState<GrowthAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'progress' | 'insights'>('overview');

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserLearningData();
    }
  }, [session]);

  const fetchUserLearningData = async () => {
    setIsLoading(true);
    try {
      // 병렬로 모든 데이터 요청
      const [statsRes, affinitiesRes, goalsRes, growthRes] = await Promise.all([
        fetch('/api/user-learning?action=get_learning_stats'),
        fetch('/api/user-learning?action=get_persona_affinities'),
        fetch('/api/user-learning?action=get_learning_goals'),
        fetch('/api/user-learning?action=get_growth_analysis')
      ]);

      const [statsData, affinitiesData, goalsData, growthData] = await Promise.all([
        statsRes.json(),
        affinitiesRes.json(),
        goalsRes.json(),
        growthRes.json()
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (affinitiesData.success) setAffinities(affinitiesData.affinities);
      if (goalsData.success) setGoals(goalsData.goals);
      if (growthData.success) setGrowthAnalysis(growthData.analysis);

    } catch (error) {
      console.error('학습 데이터 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLearningStageInfo = (stage: string) => {
    const stageInfo = {
      'initial': { label: '초급', color: colors.semantic.info, icon: '🌱' },
      'developing': { label: '중급', color: colors.semantic.warning, icon: '🌿' },
      'mature': { label: '고급', color: colors.semantic.success, icon: '🌳' },
      'advanced': { label: '전문가', color: colors.accent.purple, icon: '🚀' }
    };
    return stageInfo[stage as keyof typeof stageInfo] || stageInfo.initial;
  };

  const getPersonaInfo = (persona: string) => {
    return persona === 'moment.ryan' 
      ? { name: 'Moment Ryan', icon: '🎯', color: colors.accent.blue }
      : { name: 'AtoZ IT', icon: '🏢', color: colors.accent.purple };
  };

  const formatGrowthRate = (rate: number) => {
    const isPositive = rate >= 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
        {isPositive ? (
          <ArrowUp size={16} color={colors.semantic.success} />
        ) : (
          <ArrowDown size={16} color={colors.semantic.error} />
        )}
        <span style={{ 
          color: isPositive ? colors.semantic.success : colors.semantic.error,
          fontWeight: 'bold'
        }}>
          {Math.abs(rate)}%
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: spacing[6] }}>
        <LoadingSpinner message="학습 데이터를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div style={{ padding: spacing[6] }}>
      {/* 헤더 */}
      <div style={{ marginBottom: spacing[6] }}>
        <Typography variant="h2" style={{ marginBottom: spacing[2] }}>
          📈 나의 학습 현황
        </Typography>
        <Typography variant="body" color={colors.primary.gray[600]}>
          AI 페르소나와의 상호작용을 통한 개인 맞춤 학습 분석
        </Typography>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{ 
        display: 'flex', 
        gap: spacing[2], 
        marginBottom: spacing[6],
        borderBottom: `1px solid ${colors.primary.gray[200]}`,
        paddingBottom: spacing[3]
      }}>
        {[
          { key: 'overview', label: '개요', icon: BarChart3 },
          { key: 'goals', label: '학습 목표', icon: Target },
          { key: 'progress', label: '성장 분석', icon: TrendingUp },
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

      {/* 개요 탭 */}
      {activeTab === 'overview' && (
        <div>
          {/* 주요 지표 카드들 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: spacing[4],
            marginBottom: spacing[6]
          }}>
            {/* 학습 단계 */}
            {stats && (
              <Card>
                <CardContent>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    <div style={{
                      fontSize: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getLearningStageInfo(stats.learningStage).icon}
                    </div>
                    <div>
                      <Typography variant="caption" color={colors.primary.gray[600]}>
                        현재 학습 단계
                      </Typography>
                      <Typography variant="h4" style={{ 
                        color: getLearningStageInfo(stats.learningStage).color 
                      }}>
                        {getLearningStageInfo(stats.learningStage).label}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 총 상호작용 */}
            {stats && (
              <Card>
                <CardContent>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    <div style={{
                      padding: spacing[3],
                      backgroundColor: colors.accent.blue + '20',
                      borderRadius: '50%'
                    }}>
                      <MessageSquare size={24} color={colors.accent.blue} />
                    </div>
                    <div>
                      <Typography variant="caption" color={colors.primary.gray[600]}>
                        총 대화 수
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalInteractions.toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 평균 만족도 */}
            {stats && (
              <Card>
                <CardContent>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    <div style={{
                      padding: spacing[3],
                      backgroundColor: colors.accent.yellow + '20',
                      borderRadius: '50%'
                    }}>
                      <Star size={24} color={colors.accent.yellow} />
                    </div>
                    <div>
                      <Typography variant="caption" color={colors.primary.gray[600]}>
                        평균 만족도
                      </Typography>
                      <Typography variant="h4">
                        {stats.averageSatisfaction.toFixed(1)}/5.0
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 성장률 */}
            {stats && (
              <Card>
                <CardContent>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                    <div style={{
                      padding: spacing[3],
                      backgroundColor: colors.semantic.success + '20',
                      borderRadius: '50%'
                    }}>
                      <TrendingUp size={24} color={colors.semantic.success} />
                    </div>
                    <div>
                      <Typography variant="caption" color={colors.primary.gray[600]}>
                        월 성장률
                      </Typography>
                      <div>
                        {formatGrowthRate(stats.growthRate)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 페르소나 친화도 */}
          {affinities && (
            <Card style={{ marginBottom: spacing[6] }}>
              <CardHeader>
                <Typography variant="h4">🎭 페르소나 호환성</Typography>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
                  {Object.entries(affinities).map(([persona, affinity]) => {
                    const personaInfo = getPersonaInfo(persona);
                    const affinityPercentage = Math.round(affinity.affinityScore * 100);
                    
                    return (
                      <div key={persona} style={{
                        padding: spacing[4],
                        border: `2px solid ${personaInfo.color}30`,
                        borderRadius: borderRadius.md,
                        backgroundColor: personaInfo.color + '10'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[3] }}>
                          <span style={{ fontSize: '24px' }}>{personaInfo.icon}</span>
                          <Typography variant="body" style={{ fontWeight: 'bold', color: personaInfo.color }}>
                            {personaInfo.name}
                          </Typography>
                        </div>
                        
                        <div style={{ marginBottom: spacing[3] }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[1] }}>
                            <Typography variant="caption">호환성</Typography>
                            <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                              {affinityPercentage}%
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
                              width: `${affinityPercentage}%`,
                              height: '100%',
                              backgroundColor: personaInfo.color,
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[2] }}>
                          <div>
                            <Typography variant="caption" color={colors.primary.gray[600]}>
                              성공 대화
                            </Typography>
                            <Typography variant="body" style={{ fontWeight: 'bold' }}>
                              {affinity.successfulInteractions}회
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="caption" color={colors.primary.gray[600]}>
                              평점
                            </Typography>
                            <Typography variant="body" style={{ fontWeight: 'bold' }}>
                              {affinity.satisfactionRating.toFixed(1)}/5.0
                            </Typography>
                          </div>
                        </div>

                        <div style={{ marginTop: spacing[3] }}>
                          <Typography variant="caption" color={colors.primary.gray[600]} style={{ marginBottom: spacing[1], display: 'block' }}>
                            선호 주제
                          </Typography>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[1] }}>
                            {affinity.preferredTopics.slice(0, 3).map((topic, index) => (
                              <span key={index} style={{
                                padding: `${spacing[1]} ${spacing[2]}`,
                                backgroundColor: personaInfo.color + '20',
                                color: personaInfo.color,
                                borderRadius: borderRadius.sm,
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 강점과 개선 영역 */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
              <Card>
                <CardHeader>
                  <Typography variant="h4" style={{ color: colors.semantic.success }}>
                    💪 강점 영역
                  </Typography>
                </CardHeader>
                <CardContent>
                  {stats.strongAreas.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                      {stats.strongAreas.map((area, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                          <CheckCircle size={16} color={colors.semantic.success} />
                          <Typography variant="body">{area}</Typography>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Typography variant="body" color={colors.primary.gray[500]}>
                      더 많은 상호작용을 통해 강점을 발견해보세요!
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Typography variant="h4" style={{ color: colors.semantic.warning }}>
                    🎯 개선 영역
                  </Typography>
                </CardHeader>
                <CardContent>
                  {stats.improvementAreas.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                      {stats.improvementAreas.map((area, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                          <Target size={16} color={colors.semantic.warning} />
                          <Typography variant="body">{area}</Typography>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Typography variant="body" color={colors.primary.gray[500]}>
                      현재 개선이 필요한 영역이 없습니다!
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* 학습 목표 탭 */}
      {activeTab === 'goals' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
            <Typography variant="h3">🎯 학습 목표</Typography>
            <Button variant="primary">+ 새 목표 추가</Button>
          </div>

          {goals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
              {goals.map((goal) => (
                <Card key={goal.id}>
                  <CardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[3] }}>
                      <div style={{ flex: 1 }}>
                        <Typography variant="h4" style={{ marginBottom: spacing[1] }}>
                          {goal.description}
                        </Typography>
                        <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
                          <span style={{
                            padding: `${spacing[1]} ${spacing[2]}`,
                            backgroundColor: colors.semantic.info + '20',
                            color: colors.semantic.info,
                            borderRadius: borderRadius.sm,
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {goal.goalType.replace('_', ' ')}
                          </span>
                          <span style={{
                            padding: `${spacing[1]} ${spacing[2]}`,
                            backgroundColor: goal.priority === 'high' ? colors.semantic.error + '20' : 
                                           goal.priority === 'medium' ? colors.semantic.warning + '20' : 
                                           colors.primary.gray[200],
                            color: goal.priority === 'high' ? colors.semantic.error : 
                                   goal.priority === 'medium' ? colors.semantic.warning : 
                                   colors.primary.gray[600],
                            borderRadius: borderRadius.sm,
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {goal.priority} 우선순위
                          </span>
                        </div>
                      </div>

                      <div style={{ 
                        padding: `${spacing[1]} ${spacing[2]}`,
                        backgroundColor: goal.status === 'achieved' ? colors.semantic.success + '20' : 
                                       goal.status === 'active' ? colors.semantic.info + '20' : 
                                       colors.primary.gray[200],
                        color: goal.status === 'achieved' ? colors.semantic.success : 
                               goal.status === 'active' ? colors.semantic.info : 
                               colors.primary.gray[600],
                        borderRadius: borderRadius.sm,
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {goal.status === 'achieved' ? '달성' : 
                         goal.status === 'active' ? '진행중' : '일시정지'}
                      </div>
                    </div>

                    <div style={{ marginBottom: spacing[3] }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing[1] }}>
                        <Typography variant="caption">진행률</Typography>
                        <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                          {goal.progressMetrics.currentLevel}%
                        </Typography>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '12px',
                        backgroundColor: colors.primary.gray[200],
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${goal.progressMetrics.currentLevel}%`,
                          height: '100%',
                          backgroundColor: colors.semantic.success,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {goal.progressMetrics.milestones.length > 0 && (
                      <div>
                        <Typography variant="caption" color={colors.primary.gray[600]} style={{ marginBottom: spacing[2], display: 'block' }}>
                          완료된 마일스톤
                        </Typography>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[1] }}>
                          {goal.progressMetrics.milestones.map((milestone, index) => (
                            <span key={index} style={{
                              padding: `${spacing[1]} ${spacing[2]}`,
                              backgroundColor: colors.semantic.success + '20',
                              color: colors.semantic.success,
                              borderRadius: borderRadius.sm,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing[1]
                            }}>
                              <CheckCircle size={12} />
                              {milestone}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent style={{ textAlign: 'center', padding: spacing[8] }}>
                <div style={{ fontSize: '64px', marginBottom: spacing[4] }}>🎯</div>
                <Typography variant="h4" style={{ marginBottom: spacing[2] }}>
                  아직 설정된 학습 목표가 없습니다
                </Typography>
                <Typography variant="body" color={colors.primary.gray[600]} style={{ marginBottom: spacing[4] }}>
                  새로운 학습 목표를 설정하여 체계적으로 성장해보세요!
                </Typography>
                <Button variant="primary">첫 번째 목표 설정하기</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 성장 분석 탭 */}
      {activeTab === 'progress' && growthAnalysis && (
        <div>
          <Typography variant="h3" style={{ marginBottom: spacing[4] }}>
            📊 성장 분석
          </Typography>

          <Card style={{ marginBottom: spacing[6] }}>
            <CardHeader>
              <Typography variant="h4">전체 진행률</Typography>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    width: '100%',
                    height: '20px',
                    backgroundColor: colors.primary.gray[200],
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${growthAnalysis.overallProgress * 100}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${colors.accent.blue}, ${colors.accent.purple})`,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
                <Typography variant="h3" style={{ fontWeight: 'bold' }}>
                  {Math.round(growthAnalysis.overallProgress * 100)}%
                </Typography>
              </div>
            </CardContent>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
            <Card>
              <CardHeader>
                <Typography variant="h4">💪 강점 영역</Typography>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                  {growthAnalysis.strongAreas.map((area, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                      <Star size={16} color={colors.accent.yellow} />
                      <Typography variant="body">{area}</Typography>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Typography variant="h4">🚀 추천 액션</Typography>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                  {growthAnalysis.recommendedActions.map((action, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                      <Zap size={16} color={colors.accent.blue} />
                      <Typography variant="body">{action}</Typography>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 인사이트 탭 */}
      {activeTab === 'insights' && (
        <div>
          <Typography variant="h3" style={{ marginBottom: spacing[4] }}>
            💡 학습 인사이트
          </Typography>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing[4] }}>
            <Card>
              <CardHeader>
                <Typography variant="h4">🔍 개인화 분석</Typography>
              </CardHeader>
              <CardContent>
                <Typography variant="body" color={colors.primary.gray[600]}>
                  AI가 분석한 당신의 학습 패턴과 선호도를 바탕으로 한 맞춤형 인사이트입니다.
                </Typography>
                {/* 여기에 더 상세한 인사이트 컴포넌트들 추가 */}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLearningDashboard;