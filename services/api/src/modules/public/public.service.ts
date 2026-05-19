import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async joinWaitlist(dto: { email: string; phoneNumber?: string; country?: string; source?: string }) {
    const existing = await this.prisma.waitlistEntry.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already on waitlist');

    const entry = await this.prisma.waitlistEntry.create({
      data: {
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        country: dto.country ?? 'IN',
        source: dto.source ?? 'website',
      },
    });

    return { success: true, message: "You're on the waitlist! We'll notify you when ClearRing launches.", id: entry.id };
  }

  async getWaitlistCount() {
    const count = await this.prisma.waitlistEntry.count();
    return { count };
  }
}
