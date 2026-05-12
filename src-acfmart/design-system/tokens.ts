import { type HSL } from './types'

// Color Tokens (HSL-based, hỗ trợ cả light và dark mode)
export const colors = {
  // Brand colors
  brand: {
    red: {
      50: { h: 0, s: 100, l: 97 } as HSL,
      100: { h: 0, s: 95, l: 92 } as HSL,
      200: { h: 0, s: 95, l: 82 } as HSL,
      300: { h: 0, s: 92, l: 70 } as HSL,
      400: { h: 0, s: 88, l: 55 } as HSL,
      500: { h: 0, s: 73, l: 46 } as HSL, // #dc2626 - đỏ cờ Việt Nam
      600: { h: 0, s: 73, l: 38 } as HSL,
      700: { h: 0, s: 73, l: 28 } as HSL,
      800: { h: 0, s: 73, l: 20 } as HSL,
      900: { h: 0, s: 73, l: 12 } as HSL,
    },
    gold: {
      50: { h: 45, s: 100, l: 97 } as HSL,
      100: { h: 45, s: 98, l: 92 } as HSL,
      200: { h: 45, s: 97, l: 82 } as HSL,
      300: { h: 45, s: 95, l: 70 } as HSL,
      400: { h: 45, s: 93, l: 58 } as HSL,
      500: { h: 45, s: 92, l: 53 } as HSL, // #f59e0b - huy hiệu chính hãng
      600: { h: 45, s: 92, l: 43 } as HSL,
      700: { h: 45, s: 92, l: 33 } as HSL,
      800: { h: 45, s: 92, l: 25 } as HSL,
      900: { h: 45, s: 92, l: 17 } as HSL,
    },
  },

  // Success, Warning, Danger, Info
  success: {
    50: { h: 142, s: 76, l: 97 } as HSL,
    100: { h: 142, s: 76, l: 92 } as HSL,
    200: { h: 142, s: 76, l: 82 } as HSL,
    300: { h: 142, s: 71, l: 70 } as HSL,
    400: { h: 142, s: 66, l: 58 } as HSL,
    500: { h: 142, s: 76, l: 47 } as HSL,
    600: { h: 142, s: 76, l: 38 } as HSL,
    700: { h: 142, s: 76, l: 28 } as HSL,
    800: { h: 142, s: 76, l: 20 } as HSL,
    900: { h: 142, s: 76, l: 12 } as HSL,
  },
  warning: {
    50: { h: 43, s: 100, l: 97 } as HSL,
    100: { h: 43, s: 100, l: 92 } as HSL,
    200: { h: 43, s: 96, l: 82 } as HSL,
    300: { h: 43, s: 94, l: 70 } as HSL,
    400: { h: 43, s: 90, l: 58 } as HSL,
    500: { h: 43, s: 84, l: 53 } as HSL,
    600: { h: 40, s: 83, l: 43 } as HSL,
    700: { h: 35, s: 84, l: 33 } as HSL,
    800: { h: 30, s: 84, l: 25 } as HSL,
    900: { h: 25, s: 84, l: 17 } as HSL,
  },
  danger: {
    50: { h: 0, s: 100, l: 97 } as HSL,
    100: { h: 0, s: 95, l: 92 } as HSL,
    200: { h: 0, s: 95, l: 82 } as HSL,
    300: { h: 0, s: 92, l: 70 } as HSL,
    400: { h: 0, s: 88, l: 55 } as HSL,
    500: { h: 0, s: 73, l: 46 } as HSL, // #dc2626 - trùng với brand.red
    600: { h: 0, s: 73, l: 38 } as HSL,
    700: { h: 0, s: 73, l: 28 } as HSL,
    800: { h: 0, s: 73, l: 20 } as HSL,
    900: { h: 0, s: 73, l: 12 } as HSL,
  },
  info: {
    50: { h: 204, s: 100, l: 97 } as HSL,
    100: { h: 204, s: 100, l: 92 } as HSL,
    200: { h: 204, s: 92, l: 82 } as HSL,
    300: { h: 204, s: 88, l: 70 } as HSL,
    400: { h: 204, s: 84, l: 58 } as HSL,
    500: { h: 204, s: 80, l: 46 } as HSL,
    600: { h: 204, s: 80, l: 38 } as HSL,
    700: { h: 204, s: 80, l: 28 } as HSL,
    800: { h: 204, s: 80, l: 20 } as HSL,
    900: { h: 204, s: 80, l: 12 } as HSL,
  },

  // Neutral colors (light theme)
  neutral: {
    50: { h: 0, s: 0, l: 98 } as HSL,
    100: { h: 0, s: 0, l: 95 } as HSL,
    200: { h: 0, s: 0, l: 90 } as HSL,
    300: { h: 0, s: 0, l: 80 } as HSL,
    400: { h: 0, s: 0, l: 65 } as HSL,
    500: { h: 0, s: 0, l: 50 } as HSL,
    600: { h: 0, s: 0, l: 40 } as HSL,
    700: { h: 0, s: 0, l: 30 } as HSL,
    800: { h: 0, s: 0, l: 20 } as HSL,
    900: { h: 0, s: 0, l: 10 } as HSL,
    950: { h: 0, s: 0, l: 5 } as HSL,
  },

  // Neutral colors (dark theme - inverted luminance)
  neutralDark: {
    50: { h: 0, s: 0, l: 5 } as HSL,
    100: { h: 0, s: 0, l: 10 } as HSL,
    200: { h: 0, s: 0, l: 15 } as HSL,
    300: { h: 0, s: 0, l: 25 } as HSL,
    400: { h: 0, s: 0, l: 35 } as HSL,
    500: { h: 0, s: 0, l: 50 } as HSL,
    600: { h: 0, s: 0, l: 60 } as HSL,
    700: { h: 0, s: 0, l: 70 } as HSL,
    800: { h: 0, s: 0, l: 85 } as HSL,
    900: { h: 0, s: 0, l: 95 } as HSL,
    950: { h: 0, s: 0, l: 98 } as HSL,
  },
}

