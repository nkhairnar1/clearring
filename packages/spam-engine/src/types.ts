export enum RiskLevel {
  SAFE = 'SAFE',
  LOW_RISK = 'LOW_RISK',
  CAUTION = 'CAUTION',
  LIKELY_SPAM = 'LIKELY_SPAM',
  HIGH_RISK = 'HIGH_RISK',
}

export enum AdminOverride {
  NONE = 'NONE',
  CONFIRMED_FRAUD = 'CONFIRMED_FRAUD',
  VERIFIED_SAFE = 'VERIFIED_SAFE',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export interface ReportInput {
  reportType:
    | 'FRAUD'
    | 'SCAM'
    | 'SPAM'
    | 'HARASSMENT'
    | 'TELEMARKETING'
    | 'ROBOCALL'
    | 'FAKE_BANK'
    | 'OTP_SCAM'
    | 'PAYMENT_SCAM'
    | 'JOB_SCAM'
    | 'SAFE'
    | 'WRONG_NUMBER'
    | 'SILENT_CALL';
  reportedAt: Date;
  reporterTrustScore: number;
  reporterUserId: string;
  moneyRequested?: boolean;
  otpRequested?: boolean;
  threatUsed?: boolean;
  paymentLinkRequested?: boolean;
}

export interface ScoreInput {
  reports: ReportInput[];
  isVerified: boolean;
  adminOverride: AdminOverride;
  disputeApprovedCount: number;
  currentScore?: number;
}

export interface ScoreResult {
  score: number;
  riskLevel: RiskLevel;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  baseScore: number;
  fraudContribution: number;
  scamContribution: number;
  spamContribution: number;
  harassmentContribution: number;
  telemarketingContribution: number;
  safeReduction: number;
  verifiedReduction: number;
  disputeReduction: number;
  adminOverrideApplied: string;
  finalScore: number;
  recencyBonus: number;
}
