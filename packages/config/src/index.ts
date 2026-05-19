export const APP_NAME = 'ClearRing';
export const APP_TAGLINE = "Know who's calling before you answer.";
export const APP_VERSION = '1.0.0';

export const API_DEFAULTS = {
  PORT: 3001,
  PREFIX: 'api',
  VERSION: 'v1',
} as const;

export const WEB_DEFAULTS = {
  PORT: 3000,
} as const;

export const ADMIN_DEFAULTS = {
  PORT: 3002,
} as const;

export const CACHE_TTL = {
  LOOKUP: 60 * 60,       // 1 hour
  OTP: 5 * 60,           // 5 minutes
  DASHBOARD: 5 * 60,     // 5 minutes
  ANALYTICS: 30 * 60,    // 30 minutes
} as const;

export const RATE_LIMITS = {
  DEFAULT_TTL: 60,
  DEFAULT_LIMIT: 100,
  LOOKUP_TTL: 60,
  LOOKUP_LIMIT: 30,
  REPORT_TTL: 60 * 10,
  REPORT_LIMIT: 5,
  AUTH_TTL: 60,
  AUTH_LIMIT: 10,
} as const;

export const SCORE_THRESHOLDS = {
  SAFE: 20,
  LOW_RISK: 40,
  CAUTION: 60,
  LIKELY_SPAM: 80,
} as const;

export const DEV_OTP = '123456';

export const SUPPORTED_COUNTRIES = [
  'IN', 'US', 'GB', 'AU', 'CA', 'SG', 'AE', 'DE', 'FR', 'JP',
] as const;

export const DEFAULT_COUNTRY = 'IN';
export const DEFAULT_LANGUAGE = 'en';
