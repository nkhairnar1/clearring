import {
  RiskLevel,
  CallerCategory,
  VerificationType,
  SourceType,
  AdminOverrideStatus,
  DisputeStatus,
} from './enums';

export interface PhoneNumber {
  id: string;
  e164Number: string;
  countryCode: string;
  nationalNumber: string;
  displayLabel?: string;
  category: CallerCategory;
  spamScore: number;
  riskLevel: RiskLevel;
  confidenceScore: number;
  isVerified: boolean;
  verificationType: VerificationType;
  sourceType: SourceType;
  sourceReference?: string;
  totalReports: number;
  spamReports: number;
  fraudReports: number;
  scamReports: number;
  safeReports: number;
  lastReportedAt?: Date;
  adminOverrideStatus: AdminOverrideStatus;
  disputeStatus: DisputeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CallerIntelligence {
  phoneNumber: PhoneNumber;
  businessProfile?: {
    businessName: string;
    category: string;
    website?: string;
    address?: string;
    logoUrl?: string;
    callReasons: CallReason[];
  };
  recentReports: ReportSummary[];
  warnings: string[];
  trustSignals: string[];
}

export interface CallReason {
  id: string;
  reasonTitle: string;
  reasonDescription: string;
}

export interface ReportSummary {
  reportType: string;
  count: number;
  lastReported?: Date;
}

export interface LookupResult {
  number: string;
  e164: string;
  label: string;
  category: CallerCategory;
  riskLevel: RiskLevel;
  spamScore: number;
  isVerified: boolean;
  verificationType: VerificationType;
  sourceType: SourceType;
  totalReports: number;
  fraudReports: number;
  scamReports: number;
  spamReports: number;
  safeReports: number;
  lastReportedAt?: string;
  warnings: string[];
  trustSignals: string[];
  businessProfile?: BusinessProfile | null;
  fromCache: boolean;
}

export interface BusinessProfile {
  id: string;
  businessName: string;
  category: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  logoUrl?: string;
  callReasons?: CallReason[];
}
