import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { NumbersService } from './numbers.service';
import { SpamScoringService } from './spam-scoring.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';

const mockPhoneRecord = {
  id: 'phone-1',
  e164Number: '+919876543210',
  countryCode: 'IN',
  nationalNumber: '9876543210',
  displayLabel: 'Unknown Caller',
  category: 'UNKNOWN',
  riskLevel: 'SAFE',
  spamScore: 10,
  isVerified: false,
  verificationType: null,
  sourceType: 'UNKNOWN',
  adminOverrideStatus: 'NONE',
  totalReports: 0,
  fraudReports: 0,
  scamReports: 0,
  spamReports: 0,
  safeReports: 0,
  lastReportedAt: null,
  businessProfiles: [],
  reports: [],
};

const mockPrisma = {
  phoneNumber: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  numberReport: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  blockedNumber: {
    create: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  lookupLog: {
    create: jest.fn(),
  },
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
};

const mockScoringService = {
  recalculateScore: jest.fn(),
};

const mockUser = { id: 'user-1', trustScore: 50 };

describe('NumbersService', () => {
  let service: NumbersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NumbersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: SpamScoringService, useValue: mockScoringService },
      ],
    }).compile();

    service = module.get<NumbersService>(NumbersService);
    jest.clearAllMocks();
    mockRedis.get.mockResolvedValue(null);
    mockRedis.setex.mockResolvedValue('OK');
    mockPrisma.lookupLog.create.mockResolvedValue({});
    mockScoringService.recalculateScore.mockResolvedValue(undefined);
  });

  describe('lookup', () => {
    it('returns result for an existing phone number', async () => {
      mockPrisma.phoneNumber.findUnique.mockResolvedValue(mockPhoneRecord);

      const result = await service.lookup('+919876543210');

      expect(result.e164).toBe('+919876543210');
      expect(result.riskLevel).toBe('SAFE');
      expect(result.fromCache).toBe(false);
    });

    it('creates a new record if number not in DB', async () => {
      mockPrisma.phoneNumber.findUnique.mockResolvedValue(null);
      mockPrisma.phoneNumber.create.mockResolvedValue(mockPhoneRecord);

      const result = await service.lookup('9876543210');

      expect(mockPrisma.phoneNumber.create).toHaveBeenCalled();
      expect(result.e164).toBe('+919876543210');
    });

    it('returns cached result when available', async () => {
      const cached = { ...mockPhoneRecord, fromCache: false, e164: '+919876543210', number: '+91 98765 43210', label: 'Unknown Caller', warnings: [], trustSignals: [], recentReports: [], businessProfile: null };
      mockRedis.get.mockResolvedValue(JSON.stringify(cached));

      const result = await service.lookup('+919876543210');
      expect(result.fromCache).toBe(true);
      expect(mockPrisma.phoneNumber.findUnique).not.toHaveBeenCalled();
    });

    it('includes warning for high spam score', async () => {
      mockPrisma.phoneNumber.findUnique.mockResolvedValue({
        ...mockPhoneRecord,
        spamScore: 90,
        fraudReports: 3,
        riskLevel: 'HIGH_RISK',
      });

      const result = await service.lookup('+919876543210');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('throws BadRequestException for clearly invalid number', async () => {
      await expect(service.lookup('abc')).rejects.toThrow(BadRequestException);
    });

    it('includes trust signal for verified number', async () => {
      mockPrisma.phoneNumber.findUnique.mockResolvedValue({
        ...mockPhoneRecord,
        isVerified: true,
        safeReports: 3,
      });

      const result = await service.lookup('+919876543210');
      expect(result.trustSignals).toContain('Verified by ClearRing admin');
    });
  });

  describe('reportNumber', () => {
    const dto = { phoneNumber: '+919876543210', reportType: 'SPAM' };

    it('creates a report and triggers score recalculation', async () => {
      mockPrisma.phoneNumber.findUnique.mockResolvedValue(mockPhoneRecord);
      mockPrisma.numberReport.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.numberReport.create.mockResolvedValue({ id: 'report-1' });

      const result = await service.reportNumber(dto as any, 'user-1');

      expect(result.success).toBe(true);
      expect(result.reportId).toBe('report-1');
      expect(mockScoringService.recalculateScore).toHaveBeenCalledWith('phone-1');
      expect(mockRedis.del).toHaveBeenCalledWith('lookup:+919876543210');
    });

    it('creates phone record if it does not exist before reporting', async () => {
      mockPrisma.phoneNumber.findUnique.mockResolvedValue(null);
      mockPrisma.phoneNumber.create.mockResolvedValue(mockPhoneRecord);
      mockPrisma.numberReport.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.numberReport.create.mockResolvedValue({ id: 'report-2' });

      const result = await service.reportNumber(dto as any, 'user-1');
      expect(mockPrisma.phoneNumber.create).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('throws ConflictException if same user reports same type twice', async () => {
      mockPrisma.phoneNumber.findUnique.mockResolvedValue(mockPhoneRecord);
      mockPrisma.numberReport.findUnique.mockResolvedValue({ id: 'existing-report' });

      await expect(service.reportNumber(dto as any, 'user-1')).rejects.toThrow(ConflictException);
    });

    it('rejects invalid phone number', async () => {
      await expect(service.reportNumber({ phoneNumber: 'bad', reportType: 'SPAM' } as any, 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('blockNumber', () => {
    it('blocks a phone number for a user', async () => {
      mockPrisma.phoneNumber.findUnique.mockResolvedValue(mockPhoneRecord);
      mockPrisma.blockedNumber.create.mockResolvedValue({ id: 'block-1' });

      const result = await service.blockNumber({ phoneNumber: '+919876543210' } as any, 'user-1');
      expect(result.success).toBe(true);
    });

    it('throws ConflictException if already blocked', async () => {
      mockPrisma.phoneNumber.findUnique.mockResolvedValue(mockPhoneRecord);
      mockPrisma.blockedNumber.create.mockRejectedValue(new Error('Unique constraint failed'));

      await expect(service.blockNumber({ phoneNumber: '+919876543210' } as any, 'user-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('getNumberById', () => {
    it('returns a phone number record by ID', async () => {
      mockPrisma.phoneNumber.findUnique.mockResolvedValue(mockPhoneRecord);
      const result = await service.getNumberById('phone-1');
      expect(result.e164Number).toBe('+919876543210');
    });

    it('throws NotFoundException for unknown ID', async () => {
      mockPrisma.phoneNumber.findUnique.mockResolvedValue(null);
      await expect(service.getNumberById('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getReports', () => {
    it('returns paginated reports', async () => {
      mockPrisma.numberReport.findMany.mockResolvedValue([{ id: 'r1', reportType: 'SPAM', createdAt: new Date() }]);
      mockPrisma.numberReport.count.mockResolvedValue(1);

      const result = await service.getReports('phone-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('calculates total pages correctly', async () => {
      mockPrisma.numberReport.findMany.mockResolvedValue([]);
      mockPrisma.numberReport.count.mockResolvedValue(45);

      const result = await service.getReports('phone-1', 1, 20);
      expect(result.totalPages).toBe(3);
    });
  });
});
