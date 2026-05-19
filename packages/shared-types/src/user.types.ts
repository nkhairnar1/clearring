import { UserRole, AppTheme } from './enums';

export interface User {
  id: string;
  phoneNumber: string;
  countryCode: string;
  name?: string;
  email?: string;
  role: UserRole;
  trustScore: number;
  language: string;
  theme: AppTheme;
  city?: string;
  state?: string;
  country?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublicProfile {
  id: string;
  name?: string;
  trustScore: number;
  role: UserRole;
  createdAt: Date;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  language?: string;
  city?: string;
  state?: string;
  country?: string;
}
