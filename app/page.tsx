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
                fontWeight: '500'
              }}
            >
              AI 챗봇
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
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.2s'
              }}
            >
              시작하기
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
          사업자를 위한 <br />
          <span style={{ color: '#fbbf24' }}>AI 태스크 매니저</span>
        </h1>
        
        <p style={{ 
          fontSize: '20px', 
          color: 'rgba(255,255,255,0.9)', 
          marginBottom: '48px',
          lineHeight: '1.6',
          maxWidth: '800px',
          margin: '0 auto 48px auto'
        }}>
          브랜딩 전문가와 콘텐츠 크리에이터의 노하우를 담은 AI가 <br />
          당신의 비즈니스 성장을 위한 맞춤형 업무를 매일 추천해드립니다.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '80px', flexWrap: 'wrap' }}>
          <Link 
            href="/chat" 
            style={{ 
              backgroundColor: '#f59e0b',
              color: 'white',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              transition: 'all 0.2s'
            }}
          >
            🤖 AI와 대화하기 →
          </Link>
          <Link 
            href="/chat" 
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              textDecoration: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              border: '2px solid rgba(255,255,255,0.3)',
              transition: 'all 0.2s'
            }}
          >
            무료 체험하기
          </Link>
        </div>

        {/* New AI Chatbot Preview Section */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '40px',
          borderRadius: '20px',
          marginBottom: '64px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '16px' 
          }}>
            💬 TaskGenius AI와 대화해보세요
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: 'rgba(255,255,255,0.8)', 
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            "새 프로젝트 시작하기", "오늘 할 일 정리", "팀 미팅 스케줄링" 등<br />
            작업 관리에 관한 모든 것을 AI가 도와드립니다.
          </p>
          
          {/* Sample Chat Bubbles */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            maxWidth: '600px', 
            margin: '0 auto 24px auto',
            textAlign: 'left'
          }}>
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '18px 18px 4px 18px',
              alignSelf: 'flex-end',
              maxWidth: '80%',
              fontSize: '14px'
            }}>
              새 프로젝트를 시작하려는데 어떻게 계획을 세워야 할까요?
            </div>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: '#374151',
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              alignSelf: 'flex-start',
              maxWidth: '80%',
              fontSize: '14px'
            }}>
              새 프로젝트를 시작하시는군요! 🎯<br />
              프로젝트 목표 설정부터 팀원 배정, 마일스톤 설정까지 단계별로 도와드릴게요!
            </div>
          </div>

          <Link 
            href="/chat"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            지금 AI와 대화하기 ✨
          </Link>
        </div>

        {/* Feature Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px',
          marginTop: '64px'
        }}>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            padding: '32px', 
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>AI 컨설턴트</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
              브랜딩과 콘텐츠 전문가의 페르소나가 담긴 AI가 실시간으로 맞춤형 조언을 제공합니다.
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            padding: '32px', 
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>대화형 플래닝</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
              자연스러운 대화로 프로젝트 계획, 작업 분배, 일정 관리를 쉽고 빠르게 해결하세요.
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            padding: '32px', 
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>스마트 분석</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
              업무 진행률과 팀 성과를 자동으로 분석하고 최적화된 다음 액션을 제안합니다.
            </p>
          </div>
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
              marginRight: '8px' 
            }}></div>
            🚀 AI 챗봇 베타 버전 체험 가능 - 지금 사용해보세요!
          </div>
        </div>
      </main>
    </div>
  )
}