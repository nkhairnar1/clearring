import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { SpamScoringService } from '../numbers/spam-scoring.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly auditLogs: AuditLogsService,
    private readonly scoringService: SpamScoringService,
  ) {}

  async getDashboard() {
    const [
      totalNumbers,
      totalReports,
      highRiskNumbers,
      verifiedBusinesses,
      pendingDisputes,
      pendingBusinessClaims,
      todayReports,
      waitlistCount,
    ] = await Promise.all([
      this.prisma.phoneNumber.count(),
      this.prisma.numberReport.count(),
      this.prisma.phoneNumber.count({ where: { riskLevel: 'HIGH_RISK' } }),
      this.prisma.businessProfile.count({ where: { verificationStatus: 'APPROVED' } }),
      this.prisma.dispute.count({ where: { status: 'PENDING' } }),
      this.prisma.businessProfile.count({ where: { verificationStatus: 'PENDING' } }),
      this.prisma.numberReport.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.waitlistEntry.count(),
    ]);

    return {
      totalNumbers,
      totalReports,
      highRiskNumbers,
      verifiedBusinesses,
      pendingDisputes,
      pendingBusinessClaims,
      todayReports,
      waitlistCount,
    };
  }

  async getNumbers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { e164Number: { contains: search } },
            { displayLabel: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.phoneNumber.findMany({
        where,
        skip,
        take: limit,
        orderBy: { spamScore: 'desc' },
        include: {
          businessProfiles: { select: { businessName: true, verificationStatus: true } },
          _count: { select: { reports: true } },
        },
      }),
      this.prisma.phoneNumber.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateNumber(id: string, dto: any, adminId: string) {
    const before = await this.prisma.phoneNumber.findUnique({ where: { id } });

    const updated = await this.prisma.phoneNumber.update({
      where: { id },
      data: {
        displayLabel: dto.displayLabel,
        category: dto.category,
        isVerified: dto.isVerified,
        adminOverrideStatus: dto.adminOverrideStatus,
        spamScore: dto.spamScore,
        riskLevel: dto.riskLevel,
      },
    });

    if (dto.adminOverrideStatus) {
      await this.scoringService.recalculateScore(id);
      await this.redis.del(`lookup:${updated.e164Number}`);
    }

    await this.auditLogs.log({
      actorUserId: adminId,
      action: 'ADMIN_UPDATE_NUMBER',
      entityType: 'PhoneNumber',
      entityId: id,
      metadata: { before: { label: before?.displayLabel, score: before?.spamScore }, after: dto },
    });

    return updated;
  }

  async getReports(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

    const [data, total] = await Promise.all([
      this.prisma.numberReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          phoneNumber: { select: { e164Number: true, displayLabel: true, riskLevel: true } },
          reportedBy: { select: { id: true, trustScore: true } },
        },
      }),
      this.prisma.numberReport.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async reviewReport(reportId: string, action: 'approve' | 'reject', adminId: string) {
    const report = await this.prisma.numberReport.update({
      where: { id: reportId },
      data: { status: action === 'approve' ? 'APPROVED' : 'REJECTED', approvedByUserId: adminId },
      include: { phoneNumber: true },
    });

    if (action === 'approve') {
      await this.scoringService.recalculateScore(report.phoneNumberId);
      await this.redis.del(`lookup:${report.phoneNumber.e164Number}`);
    }

    await this.auditLogs.log({
      actorUserId: adminId,
      action: `ADMIN_${action.toUpperCase()}_REPORT`,
      entityType: 'NumberReport',
      entityId: reportId,
    });

    return { success: true, action, reportId };
  }

  async getBusinessClaims(page = 1, limit = 20, status = 'PENDING') {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.businessProfile.findMany({
        where: { verificationStatus: status as any },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          phoneNumber: { select: { e164Number: true } },
          claimedBy: { select: { id: true, trustScore: true } },
        },
      }),
      this.prisma.businessProfile.count({ where: { verificationStatus: status as any } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async reviewBusinessClaim(profileId: string, action: 'approve' | 'reject', adminId: string) {
    const profile = await this.prisma.businessProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
        approvedByAdminId: action === 'approve' ? adminId : undefined,
      },
      include: { phoneNumber: true },
    });

    if (action === 'approve') {
      await this.prisma.phoneNumber.update({
        where: { id: profile.phoneNumberId },
        data: { isVerified: true, verificationType: 'DOCUMENT', sourceType: 'BUSINESS_CLAIM' },
      });
      await this.redis.del(`lookup:${profile.phoneNumber.e164Number}`);
    }

    await this.auditLogs.log({
      actorUserId: adminId,
      action: `ADMIN_${action.toUpperCase()}_BUSINESS`,
      entityType: 'BusinessProfile',
      entityId: profileId,
    });

    return { success: true, action, profileId };
  }

  async getDisputes(page = 1, limit = 20, status = 'PENDING') {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where: { status: status as any },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          phoneNumber: { select: { e164Number: true, displayLabel: true, spamScore: true } },
          submittedBy: { select: { id: true, trustScore: true } },
        },
      }),
      this.prisma.dispute.count({ where: { status: status as any } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async reviewDispute(disputeId: string, action: 'approve' | 'reject', adminId: string) {
    const dispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewedByAdminId: adminId,
      },
      include: { phoneNumber: true },
    });

    if (action === 'approve') {
      await this.prisma.phoneNumber.update({
        where: { id: dispute.phoneNumberId },
        data: { disputeStatus: 'APPROVED' },
      });
      await this.scoringService.recalculateScore(dispute.phoneNumberId);
      await this.redis.del(`lookup:${dispute.phoneNumber.e164Number}`);
    }

    await this.auditLogs.log({
      actorUserId: adminId,
      action: `ADMIN_${action.toUpperCase()}_DISPUTE`,
      entityType: 'Dispute',
      entityId: disputeId,
    });

    return { success: true, action, disputeId };
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search ? { phoneNumber: { contains: search } } : {};

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phoneNumber: true,
          name: true,
          role: true,
          trustScore: true,
          isActive: true,
          createdAt: true,
          _count: { select: { reports: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateUser(userId: string, dto: any, adminId: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: dto.isActive,
        trustScore: dto.trustScore,
        role: dto.role,
      },
    });

    await this.auditLogs.log({
      actorUserId: adminId,
      action: 'ADMIN_UPDATE_USER',
      entityType: 'User',
      entityId: userId,
      metadata: dto,
    });

    return updated;
  }

  async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, name: true, phoneNumber: true } } },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getWaitlist(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.waitlistEntry.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, phoneNumber: true, country: true, source: true, createdAt: true },
      }),
      this.prisma.waitlistEntry.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
