'use client';

import TaskGeniusChatbot from '../../components/TaskGeniusChatbot';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // 로딩 중이면 대기
    if (!session) {
      router.push('/auth/signin') // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    }
  }, [session, status, router])

  const handleTipsToggle = () => {
    const tips = document.getElementById('brandingTips');
    if (tips) {
      tips.style.display = tips.style.display === 'none' ? 'block' : 'none';
    }
  };

  // 로딩 중이거나 세션이 없으면 로딩 표시
  if (status === 'loading' || !session) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: '#666666' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>로딩 중...</div>
          <div style={{ fontSize: '14px' }}>잠시만 기다려주세요</div>
        </div>
      </div>
    )
  }

  // 완전한 인라인 스타일 정의
  const overlayStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    padding: '16px 0',
    borderBottom: '1px solid var(--glass-border)',
  };

  const overlayContentStyles = {
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '8px'
  };

  const overlayLeftStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const overlayIconStyles = {
    width: '24px',
    height: '24px',
    background: '#2c2c2c',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
  };

  const overlayTitleStyles = {
    color: '#2c2c2c',
    fontSize: '14px',
    fontWeight: '500' as const,
    margin: 0,
    lineHeight: '1.2',
    letterSpacing: '0.01em'
  };

  const overlaySubtitleStyles = {
    color: '#666666',
    fontSize: '12px',
    margin: 0,
    lineHeight: '1.2',
    fontWeight: '400'
  };

  const overlayRightStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const homeLinkStyles = {
    color: 'hsl(var(--foreground))',
    textDecoration: 'none',
    fontSize: '13px',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
    fontWeight: '500',
    letterSpacing: '0.01em',
  };

  const onlineStatusStyles = {
    borderRadius: '8px',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const onlineDotStyles = {
    width: '6px',
    height: '6px',
    background: 'hsl(var(--primary))',
    borderRadius: '50%'
  };

  const onlineTextStyles = {
    color: 'hsl(var(--foreground))',
    fontSize: '11px',
    fontWeight: '500' as const
  };

  const mainContentStyles = {
    paddingTop: '76px'
  };

  const tipsContainerStyles = {
    position: 'fixed' as const,
    bottom: '160px',
    right: '20px',
    zIndex: 40,
    borderRadius: '12px',
    padding: '20px',
    maxWidth: '280px',
    display: 'none'
  };

  const tipsTitleStyles = {
    fontSize: '14px',
    fontWeight: '500' as const,
    color: 'hsl(var(--foreground))',
    margin: '0 0 12px 0',
    letterSpacing: '0.01em'
  };

  const tipsListStyles = {
    fontSize: '12px',
    color: 'hsl(var(--muted-foreground))',
    lineHeight: '1.5',
    margin: 0,
    paddingLeft: '16px',
    listStyle: 'disc',
    fontWeight: '400'
  };

  const tipsButtonStyles = {
    position: 'fixed' as const,
    bottom: '180px',
    right: '20px',
    zIndex: 50,
    width: '48px',
    height: '48px',
    color: 'hsl(var(--primary-foreground))',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease'
  };

  // 호버 이벤트 핸들러
  const handleHomeLinkHover = (e: React.MouseEvent<HTMLAnchorElement>, isEnter: boolean) => {
    if (isEnter) {
      e.currentTarget.style.background = '#f8f9fa';
      e.currentTarget.style.borderColor = '#b0b0b0';
    } else {
      e.currentTarget.style.background = '#ffffff';
      e.currentTarget.style.borderColor = '#d0d0d0';
    }
  };

  const handleTipsButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean) => {
    if (isEnter) {
      e.currentTarget.style.background = '#1a1a1a';
      e.currentTarget.style.transform = 'translateY(-1px)';
    } else {
      e.currentTarget.style.background = '#2c2c2c';
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  return (
    <>
      {/* CSS 애니메이션 정의 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { 
              opacity: 1; 
            }
            50% { 
              opacity: 0.5; 
            }
          }
          
          @media (max-width: 768px) {
            .tips-container {
              right: 1rem !important;
              max-width: 16rem !important;
              bottom: 11rem !important;
            }
            
            .tips-button {
              right: 1rem !important;
              bottom: 12rem !important;
              width: 2.75rem !important;
              height: 2.75rem !important;
            }
            
            .overlay-content {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 12px !important;
            }
          }
        `
      }} />

      {/* 브랜딩 전문가 소개 오버레이 */}
      <div className="glass-card" style={overlayStyles}>
        <div style={overlayContentStyles} className="overlay-content">
          <div style={overlayLeftStyles}>
            <div style={overlayIconStyles}>
              🎨
            </div>
            <div>
              <p style={overlayTitleStyles}>
                atozit & moment.ryan과 실시간 상담 중
              </p>
              <p style={overlaySubtitleStyles}>
                Claude 3 Haiku • 무제한 질문 • Threads & Instagram 통합 전략
              </p>
            </div>
          </div>
          
          <div style={overlayRightStyles}>
            <Link 
              href="/"
              className="glass-button"
              style={homeLinkStyles}
              onMouseEnter={(e) => handleHomeLinkHover(e, true)}
              onMouseLeave={(e) => handleHomeLinkHover(e, false)}
            >
              🏠 홈으로
            </Link>
            
            <div className="glass-tertiary" style={onlineStatusStyles}>
              <div style={onlineDotStyles}></div>
              <span style={onlineTextStyles}>
                실시간 연결
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 챗봇 컴포넌트 */}
      <div style={mainContentStyles}>
        <TaskGeniusChatbot />
      </div>

      {/* 하단 브랜딩 정보 */}
      <div 
        className="glass-card tips-container"
        style={tipsContainerStyles}
        id="brandingTips"
      >
        <h4 style={tipsTitleStyles}>
          💡 효과적인 질문 팁
        </h4>
        <ul style={tipsListStyles}>
          <li style={{ marginBottom: '4px' }}>구체적인 업종과 상황 설명</li>
          <li style={{ marginBottom: '4px' }}>현재 고민이나 목표 명시</li>
          <li style={{ marginBottom: '4px' }}>타겟 고객층과 브랜드 정보 포함</li>
          <li style={{ marginBottom: '4px' }}>Threads/Instagram 현황과 목표 공유</li>
        </ul>
      </div>

      {/* 팁 토글 버튼 */}
      <button
        onClick={handleTipsToggle}
        className="glass-button tips-button"
        style={tipsButtonStyles}
        title="상담 팁 보기"
        onMouseEnter={(e) => handleTipsButtonHover(e, true)}
        onMouseLeave={(e) => handleTipsButtonHover(e, false)}
      >
        💡
      </button>
    </>
  );
}