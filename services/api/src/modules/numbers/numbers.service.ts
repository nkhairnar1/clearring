import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { SpamScoringService } from './spam-scoring.service';
import { toE164, normalizePhoneNumber, splitE164 } from '@clearring/phone-utils';
import { ReportNumberDto, MarkSafeDto, BlockNumberDto, SuggestCorrectionDto } from './numbers.dto';
import { parsePhoneNumber } from 'libphonenumber-js';

const LOOKUP_CACHE_TTL = 60 * 60;

@Injectable()
export class NumbersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly scoringService: SpamScoringService,
  ) {}

  async lookup(rawNumber: string, userId?: string) {
    const e164 = toE164(rawNumber, 'IN');
    if (!e164) throw new BadRequestException('Invalid phone number format');

    const cacheKey = `lookup:${e164}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      // Increment lookup count atomically even on cache hit
      const updated = await this.prisma.phoneNumber.update({
        where: { e164Number: e164 },
        data: { lookupCount: { increment: 1 } },
        select: { id: true, lookupCount: true, createdAt: true },
      }).catch(() => null);
      await this.logLookup(userId, updated?.id ?? null, rawNumber, e164);
      return {
        ...JSON.parse(cached),
        fromCache: true,
        lookupCount: updated?.lookupCount ?? 0,
        firstSeenAt: updated?.createdAt?.toISOString() ?? null,
      };
    }

    let phoneNumber = await this.prisma.phoneNumber.findUnique({
      where: { e164Number: e164 },
      include: {
        businessProfiles: {
          where: { verificationStatus: 'APPROVED' },
          include: { callReasons: { where: { isActive: true } } },
        },
        reports: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { reportType: true, createdAt: true },
        },
      },
    });

    if (!phoneNumber) {
      const parts = splitE164(e164);
      phoneNumber = await this.prisma.phoneNumber.create({
        data: {
          e164Number: e164,
          countryCode: parts?.countryCode ?? 'IN',
          nationalNumber: parts?.nationalNumber ?? e164.slice(3),
          category: 'UNKNOWN',
          spamScore: 10,
          riskLevel: 'SAFE',
          sourceType: 'UNKNOWN',
          lookupCount: 1,
        },
        include: {
          businessProfiles: { include: { callReasons: true } },
          reports: { take: 0 },
        },
      });
    } else {
      // Increment for existing number
      await this.prisma.phoneNumber.update({
        where: { id: phoneNumber.id },
        data: { lookupCount: { increment: 1 } },
      });
      (phoneNumber as any).lookupCount = phoneNumber.lookupCount + 1;
    }

    // --- Number intelligence ---
    const numberType = this.getNumberType(e164);
    const normalizedDisplay = normalizePhoneNumber(e164)?.formattedInternational ?? e164;
    const bp = phoneNumber.businessProfiles[0];

    // Crowdsourced caller name: most commonly submitted businessNameSuggestion
    const callerNameRows = await this.prisma.numberReport.groupBy({
      by: ['businessNameSuggestion'],
      where: {
        phoneNumberId: phoneNumber.id,
        status: 'APPROVED',
        businessNameSuggestion: { not: null },
      },
      _count: { businessNameSuggestion: true },
      orderBy: { _count: { businessNameSuggestion: 'desc' } },
      take: 1,
    });
    const callerName = callerNameRows[0]?.businessNameSuggestion ?? null;

    // Similar numbers in same series flagged as HIGH_RISK / LIKELY_SPAM
    let similarNumbersHighRisk = 0;
    if (phoneNumber.spamScore < 40 && phoneNumber.nationalNumber.length >= 6) {
      const prefix = phoneNumber.nationalNumber.slice(0, 6);
      similarNumbersHighRisk = await this.prisma.phoneNumber.count({
        where: {
          nationalNumber: { startsWith: prefix },
          riskLevel: { in: ['HIGH_RISK', 'LIKELY_SPAM'] },
          id: { not: phoneNumber.id },
        },
      });
    }

    const warnings: string[] = [];
    const trustSignals: string[] = [];

    if (phoneNumber.fraudReports >= 2) warnings.push('Multiple fraud reports from the community');
    if (phoneNumber.scamReports >= 2) warnings.push('Reported as scam by multiple users');
    if (phoneNumber.spamScore >= 80) warnings.push('High risk — exercise caution');
    if (phoneNumber.adminOverrideStatus === 'CONFIRMED_FRAUD') warnings.push('Confirmed fraud by admin review');
    if (similarNumbersHighRisk > 0) warnings.push(`${similarNumbersHighRisk} similar numbers in this series have been flagged`);

    if (phoneNumber.isVerified) trustSignals.push('Verified by ClearRing admin');
    if (bp) trustSignals.push(`Verified business: ${bp.businessName}`);
    if (phoneNumber.safeReports >= 2) trustSignals.push(`${phoneNumber.safeReports} users marked as safe`);

    const result = {
      number: normalizedDisplay,
      e164,
      label: phoneNumber.displayLabel ?? 'Unknown Caller',
      category: phoneNumber.category,
      riskLevel: phoneNumber.riskLevel,
      spamScore: phoneNumber.spamScore,
      isVerified: phoneNumber.isVerified,
      verificationType: phoneNumber.verificationType,
      sourceType: phoneNumber.sourceType,
      totalReports: phoneNumber.totalReports,
      fraudReports: phoneNumber.fraudReports,
      scamReports: phoneNumber.scamReports,
      spamReports: phoneNumber.spamReports,
      safeReports: phoneNumber.safeReports,
      lastReportedAt: phoneNumber.lastReportedAt?.toISOString() ?? null,
      adminOverrideStatus: phoneNumber.adminOverrideStatus,
      numberType,
      callerName,
      similarNumbersHighRisk,
      lookupCount: (phoneNumber as any).lookupCount,
      firstSeenAt: phoneNumber.createdAt.toISOString(),
      warnings,
      trustSignals,
      recentReports: (phoneNumber.reports as any[]).map((r) => ({
        reportType: r.reportType,
        reportedAt: r.createdAt,
      })),
      businessProfile: bp
        ? {
            id: bp.id,
            businessName: bp.businessName,
            category: bp.category,
            website: bp.website,
            address: bp.address,
            city: bp.city,
            state: bp.state,
            country: bp.country,
            callReasons: bp.callReasons.map((cr: any) => ({
              id: cr.id,
              reasonTitle: cr.reasonTitle,
              reasonDescription: cr.reasonDescription,
            })),
          }
        : null,
      fromCache: false,
    };

    // Cache without dynamic fields (lookupCount changes every request)
    const toCache = { ...result };
    delete (toCache as any).lookupCount;
    delete (toCache as any).firstSeenAt;
    await this.redis.setex(cacheKey, LOOKUP_CACHE_TTL, JSON.stringify(toCache));
    await this.logLookup(userId, phoneNumber.id, rawNumber, e164);

    return result;
  }

  private getNumberType(e164: string): string {
    try {
      const phone = parsePhoneNumber(e164);
      const type = phone.getType();
      const map: Record<string, string> = {
        MOBILE: 'Mobile',
        FIXED_LINE: 'Landline',
        FIXED_LINE_OR_MOBILE: 'Mobile/Landline',
        TOLL_FREE: 'Toll-Free',
        PREMIUM_RATE: 'Premium Rate',
        SHARED_COST: 'Shared Cost',
        VOIP: 'VoIP',
        PERSONAL_NUMBER: 'Personal',
        UAN: 'UAN',
      };
      return map[type ?? ''] ?? 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  async reportNumber(dto: ReportNumberDto, userId: string) {
    const e164 = toE164(dto.phoneNumber, 'IN');
    if (!e164) throw new BadRequestException('Invalid phone number');

    let phoneNumber = await this.prisma.phoneNumber.findUnique({ where: { e164Number: e164 } });
    if (!phoneNumber) {
      const parts = splitE164(e164);
      phoneNumber = await this.prisma.phoneNumber.create({
        data: {
          e164Number: e164,
          countryCode: parts?.countryCode ?? 'IN',
          nationalNumber: parts?.nationalNumber ?? '',
          sourceType: 'COMMUNITY',
          category: 'UNKNOWN',
        },
      });
    }

    const existing = await this.prisma.numberReport.findUnique({
      where: {
        phoneNumberId_reportedByUserId_reportType: {
          phoneNumberId: phoneNumber.id,
          reportedByUserId: userId,
          reportType: dto.reportType as any,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already submitted this type of report for this number');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { trustScore: true } });
    const reportWeight = this.calculateWeight(user?.trustScore ?? 50);

    const report = await this.prisma.numberReport.create({
      data: {
        phoneNumberId: phoneNumber.id,
        reportedByUserId: userId,
        reportType: dto.reportType as any,
        labelSuggestion: dto.labelSuggestion,
        businessNameSuggestion: dto.businessNameSuggestion,
        notes: dto.notes,
        city: dto.city,
        moneyRequested: dto.moneyRequested ?? false,
        otpRequested: dto.otpRequested ?? false,
        paymentLinkRequested: dto.paymentLinkRequested ?? false,
        threatUsed: dto.threatUsed ?? false,
        reportWeight,
        status: 'APPROVED',
      },
    });

    await this.scoringService.recalculateScore(phoneNumber.id);
    await this.redis.del(`lookup:${e164}`);

    return { success: true, reportId: report.id, message: 'Report submitted and score updated' };
  }

  async markSafe(dto: MarkSafeDto, userId: string) {
    const e164 = toE164(dto.phoneNumber, 'IN');
    if (!e164) throw new BadRequestException('Invalid phone number');

    let phoneNumber = await this.prisma.phoneNumber.findUnique({ where: { e164Number: e164 } });
    if (!phoneNumber) {
      const parts = splitE164(e164);
      phoneNumber = await this.prisma.phoneNumber.create({
        data: {
          e164Number: e164,
          countryCode: parts?.countryCode ?? 'IN',
          nationalNumber: parts?.nationalNumber ?? '',
          sourceType: 'COMMUNITY',
          category: 'UNKNOWN',
        },
      });
    }

    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { trustScore: true } });
      await this.prisma.numberReport.create({
        data: {
          phoneNumberId: phoneNumber.id,
          reportedByUserId: userId,
          reportType: 'SAFE',
          notes: dto.notes,
          reportWeight: this.calculateWeight(user?.trustScore ?? 50),
          status: 'APPROVED',
        },
      });
    } catch {
      throw new ConflictException('You have already marked this number as safe');
    }

    await this.scoringService.recalculateScore(phoneNumber.id);
    await this.redis.del(`lookup:${e164}`);

    return { success: true, message: 'Number marked as safe' };
  }

  async blockNumber(dto: BlockNumberDto, userId: string) {
    const e164 = toE164(dto.phoneNumber, 'IN');
    if (!e164) throw new BadRequestException('Invalid phone number');

    let phoneNumber = await this.prisma.phoneNumber.findUnique({ where: { e164Number: e164 } });
    if (!phoneNumber) {
      const parts = splitE164(e164);
      phoneNumber = await this.prisma.phoneNumber.create({
        data: {
          e164Number: e164,
          countryCode: parts?.countryCode ?? 'IN',
          nationalNumber: parts?.nationalNumber ?? '',
          sourceType: 'COMMUNITY',
          category: 'UNKNOWN',
        },
      });
    }

    try {
      await this.prisma.blockedNumber.create({
        data: { userId, phoneNumberId: phoneNumber.id },
      });
    } catch {
      throw new ConflictException('Number already blocked');
    }

    return { success: true, message: 'Number blocked successfully' };
  }

  async getNumberById(id: string) {
    const phoneNumber = await this.prisma.phoneNumber.findUnique({
      where: { id },
      include: {
        businessProfiles: { include: { callReasons: true } },
        reports: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { reportType: true, createdAt: true, labelSuggestion: true },
        },
      },
    });

    if (!phoneNumber) throw new NotFoundException('Phone number not found');
    return phoneNumber;
  }

  async getReports(phoneNumberId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      this.prisma.numberReport.findMany({
        where: { phoneNumberId, status: 'APPROVED' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reportType: true,
          labelSuggestion: true,
          notes: true,
          city: true,
          moneyRequested: true,
          otpRequested: true,
          threatUsed: true,
          createdAt: true,
        },
      }),
      this.prisma.numberReport.count({ where: { phoneNumberId, status: 'APPROVED' } }),
    ]);

    return { data: reports, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async suggestCorrection(dto: SuggestCorrectionDto, userId: string) {
    const e164 = toE164(dto.phoneNumber, 'IN');
    if (!e164) throw new BadRequestException('Invalid phone number');

    const phoneNumber = await this.prisma.phoneNumber.findUnique({ where: { e164Number: e164 } });
    if (!phoneNumber) throw new BadRequestException('Phone number not found in our database');

    const messageParts = [
      dto.suggestedLabel ? `Suggested label: ${dto.suggestedLabel}` : null,
      dto.notes,
    ].filter(Boolean);

    await this.prisma.dispute.create({
      data: {
        phoneNumberId: phoneNumber.id,
        submittedByUserId: userId,
        disputeType: 'WRONG_LABEL',
        message: messageParts.length ? messageParts.join(' | ') : 'Label correction requested',
        status: 'PENDING',
      },
    });

    await this.prisma.phoneNumber.update({
      where: { id: phoneNumber.id },
      data: { disputeStatus: 'PENDING' },
    });

    return { success: true, message: 'Correction suggestion submitted for admin review' };
  }

  private calculateWeight(trustScore: number): number {
    if (trustScore >= 80) return 1.3;
    if (trustScore >= 60) return 1.1;
    if (trustScore >= 40) return 1.0;
    if (trustScore >= 20) return 0.8;
    return 0.6;
  }

  private async logLookup(userId: string | undefined, phoneNumberId: string | null, rawNumber: string, e164: string) {
    try {
      await this.prisma.lookupLog.create({
        data: {
          userId,
          phoneNumberId,
          lookupType: 'MANUAL',
          rawNumber,
        },
      });
    } catch {
      // Non-critical — don't fail on log error
    }
  }
}
