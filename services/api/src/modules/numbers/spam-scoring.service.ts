import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { calculateSpamScore, AdminOverride, RiskLevel } from '@clearring/spam-engine';

@Injectable()
export class SpamScoringService {
  constructor(private readonly prisma: PrismaService) {}

  async recalculateScore(phoneNumberId: string): Promise<void> {
    const phoneNumber = await this.prisma.phoneNumber.findUnique({
      where: { id: phoneNumberId },
      include: {
        reports: {
          where: { status: 'APPROVED' },
          include: { reportedBy: { select: { trustScore: true, id: true } } },
        },
        disputes: { where: { status: 'APPROVED' } },
      },
    });

    if (!phoneNumber) return;

    const reports = phoneNumber.reports.map((r) => ({
      reportType: r.reportType as any,
      reportedAt: r.createdAt,
      reporterTrustScore: r.reportedBy.trustScore,
      reporterUserId: r.reportedByUserId,
      moneyRequested: r.moneyRequested,
      otpRequested: r.otpRequested,
      threatUsed: r.threatUsed,
      paymentLinkRequested: r.paymentLinkRequested,
    }));

    const adminOverride = (phoneNumber.adminOverrideStatus as AdminOverride) ?? AdminOverride.NONE;
    const disputeApprovedCount = phoneNumber.disputes.length;

    const result = calculateSpamScore({
      reports,
      isVerified: phoneNumber.isVerified,
      adminOverride,
      disputeApprovedCount,
    });

    const spamReports = phoneNumber.reports.filter(
      (r) => ['SPAM', 'TELEMARKETING', 'ROBOCALL', 'SILENT_CALL'].includes(r.reportType),
    ).length;
    const fraudReports = phoneNumber.reports.filter(
      (r) => ['FRAUD', 'FAKE_BANK'].includes(r.reportType),
    ).length;
    const scamReports = phoneNumber.reports.filter(
      (r) => ['SCAM', 'OTP_SCAM', 'PAYMENT_SCAM', 'JOB_SCAM'].includes(r.reportType),
    ).length;
    const safeReports = phoneNumber.reports.filter((r) => r.reportType === 'SAFE').length;

    await this.prisma.phoneNumber.update({
      where: { id: phoneNumberId },
      data: {
        spamScore: result.score,
        riskLevel: result.riskLevel as RiskLevel,
        totalReports: phoneNumber.reports.length,
        spamReports,
        fraudReports,
        scamReports,
        safeReports,
        lastReportedAt: phoneNumber.reports.length > 0 ? new Date() : undefined,
      },
    });
  }
}
