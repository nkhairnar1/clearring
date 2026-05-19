import { ScoreInput, ScoreResult, ScoreBreakdown, AdminOverride } from './types';
import { classifyRisk } from './risk-classifier';

const WEIGHTS = {
  FRAUD: 35,
  SCAM: 25,
  FAKE_BANK: 30,
  OTP_SCAM: 30,
  PAYMENT_SCAM: 28,
  JOB_SCAM: 22,
  SPAM: 15,
  HARASSMENT: 10,
  TELEMARKETING: 5,
  ROBOCALL: 5,
  SILENT_CALL: 3,
  SAFE: -20,
  WRONG_NUMBER: -5,
};

const CAPS = {
  FRAUD_REPORTERS: 3,
  SCAM_REPORTERS: 5,
  SPAM_REPORTERS: 10,
  SAFE_REPORTERS: 5,
};

const VERIFIED_REDUCTION = 30;
const DISPUTE_REDUCTION_PER = 10;
const RECENCY_WINDOW_DAYS = 7;
const RECENCY_MULTIPLIER = 1.5;
const BASE_SCORE = 10;

function isRecentReport(reportedAt: Date): boolean {
  const now = new Date();
  const diffMs = now.getTime() - new Date(reportedAt).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= RECENCY_WINDOW_DAYS;
}

function getReporterWeightMultiplier(trustScore: number): number {
  if (trustScore >= 80) return 1.3;
  if (trustScore >= 60) return 1.1;
  if (trustScore >= 40) return 1.0;
  if (trustScore >= 20) return 0.8;
  return 0.6;
}

function dedupByUser(reports: ScoreInput['reports']): ScoreInput['reports'] {
  const seen = new Map<string, ScoreInput['reports'][0]>();
  for (const r of reports) {
    const key = `${r.reporterUserId}:${r.reportType}`;
    const existing = seen.get(key);
    if (!existing || new Date(r.reportedAt) > new Date(existing.reportedAt)) {
      seen.set(key, r);
    }
  }
  return Array.from(seen.values());
}

