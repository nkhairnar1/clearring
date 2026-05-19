import { UserRole, AppTheme } from './enums';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  phone: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface RegisterDto {
  phoneNumber: string;
  countryCode?: string;
  name?: string;
}

export interface SendOtpDto {
  phoneNumber: string;
}

export interface VerifyOtpDto {
  phoneNumber: string;
  otp: string;
}

export interface LoginDto {
  phoneNumber: string;
  otp: string;
}

export interface AuthResponse {
  user: {
    id: string;
    phoneNumber: string;
    name?: string;
    role: UserRole;
    theme: AppTheme;
  };
  tokens: AuthTokens;
}
