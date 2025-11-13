// Production-ready date utilities with DST safety, UTC normalization, and input validation
const DAY_MS = 86_400_000;

/**
 * Assert that a Date object is valid
 * Fails fast on invalid dates to prevent silent errors
 */
const assertValid = (d: Date, label = 'Date'): void => {
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid ${label}: ${d}`);
  }
};

/**
 * Normalize to UTC midnight to avoid DST/timezone drift
 * This ensures consistent calendar-day calculations across all timezones
 */
const utcMidnight = (d: Date): number => {
  assertValid(d);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

/**
 * Calculate number of nights between check-in and check-out
 * DST-safe: uses UTC midnight normalization and integer division
 */
export const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const start = utcMidnight(checkIn);
  const end = utcMidnight(checkOut);
  // Integer division: end-start is always a multiple of DAY_MS after normalization
  return (end - start) / DAY_MS;
};

/**
 * Strict ISO "YYYY-MM-DD" parser to UTC date
 * Avoids browser inconsistencies with Date constructor
 */
export const parseDate = (s: string): Date => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) throw new Error(`Invalid date format. Expected: YYYY-MM-DD, got: ${s}`);
  const [_, y, mo, d] = m;
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  assertValid(date, `Parsed date from ${s}`);
  return date;
};

/**
 * Format date as ISO string without timezone shift
 * Returns UTC calendar date in YYYY-MM-DD format
 */
export const formatDate = (date: Date): string => {
  assertValid(date);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Add days to a date (DST-safe)
 */
export const addDays = (date: Date, days: number): Date => {
  return new Date(utcMidnight(date) + days * DAY_MS);
};

/**
 * Half-open interval overlap detection
 * [aStart, aEnd) and [bStart, bEnd) overlap iff: aStart < bEnd && bStart < aEnd
 */
const overlaps = (
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean => aStart < bEnd && bStart < aEnd;

/**
 * Check if a date range is available (no booking conflicts)
 * Uses half-open interval logic for accurate overlap detection
 */
export const isDateRangeAvailable = (
  checkIn: Date,
  checkOut: Date,
  bookedDates: ReadonlyArray<{ checkIn: Date; checkOut: Date }>
): boolean => {
  const reqStart = utcMidnight(checkIn);
  const reqEnd = utcMidnight(checkOut);
  
  return !bookedDates.some(booking =>
    overlaps(
      reqStart,
      reqEnd,
      utcMidnight(booking.checkIn),
      utcMidnight(booking.checkOut)
    )
  );
};

/**
 * Validate if a date range is acceptable for booking
 * - Check-in must be today or later
 * - Check-out must be after check-in
 * - Maximum stay is 365 nights
 */
export const isValidDateRange = (checkIn: Date, checkOut: Date): boolean => {
  try {
    const today = new Date();
    const todayUTC = utcMidnight(today);
    const start = utcMidnight(checkIn);
    const end = utcMidnight(checkOut);
    const nights = (end - start) / DAY_MS;
    
    return start >= todayUTC && end > start && nights <= 365;
  } catch {
    return false;
  }
};

/**
 * Get all dates between start and end (exclusive of end)
 * Returns array of Date objects at UTC midnight
 */
export const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const start = utcMidnight(startDate);
  const end = utcMidnight(endDate);
  
  for (let t = start; t < end; t += DAY_MS) {
    dates.push(new Date(t));
  }
  
  return dates;
};

/**
 * Helper to check if two date ranges overlap (exposed for testing)
 * Uses half-open interval [start, end) convention
 */
export const doDateRangesOverlap = (
  range1: { checkIn: Date; checkOut: Date },
  range2: { checkIn: Date; checkOut: Date }
): boolean => {
  return overlaps(
    utcMidnight(range1.checkIn),
    utcMidnight(range1.checkOut),
    utcMidnight(range2.checkIn),
    utcMidnight(range2.checkOut)
  );
};
