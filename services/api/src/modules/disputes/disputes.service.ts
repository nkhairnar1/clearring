import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { toE164 } from '@clearring/phone-utils';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async createDispute(dto: any, userId: string) {
    const e164 = toE164(dto.phoneNumber, 'IN');
    if (!e164) throw new BadRequestException('Invalid phone number');

    const phoneNumber = await this.prisma.phoneNumber.findUnique({ where: { e164Number: e164 } });
    if (!phoneNumber) throw new BadRequestException('Phone number not found in our database');

    const dispute = await this.prisma.dispute.create({
      data: {
        phoneNumberId: phoneNumber.id,
        submittedByUserId: userId,
        disputeType: dto.disputeType ?? 'WRONG_LABEL',
        message: dto.message,
        status: 'PENDING',
      },
    });

    await this.prisma.phoneNumber.update({
      where: { id: phoneNumber.id },
      data: { disputeStatus: 'PENDING' },
    });

    return { success: true, disputeId: dispute.id, message: 'Dispute submitted for admin review' };
  }

  async getMyDisputes(userId: string) {
    return this.prisma.dispute.findMany({
      where: { submittedByUserId: userId },
      include: {
        phoneNumber: { select: { e164Number: true, displayLabel: true, spamScore: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
