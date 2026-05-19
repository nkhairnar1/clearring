import { calculateSpamScore } from './scorer';
import { AdminOverride, RiskLevel } from './types';
import type { ReportInput } from './types';

// extend Jest matchers before tests
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: unknown[]): R;
    }
  }
}

expect.extend({
  toBeOneOf(received: unknown, expected: unknown[]) {
    const pass = expected.includes(received);
    return {
      pass,
      message: () => `expected ${received} to be one of ${JSON.stringify(expected)}`,
    };
  },
});

const baseInput = {
  reports: [] as ReportInput[],
  isVerified: false,
  adminOverride: AdminOverride.NONE,
  disputeApprovedCount: 0,
};

function makeReport(
  type: string,
  userId = 'user1',
  trustScore = 50,
  daysAgo = 1,
): ReportInput {
  const reportedAt = new Date();
  reportedAt.setDate(reportedAt.getDate() - daysAgo);
  return {
    reportType: type as ReportInput['reportType'],
    reportedAt,
    reporterTrustScore: trustScore,
    reporterUserId: userId,
  };
}

describe('SpamEngine - calculateSpamScore', () => {
  test('returns SAFE with no reports and no overrides', () => {
    const result = calculateSpamScore(baseInput);
    expect(result.score).toBeLessThanOrEqual(20);
    expect(result.riskLevel).toBe(RiskLevel.SAFE);
  });

  test('CONFIRMED_FRAUD override forces score to 95', () => {
    const result = calculateSpamScore({
      ...baseInput,
      adminOverride: AdminOverride.CONFIRMED_FRAUD,
    });
    expect(result.score).toBe(95);
    expect(result.riskLevel).toBe(RiskLevel.HIGH_RISK);
  });

  test('VERIFIED_SAFE override forces score to 5', () => {
    const result = calculateSpamScore({
      ...baseInput,
      adminOverride: AdminOverride.VERIFIED_SAFE,
    });
    expect(result.score).toBe(5);
    expect(result.riskLevel).toBe(RiskLevel.SAFE);
  });

  test('single fraud report produces high score', () => {
    const result = calculateSpamScore({
      ...baseInput,
      reports: [makeReport('FRAUD', 'user1', 70)],
    });
    expect(result.score).toBeGreaterThan(60);
    expect(result.riskLevel).toBeOneOf([RiskLevel.LIKELY_SPAM, RiskLevel.HIGH_RISK]);
  });

  test('multiple fraud reporters cap at FRAUD_REPORTERS limit', () => {
    const reports = [
      makeReport('FRAUD', 'user1', 70),
      makeReport('FRAUD', 'user2', 70),
      makeReport('FRAUD', 'user3', 70),
      makeReport('FRAUD', 'user4', 70), // should be ignored — over cap
    ];
    const result3 = calculateSpamScore({ ...baseInput, reports: reports.slice(0, 3) });
    const result4 = calculateSpamScore({ ...baseInput, reports });
    expect(result3.score).toBe(result4.score);
  });

  test('same user reporting multiple times is deduped', () => {
    const result1 = calculateSpamScore({
      ...baseInput,
      reports: [makeReport('SPAM', 'user1')],
    });
    const result2 = calculateSpamScore({
      ...baseInput,
      reports: [makeReport('SPAM', 'user1'), makeReport('SPAM', 'user1')],
    });
    expect(result1.score).toBe(result2.score);
  });

  test('safe reports reduce score', () => {
    const withFraud = calculateSpamScore({
      ...baseInput,
      reports: [makeReport('FRAUD', 'user1', 70)],
    });
    const withFraudAndSafe = calculateSpamScore({
      ...baseInput,
      reports: [makeReport('FRAUD', 'user1', 70), makeReport('SAFE', 'user2', 80)],
    });
    expect(withFraudAndSafe.score).toBeLessThan(withFraud.score);
  });

  test('verified business reduces score when no fraud reports', () => {
    const result = calculateSpamScore({
      ...baseInput,
      isVerified: true,
      reports: [makeReport('SPAM', 'user1')],
    });
    const resultUnverified = calculateSpamScore({
      ...baseInput,
      isVerified: false,
      reports: [makeReport('SPAM', 'user1')],
    });
    expect(result.score).toBeLessThan(resultUnverified.score);
  });

  test('approved disputes reduce score', () => {
    const without = calculateSpamScore({
      ...baseInput,
      reports: [makeReport('SPAM', 'user1')],
      disputeApprovedCount: 0,
    });
    const with2 = calculateSpamScore({
      ...baseInput,
      reports: [makeReport('SPAM', 'user1')],
      disputeApprovedCount: 2,
    });
    expect(with2.score).toBeLessThan(without.score);
  });

  test('high trust reporters contribute more weight', () => {
    const highTrust = calculateSpamScore({
      ...baseInput,
      reports: [makeReport('SPAM', 'user1', 90)],
    });
    const lowTrust = calculateSpamScore({
      ...baseInput,
      reports: [makeReport('SPAM', 'user1', 10)],
    });
    expect(highTrust.score).toBeGreaterThan(lowTrust.score);
  });

  test('recent reports get recency bonus', () => {
    const recent = calculateSpamScore({
      ...baseInput,
      reports: [makeReport('SPAM', 'user1', 50, 1)],
    });
    const old = calculateSpamScore({
      ...baseInput,
      reports: [makeReport('SPAM', 'user1', 50, 30)],
    });
    expect(recent.score).toBeGreaterThan(old.score);
  });

  test('score is always clamped between 0 and 100', () => {
    const manyFraud = calculateSpamScore({
      ...baseInput,
      reports: [
        makeReport('FRAUD', 'u1', 100),
        makeReport('FRAUD', 'u2', 100),
        makeReport('FRAUD', 'u3', 100),
        makeReport('OTP_SCAM', 'u4', 100),
        makeReport('PAYMENT_SCAM', 'u5', 100),
      ],
    });
    expect(manyFraud.score).toBeGreaterThanOrEqual(0);
    expect(manyFraud.score).toBeLessThanOrEqual(100);
  });

  test('OTP scam with otpRequested flag increases score', () => {
    const withFlag = calculateSpamScore({
      ...baseInput,
      reports: [{ ...makeReport('OTP_SCAM', 'user1', 70), otpRequested: true }],
    });
    const withoutFlag = calculateSpamScore({
      ...baseInput,
      reports: [{ ...makeReport('OTP_SCAM', 'user1', 70), otpRequested: false }],
    });
    expect(withFlag.score).toBeGreaterThan(withoutFlag.score);
  });

  test('risk levels map correctly to score ranges', () => {
    expect(calculateSpamScore({ ...baseInput }).riskLevel).toBe(RiskLevel.SAFE);
    expect(
      calculateSpamScore({
        ...baseInput,
        adminOverride: AdminOverride.CONFIRMED_FRAUD,
      }).riskLevel
    ).toBe(RiskLevel.HIGH_RISK);
    expect(
      calculateSpamScore({
        ...baseInput,
        adminOverride: AdminOverride.VERIFIED_SAFE,
      }).riskLevel
    ).toBe(RiskLevel.SAFE);
  });
});
