// Design System - Jungle AI inspired
// Centralized design tokens for consistent theming

export const colors = {
  // Primary palette
  primary: {
    black: '#000000',
    white: '#FFFFFF',
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    }
  },
  
  // Accent colors
  accent: {
    yellow: '#FFCC0C',
    yellowHover: '#E6B800',
    yellowLight: '#FFF9D1',
  },
  
  // Semantic colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Background variations
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
    dark: '#000000',
    overlay: 'rgba(0, 0, 0, 0.6)',
  }
} as const;

export const typography = {
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    secondary: '"IBM Plex Sans", "Inter", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  }
} as const;

export const spacing = {
  0: '0rem',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  base: '0.25rem', // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

export const animations = {
  transition: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
    slowest: '500ms ease',
  },
  
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  }
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Component style generators
export const buttonStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: borderRadius.lg,
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.tight,
    transition: animations.transition.base,
    cursor: 'pointer',
    border: 'none',
    textDecoration: 'none',
    outline: 'none',
  },
  
  variants: {
    primary: {
      backgroundColor: colors.primary.black,
      color: colors.primary.white,
      padding: `${spacing[3]} ${spacing[6]}`,
      boxShadow: shadows.md,
    },
    
    secondary: {
      backgroundColor: colors.primary.white,
      color: colors.primary.black,
      border: `1px solid ${colors.primary.gray[200]}`,
      padding: `${spacing[3]} ${spacing[6]}`,
      boxShadow: shadows.sm,
    },
    
    accent: {
      backgroundColor: colors.accent.yellow,
      color: colors.primary.black,
      padding: `${spacing[3]} ${spacing[6]}`,
      boxShadow: shadows.md,
    },
    
    ghost: {
      backgroundColor: 'transparent',
      color: colors.primary.gray[700],
      padding: `${spacing[2]} ${spacing[4]}`,
    }
  },
  
  sizes: {
    sm: {
      fontSize: typography.fontSize.xs,
      padding: `${spacing[2]} ${spacing[4]}`,
    },
    md: {
      fontSize: typography.fontSize.sm,
      padding: `${spacing[3]} ${spacing[6]}`,
    },
    lg: {
      fontSize: typography.fontSize.base,
      padding: `${spacing[4]} ${spacing[8]}`,
    }
  }
} as const;

export const cardStyles = {
  base: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    border: `1px solid ${colors.primary.gray[200]}`,
    boxShadow: shadows.sm,
    transition: animations.transition.base,
  },
  
  variants: {
    elevated: {
      boxShadow: shadows.lg,
    },
    
    bordered: {
      border: `1px solid ${colors.primary.gray[300]}`,
      boxShadow: shadows.none,
    },
    
    ghost: {
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: shadows.none,
    }
  }
} as const;

export const layoutStyles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: `0 ${spacing[6]}`,
  },
  
  section: {
    padding: `${spacing[20]} 0`,
  },
  
  grid: {
    display: 'grid',
    gap: spacing[6],
  }
} as const;

// Utility functions
export const createResponsiveValue = (mobile: string, desktop: string) => ({
  mobile,
  desktop,
});

export const getColorWithOpacity = (color: string, opacity: number) => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
} as const;