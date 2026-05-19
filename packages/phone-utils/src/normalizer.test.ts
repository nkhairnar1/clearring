import { toE164, normalizePhoneNumber, normalizeIndianNumber, splitE164 } from './normalizer';

describe('phone-utils - normalizer', () => {
  describe('toE164', () => {
    test('converts Indian number without country code to E.164', () => {
      expect(toE164('9876543210', 'IN')).toBe('+919876543210');
    });

    test('converts Indian number with 0 prefix', () => {
      expect(toE164('09876543210', 'IN')).toBe('+919876543210');
    });

    test('converts number with +91 already present', () => {
      expect(toE164('+919876543210')).toBe('+919876543210');
    });

    test('converts formatted Indian number', () => {
      expect(toE164('98765 43210', 'IN')).toBe('+919876543210');
    });

    test('returns null for clearly invalid number', () => {
      expect(toE164('12345', 'IN')).toBeNull();
    });

    test('converts US number correctly', () => {
      const result = toE164('2025551234', 'US');
      expect(result).toBe('+12025551234');
    });

    test('preserves already-valid E.164', () => {
      expect(toE164('+14155552671')).toBe('+14155552671');
    });
  });

  describe('normalizePhoneNumber', () => {
    test('returns normalized info for valid Indian mobile', () => {
      const result = normalizePhoneNumber('+919876543210');
      expect(result).not.toBeNull();
      expect(result?.e164).toBe('+919876543210');
      expect(result?.countryCode).toBe('IN');
      expect(result?.isValid).toBe(true);
    });

    test('returns null for empty string', () => {
      expect(normalizePhoneNumber('')).toBeNull();
    });

    test('returns null for very short number', () => {
      expect(normalizePhoneNumber('123')).toBeNull();
    });

    test('handles spaces and dashes in number', () => {
      const result = normalizePhoneNumber('+91 98765-43210');
      expect(result).not.toBeNull();
      expect(result?.e164).toBe('+919876543210');
    });

    test('returns country code for Indian number', () => {
      const result = normalizePhoneNumber('+919876543210');
      expect(result?.countryCode).toBe('IN');
    });
  });

  describe('normalizeIndianNumber', () => {
    test('normalizes 10-digit Indian number', () => {
      const result = normalizeIndianNumber('9876543210');
      expect(result).not.toBeNull();
      expect(result?.e164).toBe('+919876543210');
    });

    test('normalizes Indian number with 91 prefix', () => {
      const result = normalizeIndianNumber('919876543210');
      expect(result).not.toBeNull();
      expect(result?.e164).toBe('+919876543210');
    });

    test('returns null for non-Indian format', () => {
      expect(normalizeIndianNumber('+12025551234')).toBeNull();
    });
  });

  describe('splitE164', () => {
    test('splits +91 number correctly', () => {
      const result = splitE164('+919876543210');
      expect(result).not.toBeNull();
      expect(result?.countryCode).toBe('91');
      expect(result?.nationalNumber).toBe('9876543210');
    });

    test('splits US number correctly', () => {
      const result = splitE164('+12025551234');
      expect(result).not.toBeNull();
      expect(result?.countryCode).toBe('1');
    });

    test('returns null for non-E164 input', () => {
      expect(splitE164('9876543210')).toBeNull();
    });
  });
});
