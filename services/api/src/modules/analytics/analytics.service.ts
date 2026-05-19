import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics() {
    const [
      riskDistribution,
      categoryDistribution,
      topHighRisk,
      recentSpike,
    ] = await Promise.all([
      this.prisma.phoneNumber.groupBy({
        by: ['riskLevel'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.phoneNumber.groupBy({
        by: ['category'],
        _count: { id: true },
        where: { spamScore: { gte: 50 } },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      this.prisma.phoneNumber.findMany({
        where: { riskLevel: 'HIGH_RISK' },
        orderBy: { spamScore: 'desc' },
        take: 5,
        select: { e164Number: true, displayLabel: true, spamScore: true, totalReports: true },
      }),
      this.prisma.numberReport.groupBy({
        by: ['reportType'],
        _count: { id: true },
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    const dailyReports = await this.getDailyReports(7);

    return {
      riskDistribution: riskDistribution.map((r) => ({
        riskLevel: r.riskLevel,
        count: r._count.id,
      })),
      categoryDistribution: categoryDistribution.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
      topHighRiskNumbers: topHighRisk,
      recentSpike: recentSpike.map((r) => ({
        reportType: r.reportType,
        count: r._count.id,
      })),
      dailyReports,
    };
  }

  private async getDailyReports(days: number) {
    const result: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const count = await this.prisma.numberReport.count({
        where: { createdAt: { gte: start, lte: end } },
      });

      result.push({ date: start.toISOString().split('T')[0], count });
    }
    return result;
  }
}