// Semantic color tokens
export const semanticColors = {
  // Surface colors
  surface: {
    base: colors.neutral[50],
    raised: colors.neutral[100],
    sunken: colors.neutral[200],
    overlay: { ...colors.neutral[900], a: 0.7 }, // Semi-transparent overlay
  },
  
  // Text colors
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[700],
    tertiary: colors.neutral[500],
    muted: colors.neutral[400],
    inverse: colors.neutral[50],
    
    // Dark mode
    primaryDark: colors.neutralDark[50],
    secondaryDark: colors.neutralDark[200],
    tertiaryDark: colors.neutralDark[300],
    mutedDark: colors.neutralDark[400],
  },
  
  // Border colors
  border: {
    subtle: colors.neutral[300],
    default: colors.neutral[400],
    strong: colors.neutral[500],
    divider: colors.neutral[200],
    
    // Dark mode
    subtleDark: colors.neutralDark[700],
    defaultDark: colors.neutralDark[600],
    strongDark: colors.neutralDark[500],
    dividerDark: colors.neutralDark[800],
  },
  
  // Status colors
  status: {
    success: colors.success[500],
    warning: colors.warning[500],
    danger: colors.danger[500],
    info: colors.info[500],
    
    // Dark mode
    successDark: colors.success[400],
    warningDark: colors.warning[400],
    dangerDark: colors.danger[400],
    infoDark: colors.info[400],
  },
}

// Spacing scale (4px base)
export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
}

// Typography scale (using rem units)
export const typography = {
  // Display sizes
  display: {
    xl: { fontSize: '3rem', lineHeight: '3.5rem' }, // 48/56
    lg: { fontSize: '2.5rem', lineHeight: '3rem' }, // 40/48
  },
  
  // Heading sizes
  h1: { fontSize: '2rem', lineHeight: '2.5rem' }, // 32/40
  h2: { fontSize: '1.5rem', lineHeight: '2rem' }, // 24/32
  h3: { fontSize: '1.25rem', lineHeight: '1.75rem' }, // 20/28
  h4: { fontSize: '1.125rem', lineHeight: '1.5rem' }, // 18/24
  
  // Body sizes
  body: {
    lg: { fontSize: '1rem', lineHeight: '1.5rem' }, // 16/24
    md: { fontSize: '0.875rem', lineHeight: '1.25rem' }, // 14/20
    sm: { fontSize: '0.75rem', lineHeight: '1rem' }, // 12/16
  },
  
  // Caption
  caption: { fontSize: '0.6875rem', lineHeight: '0.875rem' }, // 11/14
}

// Font weights
export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

// Radius values
export const radius = {
  none: '0px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
} as const

// Elevation/shadow levels
export const elevation = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const

// Motion tokens
export const motion = {
  duration: {
    shortest: '100ms',
    shorter: '150ms',
    short: '200ms',
    standard: '300ms',
    long: '500ms',
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const

// Breakpoints
export const breakpoints = {
  sm: '360px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Grid system
export const grid = {
  columns: {
    mobile: 4,
    tablet: 8,
    desktop: 12,
  },
  gutter: {
    mobile: spacing[4],
    tablet: spacing[5],
    desktop: spacing[6],
  },
  container: {
    mobile: `calc(100% - ${spacing[4]} * 2)`,
    tablet: `calc(100% - ${spacing[5]} * 2)`,
    desktop: `min(${spacing[96]}, calc(100% - ${spacing[6]} * 2))`,
  },
}

// Minimum touch target size (44px for accessibility)
export const touchTarget = {
  min: '44px',
} as const

// Z-index layers
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
} as const