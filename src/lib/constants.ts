// TERENCE RICHARDSON SIGNATURE DESIGN SYSTEM
export const COLORS = {
  // Primary Colors - Black Theme
  primary: {
    50: '#f7f7f8',
    100: '#e5e5e5',
    200: '#d4d4d4',
    300: '#a3a3a3',
    400: '#737373',
    500: '#000000', // Primary black
    600: '#0a0a0a', // Secondary black
    700: '#111111', // Panel black
    800: '#0a0a0a',
    900: '#000000',
  },
  
  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Accent Colors - Signature Red
  accent: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#dc2626', // Signature red
    600: '#b91c1c', // Red hover
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Status Colors
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
  
  error: {
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
  
  // Neutral Colors - Dark Theme
  neutral: {
    50: '#ffffff', // Text primary
    100: '#e5e5e5', // Text secondary
    200: '#9ca3af', // Text muted
    300: '#6b7280',
    400: '#4b5563',
    500: '#374151',
    600: '#2d2d2d', // Border
    700: '#3d3d3d', // Border hover
    800: '#1f2937',
    900: '#111827',
  },
} as const;

// Spacing Scale
export const SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '32px',
  8: '40px',
  9: '48px',
  10: '56px',
  11: '64px',
  12: '80px',
  13: '96px',
  14: '128px',
  15: '160px',
  16: '192px',
  17: '224px',
  18: '256px',
} as const;

// Typography Scale
export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },
  
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
    '7xl': '72px',
    '8xl': '96px',
    '9xl': '128px',
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
} as const;

// Border Radius
export const BORDER_RADIUS = {
  none: '0px',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
} as const;

// Breakpoints
export const BREAKPOINTS = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-Index Scale
export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  fastest: '75ms',
  faster: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '700ms',
} as const;

// Animation Easing
export const ANIMATION_EASING = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// Job Status Configuration
export const JOB_STATUS = {
  APPLIED: {
    label: 'Applied',
    color: COLORS.primary[500],
    bgColor: COLORS.primary[50],
    textColor: COLORS.primary[700],
  },
  INTERVIEW: {
    label: 'Interview',
    color: COLORS.warning[500],
    bgColor: COLORS.warning[50],
    textColor: COLORS.warning[700],
  },
  OFFER: {
    label: 'Offer',
    color: COLORS.success[500],
    bgColor: COLORS.success[50],
    textColor: COLORS.success[700],
  },
  REJECTED: {
    label: 'Rejected',
    color: COLORS.error[500],
    bgColor: COLORS.error[50],
    textColor: COLORS.error[700],
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    color: COLORS.neutral[500],
    bgColor: COLORS.neutral[50],
    textColor: COLORS.neutral[700],
  },
  ARCHIVED: {
    label: 'Archived',
    color: COLORS.neutral[400],
    bgColor: COLORS.neutral[50],
    textColor: COLORS.neutral[600],
  },
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'job-tracker-user-preferences',
  THEME: 'job-tracker-theme',
  FILTERS: 'job-tracker-filters',
  DASHBOARD_LAYOUT: 'job-tracker-dashboard-layout',
} as const;

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  URL_REGEX: /^https?:\/\/.+/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 1000,
  MAX_TITLE_LENGTH: 100,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [6, 12, 24, 48],
  MAX_PAGE_SIZE: 100,
} as const;

// TERENCE RICHARDSON SIGNATURE DESIGN TOKENS
export const SIGNATURE_TOKENS = {
  // Core Colors
  primaryBg: '#000000',
  secondaryBg: '#0a0a0a',
  panelBg: '#111111',
  accent: '#dc2626',
  accentHover: '#b91c1c',
  accentGlow: 'rgba(220, 38, 38, 0.5)',
  
  // Text Colors
  textPrimary: '#ffffff',
  textSecondary: '#e5e5e5',
  textMuted: '#9ca3af',
  
  // Borders & Overlays
  border: '#2d2d2d',
  borderHover: '#3d3d3d',
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  error: '#ef4444',
  
  // Spacing Scale (8px grid)
  spaceXs: '0.5rem',
  spaceSm: '0.75rem',
  spaceMd: '1rem',
  spaceLg: '1.5rem',
  spaceXl: '2rem',
  space2xl: '3rem',
  
  // Typography Scale
  fontXs: '0.75rem',
  fontSm: '0.875rem',
  fontMd: '1rem',
  fontLg: '1.125rem',
  fontXl: '1.5rem',
  font2xl: '2rem',
  font3xl: '2.5rem',
  
  // Animation
  transitionFast: '150ms ease',
  transitionBase: '250ms ease',
  transitionSlow: '350ms ease',
  
  // Shadows
  shadowSm: '0 1px 2px rgba(0, 0, 0, 0.5)',
  shadowMd: '0 4px 6px rgba(0, 0, 0, 0.5)',
  shadowLg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  shadowXl: '0 20px 25px rgba(0, 0, 0, 0.5)',
  shadowGlow: '0 0 20px rgba(220, 38, 38, 0.5)',
} as const;

// Export all constants as a single object for easy access
export const DESIGN_TOKENS = {
  colors: COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  animation: {
    duration: ANIMATION_DURATION,
    easing: ANIMATION_EASING,
  },
  jobStatus: JOB_STATUS,
  api: API_CONFIG,
  storage: STORAGE_KEYS,
  validation: VALIDATION,
  pagination: PAGINATION,
  signature: SIGNATURE_TOKENS,
} as const;