export function calculateSpamScore(input: ScoreInput): ScoreResult {
  const { reports, isVerified, adminOverride, disputeApprovedCount } = input;

  if (adminOverride === AdminOverride.CONFIRMED_FRAUD) {
    const breakdown = emptyBreakdown();
    breakdown.adminOverrideApplied = 'CONFIRMED_FRAUD → forced to 95';
    breakdown.finalScore = 95;
    return { score: 95, riskLevel: classifyRisk(95), breakdown };
  }

  if (adminOverride === AdminOverride.VERIFIED_SAFE) {
    const breakdown = emptyBreakdown();
    breakdown.adminOverrideApplied = 'VERIFIED_SAFE → forced to 5';
    breakdown.finalScore = 5;
    return { score: 5, riskLevel: classifyRisk(5), breakdown };
  }

  const deduped = dedupByUser(reports);

  let fraudContrib = 0;
  let scamContrib = 0;
  let spamContrib = 0;
  let harassmentContrib = 0;
  let telemarketingContrib = 0;
  let safeReduction = 0;
  let recencyBonus = 0;

  let fraudReporterCount = 0;
  let scamReporterCount = 0;
  let spamReporterCount = 0;
  let safeReporterCount = 0;

  const highFraudReporters = new Set<string>();
  const scamReporters = new Set<string>();
  const spamReporters = new Set<string>();
  const safeReporters = new Set<string>();

  for (const report of deduped) {
    const trustMult = getReporterWeightMultiplier(report.reporterTrustScore);
    const recencyMult = isRecentReport(report.reportedAt) ? RECENCY_MULTIPLIER : 1.0;
    const effectiveMult = trustMult * recencyMult;

    if (isRecentReport(report.reportedAt)) {
      recencyBonus += 2;
    }

    switch (report.reportType) {
      case 'FRAUD':
      case 'FAKE_BANK': {
        if (!highFraudReporters.has(report.reporterUserId) && fraudReporterCount < CAPS.FRAUD_REPORTERS) {
          highFraudReporters.add(report.reporterUserId);
          fraudReporterCount++;
          fraudContrib += WEIGHTS.FRAUD * effectiveMult;
          if (report.moneyRequested) fraudContrib += 5;
          if (report.threatUsed) fraudContrib += 5;
        }
        break;
      }
      case 'SCAM':
      case 'OTP_SCAM':
      case 'PAYMENT_SCAM':
      case 'JOB_SCAM': {
        if (!scamReporters.has(report.reporterUserId) && scamReporterCount < CAPS.SCAM_REPORTERS) {
          scamReporters.add(report.reporterUserId);
          scamReporterCount++;
          scamContrib += WEIGHTS.SCAM * effectiveMult;
          if (report.otpRequested) scamContrib += 8;
          if (report.paymentLinkRequested) scamContrib += 5;
        }
        break;
      }
      case 'SPAM':
      case 'ROBOCALL':
      case 'SILENT_CALL': {
        if (!spamReporters.has(report.reporterUserId) && spamReporterCount < CAPS.SPAM_REPORTERS) {
          spamReporters.add(report.reporterUserId);
          spamReporterCount++;
          spamContrib += WEIGHTS.SPAM * effectiveMult;
        }
        break;
      }
      case 'HARASSMENT': {
        harassmentContrib += WEIGHTS.HARASSMENT * effectiveMult;
        break;
      }
      case 'TELEMARKETING': {
        telemarketingContrib += WEIGHTS.TELEMARKETING * effectiveMult;
        break;
      }
      case 'SAFE': {
        if (!safeReporters.has(report.reporterUserId) && safeReporterCount < CAPS.SAFE_REPORTERS) {
          safeReporters.add(report.reporterUserId);
          safeReporterCount++;
          safeReduction += Math.abs(WEIGHTS.SAFE) * trustMult;
        }
        break;
      }
      case 'WRONG_NUMBER': {
        safeReduction += Math.abs(WEIGHTS.WRONG_NUMBER);
        break;
      }
    }
  }

  const verifiedReduction = isVerified && fraudReporterCount === 0 ? VERIFIED_REDUCTION : 0;
  const disputeReduction = Math.min(disputeApprovedCount * DISPUTE_REDUCTION_PER, 20);

  const rawScore =
    BASE_SCORE +
    fraudContrib +
    scamContrib +
    spamContrib +
    harassmentContrib +
    telemarketingContrib +
    recencyBonus -
    safeReduction -
    verifiedReduction -
    disputeReduction;

  const finalScore = Math.round(Math.max(0, Math.min(100, rawScore)));

  const breakdown: ScoreBreakdown = {
    baseScore: BASE_SCORE,
    fraudContribution: Math.round(fraudContrib),
    scamContribution: Math.round(scamContrib),
    spamContribution: Math.round(spamContrib),
    harassmentContribution: Math.round(harassmentContrib),
    telemarketingContribution: Math.round(telemarketingContrib),
    safeReduction: Math.round(safeReduction),
    verifiedReduction,
    disputeReduction,
    adminOverrideApplied: adminOverride,
    recencyBonus: Math.round(recencyBonus),
    finalScore,
  };

  return {
    score: finalScore,
    riskLevel: classifyRisk(finalScore),
    breakdown,
  };
}

function emptyBreakdown(): ScoreBreakdown {
  return {
    baseScore: 0,
    fraudContribution: 0,
    scamContribution: 0,
    spamContribution: 0,
    harassmentContribution: 0,
    telemarketingContribution: 0,
    safeReduction: 0,
    verifiedReduction: 0,
    disputeReduction: 0,
    adminOverrideApplied: 'NONE',
    recencyBonus: 0,
    finalScore: 0,
  };
}
