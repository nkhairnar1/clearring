import { BusinessVerificationStatus, CallerCategory } from './enums';

export interface BusinessProfile {
  id: string;
  businessName: string;
  phoneNumberId: string;
  category: CallerCategory;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  logoUrl?: string;
  verificationStatus: BusinessVerificationStatus;
  verificationDocumentUrl?: string;
  claimedByUserId: string;
  approvedByAdminId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBusinessClaimDto {
  businessName: string;
  phoneNumber: string;
  category: CallerCategory;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  verificationDocumentUrl?: string;
}

export interface CreateCallReasonDto {
  reasonTitle: string;
  reasonDescription: string;
}
