import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';

export function formatForDisplay(e164: string): string {
  try {
    const phone = parsePhoneNumber(e164);
    return phone?.formatInternational() ?? e164;
  } catch {
    return e164;
  }
}

export function formatNational(e164: string): string {
  try {
    const phone = parsePhoneNumber(e164);
    return phone?.formatNational() ?? e164;
  } catch {
    return e164;
  }
}

export function maskNumber(e164: string): string {
  if (e164.length < 7) return e164;
  const prefix = e164.slice(0, e164.length - 4);
  return prefix.replace(/\d/g, '*') + e164.slice(-4);
}

export function getCountryFlag(countryCode: string): string {
  const codePoints = [...countryCode.toUpperCase()].map(
    (c) => 0x1f1e6 + c.charCodeAt(0) - 65,
  );
  return String.fromCodePoint(...codePoints);
}
