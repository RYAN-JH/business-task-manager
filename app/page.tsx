'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ArrowRight, Brain, Target, TrendingUp, Users, BarChart3, Zap, RefreshCw } from 'lucide-react';

import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { colors, spacing, shadows, borderRadius, animations, typography } from '@/lib/design-system';

export default function HomePage() {
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const features = [
    {
      icon: <Target size={24} />,
      title: 'AI 브랜딩 컨설턴트',
      description: '브랜딩 전문가의 노하우가 담긴 AI가 브랜드 포지셔닝부터 차별화 전략까지 체계적으로 설계해드립니다.',
      highlights: ['브랜드 포지셔닝 & 차별화 전략', '톤앤매너 & 비주얼 아이덴티티', '타겟 고객 분석 & 브랜드 스토리'],
      color: colors.accent.yellow,
    },
    {
      icon: <TrendingUp size={24} />,
      title: '콘텐츠 바이럴 엔진',
      description: '브랜드 기반 바이럴 콘텐츠 전략으로 유료 광고 없이도 자연스럽게 고객이 찾아오도록 합니다.',
      highlights: ['바이럴 가능성 예측 & 최적화', '플랫폼별 맞춤 콘텐츠 전략', '트렌드 분석 & 콘텐츠 캘린더'],
      color: colors.semantic.info,
    },
    {
      icon: <Brain size={24} />,
      title: '학습형 AI 시스템',
      description: '사용자의 피드백을 통해 지속적으로 학습하고 개선되는 세계 최초의 진화하는 AI 전문가입니다.',
      highlights: ['개인 맞춤형 조언 & 스타일 학습', '실시간 피드백 기반 개선', '대화할수록 더 정확한 전문가'],
      color: colors.semantic.success,
      badge: 'NEW'
    },
    {
      icon: <RefreshCw size={24} />,
      title: '페르소나 자동 동기화',
      description: '실제 SNS 계정과 연동하여 moment.ryan 페르소나를 실시간으로 업데이트하는 혁신적인 시스템입니다.',
      highlights: ['Threads & Instagram 실시간 연동', '자동 글쓰기 스타일 분석', '개인화된 AI 페르소나 진화'],
      color: colors.semantic.info,
      badge: 'BETA'
    },
  ];

  const valueProps = [
    {
      icon: '💰',
      title: '마케팅 비용 절감',
      description: '유료 광고 의존도를 줄이고 오가닉 바이럴로 건강한 성장',
    },
    {
      icon: '🎯',
      title: '브랜딩 통합 관리',
      description: '분산된 브랜드 활동을 하나의 플랫폼에서 체계적으로',
    },
    {
      icon: '💝',
      title: '찐팬 기반 성장',
      description: '일회성 고객이 아닌 평생 팬으로 전환하는 시스템',
    },
    {
      icon: '🧠',
      title: '학습하는 AI 전문가',
      description: '대화할수록 더 정확해지는 개인 맞춤형 전문가 AI',
    },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: colors.background.primary,
      fontFamily: typography.fontFamily.primary 
    }}>
      {/* Header */}
      <header style={{ 
        padding: `${spacing[6]} 0`,
        borderBottom: `1px solid ${colors.primary.gray[200]}`,
        backgroundColor: colors.background.primary,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(8px)',
      }}>
        <Container>
          <nav style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: colors.primary.black,
                borderRadius: borderRadius.lg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}>
                🧠
              </div>
              <Typography variant="h5" weight="semibold" style={{ margin: 0 }}>
                TaskGenius
              </Typography>
            </div>

            <div style={{ display: 'flex', gap: spacing[4], alignItems: 'center' }}>
              <Link href="/chat" style={{ textDecoration: 'none' }}>
                <Button variant="ghost">AI 브랜딩 상담</Button>
              </Link>
              <Link href="/dashboard/learning" style={{ textDecoration: 'none' }}>
                <Button variant="ghost">학습 대시보드</Button>
              </Link>
              <Link href="/dashboard/data" style={{ textDecoration: 'none' }}>
                <Button variant="ghost">
                  데이터 대시보드
                  <span style={{
                    marginLeft: spacing[2],
                    backgroundColor: colors.semantic.success,
                    color: colors.primary.white,
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: borderRadius.base,
                    fontWeight: '600',
                  }}>
                    NEW
                  </span>
                </Button>
              </Link>
              <Link href="/dashboard/persona-sync" style={{ textDecoration: 'none' }}>
                <Button variant="ghost">페르소나 동기화</Button>
              </Link>
              
              {session ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                  <Typography variant="caption" style={{ margin: 0 }}>
                    안녕하세요, {session.user?.name || session.user?.email}님
                  </Typography>
                  <Button variant="secondary" onClick={handleSignOut}>
                    로그아웃
                  </Button>
                </div>
              ) : (
                <Link href="/auth/signin" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary">로그인</Button>
                </Link>
              )}
              
              <Link href="/chat" style={{ textDecoration: 'none' }}>
                <Button variant="accent" rightIcon={<ArrowRight size={16} />}>
                  브랜드 진단받기
                </Button>
              </Link>
            </div>
          </nav>
        </Container>
      </header>

      {/* Hero Section */}
      <section style={{ padding: `${spacing[32]} 0` }}>
        <Container>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <Typography variant="h1" align="center" style={{ marginBottom: spacing[6] }}>
              브랜딩과 콘텐츠를 하나로
              <br />
              <span style={{ color: colors.accent.yellow }}>찐팬 기반 성장 플랫폼</span>
            </Typography>
            
            <Typography variant="body" size="lg" color={colors.primary.gray[600]} align="center" style={{ marginBottom: spacing[12] }}>
              마케팅 비용 없이도 바이럴 콘텐츠로 건강한 성장을.
              <br />
              브랜딩 전문가 AI가 일관된 브랜드 경험과 찐팬 육성을 도와드립니다.
            </Typography>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: spacing[4], 
              marginBottom: spacing[20],
              flexWrap: 'wrap'
            }}>
              <Link href="/chat" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />}>
                  브랜드 전략 상담받기
                </Button>
              </Link>
              <Link href="/chat" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="lg">
                  콘텐츠 바이럴 전략보기
                </Button>
              </Link>
            </div>

            {/* Status Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: colors.semantic.success + '15',
              color: colors.semantic.success,
              padding: `${spacing[3]} ${spacing[6]}`,
              borderRadius: borderRadius.full,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              border: `1px solid ${colors.semantic.success}30`,
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: colors.semantic.success,
                borderRadius: '50%',
                marginRight: spacing[2],
                animation: 'pulse 2s infinite'
              }} />
              학습형 AI 시스템 베타 버전 - 지금 바로 체험해보세요!
            </div>
          </div>
        </Container>
      </section>

      {/* Learning AI System Highlight */}
      <section style={{ 
        padding: `${spacing[20]} 0`,
        backgroundColor: colors.background.secondary,
      }}>
        <Container>
          <Card variant="elevated" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: spacing[4],
              right: spacing[4],
              backgroundColor: colors.accent.yellow,
              color: colors.primary.black,
              padding: `${spacing[2]} ${spacing[4]}`,
              borderRadius: borderRadius.lg,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
            }}>
              세계 최초 기술
            </div>

            <CardContent style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: colors.background.tertiary,
                padding: `${spacing[3]} ${spacing[6]}`,
                borderRadius: borderRadius.lg,
                marginBottom: spacing[8],
                border: `1px solid ${colors.primary.gray[200]}`,
              }}>
                <Typography variant="caption" style={{ margin: 0, color: colors.primary.black }}>
                  사용자와 함께 성장하는 AI
                </Typography>
              </div>
              
              <Typography variant="h2" align="center" style={{ marginBottom: spacing[6] }}>
                학습하고 진화하는 AI 시스템
              </Typography>
              
              <Typography variant="body" color={colors.primary.gray[600]} align="center" style={{ 
                marginBottom: spacing[12],
                maxWidth: '600px',
                margin: `0 auto ${spacing[12]} auto`
              }}>
                당신의 피드백을 통해 학습하고 개선되는 세계 최초의 진화하는 AI.
                <br />
                대화할수록 더 정확해지고, 개인 맞춤형 조언을 제공하는 혁신적인 학습 시스템을 경험해보세요.
              </Typography>
              
              {/* Learning Process Visualization */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                gap: spacing[8], 
                marginBottom: spacing[12],
                flexWrap: 'wrap'
              }}>
                {[
                  { emoji: '💬', label: 'AI 대화' },
                  { emoji: '🎯', label: '피드백' },
                  { emoji: '🧠', label: '학습' },
                  { emoji: '⚡', label: '개선' },
                ].map((step, index, array) => (
                  <React.Fragment key={step.label}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '32px', 
                        marginBottom: spacing[3],
                        color: colors.primary.gray[600] 
                      }}>
                        {step.emoji}
                      </div>
                      <Typography variant="caption" style={{ margin: 0 }}>
                        {step.label}
                      </Typography>
                    </div>
                    {index < array.length - 1 && (
                      <div style={{ 
                        color: colors.primary.gray[400], 
                        fontSize: typography.fontSize.lg 
                      }}>
                        →
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div style={{ display: 'flex', gap: spacing[4], justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/dashboard/learning" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" leftIcon={<BarChart3 size={16} />}>
                    학습 현황 확인하기
                  </Button>
                </Link>
                <Link href="/dashboard/persona-sync" style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" leftIcon={<RefreshCw size={16} />}>
                    페르소나 동기화
                  </Button>
                </Link>
                <Link href="/chat" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" leftIcon={<Brain size={16} />}>
                    AI와 대화해보기
                  </Button>
                </Link>
              </div>
              
              <Typography variant="caption" align="center" style={{ 
                marginTop: spacing[6],
                margin: `${spacing[6]} auto 0 auto`
              }}>
                대화할수록 더 정확해지는 개인화된 AI 경험
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* Features Section */}
      <section style={{ padding: `${spacing[20]} 0` }}>
        <Container>
          <div style={{ textAlign: 'center', marginBottom: spacing[16] }}>
            <Typography variant="h2" align="center">
              브랜딩 x 콘텐츠 통합 솔루션
            </Typography>
            <Typography variant="body" color={colors.primary.gray[600]} align="center">
              마케팅 비용 없이도 찐팬을 만드는 체계적인 브랜드 성장 전략
            </Typography>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: spacing[8]
          }}>
            {features.map((feature, index) => (
              <Card key={index} style={{ position: 'relative', height: '100%' }}>
                {feature.badge && (
                  <div style={{
                    position: 'absolute',
                    top: spacing[4],
                    right: spacing[4],
                    backgroundColor: colors.primary.black,
                    color: colors.primary.white,
                    padding: `${spacing[2]} ${spacing[4]}`,
                    borderRadius: borderRadius.lg,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                  }}>
                    {feature.badge}
                  </div>
                )}

                <CardHeader>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: spacing[4]
                  }}>
                    <div style={{
                      padding: spacing[4],
                      backgroundColor: feature.color + '15',
                      borderRadius: borderRadius.lg,
                      marginRight: spacing[4],
                      border: `1px solid ${feature.color}30`,
                      color: feature.color,
                    }}>
                      {feature.icon}
                    </div>
                    <Typography variant="h4" style={{ margin: 0 }}>
                      {feature.title}
                    </Typography>
                  </div>
                </CardHeader>

                <CardContent>
                  <Typography variant="body" color={colors.primary.gray[600]} style={{ marginBottom: spacing[6] }}>
                    {feature.description}
                  </Typography>
                  
                  <ul style={{
                    margin: 0,
                    paddingLeft: 0,
                    listStyle: 'none',
                  }}>
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} style={{ 
                        marginBottom: spacing[3], 
                        display: 'flex', 
                        alignItems: 'center',
                        fontSize: typography.fontSize.sm,
                        color: colors.primary.gray[600],
                      }}>
                        <span style={{ 
                          color: feature.color, 
                          marginRight: spacing[2], 
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.bold,
                        }}>
                          •
                        </span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Chat Preview Section */}
      <section style={{ 
        padding: `${spacing[20]} 0`,
        backgroundColor: colors.background.secondary,
      }}>
        <Container>
          <Card variant="elevated">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: colors.accent.yellowLight,
              padding: `${spacing[3]} ${spacing[6]}`,
              borderRadius: borderRadius.lg,
              marginBottom: spacing[8],
              border: `1px solid ${colors.accent.yellow}50`,
            }}>
              <Typography variant="caption" style={{ margin: 0, color: colors.accent.yellow }}>
                브랜딩 전문가와 바로 상담
              </Typography>
            </div>
            
            <Typography variant="h2" style={{ marginBottom: spacing[6] }}>
              AI 브랜딩 전문가와 대화해보세요
            </Typography>
            
            <Typography variant="body" color={colors.primary.gray[600]} style={{ 
              marginBottom: spacing[12],
              maxWidth: '600px'
            }}>
              "브랜드 포지셔닝은 어떻게?", "바이럴 콘텐츠 아이디어", "찐팬 육성 전략" 등
              <br />
              브랜딩과 콘텐츠 전략의 모든 것을 AI 전문가가 도와드립니다.
            </Typography>
            
            {/* Chat Preview */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: spacing[4], 
              maxWidth: '700px', 
              marginBottom: spacing[12]
            }}>
              <div style={{
                backgroundColor: colors.semantic.info,
                color: colors.primary.white,
                padding: `${spacing[4]} ${spacing[6]}`,
                borderRadius: `${borderRadius.lg} ${borderRadius.lg} ${borderRadius.base} ${borderRadius.lg}`,
                alignSelf: 'flex-end',
                maxWidth: '80%',
                fontSize: typography.fontSize.sm,
                boxShadow: shadows.sm,
              }}>
                우리 브랜드만의 차별화 포인트를 어떻게 찾을 수 있을까요?
              </div>
              
              <div style={{
                backgroundColor: colors.background.primary,
                color: colors.primary.gray[800],
                padding: `${spacing[4]} ${spacing[6]}`,
                borderRadius: `${borderRadius.lg} ${borderRadius.lg} ${borderRadius.lg} ${borderRadius.base}`,
                alignSelf: 'flex-start',
                maxWidth: '85%',
                fontSize: typography.fontSize.sm,
                lineHeight: typography.lineHeight.relaxed,
                border: `1px solid ${colors.primary.gray[200]}`,
                boxShadow: shadows.sm,
              }}>
                브랜드 차별화 전략을 세워보시는군요!
                <br />
                타겟 고객 분석부터 경쟁사 포지셔닝, 고유한 브랜드 스토리까지 단계별로 도와드릴게요!
              </div>
            </div>

            <Link href="/chat" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />}>
                지금 브랜딩 전략 받기
              </Button>
            </Link>
            
            <Typography variant="caption" style={{ 
              marginTop: spacing[6],
              display: 'block'
            }}>
              무료 브랜드 진단부터 시작하세요
            </Typography>
          </Card>
        </Container>
      </section>

      {/* Value Proposition */}
      <section style={{ padding: `${spacing[20]} 0` }}>
        <Container>
          <Typography variant="h2" align="center" style={{ marginBottom: spacing[16] }}>
            왜 TaskGenius여야 할까요?
          </Typography>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: spacing[8],
            marginBottom: spacing[12]
          }}>
            {valueProps.map((prop, index) => (
              <Card key={index} variant="bordered" style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: spacing[5],
                  width: '80px',
                  height: '80px',
                  backgroundColor: colors.background.secondary,
                  borderRadius: borderRadius.lg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: `0 auto ${spacing[5]} auto`,
                  border: `1px solid ${colors.primary.gray[200]}`,
                }}>
                  {prop.icon}
                </div>
                <Typography variant="h5" style={{ marginBottom: spacing[3] }}>
                  {prop.title}
                </Typography>
                <Typography variant="body" color={colors.primary.gray[600]} style={{ margin: 0 }}>
                  {prop.description}
                </Typography>
              </Card>
            ))}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <Link href="/chat" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />}>
                지금 바로 브랜드 성장 시작하기
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}