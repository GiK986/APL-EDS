// Real VIN: 17 chars, VIN alphabet only (ISO 3779 excludes I, O, Q).
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

export function isValidVin(value: string): boolean {
  return VIN_PATTERN.test(value);
}
