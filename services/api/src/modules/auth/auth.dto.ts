import { IsString, IsNotEmpty, IsEmail, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: 'you@gmail.com', description: 'Email address to receive OTP' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'you@gmail.com', description: 'Email used to request OTP' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({ example: '123456', description: 'Six-digit OTP from email' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  otp!: string;
}

export class SavePhoneDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number in E.164 format' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone number must be in E.164 format e.g. +919876543210' })
  phoneNumber!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'JWT refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

// Keep for backward compatibility
export class RegisterDto extends SendOtpDto {}
