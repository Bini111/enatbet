import { format, formatDistance, formatDistanceToNow, isValid, parseISO, differenceInDays } from 'date-fns';

/**
 * Formatting Utilities - Enatebet Platform
 * Consistent formatting across web and mobile
 */

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyDetailed = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPriceRange = (min: number, max: number, currency: string = 'USD'): string => {
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
};

// ============================================================================
// DATE FORMATTING
// ============================================================================

export const formatDate = (date: Date | string, formatString: string = 'MMM d, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, formatString) : 'Invalid date';
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'MMM d, yyyy h:mm a');
};

export const formatShortDate = (date: Date | string): string => {
  return formatDate(date, 'MMM d');
};

export const formatFullDate = (date: Date | string): string => {
  return formatDate(date, 'EEEE, MMMM d, yyyy');
};

export const formatTimeAgo = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : 'Invalid date';
};

export const formatDateRange = (startDate: Date | string, endDate: Date | string): string => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) return 'Invalid date range';

  const startMonth = format(start, 'MMM');
  const endMonth = format(end, 'MMM');
  const startDay = format(start, 'd');
  const endDay = format(end, 'd');
  const startYear = format(start, 'yyyy');
  const endYear = format(end, 'yyyy');

  if (startYear !== endYear) {
    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
  }

  if (startMonth !== endMonth) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  }

  return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
};

export const calculateNights = (checkIn: Date | string, checkOut: Date | string): number => {
  const start = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut;

  if (!isValid(start) || !isValid(end)) return 0;

  return differenceInDays(end, start);
};

// ============================================================================
// GUEST FORMATTING
// ============================================================================

export const formatGuestCount = (guests: {
  adults: number;
  children?: number;
  infants?: number;
  pets?: number;
}): string => {
  const parts: string[] = [];

  if (guests.adults === 1) parts.push('1 adult');
  if (guests.adults > 1) parts.push(`${guests.adults} adults`);

  if (guests.children === 1) parts.push('1 child');
  if (guests.children && guests.children > 1) parts.push(`${guests.children} children`);

  if (guests.infants === 1) parts.push('1 infant');
  if (guests.infants && guests.infants > 1) parts.push(`${guests.infants} infants`);

  if (guests.pets === 1) parts.push('1 pet');
  if (guests.pets && guests.pets > 1) parts.push(`${guests.pets} pets`);

  return parts.join(', ');
};

export const formatTotalGuests = (guests: {
  adults: number;
  children?: number;
  infants?: number;
}): string => {
  const total = guests.adults + (guests.children || 0) + (guests.infants || 0);
  return total === 1 ? '1 guest' : `${total} guests`;
};

// ============================================================================
// LOCATION FORMATTING
// ============================================================================

export const formatAddress = (location: {
  address?: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
}): string => {
  const parts = [location.address, location.city, location.state, location.zipCode, location.country].filter(
    Boolean
  );
  return parts.join(', ');
};

export const formatShortAddress = (location: { city: string; state?: string; country: string }): string => {
  return location.state ? `${location.city}, ${location.state}` : `${location.city}, ${location.country}`;
};

// ============================================================================
// PROPERTY FORMATTING
// ============================================================================

export const formatPropertyType = (type: string): string => {
  const typeMap: Record<string, string> = {
    apartment: 'Apartment',
    house: 'House',
    villa: 'Villa',
    condo: 'Condo',
    guesthouse: 'Guesthouse',
    other: 'Other',
  };
  return typeMap[type] || type;
};

export const formatRoomType = (type: string): string => {
  const typeMap: Record<string, string> = {
    entire_place: 'Entire place',
    private_room: 'Private room',
    shared_room: 'Shared room',
    free_stay: 'Free stay (Couchsurfing)',
  };
  return typeMap[type] || type;
};

export const formatAmenity = (amenity: string): string => {
  const amenityMap: Record<string, string> = {
    wifi: 'WiFi',
    kitchen: 'Kitchen',
    parking: 'Free parking',
    pool: 'Pool',
    gym: 'Gym',
    ac: 'Air conditioning',
    heating: 'Heating',
    tv: 'TV',
    washer: 'Washer',
    dryer: 'Dryer',
    workspace: 'Dedicated workspace',
    fireplace: 'Fireplace',
    balcony: 'Balcony',
    garden: 'Garden',
    hot_tub: 'Hot tub',
    ev_charger: 'EV charger',
  };
  return amenityMap[amenity] || amenity;
};

export const formatCapacity = (capacity: {
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
}): string => {
  const parts: string[] = [];

  parts.push(`${capacity.guests} ${capacity.guests === 1 ? 'guest' : 'guests'}`);
  parts.push(`${capacity.bedrooms} ${capacity.bedrooms === 1 ? 'bedroom' : 'bedrooms'}`);
  parts.push(`${capacity.beds} ${capacity.beds === 1 ? 'bed' : 'beds'}`);
  parts.push(`${capacity.bathrooms} ${capacity.bathrooms === 1 ? 'bath' : 'baths'}`);

  return parts.join(' · ');
};

// ============================================================================
// BOOKING STATUS FORMATTING
// ============================================================================

export const formatBookingStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending Approval',
    confirmed: 'Confirmed',
    checked_in: 'Checked In',
    checked_out: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return statusMap[status] || status;
};

export const getBookingStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: '#FFA500',      // Orange
    confirmed: '#4CAF50',    // Green
    checked_in: '#2196F3',   // Blue
    checked_out: '#9E9E9E',  // Gray
    cancelled: '#F44336',    // Red
    refunded: '#9C27B0',     // Purple
  };
  return colorMap[status] || '#9E9E9E';
};

// ============================================================================
// RATING FORMATTING
// ============================================================================

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const formatReviewCount = (count: number): string => {
  if (count === 0) return 'No reviews';
  if (count === 1) return '1 review';
  return `${count} reviews`;
};

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

export const formatNumber = (num: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

export const formatCompactNumber = (num: number, locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
};

export const formatPercentage = (num: number, decimals: number = 0): string => {
  return `${num.toFixed(decimals)}%`;
};

// ============================================================================
// PHONE NUMBER FORMATTING
// ============================================================================

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Format based on length (US format)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phoneNumber;
};

// ============================================================================
// FILE SIZE FORMATTING
// ============================================================================

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// ============================================================================
// PAYMENT STATUS FORMATTING
// ============================================================================

export const formatPaymentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    succeeded: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded',
  };
  return statusMap[status] || status;
};
