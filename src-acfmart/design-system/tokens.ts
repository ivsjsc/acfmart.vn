/**
 * Design System Tokens cho ACF Marketplace
 * Sàn TMĐT chống hàng giả của Quỹ Chống Hàng Giả Việt Nam
 */

// Brand Colors - Màu sắc thương hiệu ACF
export const colors = {
  // Brand colors
  brand: {
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#dc2626', // Đỏ cờ Việt Nam
      600: '#b91c1c',
      700: '#991b1b',
      800: '#7f1d1d',
      900: '#450a0a',
    },
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Vàng huy hiệu chính hãng
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    }
  },
  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  }
};

// Semantic colors cho UI
export const semanticColors = {
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[700],
    muted: colors.neutral[500],
    inverse: colors.neutral[50],
  },
  background: {
    primary: colors.neutral[50],
    secondary: colors.neutral[100],
    inverse: colors.neutral[900],
  },
  surface: {
    base: colors.neutral[50],
    elevated: colors.neutral[50],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  border: {
    default: colors.neutral[200],
    focus: colors.brand.red[500],
    divider: colors.neutral[100],
  },
  interactive: {
    primary: colors.brand.red[500],
    secondary: colors.brand.gold[500],
    accent: colors.info[500],
    success: colors.success[500],
    warning: colors.warning[500],
    danger: colors.danger[500],
  }
};

// Spacing - Khoảng cách dựa trên 4px
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
};

// Typography - Chữ viết
export const typography = {
  // Font families
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    vietnamese: '"Be Vietnam Pro", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  // Font sizes
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },
  // Line heights
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  // Font weights
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  // Typography scale
  display: {
    fontSize: '60px',
    lineHeight: '1.25',
    fontWeight: '900',
  },
  h1: {
    fontSize: '48px',
    lineHeight: '1.25',
    fontWeight: '700',
  },
  h2: {
    fontSize: '36px',
    lineHeight: '1.25',
    fontWeight: '700',
  },
  h3: {
    fontSize: '30px',
    lineHeight: '1.375',
    fontWeight: '600',
  },
  h4: {
    fontSize: '24px',
    lineHeight: '1.375',
    fontWeight: '600',
  },
  body: {
    lg: {
      fontSize: '18px',
      lineHeight: '1.5',
      fontWeight: '400',
    },
    md: {
      fontSize: '16px',
      lineHeight: '1.5',
      fontWeight: '400',
    },
    sm: {
      fontSize: '14px',
      lineHeight: '1.5',
      fontWeight: '400',
    },
  },
  caption: {
    fontSize: '12px',
    lineHeight: '1.5',
    fontWeight: '500',
  }
};

// Border radius - Bo góc
export const radius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
};

// Elevation/Shadow - Đổ bóng
export const elevation = {
  flat: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Breakpoints - Điểm ngắt responsive
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Animation tokens
export const animation = {
  duration: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  }
};
