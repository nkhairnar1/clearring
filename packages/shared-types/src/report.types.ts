import { ReportType, ReportStatus } from './enums';

export interface NumberReport {
  id: string;
  phoneNumberId: string;
  reportedByUserId: string;
  reportType: ReportType;
  labelSuggestion?: string;
  businessNameSuggestion?: string;
  notes?: string;
  city?: string;
  state?: string;
  country?: string;
  language?: string;
  moneyRequested: boolean;
  otpRequested: boolean;
  paymentLinkRequested: boolean;
  threatUsed: boolean;
  reportWeight: number;
  status: ReportStatus;
  createdAt: Date;
}

export interface CreateReportDto {
  phoneNumber: string;
  reportType: ReportType;
  labelSuggestion?: string;
  businessNameSuggestion?: string;
  notes?: string;
  city?: string;
  state?: string;
  country?: string;
  language?: string;
  moneyRequested?: boolean;
  otpRequested?: boolean;
  paymentLinkRequested?: boolean;
  threatUsed?: boolean;
}

export interface ReportWithDetails extends NumberReport {
  phoneNumber: {
    e164Number: string;
    displayLabel?: string;
  };
  reportedBy: {
    id: string;
    trustScore: number;
  };
}
