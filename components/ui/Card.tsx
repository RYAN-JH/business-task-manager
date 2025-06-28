'use client';

import React from 'react';
import { cardStyles, spacing } from '@/lib/design-system';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', children, style, className, ...props }, ref) => {
    const baseStyle = cardStyles.base;
    const variantStyle = variant !== 'default' ? cardStyles.variants[variant] : {};
    
    const paddingStyles = {
      none: { padding: 0 },
      sm: { padding: spacing[4] },
      md: { padding: spacing[6] },
      lg: { padding: spacing[8] },
    };

    const combinedStyle = {
      ...baseStyle,
      ...variantStyle,
      ...paddingStyles[padding],
      ...style,
    };

    // 기본 글래스모피즘 클래스 추가
    const defaultClassName = className ? `glass-card ${className}` : 'glass-card';

    return (
      <div ref={ref} className={defaultClassName} style={combinedStyle} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, style, ...props }, ref) => {
    const headerStyle = {
      marginBottom: spacing[6],
      ...style,
    };

    return (
      <div ref={ref} style={headerStyle} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, style, ...props }, ref) => {
    return (
      <div ref={ref} style={style} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export default Card;