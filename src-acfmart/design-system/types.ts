/**
 * Định nghĩa kiểu dữ liệu cho hệ thống thiết kế ACF Marketplace
 */

// Kiểu dữ liệu cho màu HSL
export interface HSL {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
  a?: number; // Alpha (0-1), tùy chọn
}

// Kiểu dữ liệu cho các kích thước
export interface SpacingTokens {
  [key: string]: string;
}

// Kiểu dữ liệu cho typo
export interface TypographyTokens {
  fontSize: string;
  lineHeight: string;
}

// Kiểu dữ liệu cho shadow/elevation
export interface ElevationTokens {
  [key: string]: string;
}

// Kiểu dữ liệu cho radius
export interface RadiusTokens {
  [key: string]: string;
}

// Kiểu dữ liệu cho breakpoints
export interface BreakpointTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Kiểu dữ liệu cho grid system
export interface GridTokens {
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gutter: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  container: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

// Kiểu dữ liệu cho animation
export interface AnimationTokens {
  duration: {
    fast: string;
    normal: string;
    slow: string;
    slower: string;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}
