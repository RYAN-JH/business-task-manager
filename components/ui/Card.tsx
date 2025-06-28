'use client';

import React from 'react';
import { cardStyles, spacing } from '@/lib/design-system';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', children, style, ...props }, ref) => {
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

    return (
      <div ref={ref} style={combinedStyle} {...props}>
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