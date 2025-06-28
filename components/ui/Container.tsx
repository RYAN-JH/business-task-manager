'use client';

import React from 'react';
import { layoutStyles, spacing, breakpoints } from '@/lib/design-system';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  children: React.ReactNode;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'lg', padding = true, children, style, ...props }, ref) => {
    const sizeStyles = {
      sm: { maxWidth: breakpoints.sm },
      md: { maxWidth: breakpoints.md },
      lg: { maxWidth: breakpoints.lg },
      xl: { maxWidth: breakpoints.xl },
      full: { maxWidth: '100%' },
    };

    const containerStyle = {
      ...layoutStyles.container,
      ...sizeStyles[size],
      padding: padding ? `0 ${spacing[6]}` : '0',
      ...style,
    };

    return (
      <div ref={ref} style={containerStyle} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;