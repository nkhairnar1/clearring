import { RiskLevel } from './types';

export function classifyRisk(score: number): RiskLevel {
  if (score <= 20) return RiskLevel.SAFE;
  if (score <= 40) return RiskLevel.LOW_RISK;
  if (score <= 60) return RiskLevel.CAUTION;
  if (score <= 80) return RiskLevel.LIKELY_SPAM;
  return RiskLevel.HIGH_RISK;
}

export const RISK_SCORE_RANGES: Record<RiskLevel, [number, number]> = {
  [RiskLevel.SAFE]: [0, 20],
  [RiskLevel.LOW_RISK]: [21, 40],
  [RiskLevel.CAUTION]: [41, 60],
  [RiskLevel.LIKELY_SPAM]: [61, 80],
  [RiskLevel.HIGH_RISK]: [81, 100],
};

export function getRiskLabel(riskLevel: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    [RiskLevel.SAFE]: 'Safe',
    [RiskLevel.LOW_RISK]: 'Low Risk',
    [RiskLevel.CAUTION]: 'Caution',
    [RiskLevel.LIKELY_SPAM]: 'Likely Spam',
    [RiskLevel.HIGH_RISK]: 'High Risk',
  };
  return labels[riskLevel];
}
