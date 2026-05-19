import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, phoneNumber: true, name: true, email: true,
        role: true, trustScore: true, theme: true, language: true,
        country: true, city: true, state: true, isActive: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, dto: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
        language: dto.language,
        city: dto.city,
        state: dto.state,
        country: dto.country,
      },
      select: {
        id: true, name: true, email: true, language: true, theme: true,
        city: true, state: true, country: true, updatedAt: true,
      },
    });
  }

  async updateTheme(userId: string, theme: string, platform = 'ANDROID') {
    await this.prisma.user.update({ where: { id: userId }, data: { theme: theme as any } });
    await this.prisma.themePreference.upsert({
      where: { userId_platform: { userId, platform: platform as any } },
      update: { themeName: theme as any },
      create: { userId, themeName: theme as any, platform: platform as any },
    });
    return { success: true, theme };
  }

  async getMyReports(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      this.prisma.numberReport.findMany({
        where: { reportedByUserId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { phoneNumber: { select: { e164Number: true, displayLabel: true, riskLevel: true } } },
      }),
      this.prisma.numberReport.count({ where: { reportedByUserId: userId } }),
    ]);
    return { data: reports, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMyBlocked(userId: string) {
    return this.prisma.blockedNumber.findMany({
      where: { userId },
      include: { phoneNumber: { select: { e164Number: true, displayLabel: true, category: true, riskLevel: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false, phoneNumber: `deleted_${userId}` },
    });
    return { success: true, message: 'Account deactivated' };
  }
}
