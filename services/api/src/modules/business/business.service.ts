import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { toE164, splitE164 } from '@clearring/phone-utils';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async claimBusiness(dto: any, userId: string) {
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
          sourceType: 'BUSINESS_CLAIM',
          category: dto.category ?? 'BUSINESS',
        },
      });
    }

    const existing = await this.prisma.businessProfile.findFirst({
      where: { phoneNumberId: phoneNumber.id, verificationStatus: { not: 'REJECTED' } },
    });
    if (existing) throw new ConflictException('A business claim already exists for this number');

    const profile = await this.prisma.businessProfile.create({
      data: {
        businessName: dto.businessName,
        phoneNumberId: phoneNumber.id,
        category: dto.category ?? 'BUSINESS',
        website: dto.website,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country ?? 'IN',
        verificationDocumentUrl: dto.verificationDocumentUrl,
        claimedByUserId: userId,
        verificationStatus: 'PENDING',
      },
    });

    return { success: true, profileId: profile.id, message: 'Business claim submitted for review' };
  }

  async getMyClaims(userId: string) {
    return this.prisma.businessProfile.findMany({
      where: { claimedByUserId: userId },
      include: {
        phoneNumber: { select: { e164Number: true, displayLabel: true } },
        callReasons: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProfile(id: string) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { id },
      include: {
        phoneNumber: { select: { e164Number: true, spamScore: true, isVerified: true } },
        callReasons: { where: { isActive: true } },
      },
    });
    if (!profile) throw new NotFoundException('Business profile not found');
    return profile;
  }

  async addCallReason(businessProfileId: string, dto: any, userId: string) {
    const profile = await this.prisma.businessProfile.findUnique({ where: { id: businessProfileId } });
    if (!profile) throw new NotFoundException('Business profile not found');
    if (profile.claimedByUserId !== userId) throw new BadRequestException('Not your business profile');

    return this.prisma.callReason.create({
      data: {
        businessProfileId,
        reasonTitle: dto.reasonTitle,
        reasonDescription: dto.reasonDescription,
      },
    });
  }
}
