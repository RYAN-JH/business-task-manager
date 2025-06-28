'use client';

import React from 'react';
import { buttonStyles, animations } from '@/lib/design-system';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    children, 
    leftIcon, 
    rightIcon, 
    isLoading = false,
    style,
    onMouseEnter,
    onMouseLeave,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const baseStyle = buttonStyles.base;
    const variantStyle = buttonStyles.variants[variant];
    const sizeStyle = buttonStyles.sizes[size];

    const getHoverStyle = () => {
      if (!isHovered) return {};
      
      switch (variant) {
        case 'primary':
          return { backgroundColor: '#1a1a1a' };
        case 'secondary':
          return { 
            backgroundColor: '#f9f9f9',
            borderColor: '#d1d1d1'
          };
        case 'accent':
          return { backgroundColor: '#e6b800' };
        case 'ghost':
          return { backgroundColor: '#f5f5f5' };
        default:
          return {};
      }
    };

    const combinedStyle = {
      ...baseStyle,
      ...variantStyle,
      ...sizeStyle,
      ...getHoverStyle(),
      opacity: isLoading ? 0.7 : 1,
      cursor: isLoading ? 'not-allowed' : 'pointer',
      ...style,
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(true);
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(false);
      onMouseLeave?.(e);
    };

    // 기본 글래스모피즘 클래스 추가
    const defaultClassName = props.className ? `glass-button ${props.className}` : 'glass-button';

    return (
      <button
        ref={ref}
        className={defaultClassName}
        style={combinedStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={isLoading}
        {...props}
      >
        {isLoading && (
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        )}
        {!isLoading && leftIcon && leftIcon}
        {children}
        {!isLoading && rightIcon && rightIcon}
        
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;