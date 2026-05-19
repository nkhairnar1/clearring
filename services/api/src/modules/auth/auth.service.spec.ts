import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';

const mockUser = {
  id: 'user-1',
  phoneNumber: '+919876543210',
  name: 'Test User',
  role: 'USER',
  theme: 'CRYSTAL_GLASS',
  trustScore: 50,
  isActive: true,
  countryCode: 'IN',
  email: null,
  language: 'en',
  country: 'IN',
  createdAt: new Date(),
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
};

const mockOtpService = {
  sendOtp: jest.fn(),
  verifyOtp: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-access-token'),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: OtpService, useValue: mockOtpService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    mockJwtService.sign.mockReturnValue('mock-access-token');
  });

  describe('sendOtp', () => {
    it('sends OTP for a valid Indian number', async () => {
      mockOtpService.sendOtp.mockResolvedValue({ sent: true, devOtp: '123456' });
      const result = await service.sendOtp('9876543210');
      expect(mockOtpService.sendOtp).toHaveBeenCalledWith('+919876543210');
      expect(result.sent).toBe(true);
    });

    it('throws BadRequestException for invalid phone number', async () => {
      await expect(service.sendOtp('invalid')).rejects.toThrow(BadRequestException);
    });

    it('normalizes number with 0 prefix', async () => {
      mockOtpService.sendOtp.mockResolvedValue({ sent: true });
      await service.sendOtp('09876543210');
      expect(mockOtpService.sendOtp).toHaveBeenCalledWith('+919876543210');
    });
  });

  describe('verifyOtpAndLogin', () => {
    it('creates new user and returns tokens on first login', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(true);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockRedis.setex.mockResolvedValue('OK');

      const result = await service.verifyOtpAndLogin('9876543210', '123456');

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBe(900);
      expect((result.user as any).phoneNumber).toBe('+919876543210');
    });

    it('returns existing user without creating on repeat login', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(true);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockRedis.setex.mockResolvedValue('OK');

      await service.verifyOtpAndLogin('9876543210', '123456');

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException for invalid OTP', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(false);
      await expect(service.verifyOtpAndLogin('9876543210', '000000')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws BadRequestException for invalid phone number', async () => {
      await expect(service.verifyOtpAndLogin('bad', '123456')).rejects.toThrow(BadRequestException);
    });
  });

  describe('register', () => {
    it('creates a new user for a new phone number', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register('9876543210', 'Alice');
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ phoneNumber: '+919876543210', name: 'Alice' }),
        }),
      );
      expect(result.phoneNumber).toBe('+919876543210');
    });

    it('returns "already exists" message for duplicate phone', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.register('9876543210');
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(result.message).toMatch(/already exists/i);
    });

    it('rejects invalid phone number', async () => {
      await expect(service.register('000')).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshTokens', () => {
    it('issues new tokens for a valid refresh token', async () => {
      mockRedis.get.mockResolvedValue('user-1');
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockRedis.del.mockResolvedValue(1);
      mockRedis.setex.mockResolvedValue('OK');

      const result = await service.refreshTokens('valid-refresh-token');
      expect(result.accessToken).toBe('mock-access-token');
      expect(mockRedis.del).toHaveBeenCalledWith('refresh:valid-refresh-token');
    });

    it('throws for unknown refresh token', async () => {
      mockRedis.get.mockResolvedValue(null);
      await expect(service.refreshTokens('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throws for inactive user', async () => {
      mockRedis.get.mockResolvedValue('user-1');
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });
      await expect(service.refreshTokens('valid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('returns user profile fields', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.getMe('user-1');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
      expect(result).toMatchObject({ phoneNumber: '+919876543210' });
    });
  });
});
