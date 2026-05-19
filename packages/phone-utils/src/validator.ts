import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

export function isValidPhone(input: string, defaultCountry: CountryCode = 'IN'): boolean {
  try {
    return isValidPhoneNumber(input, defaultCountry);
  } catch {
    return false;
  }
}

export function isIndianMobile(e164: string): boolean {
  if (!e164.startsWith('+91')) return false;
  const national = e164.slice(3);
  return /^[6-9]\d{9}$/.test(national);
}

export function isTollFree(e164: string): boolean {
  const tollFreePatterns = [
    /^\+911800/, // India toll-free
    /^\+18(00|33|44|55|66|77|88)/, // US toll-free
  ];
  return tollFreePatterns.some((p) => p.test(e164));
}
