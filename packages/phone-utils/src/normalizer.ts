import {
  parsePhoneNumber,
  isValidPhoneNumber,
  CountryCode,
  PhoneNumber,
} from 'libphonenumber-js';

export interface NormalizedPhone {
  e164: string;
  countryCode: string;
  nationalNumber: string;
  countryCallingCode: string;
  isValid: boolean;
  formatted: string;
  formattedNational: string;
  formattedInternational: string;
}

export interface NormalizeOptions {
  defaultCountry?: CountryCode;
}

/**
 * Normalizes a phone number to E.164 format.
 * Defaults to IN (India) if no country prefix is provided.
 */
export function normalizePhoneNumber(
  input: string,
  options: NormalizeOptions = {},
): NormalizedPhone | null {
  const defaultCountry: CountryCode = options.defaultCountry ?? 'IN';

  try {
    const cleaned = input.replace(/[\s\-\(\)\.]/g, '');
    const phone: PhoneNumber = parsePhoneNumber(cleaned, defaultCountry);

    if (!phone || !phone.isValid()) {
      return null;
    }

    return {
      e164: phone.format('E.164'),
      countryCode: phone.country ?? '',
      nationalNumber: phone.nationalNumber,
      countryCallingCode: `+${phone.countryCallingCode}`,
      isValid: true,
      formatted: phone.format('E.164'),
      formattedNational: phone.formatNational(),
      formattedInternational: phone.formatInternational(),
    };
  } catch {
    return null;
  }
}

/**
 * Converts any phone number input to E.164, or returns null if invalid.
 */
export function toE164(input: string, defaultCountry: CountryCode = 'IN'): string | null {
  const result = normalizePhoneNumber(input, { defaultCountry });
  return result?.e164 ?? null;
}

/**
 * Extracts the country calling code from an E.164 number.
 */
export function extractCountryCode(e164: string): string | null {
  try {
    const phone = parsePhoneNumber(e164);
    return phone?.country ?? null;
  } catch {
    return null;
  }
}

/**
 * Splits E.164 into parts for DB storage.
 */
export function splitE164(e164: string): { countryCode: string; nationalNumber: string } | null {
  if (!e164.startsWith('+')) return null;
  try {
    const phone = parsePhoneNumber(e164);
    if (!phone?.isValid()) return null;
    return {
      countryCode: phone.countryCallingCode,
      nationalNumber: phone.nationalNumber,
    };
  } catch {
    return null;
  }
}

/**
 * Normalizes an Indian phone number specifically.
 * Handles common formats: 9876543210, +919876543210, 09876543210
 */
export function normalizeIndianNumber(input: string): NormalizedPhone | null {
  let cleaned = input.replace(/[\s\-\(\)\.]/g, '');

  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '+91' + cleaned.slice(1);
  } else if (/^\d{10}$/.test(cleaned)) {
    cleaned = '+91' + cleaned;
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = '+' + cleaned;
  }

  const result = normalizePhoneNumber(cleaned, { defaultCountry: 'IN' });
  if (!result || result.countryCode !== 'IN') return null;
  return result;
}

/**
 * Checks if two phone number strings represent the same number.
 */
export function isSameNumber(a: string, b: string, defaultCountry: CountryCode = 'IN'): boolean {
  const e164a = toE164(a, defaultCountry);
  const e164b = toE164(b, defaultCountry);
  if (!e164a || !e164b) return false;
  return e164a === e164b;
}

export function isValidE164(e164: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(e164) && isValidPhoneNumber(e164);
}
