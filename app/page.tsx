'use client';

import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#3b82f6', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>🧠</div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>TaskGenius</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link 
              href="/chat" 
              style={{ 
                color: 'rgba(255,255,255,0.9)', 
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              🤖 AI 브랜딩 상담
            </Link>
            <Link 
              href="/auth" 
              style={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.2s'
              }}
            >
              로그인
            </Link>
            <Link 
              href="/chat" 
              style={{ 
                backgroundColor: '#f59e0b', 
                color: 'white',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                fontSize: '14px'
              }}
            >
              브랜드 진단받기
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: 'white', 
          marginBottom: '24px',
          lineHeight: '1.2'
        }}>
          브랜딩과 콘텐츠를 하나로 <br />
          <span style={{ color: '#fbbf24' }}>찐팬 기반 성장 플랫폼</span>
        </h1>
        
        <p style={{ 
          fontSize: '20px', 
          color: 'rgba(255,255,255,0.9)', 
          marginBottom: '48px',
          lineHeight: '1.6',
          maxWidth: '800px',
          margin: '0 auto 48px auto'
        }}>
          마케팅 비용 없이도 바이럴 콘텐츠로 건강한 성장을! <br />
          브랜딩 전문가 AI가 일관된 브랜드 경험과 찐팬 육성을 도와드립니다.
        </p>

        {/* Enhanced CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '80px', flexWrap: 'wrap' }}>
          <Link 
            href="/chat" 
            style={{ 
              backgroundColor: '#f59e0b',
              color: 'white',
              textDecoration: 'none',
              padding: '20px 40px',
              borderRadius: '16px',
              fontSize: '20px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
              transition: 'all 0.3s ease',
              transform: 'translateY(0)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(245, 158, 11, 0.4)';
            }}
          >
            🎨 브랜드 전략 상담받기
            <span style={{ 
              fontSize: '24px', 
              animation: 'bounce 2s infinite' 
            }}>→</span>
          </Link>
          <Link 
            href="/chat" 
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              textDecoration: 'none',
              padding: '20px 40px',
              borderRadius: '16px',
              fontSize: '18px',
              fontWeight: '600',
              border: '2px solid rgba(255,255,255,0.3)',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)'
            }}
          >
            콘텐츠 바이럴 전략보기
          </Link>
        </div>

        {/* Enhanced AI Chatbot Preview Section */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.12)',
          padding: '48px',
          borderRadius: '24px',
          marginBottom: '80px',
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            padding: '8px 16px',
            borderRadius: '20px',
            marginBottom: '24px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <span style={{ fontSize: '16px', color: '#fbbf24', fontWeight: '600' }}>
              🎯 브랜딩 전문가와 바로 상담
            </span>
          </div>
          
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '20px' 
          }}>
            🎨 AI 브랜딩 전문가와 대화해보세요
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: 'rgba(255,255,255,0.85)', 
            marginBottom: '32px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 32px auto'
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
            margin: '0 auto 32px auto',
            textAlign: 'left'
          }}>
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.9)',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '20px 20px 6px 20px',
              alignSelf: 'flex-end',
              maxWidth: '80%',
              fontSize: '15px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              우리 브랜드만의 차별화 포인트를 어떻게 찾을 수 있을까요?
            </div>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              color: '#374151',
              padding: '16px 20px',
              borderRadius: '20px 20px 20px 6px',
              alignSelf: 'flex-start',
              maxWidth: '85%',
              fontSize: '15px',
              lineHeight: '1.5',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              브랜드 차별화 전략을 세워보시는군요! 🎯<br />
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
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              padding: '18px 36px',
              borderRadius: '14px',
              fontSize: '18px',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 24px rgba(59, 130, 246, 0.4)',
              transform: 'translateY(0)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.5)';
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.4)';
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            지금 브랜딩 전략 받기
            <span style={{ fontSize: '20px' }}>🎨</span>
          </Link>
          
          <p style={{
            marginTop: '16px',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: '500'
          }}>
            🚀 무료 브랜드 진단부터 시작하세요
          </p>
        </div>

        {/* Information Cards - 새로운 브랜딩 중심 기능들 */}
        <div style={{
          marginBottom: '40px'
        }}>
          <h3 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px'
          }}>
            브랜딩 x 콘텐츠 통합 솔루션
          </h3>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '48px'
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
            backgroundColor: 'rgba(255,255,255,0.08)', 
            padding: '40px 32px', 
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            textAlign: 'left'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '24px' 
            }}>
              <div style={{ 
                fontSize: '40px', 
                marginRight: '16px',
                padding: '16px',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderRadius: '16px',
                border: '2px solid rgba(245, 158, 11, 0.3)'
              }}>🎨</div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: 'white', 
                margin: 0 
              }}>AI 브랜딩 컨설턴트</h3>
            </div>
            <p style={{ 
              color: 'rgba(255,255,255,0.85)', 
              lineHeight: '1.7',
              margin: '0 0 20px 0',
              fontSize: '16px'
            }}>
              브랜딩 전문가의 노하우가 담긴 AI가 브랜드 포지셔닝부터 차별화 전략까지 체계적으로 설계해드립니다.
            </p>
            
            <ul style={{
              margin: 0,
              paddingLeft: '0',
              listStyle: 'none',
              color: 'rgba(255,255,255,0.75)',
              fontSize: '14px'
            }}>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#f59e0b', marginRight: '8px', fontSize: '16px' }}>•</span>
                브랜드 포지셔닝 & 차별화 전략
              </li>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#f59e0b', marginRight: '8px', fontSize: '16px' }}>•</span>
                톤앤매너 & 비주얼 아이덴티티
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#f59e0b', marginRight: '8px', fontSize: '16px' }}>•</span>
                타겟 고객 분석 & 브랜드 스토리
              </li>
            </ul>
          </div>

          {/* 콘텐츠 바이럴 엔진 */}
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.08)', 
            padding: '40px 32px', 
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            textAlign: 'left'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '24px' 
            }}>
              <div style={{ 
                fontSize: '40px', 
                marginRight: '16px',
                padding: '16px',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '16px',
                border: '2px solid rgba(59, 130, 246, 0.3)'
              }}>🚀</div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: 'white', 
                margin: 0 
              }}>콘텐츠 바이럴 엔진</h3>
            </div>
            <p style={{ 
              color: 'rgba(255,255,255,0.85)', 
              lineHeight: '1.7',
              margin: '0 0 20px 0',
              fontSize: '16px'
            }}>
              브랜드 기반 바이럴 콘텐츠 전략으로 유료 광고 없이도 자연스럽게 고객이 찾아오도록 합니다.
            </p>
            
            <ul style={{
              margin: 0,
              paddingLeft: '0',
              listStyle: 'none',
              color: 'rgba(255,255,255,0.75)',
              fontSize: '14px'
            }}>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#3b82f6', marginRight: '8px', fontSize: '16px' }}>•</span>
                바이럴 가능성 예측 & 최적화
              </li>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#3b82f6', marginRight: '8px', fontSize: '16px' }}>•</span>
                플랫폼별 맞춤 콘텐츠 전략
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#3b82f6', marginRight: '8px', fontSize: '16px' }}>•</span>
                트렌드 분석 & 콘텐츠 캘린더
              </li>
            </ul>
          </div>

          {/* 찐팬 육성 시스템 */}
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.08)', 
            padding: '40px 32px', 
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            textAlign: 'left',
            position: 'relative'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '24px' 
            }}>
              <div style={{ 
                fontSize: '40px', 
                marginRight: '16px',
                padding: '16px',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '16px',
                border: '2px solid rgba(16, 185, 129, 0.3)'
              }}>💝</div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: 'white', 
                margin: 0 
              }}>찐팬 육성 시스템</h3>
            </div>
            <p style={{ 
              color: 'rgba(255,255,255,0.85)', 
              lineHeight: '1.7',
              margin: '0 0 20px 0',
              fontSize: '16px'
            }}>
              일회성 고객을 평생 팬으로 전환하여 높은 재구매율과 입소문을 통한 자연스러운 성장을 만들어드립니다.
            </p>
            
            <ul style={{
              margin: 0,
              paddingLeft: '0',
              listStyle: 'none',
              color: 'rgba(255,255,255,0.75)',
              fontSize: '14px'
            }}>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#10b981', marginRight: '8px', fontSize: '16px' }}>•</span>
                고객 여정별 맞춤 경험 설계
              </li>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#10b981', marginRight: '8px', fontSize: '16px' }}>•</span>
                LTV 증대 & 재구매율 최적화
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#10b981', marginRight: '8px', fontSize: '16px' }}>•</span>
                브랜드 옹호자 육성 & 관리
              </li>
            </ul>

            {/* Coming Soon Badge */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '700',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
            }}>
              SOON
            </div>
          </div>
        </div>

        {/* Value Proposition Section */}
        <div style={{
          marginTop: '80px',
          padding: '48px 32px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '24px',
          backdropFilter: 'blur(15px)',
          border: '2px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px'
          }}>
            왜 TaskGenius여야 할까요? 🤔
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
              <h4 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                마케팅 비용 절감
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5' }}>
                유료 광고 의존도를 줄이고<br />오가닉 바이럴로 건강한 성장
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
              <h4 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                브랜딩 통합 관리
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5' }}>
                분산된 브랜드 활동을<br />하나의 플랫폼에서 체계적으로
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💝</div>
              <h4 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                찐팬 기반 성장
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5' }}>
                일회성 고객이 아닌<br />평생 팬으로 전환하는 시스템
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
              <h4 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                AI 전문가 24시간
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', lineHeight: '1.5' }}>
                브랜딩 전문 지식 없이도<br />전문가 수준의 전략 수립
              </p>
            </div>
          </div>
          
          <Link 
            href="/chat"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#f59e0b',
              color: 'white',
              textDecoration: 'none',
              padding: '20px 40px',
              borderRadius: '16px',
              fontSize: '20px',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
              transform: 'translateY(0)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(245, 158, 11, 0.4)';
            }}
          >
            지금 바로 브랜드 성장 시작하기
            <span style={{ fontSize: '24px' }}>🎨</span>
          </Link>
        </div>

        {/* Status */}
        <div style={{ marginTop: '80px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            backgroundColor: 'rgba(34, 197, 94, 0.2)', 
            color: '#22c55e',
            padding: '12px 24px', 
            borderRadius: '50px',
            fontSize: '14px',
            fontWeight: '500',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#22c55e', 
              borderRadius: '50%', 
              marginRight: '8px',
              animation: 'pulse 2s infinite'
            }}></div>
            🎨 브랜딩 전문가 AI 베타 버전 - 무료 브랜드 진단 받아보세요!
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