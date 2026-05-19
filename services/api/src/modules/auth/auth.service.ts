import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
  private readonly REFRESH_TTL = 7 * 24 * 60 * 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
    private readonly otpService: OtpService,
  ) {}

  async sendOtp(email: string): Promise<{ sent: boolean; devOtp?: string }> {
    return this.otpService.sendOtp(email.toLowerCase().trim());
  }

  async verifyOtpAndLogin(
    email: string,
    otp: string,
  ): Promise<{ user: object; accessToken: string; refreshToken: string; expiresIn: number; isNewUser: boolean }> {
    const normalizedEmail = email.toLowerCase().trim();

    const isValid = await this.otpService.verifyOtp(normalizedEmail, otp);
    if (!isValid) throw new UnauthorizedException('Invalid or expired OTP');

    const existingUser = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    const isNewUser = !existingUser;

    const user = existingUser ?? await this.prisma.user.create({
      data: { email: normalizedEmail, role: 'USER', trustScore: 50 },
    });

    const tokens = await this.generateTokens(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
        theme: user.theme,
        trustScore: user.trustScore,
      },
      ...tokens,
      isNewUser,
    };
  }

  async savePhone(userId: string, phoneNumber: string): Promise<object> {
    const existing = await this.prisma.user.findUnique({ where: { phoneNumber } });
    if (existing && existing.id !== userId) {
      throw new BadRequestException('This phone number is already registered');
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { phoneNumber },
      select: { id: true, email: true, phoneNumber: true, name: true, role: true, theme: true, trustScore: true },
    });
    return user;
  }

  async refreshTokens(refreshToken: string) {
    const userId = await this.redis.get(`refresh:${refreshToken}`);
    if (!userId) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new UnauthorizedException('User not found');

    await this.redis.del(`refresh:${refreshToken}`);
    return this.generateTokens(user);
  }

  private async generateTokens(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();
    await this.redis.setex(`refresh:${refreshToken}`, this.REFRESH_TTL, user.id);
    return { accessToken, refreshToken, expiresIn: 15 * 60 };
  }

  private generateRefreshToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, phoneNumber: true, name: true,
        role: true, trustScore: true, theme: true,
        language: true, country: true, isActive: true, createdAt: true,
      },
    });
  }

  reset() { /* noop — kept for interface compat */ }
}
