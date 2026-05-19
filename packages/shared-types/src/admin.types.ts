import { AdminOverrideStatus, CallerCategory, RiskLevel } from './enums';

export interface AdminDashboardStats {
  totalNumbers: number;
  totalReports: number;
  highRiskNumbers: number;
  verifiedBusinesses: number;
  pendingDisputes: number;
  pendingBusinessClaims: number;
  todayReports: number;
  todayLookups: number;
}

export interface AdminUpdateNumberDto {
  displayLabel?: string;
  category?: CallerCategory;
  isVerified?: boolean;
  adminOverrideStatus?: AdminOverrideStatus;
  spamScore?: number;
  riskLevel?: RiskLevel;
}

export interface AdminAnalytics {
  dailyReports: Array<{ date: string; count: number }>;
  topSpamCategories: Array<{ category: string; count: number }>;
  riskLevelDistribution: Array<{ riskLevel: string; count: number }>;
  recentlySpikingNumbers: Array<{
    e164Number: string;
    displayLabel?: string;
    spamScore: number;
    recentReports: number;
  }>;
}

export interface AdminUpdateUserDto {
  isActive?: boolean;
  trustScore?: number;
  role?: string;
}
