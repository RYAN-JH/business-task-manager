'use client';

import React from 'react';
import { typography, colors, spacing } from '@/lib/design-system';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'overline';
  size?: keyof typeof typography.fontSize;
  weight?: keyof typeof typography.fontWeight;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

const variantMapping = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  caption: 'span',
  overline: 'span',
} as const;

const variantStyles = {
  h1: {
    fontSize: typography.fontSize['6xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tighter,
    marginBottom: spacing[8],
  },
  h2: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing[6],
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing[4],
  },
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.snug,
    marginBottom: spacing[3],
  },
  h5: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing[2],
  },
  h6: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing[2],
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing[4],
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    color: colors.primary.gray[600],
  },
  overline: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.none,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase' as const,
    color: colors.primary.gray[500],
  },
};

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ 
    as, 
    variant = 'body', 
    size, 
    weight, 
    color, 
    align = 'left',
    children, 
    style, 
    ...props 
  }, ref) => {
    const Component = as || variantMapping[variant];
    const variantStyle = variantStyles[variant];

    const combinedStyle = {
      fontFamily: typography.fontFamily.primary,
      margin: 0,
      ...variantStyle,
      ...(size && { fontSize: typography.fontSize[size] }),
      ...(weight && { fontWeight: typography.fontWeight[weight] }),
      ...(color && { color }),
      textAlign: align,
      ...style,
    };

    return React.createElement(
      Component,
      {
        ref,
        style: combinedStyle,
        ...props,
      },
      children
    );
  }
);

Typography.displayName = 'Typography';

export default Typography;