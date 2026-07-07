export const darkTheme = {
  colors: {
    background: '#0B0E14',
    surface: '#151922',
    surfaceElevated: '#1E2430',
    primary: '#4C8DFF',
    primaryMuted: '#274A82',
    accent: '#7C5CFF',
    text: '#F2F4F8',
    textMuted: '#9AA3B2',
    textDisabled: '#5A6270',
    border: '#2A3040',
    success: '#3DDC97',
    warning: '#FFB84C',
    danger: '#FF5C6C',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 999,
  },
  typography: {
    h1: {fontSize: 28, fontWeight: '700' as const},
    h2: {fontSize: 22, fontWeight: '700' as const},
    h3: {fontSize: 18, fontWeight: '600' as const},
    body: {fontSize: 15, fontWeight: '400' as const},
    caption: {fontSize: 12, fontWeight: '400' as const},
  },
};

export type Theme = typeof darkTheme;
