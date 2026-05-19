import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, MaxLength, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

function normalizePhone({ value }: { value: unknown }): unknown {
  if (typeof value !== 'string') return value;
  return value.replace(/[\s\-().]/g, '');
}

export enum ReportTypeDto {
  SPAM = 'SPAM',
  FRAUD = 'FRAUD',
  SCAM = 'SCAM',
  HARASSMENT = 'HARASSMENT',
  TELEMARKETING = 'TELEMARKETING',
  ROBOCALL = 'ROBOCALL',
  SILENT_CALL = 'SILENT_CALL',
  FAKE_BANK = 'FAKE_BANK',
  OTP_SCAM = 'OTP_SCAM',
  PAYMENT_SCAM = 'PAYMENT_SCAM',
  JOB_SCAM = 'JOB_SCAM',
  SAFE = 'SAFE',
  WRONG_NUMBER = 'WRONG_NUMBER',
}

export class ReportNumberDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number in E.164 format' })
  @Transform(normalizePhone)
  @IsString({ message: 'phoneNumber must be a string' })
  @IsNotEmpty({ message: 'phoneNumber is required' })
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'phoneNumber must be a valid international number' })
  phoneNumber!: string;

  @ApiProperty({ enum: ReportTypeDto, example: ReportTypeDto.SPAM })
  @IsEnum(ReportTypeDto, { message: `reportType must be one of: ${Object.values(ReportTypeDto).join(', ')}` })
  reportType!: ReportTypeDto;

  @ApiPropertyOptional({ example: 'Loan Shark Calls', description: 'Custom label for the number (max 100 chars)' })
  @IsOptional()
  @IsString({ message: 'labelSuggestion must be a string' })
  @MaxLength(100, { message: 'labelSuggestion must not exceed 100 characters' })
  labelSuggestion?: string;

  @ApiPropertyOptional({ example: 'FinServe Credit Ltd' })
  @IsOptional()
  @IsString({ message: 'businessNameSuggestion must be a string' })
  @MaxLength(100, { message: 'businessNameSuggestion must not exceed 100 characters' })
  businessNameSuggestion?: string;

  @ApiPropertyOptional({ example: 'Keeps calling about loan offers', description: 'Additional notes (max 500 chars)' })
  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  @MaxLength(500, { message: 'notes must not exceed 500 characters' })
  notes?: string;

  @ApiPropertyOptional({ example: 'Chennai' })
  @IsOptional()
  @IsString({ message: 'city must be a string' })
  @MaxLength(50, { message: 'city must not exceed 50 characters' })
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'moneyRequested must be a boolean' })
  moneyRequested?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'otpRequested must be a boolean' })
  otpRequested?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'paymentLinkRequested must be a boolean' })
  paymentLinkRequested?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'threatUsed must be a boolean' })
  threatUsed?: boolean;
}

export class MarkSafeDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString({ message: 'phoneNumber must be a string' })
  @IsNotEmpty({ message: 'phoneNumber is required' })
  phoneNumber!: string;

  @ApiPropertyOptional({ description: 'Reason for marking safe (max 200 chars)' })
  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  @MaxLength(200, { message: 'notes must not exceed 200 characters' })
  notes?: string;
}

export class BlockNumberDto {
  @ApiProperty({ example: '+919876543210' })
  @Transform(normalizePhone)
  @IsString({ message: 'phoneNumber must be a string' })
  @IsNotEmpty({ message: 'phoneNumber is required' })
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'phoneNumber must be a valid international number' })
  phoneNumber!: string;
}

export class SuggestCorrectionDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString({ message: 'phoneNumber must be a string' })
  @IsNotEmpty({ message: 'phoneNumber is required' })
  phoneNumber!: string;

  @ApiPropertyOptional({ description: 'Suggested label (max 100 chars)' })
  @IsOptional()
  @IsString({ message: 'suggestedLabel must be a string' })
  @MaxLength(100, { message: 'suggestedLabel must not exceed 100 characters' })
  suggestedLabel?: string;

  @ApiPropertyOptional({ description: 'Explanation (max 500 chars)' })
  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  @MinLength(10, { message: 'notes must be at least 10 characters to be meaningful' })
  @MaxLength(500, { message: 'notes must not exceed 500 characters' })
  notes?: string;
}
