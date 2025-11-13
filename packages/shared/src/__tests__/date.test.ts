import {
  calculateNights,
  parseDate,
  formatDate,
  doDateRangesOverlap,
  isValidDateRange,
  addDays
} from '../utils/date';

describe('Date Utilities - DST Safety', () => {
  test('Spring forward weekend (Toronto): 2 nights', () => {
    // March 8-10, 2025 includes spring DST transition
    const checkIn = parseDate('2025-03-08');
    const checkOut = parseDate('2025-03-10');
    expect(calculateNights(checkIn, checkOut)).toBe(2);
  });

  test('Fall back weekend (Toronto): 2 nights', () => {
    // Nov 1-3, 2025 includes fall DST transition
    const checkIn = parseDate('2025-11-01');
    const checkOut = parseDate('2025-11-03');
    expect(calculateNights(checkIn, checkOut)).toBe(2);
  });

  test('No overlap when end = start (half-open interval)', () => {
    const range1 = {
      checkIn: parseDate('2025-05-01'),
      checkOut: parseDate('2025-05-03')
    };
    const range2 = {
      checkIn: parseDate('2025-05-03'),
      checkOut: parseDate('2025-05-05')
    };
    expect(doDateRangesOverlap(range1, range2)).toBe(false);
  });

  test('Overlap detection works correctly', () => {
    const range1 = {
      checkIn: parseDate('2025-05-01'),
      checkOut: parseDate('2025-05-05')
    };
    const range2 = {
      checkIn: parseDate('2025-05-03'),
      checkOut: parseDate('2025-05-07')
    };
    expect(doDateRangesOverlap(range1, range2)).toBe(true);
  });

  test('Format and parse are inverses', () => {
    const original = '2025-06-15';
    const parsed = parseDate(original);
    const formatted = formatDate(parsed);
    expect(formatted).toBe(original);
  });

  test('Invalid date throws error', () => {
    expect(() => parseDate('2025-13-45')).toThrow();
    expect(() => parseDate('not-a-date')).toThrow();
  });

  test('addDays works across DST', () => {
    const start = parseDate('2025-03-08');
    const result = addDays(start, 2);
    expect(formatDate(result)).toBe('2025-03-10');
  });

  test('isValidDateRange rejects past dates', () => {
    const past = parseDate('2020-01-01');
    const future = parseDate('2026-01-01');
    expect(isValidDateRange(past, future)).toBe(false);
  });
});
