'use client';

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function HomePage() {
  const { data: session, status } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#2c2c2c'
    }}>
      {/* Header */}
      <header style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', borderBottom: '1px solid #e0e0e0' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              backgroundColor: '#2c2c2c', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>🧠</div>
            <span style={{ fontSize: '18px', fontWeight: '400', color: '#2c2c2c', letterSpacing: '0.01em' }}>TaskGenius</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link 
              href="/chat" 
              style={{ 
                color: '#555555', 
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                transition: 'all 0.15s ease',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: '#ffffff',
                border: '1px solid #d0d0d0',
                letterSpacing: '0.01em',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}
            >
              AI 브랜딩 상담
            </Link>
            <Link 
              href="/dashboard/learning" 
              style={{ 
                color: '#555555', 
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                transition: 'all 0.15s ease',
                fontSize: '13px',
                fontWeight: '500',
                backgroundColor: '#ffffff',
                border: '1px solid #d0d0d0',
                letterSpacing: '0.01em',
                position: 'relative',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}
            >
              학습 대시보드
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#2c2c2c',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: '500',
                padding: '2px 6px',
                borderRadius: '4px',
                lineHeight: '1',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
              }}>
                NEW
              </span>
            </Link>
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: '#666666' }}>
                  안녕하세요, {session.user?.name || session.user?.email}님
                </span>
                <button 
                  onClick={handleSignOut}
                  style={{ 
                    color: '#555555', 
                    textDecoration: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    transition: 'all 0.15s ease',
                    fontSize: '13px',
                    fontWeight: '500',
                    letterSpacing: '0.01em',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d0d0d0',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  }}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link 
                href="/auth/signin" 
                style={{ 
                  color: '#555555', 
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease',
                  fontSize: '13px',
                  fontWeight: '500',
                  letterSpacing: '0.01em',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d0d0d0',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                }}
              >
                로그인
              </Link>
            )}
            <Link 
              href="/chat" 
              style={{ 
                backgroundColor: '#2c2c2c', 
                color: '#ffffff',
                textDecoration: 'none',
                padding: '16px 32px',
                borderRadius: '8px',
                fontWeight: '500',
                transition: 'all 0.15s ease',
                fontSize: '13px',
                letterSpacing: '0.01em',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              브랜드 진단받기
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: '300', 
          color: '#2c2c2c', 
          marginBottom: '32px',
          lineHeight: '1.3',
          letterSpacing: '-0.01em'
        }}>
          브랜딩과 콘텐츠를 하나로 <br />
          찐팬 기반 성장 플랫폼
        </h1>
        
        <p style={{ 
          fontSize: '16px', 
          color: '#666666', 
          marginBottom: '64px',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 64px auto',
          fontWeight: '400'
        }}>
          마케팅 비용 없이도 바이럴 콘텐츠로 건강한 성장을.<br />
          브랜딩 전문가 AI가 일관된 브랜드 경험과 찐팬 육성을 도와드립니다.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '120px', flexWrap: 'wrap' }}>
          <Link 
            href="/chat" 
            style={{ 
              backgroundColor: '#2c2c2c',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '20px 40px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.15s ease',
              letterSpacing: '0.01em',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            브랜드 전략 상담받기
          </Link>
          <Link 
            href="/chat" 
            style={{ 
              backgroundColor: '#ffffff',
              color: '#2c2c2c',
              textDecoration: 'none',
              padding: '20px 40px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #d0d0d0',
              transition: 'all 0.15s ease',
              letterSpacing: '0.01em',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}
          >
            콘텐츠 바이럴 전략보기
          </Link>
        </div>

        {/* 학습형 AI 시스템 소개 섹션 */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '64px',
          borderRadius: '8px',
          marginBottom: '120px',
          border: '1px solid #d0d0d0',
          position: 'relative',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#2c2c2c',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '500',
            letterSpacing: '0.01em',
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            세계 최초 기술
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            padding: '12px 24px',
            borderRadius: '8px',
            marginBottom: '32px',
            border: '1px solid #d0d0d0',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}>
            <span style={{ fontSize: '13px', color: '#2c2c2c', fontWeight: '500', letterSpacing: '0.01em' }}>
              사용자와 함께 성장하는 AI
            </span>
          </div>
          
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '400', 
            color: '#2c2c2c', 
            marginBottom: '24px',
            letterSpacing: '-0.01em'
          }}>
            학습하고 진화하는 AI 시스템
          </h2>
          <p style={{ 
            fontSize: '15px', 
            color: '#666666', 
            marginBottom: '48px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 48px auto',
            fontWeight: '400'
          }}>
            당신의 피드백을 통해 학습하고 개선되는 세계 최초의 진화하는 AI.<br />
            대화할수록 더 정확해지고, 개인 맞춤형 조언을 제공하는 혁신적인 학습 시스템을 경험해보세요.
          </p>
          
          {/* 학습 과정 시각화 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: '32px', 
            marginBottom: '48px',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', color: '#666666' }}>💬</div>
              <div style={{ color: '#2c2c2c', fontSize: '12px', fontWeight: '500', letterSpacing: '0.01em' }}>AI 대화</div>
            </div>
            <div style={{ color: '#666666', fontSize: '16px' }}>→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', color: '#666666' }}>🎯</div>
              <div style={{ color: '#2c2c2c', fontSize: '12px', fontWeight: '500', letterSpacing: '0.01em' }}>피드백</div>
            </div>
            <div style={{ color: '#666666', fontSize: '16px' }}>→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', color: '#666666' }}>🧠</div>
              <div style={{ color: '#2c2c2c', fontSize: '12px', fontWeight: '500', letterSpacing: '0.01em' }}>학습</div>
            </div>
            <div style={{ color: '#666666', fontSize: '16px' }}>→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px', color: '#666666' }}>⚡</div>
              <div style={{ color: '#2c2c2c', fontSize: '12px', fontWeight: '500', letterSpacing: '0.01em' }}>개선</div>
            </div>
          </div>

          {/* 학습 대시보드 CTA 버튼 */}
          <Link 
            href="/dashboard/learning"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#2c2c2c',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.15s ease',
              marginRight: '16px',
              letterSpacing: '0.01em',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            학습 현황 확인하기
          </Link>
          
          <Link 
            href="/chat"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#ffffff',
              color: '#2c2c2c',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.15s ease',
              border: '1px solid #d0d0d0',
              letterSpacing: '0.01em',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}
          >
            AI와 대화해보기
          </Link>
          
          <p style={{
            marginTop: '24px',
            fontSize: '12px',
            color: '#666666',
            fontWeight: '400'
          }}>
            대화할수록 더 정확해지는 개인화된 AI 경험
          </p>
        </div>

        {/* Enhanced AI Chatbot Preview Section */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '64px',
          borderRadius: '8px',
          marginBottom: '80px',
          border: '1px solid #d0d0d0',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#fff7ed',
            padding: '12px 24px',
            borderRadius: '8px',
            marginBottom: '32px',
            border: '1px solid #fed7aa',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}>
            <span style={{ fontSize: '13px', color: '#ea580c', fontWeight: '500', letterSpacing: '0.01em' }}>
              브랜딩 전문가와 바로 상담
            </span>
          </div>
          
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '400', 
            color: '#2c2c2c', 
            marginBottom: '24px',
            letterSpacing: '-0.01em'
          }}>
            AI 브랜딩 전문가와 대화해보세요
          </h2>
          <p style={{ 
            fontSize: '15px', 
            color: '#666666', 
            marginBottom: '48px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 48px auto',
            fontWeight: '400'
          }}>
            "브랜드 포지셔닝은 어떻게?", "바이럴 콘텐츠 아이디어", "찐팬 육성 전략" 등<br />
            브랜딩과 콘텐츠 전략의 모든 것을 AI 전문가가 도와드립니다.
          </p>
          
          {/* Sample Chat Bubbles - 브랜딩 관련 대화 */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            maxWidth: '700px', 
            margin: '0 auto 48px auto',
            textAlign: 'left'
          }}>
            <div style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              padding: '16px 24px',
              borderRadius: '8px 8px 2px 8px',
              alignSelf: 'flex-end',
              maxWidth: '80%',
              fontSize: '14px',
              fontWeight: '400',
              boxShadow: '0 4px 8px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}>
              우리 브랜드만의 차별화 포인트를 어떻게 찾을 수 있을까요?
            </div>
            <div style={{
              backgroundColor: '#f3f4f6',
              color: '#2c2c2c',
              padding: '16px 24px',
              borderRadius: '8px 8px 8px 2px',
              alignSelf: 'flex-start',
              maxWidth: '85%',
              fontSize: '14px',
              lineHeight: '1.6',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}>
              브랜드 차별화 전략을 세워보시는군요!<br />
              타겟 고객 분석부터 경쟁사 포지셔닝, 고유한 브랜드 스토리까지 단계별로 도와드릴게요!
            </div>
          </div>

          {/* Main CTA Button */}
          <Link 
            href="/chat"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#2c2c2c',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '20px 40px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.15s ease',
              letterSpacing: '0.01em',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            지금 브랜딩 전략 받기
          </Link>
          
          <p style={{
            marginTop: '24px',
            fontSize: '12px',
            color: '#666666',
            fontWeight: '400'
          }}>
            무료 브랜드 진단부터 시작하세요
          </p>
        </div>

        {/* Information Cards - 새로운 브랜딩 중심 기능들 */}
        <div style={{
          marginBottom: '48px'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '400',
            color: '#2c2c2c',
            marginBottom: '16px',
            letterSpacing: '-0.01em'
          }}>
            브랜딩 x 콘텐츠 통합 솔루션
          </h3>
          <p style={{
            fontSize: '15px',
            color: '#666666',
            marginBottom: '48px',
            fontWeight: '400'
          }}>
            마케팅 비용 없이도 찐팬을 만드는 체계적인 브랜드 성장 전략
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '32px',
          marginTop: '40px'
        }}>
          {/* AI 브랜딩 컨설턴트 */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '48px', 
            borderRadius: '8px',
            border: '1px solid #d0d0d0',
            textAlign: 'left',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '32px' 
            }}>
              <div style={{ 
                fontSize: '32px', 
                marginRight: '16px',
                padding: '16px',
                backgroundColor: '#fff7ed',
                borderRadius: '8px',
                border: '1px solid #fed7aa',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}>🎨</div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '500', 
                color: '#2c2c2c', 
                margin: 0,
                letterSpacing: '-0.01em'
              }}>AI 브랜딩 컨설턴트</h3>
            </div>
            <p style={{ 
              color: '#666666', 
              lineHeight: '1.6',
              margin: '0 0 24px 0',
              fontSize: '14px',
              fontWeight: '400'
            }}>
              브랜딩 전문가의 노하우가 담긴 AI가 브랜드 포지셔닝부터 차별화 전략까지 체계적으로 설계해드립니다.
            </p>
            
            <ul style={{
              margin: 0,
              paddingLeft: '0',
              listStyle: 'none',
              color: '#666666',
              fontSize: '13px'
            }}>
              <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#ea580c', marginRight: '8px', fontSize: '14px' }}>•</span>
                브랜드 포지셔닝 & 차별화 전략
              </li>
              <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#ea580c', marginRight: '8px', fontSize: '14px' }}>•</span>
                톤앤매너 & 비주얼 아이덴티티
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#ea580c', marginRight: '8px', fontSize: '14px' }}>•</span>
                타겟 고객 분석 & 브랜드 스토리
              </li>
            </ul>
          </div>

          {/* 콘텐츠 바이럴 엔진 */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '48px', 
            borderRadius: '8px',
            border: '1px solid #d0d0d0',
            textAlign: 'left',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '32px' 
            }}>
              <div style={{ 
                fontSize: '32px', 
                marginRight: '16px',
                padding: '16px',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}>🚀</div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '500', 
                color: '#2c2c2c', 
                margin: 0,
                letterSpacing: '-0.01em'
              }}>콘텐츠 바이럴 엔진</h3>
            </div>
            <p style={{ 
              color: '#666666', 
              lineHeight: '1.6',
              margin: '0 0 24px 0',
              fontSize: '14px',
              fontWeight: '400'
            }}>
              브랜드 기반 바이럴 콘텐츠 전략으로 유료 광고 없이도 자연스럽게 고객이 찾아오도록 합니다.
            </p>
            
            <ul style={{
              margin: 0,
              paddingLeft: '0',
              listStyle: 'none',
              color: '#666666',
              fontSize: '13px'
            }}>
              <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#3b82f6', marginRight: '8px', fontSize: '14px' }}>•</span>
                바이럴 가능성 예측 & 최적화
              </li>
              <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#3b82f6', marginRight: '8px', fontSize: '14px' }}>•</span>
                플랫폼별 맞춤 콘텐츠 전략
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#3b82f6', marginRight: '8px', fontSize: '14px' }}>•</span>
                트렌드 분석 & 콘텐츠 캘린더
              </li>
            </ul>
          </div>

          {/* 학습형 AI 시스템 카드 */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '48px', 
            borderRadius: '8px',
            border: '1px solid #d0d0d0',
            textAlign: 'left',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '32px' 
            }}>
              <div style={{ 
                fontSize: '32px', 
                marginRight: '16px',
                padding: '16px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                border: '1px solid #bbf7d0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}>🧠</div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '500', 
                color: '#2c2c2c', 
                margin: 0,
                letterSpacing: '-0.01em'
              }}>학습형 AI 시스템</h3>
            </div>
            <p style={{ 
              color: '#666666', 
              lineHeight: '1.6',
              margin: '0 0 24px 0',
              fontSize: '14px',
              fontWeight: '400'
            }}>
              사용자의 피드백을 통해 지속적으로 학습하고 개선되는 세계 최초의 진화하는 AI 전문가입니다.
            </p>
            
            <ul style={{
              margin: '0 0 32px 0',
              paddingLeft: '0',
              listStyle: 'none',
              color: '#666666',
              fontSize: '13px'
            }}>
              <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#10b981', marginRight: '8px', fontSize: '14px' }}>•</span>
                개인 맞춤형 조언 & 스타일 학습
              </li>
              <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#10b981', marginRight: '8px', fontSize: '14px' }}>•</span>
                실시간 피드백 기반 개선
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#10b981', marginRight: '8px', fontSize: '14px' }}>•</span>
                대화할수록 더 정확한 전문가
              </li>
            </ul>

            {/* 학습 대시보드 링크 버튼 */}
            <Link 
              href="/dashboard/learning"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#2c2c2c',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.15s ease',
                letterSpacing: '0.01em',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              학습 현황 보기
            </Link>

            {/* NEW 배지 */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: '#2c2c2c',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '0.01em',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              NEW
            </div>
          </div>
        </div>

        {/* Value Proposition Section */}
        <div style={{
          marginTop: '80px',
          padding: '64px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #d0d0d0',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '400',
            color: '#2c2c2c',
            marginBottom: '48px',
            letterSpacing: '-0.01em'
          }}>
            왜 TaskGenius여야 할까요?
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            marginBottom: '48px'
          }}>
            <div style={{ 
              textAlign: 'center',
              padding: '32px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{ 
                fontSize: '40px', 
                marginBottom: '20px',
                width: '64px',
                height: '64px',
                backgroundColor: '#fff7ed',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fed7aa',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}>💰</div>
              <h4 style={{ color: '#2c2c2c', fontSize: '16px', fontWeight: '500', marginBottom: '12px', letterSpacing: '-0.01em' }}>
                마케팅 비용 절감
              </h4>
              <p style={{ color: '#666666', fontSize: '13px', lineHeight: '1.6' }}>
                유료 광고 의존도를 줄이고<br />오가닉 바이럴로 건강한 성장
              </p>
            </div>
            
            <div style={{ 
              textAlign: 'center',
              padding: '32px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{ 
                fontSize: '40px', 
                marginBottom: '20px',
                width: '64px',
                height: '64px',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}>🎯</div>
              <h4 style={{ color: '#2c2c2c', fontSize: '16px', fontWeight: '500', marginBottom: '12px', letterSpacing: '-0.01em' }}>
                브랜딩 통합 관리
              </h4>
              <p style={{ color: '#666666', fontSize: '13px', lineHeight: '1.6' }}>
                분산된 브랜드 활동을<br />하나의 플랫폼에서 체계적으로
              </p>
            </div>
            
            <div style={{ 
              textAlign: 'center',
              padding: '32px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{ 
                fontSize: '40px', 
                marginBottom: '20px',
                width: '64px',
                height: '64px',
                backgroundColor: '#fef3f2',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fecaca',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}>💝</div>
              <h4 style={{ color: '#2c2c2c', fontSize: '16px', fontWeight: '500', marginBottom: '12px', letterSpacing: '-0.01em' }}>
                찐팬 기반 성장
              </h4>
              <p style={{ color: '#666666', fontSize: '13px', lineHeight: '1.6' }}>
                일회성 고객이 아닌<br />평생 팬으로 전환하는 시스템
              </p>
            </div>
            
            <div style={{ 
              textAlign: 'center',
              padding: '32px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{ 
                fontSize: '40px', 
                marginBottom: '20px',
                width: '64px',
                height: '64px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bbf7d0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}>🧠</div>
              <h4 style={{ color: '#2c2c2c', fontSize: '16px', fontWeight: '500', marginBottom: '12px', letterSpacing: '-0.01em' }}>
                학습하는 AI 전문가
              </h4>
              <p style={{ color: '#666666', fontSize: '13px', lineHeight: '1.6' }}>
                대화할수록 더 정확해지는<br />개인 맞춤형 전문가 AI
              </p>
            </div>
          </div>
          
          <Link 
            href="/chat"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#2c2c2c',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '20px 40px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.15s ease',
              letterSpacing: '0.01em',
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            지금 바로 브랜드 성장 시작하기
          </Link>
        </div>

        {/* Status */}
        <div style={{ marginTop: '80px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            backgroundColor: '#f0fdf4', 
            color: '#16a34a',
            padding: '12px 24px', 
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            border: '1px solid #bbf7d0',
            letterSpacing: '0.01em',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#16a34a', 
              borderRadius: '50%', 
              marginRight: '8px',
              animation: 'pulse 2s infinite'
            }}></div>
            학습형 AI 시스템 베타 버전 - 지금 바로 체험해보세요!
          </div>
        </div>
      </main>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translateX(0);
          }
          40%, 43% {
            transform: translateX(5px);
          }
          70% {
            transform: translateX(3px);
          }
          90% {
            transform: translateX(1px);
          }
        }
        
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
  )
}