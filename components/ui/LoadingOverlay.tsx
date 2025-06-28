'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  estimatedTime?: number;
  showProgress?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
  onCancel?: () => void;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = '데이터를 불러오는 중...',
  estimatedTime = 5,
  showProgress = true,
  variant = 'default',
  onCancel
}) => {
  if (!isVisible) return null;

  const overlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(2px)',
    animation: 'fadeIn 0.2s ease-out'
  };

  const cancelButtonStyle = {
    marginTop: '16px',
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #d0d0d0',
    borderRadius: '6px',
    color: '#666',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      <div style={overlayStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <LoadingSpinner
            message={message}
            estimatedTime={estimatedTime}
            showProgress={showProgress}
            size="medium"
            variant={variant}
          />
          
          {onCancel && (
            <button
              style={cancelButtonStyle}
              onClick={onCancel}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#b0b0b0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#d0d0d0';
              }}
            >
              취소
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default LoadingOverlay;