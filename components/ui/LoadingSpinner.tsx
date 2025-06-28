'use client';

import React, { useState, useEffect } from 'react';
import { colors, spacing, borderRadius, shadows, typography, animations } from '@/lib/design-system';

interface LoadingSpinnerProps {
  message?: string;
  estimatedTime?: number; // 초 단위
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal' | 'detailed';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = '로딩 중...',
  estimatedTime = 5,
  showProgress = true,
  size = 'medium',
  variant = 'default'
}) => {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 0.1);
      
      // 자연스러운 진행률 계산 (초기엔 빠르게, 후반엔 천천히)
      setProgress(prev => {
        const timeRatio = elapsedTime / estimatedTime;
        const naturalProgress = Math.min(95, timeRatio * 100);
        const smoothProgress = naturalProgress - (naturalProgress - prev) * 0.3;
        return Math.min(95, smoothProgress);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [elapsedTime, estimatedTime]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: '240px', padding: '16px' },
          icon: { width: '24px', height: '24px', fontSize: '14px' },
          message: { fontSize: '12px' },
          progress: { height: '6px' }
        };
      case 'large':
        return {
          container: { width: '400px', padding: '32px' },
          icon: { width: '48px', height: '48px', fontSize: '24px' },
          message: { fontSize: '16px' },
          progress: { height: '12px' }
        };
      default:
        return {
          container: { width: '320px', padding: '24px' },
          icon: { width: '32px', height: '32px', fontSize: '18px' },
          message: { fontSize: '14px' },
          progress: { height: '8px' }
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const containerStyle = {
    ...sizeStyles.container,
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    border: '1px solid #e0e0e0',
    boxShadow: shadows.md,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typography.fontFamily.sans,
    position: 'relative' as const,
    overflow: 'hidden' as const
  };

  const iconStyle = {
    ...sizeStyles.icon,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    boxShadow: shadows.sm,
    marginBottom: spacing.md,
    animation: 'brainPulse 2s ease-in-out infinite'
  };

  const messageStyle = {
    ...sizeStyles.message,
    color: colors.primary.gray[800],
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center' as const,
    marginBottom: showProgress ? spacing.md : 0
  };

  const progressContainerStyle = {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: borderRadius.full,
    overflow: 'hidden' as const,
    marginBottom: spacing.sm,
    ...sizeStyles.progress
  };

  const progressBarStyle = {
    height: '100%',
    backgroundColor: colors.accent.yellow,
    borderRadius: borderRadius.full,
    transition: 'width 0.3s ease',
    width: `${progress}%`,
    position: 'relative' as const,
    overflow: 'hidden' as const
  };

  const progressShineStyle = {
    position: 'absolute' as const,
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    animation: 'progressShine 2s ease-in-out infinite'
  };

  const timeStyle = {
    fontSize: '11px',
    color: colors.primary.gray[600],
    textAlign: 'center' as const
  };

  const remainingTime = Math.max(0, estimatedTime - elapsedTime);
  const timeText = remainingTime > 0 
    ? `약 ${Math.ceil(remainingTime)}초 남음`
    : '거의 완료됨...';

  if (variant === 'minimal') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        <div style={{
          ...iconStyle,
          width: '20px',
          height: '20px',
          fontSize: '12px',
          marginBottom: 0
        }}>
          🧠
        </div>
        <span style={{ fontSize: '14px', color: colors.primary.gray[600] }}>
          {message}
        </span>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes brainPulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          }
          50% { 
            transform: scale(1.1); 
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
          }
        }
        
        @keyframes progressShine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div style={{
        ...containerStyle,
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <div style={iconStyle}>
          🧠
        </div>
        
        <div style={messageStyle}>
          {message}
        </div>
        
        {showProgress && (
          <>
            <div style={progressContainerStyle}>
              <div style={progressBarStyle}>
                <div style={progressShineStyle} />
              </div>
            </div>
            
            <div style={timeStyle}>
              {progress < 95 ? timeText : '마무리 중...'}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LoadingSpinner;