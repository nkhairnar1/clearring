export interface ThemeTokens {
  name: string;
  displayName: string;
  description: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  blur: string;
  shadow: string;
  isDark: boolean;
}

export const THEMES: Record<string, ThemeTokens> = {
  CRYSTAL_GLASS: {
    name: 'CRYSTAL_GLASS',
    displayName: 'Crystal Glass',
    description: 'Transparent glass cards, soft blue/purple gradients, frosted panels',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #06b6d4 100%)',
    backgroundSecondary: 'rgba(99,102,241,0.15)',
    surface: 'rgba(255,255,255,0.12)',
    surfaceHover: 'rgba(255,255,255,0.18)',
    border: 'rgba(255,255,255,0.25)',
    text: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.85)',
    textMuted: 'rgba(255,255,255,0.6)',
    primary: '#6366f1',
    primaryText: '#ffffff',
    accent: '#06b6d4',
    blur: 'blur(16px)',
    shadow: '0 8px 32px rgba(0,0,0,0.2)',
    isDark: true,
  },
  MIDNIGHT_TRUST: {
    name: 'MIDNIGHT_TRUST',
    displayName: 'Midnight Trust',
    description: 'Dark premium mode with navy, slate, and electric blue highlights',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c1a3a 100%)',
    backgroundSecondary: '#1e293b',
    surface: 'rgba(30,41,59,0.9)',
    surfaceHover: 'rgba(51,65,85,0.9)',
    border: 'rgba(148,163,184,0.15)',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    primary: '#3b82f6',
    primaryText: '#ffffff',
    accent: '#06b6d4',
    blur: 'blur(12px)',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
    isDark: true,
  },
  CLEAN_LIGHT: {
    name: 'CLEAN_LIGHT',
    displayName: 'Clean Light',
    description: 'Simple white/light professional theme',
    background: '#f8fafc',
    backgroundSecondary: '#f1f5f9',
    surface: '#ffffff',
    surfaceHover: '#f8fafc',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    primary: '#6366f1',
    primaryText: '#ffffff',
    accent: '#0ea5e9',
    blur: 'none',
    shadow: '0 1px 3px rgba(0,0,0,0.1)',
    isDark: false,
  },
  HIGH_CONTRAST: {
    name: 'HIGH_CONTRAST',
    displayName: 'High Contrast',
    description: 'Accessibility-friendly high contrast theme',
    background: '#000000',
    backgroundSecondary: '#1a1a1a',
    surface: '#1a1a1a',
    surfaceHover: '#2a2a2a',
    border: '#ffffff',
    text: '#ffffff',
    textSecondary: '#ffff00',
    textMuted: '#cccccc',
    primary: '#ffff00',
    primaryText: '#000000',
    accent: '#00ffff',
    blur: 'none',
    shadow: '0 0 0 2px #ffffff',
    isDark: true,
  },
  TRUE_SIGNAL: {
    name: 'TRUE_SIGNAL',
    displayName: 'True Signal',
    description: 'Green/blue trust-first theme focused on verified callers',
    background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0e7490 100%)',
    backgroundSecondary: 'rgba(6,78,59,0.3)',
    surface: 'rgba(255,255,255,0.1)',
    surfaceHover: 'rgba(255,255,255,0.16)',
    border: 'rgba(52,211,153,0.3)',
    text: '#ecfdf5',
    textSecondary: 'rgba(236,253,245,0.85)',
    textMuted: 'rgba(236,253,245,0.6)',
    primary: '#10b981',
    primaryText: '#ffffff',
    accent: '#06b6d4',
    blur: 'blur(12px)',
    shadow: '0 8px 32px rgba(0,0,0,0.25)',
    isDark: true,
  },
};

export const DEFAULT_THEME = 'CRYSTAL_GLASS';
