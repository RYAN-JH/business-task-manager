'use client';

import TaskGeniusChatbot from '../../components/TaskGeniusChatbot';
import Link from 'next/link';

export default function ChatPage() {
  const handleTipsToggle = () => {
    const tips = document.getElementById('brandingTips');
    if (tips) {
      tips.style.display = tips.style.display === 'none' ? 'block' : 'none';
    }
  };

  // 완전한 인라인 스타일 정의
  const overlayStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    background: 'rgba(59, 130, 246, 0.95)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)', // Safari 호환성
    padding: '12px 0',
    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
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
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  };

  const overlayTitleStyles = {
    color: 'white',
    fontSize: '14px',
    fontWeight: '600' as const,
    margin: 0,
    lineHeight: '1.2'
  };

  const overlaySubtitleStyles = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '12px',
    margin: 0,
    lineHeight: '1.2'
  };

  const overlayRightStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const homeLinkStyles = {
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    fontSize: '14px',
    padding: '6px 12px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };

  const onlineStatusStyles = {
    background: 'rgba(34, 197, 94, 0.2)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '20px',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const onlineDotStyles = {
    width: '6px',
    height: '6px',
    background: '#22c55e',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  };

  const onlineTextStyles = {
    color: 'white',
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
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    maxWidth: '280px',
    display: 'none'
  };

  const tipsTitleStyles = {
    fontSize: '14px',
    fontWeight: '600' as const,
    color: '#374151',
    margin: '0 0 8px 0'
  };

  const tipsListStyles = {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.4',
    margin: 0,
    paddingLeft: '16px',
    listStyle: 'disc'
  };

  const tipsButtonStyles = {
    position: 'fixed' as const,
    bottom: '180px',
    right: '20px',
    zIndex: 50,
    width: '48px',
    height: '48px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  };

  // 호버 이벤트 핸들러
  const handleHomeLinkHover = (e: React.MouseEvent<HTMLAnchorElement>, isEnter: boolean) => {
    if (isEnter) {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
    } else {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
    }
  };

  const handleTipsButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean) => {
    if (isEnter) {
      e.currentTarget.style.background = '#1d4ed8';
      e.currentTarget.style.transform = 'scale(1.05)';
    } else {
      e.currentTarget.style.background = '#3b82f6';
      e.currentTarget.style.transform = 'scale(1)';
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
      <div style={overlayStyles}>
        <div style={overlayContentStyles} className="overlay-content">
          <div style={overlayLeftStyles}>
            <div style={overlayIconStyles}>
              🎨
            </div>
            <div>
              <p style={overlayTitleStyles}>
                브랜딩 전문가 AI와 실시간 상담 중
              </p>
              <p style={overlaySubtitleStyles}>
                Claude 3 Haiku • 무제한 질문 • 개인화된 브랜드 전략
              </p>
            </div>
          </div>
          
          <div style={overlayRightStyles}>
            <Link 
              href="/"
              style={homeLinkStyles}
              onMouseEnter={(e) => handleHomeLinkHover(e, true)}
              onMouseLeave={(e) => handleHomeLinkHover(e, false)}
            >
              🏠 홈으로
            </Link>
            
            <div style={onlineStatusStyles}>
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
        style={tipsContainerStyles}
        id="brandingTips"
        className="tips-container"
      >
        <h4 style={tipsTitleStyles}>
          💡 효과적인 질문 팁
        </h4>
        <ul style={tipsListStyles}>
          <li style={{ marginBottom: '4px' }}>구체적인 업종과 상황 설명</li>
          <li style={{ marginBottom: '4px' }}>현재 고민이나 목표 명시</li>
          <li style={{ marginBottom: '4px' }}>타겟 고객층 정보 포함</li>
          <li style={{ marginBottom: '4px' }}>예산이나 리소스 제약 언급</li>
        </ul>
      </div>

      {/* 팁 토글 버튼 */}
      <button
        onClick={handleTipsToggle}
        style={tipsButtonStyles}
        className="tips-button"
        title="브랜딩 팁 보기"
        onMouseEnter={(e) => handleTipsButtonHover(e, true)}
        onMouseLeave={(e) => handleTipsButtonHover(e, false)}
      >
        💡
      </button>
    </>
  );
}