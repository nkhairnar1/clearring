export const RISK_COLORS = {
  SAFE: {
    bg: '#22c55e',
    text: '#ffffff',
    light: '#dcfce7',
    border: '#16a34a',
    label: 'Safe',
  },
  LOW_RISK: {
    bg: '#eab308',
    text: '#ffffff',
    light: '#fef9c3',
    border: '#ca8a04',
    label: 'Low Risk',
  },
  CAUTION: {
    bg: '#f97316',
    text: '#ffffff',
    light: '#ffedd5',
    border: '#ea580c',
    label: 'Caution',
  },
  LIKELY_SPAM: {
    bg: '#ef4444',
    text: '#ffffff',
    light: '#fee2e2',
    border: '#dc2626',
    label: 'Likely Spam',
  },
  HIGH_RISK: {
    bg: '#dc2626',
    text: '#ffffff',
    light: '#fecaca',
    border: '#b91c1c',
    label: 'High Risk / Fraud',
  },
  VERIFIED: {
    bg: '#3b82f6',
    text: '#ffffff',
    light: '#dbeafe',
    border: '#2563eb',
    label: 'Verified',
  },
  UNKNOWN: {
    bg: '#6b7280',
    text: '#ffffff',
    light: '#f3f4f6',
    border: '#4b5563',
    label: 'Unknown',
  },
} as const;

export type RiskColorKey = keyof typeof RISK_COLORS;
