# API Documentation

## Base URLs

- **Production**: `https://enatebet.com/api`
- **Development**: `http://localhost:3000/api`

## Authentication

All authenticated endpoints require a Firebase Auth JWT token in the Authorization header:

```
Authorization: Bearer <firebase-jwt-token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-14T12:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  },
  "timestamp": "2025-01-14T12:00:00Z"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `LISTING_NOT_AVAILABLE` | Listing not available for booking |
| `PAYMENT_FAILED` | Payment processing failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

---

## Endpoints

### Health Check

#### `GET /api/health`

Check API health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-14T12:00:00Z"
  }
}
```

---

### Listings

#### `GET /api/listings`

Get paginated listings with optional filters.

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 20, max: 100)
- `city` (string, optional)
- `checkIn` (ISO date, optional)
- `checkOut` (ISO date, optional)
- `guests` (number, optional)
- `minPrice` (number, optional)
- `maxPrice` (number, optional)
- `propertyType` (string, optional)
- `amenities` (comma-separated, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "listing_123",
        "title": "Beautiful Apartment in Addis",
        "description": "...",
        "pricePerNight": 2500,
        "currency": "ETB",
        "images": ["url1", "url2"],
        "location": {
          "city": "Addis Ababa",
          "country": "Ethiopia"
        },
        "rating": 4.8,
        "reviewCount": 45
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

#### `GET /api/listings/[id]`

Get detailed information about a specific listing.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "listing_123",
    "hostId": "user_456",
    "title": "Beautiful Apartment in Addis",
    "description": "Full description...",
    "propertyType": "apartment",
    "roomType": "entire_place",
    "pricing": {
      "basePrice": 2500,
      "currency": "ETB",
      "cleaningFee": 200,
      "serviceFee": 250
    },
    "capacity": {
      "maxGuests": 4,
      "bedrooms": 2,
      "beds": 2,
      "bathrooms": 1
    },
    "amenities": ["wifi", "kitchen", "parking"],
    "images": [...],
    "location": {...},
    "availability": {...},
    "rules": {...},
    "stats": {...}
  }
}
```

#### `POST /api/listings`

Create a new listing (host only).

**Authentication:** Required (host role)

**Request Body:**
```json
{
  "title": "My Amazing Property",
  "description": "Detailed description...",
  "propertyType": "apartment",
  "roomType": "entire_place",
  "location": {
    "address": "123 Main St",
    "city": "Addis Ababa",
    "country": "Ethiopia",
    "coordinates": {
      "latitude": 9.0320,
      "longitude": 38.7469
    }
  },
  "pricing": {
    "basePrice": 2500,
    "currency": "ETB",
    "cleaningFee": 200
  },
  "capacity": {
    "maxGuests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 1
  },
  "amenities": ["wifi", "kitchen", "parking"],
  "images": ["url1", "url2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "listing_new",
    "status": "draft",
    "createdAt": "2025-01-14T12:00:00Z"
  }
}
```

---

### Bookings

#### `POST /api/bookings`

Create a new booking request.

**Authentication:** Required

**Request Body:**
```json
{
  "listingId": "listing_123",
  "checkIn": "2025-02-01",
  "checkOut": "2025-02-05",
  "guests": {
    "adults": 2,
    "children": 1,
    "infants": 0,
    "pets": 0
  },
  "specialRequests": "Early check-in if possible"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_789",
    "status": "pending_payment",
    "pricing": {
      "nights": 4,
      "pricePerNight": 2500,
      "subtotal": 10000,
      "cleaningFee": 200,
      "serviceFee": 1000,
      "taxes": 1680,
      "total": 12880,
      "currency": "ETB"
    },
    "paymentIntentId": "pi_xyz",
    "clientSecret": "pi_xyz_secret_abc"
  }
}
```

#### `GET /api/bookings`

Get user's bookings (guest or host view).

**Authentication:** Required

**Query Parameters:**
- `role` (string: "guest" | "host", default: "guest")
- `status` (string, optional)
- `page` (number, default: 1)
- `pageSize` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "booking_789",
        "listingId": "listing_123",
        "listingTitle": "Beautiful Apartment",
        "checkIn": "2025-02-01",
        "checkOut": "2025-02-05",
        "guests": {...},
        "status": "confirmed",
        "total": 12880,
        "currency": "ETB"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

#### `PATCH /api/bookings/[id]`

Update booking status (cancel, confirm, etc.).

**Authentication:** Required (guest or host)

**Request Body:**
```json
{
  "action": "cancel",
  "reason": "Plans changed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_789",
    "status": "cancelled",
    "refundAmount": 10000,
    "refundStatus": "processing"
  }
}
```

---

### Payments

#### `POST /api/stripe/create-payment`

Create a Stripe Payment Intent.

**Authentication:** Required

**Request Body:**
```json
{
  "bookingId": "booking_789",
  "amount": 12880,
  "currency": "ETB"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xyz_secret_abc",
    "paymentIntentId": "pi_xyz"
  }
}
```

#### `POST /api/stripe/webhook`

Stripe webhook handler (internal use).

**Headers:**
- `stripe-signature` - Webhook signature

**Note:** This endpoint is called by Stripe, not by clients.

---

### Reviews

#### `POST /api/reviews`

Create a review for a completed booking.

**Authentication:** Required

**Request Body:**
```json
{
  "bookingId": "booking_789",
  "ratings": {
    "overall": 5,
    "cleanliness": 5,
    "accuracy": 4,
    "communication": 5,
    "location": 5,
    "value": 4
  },
  "comment": "Amazing stay! Highly recommended."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "review_abc",
    "status": "published",
    "createdAt": "2025-01-14T12:00:00Z"
  }
}
```

#### `GET /api/listings/[id]/reviews`

Get reviews for a listing.

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "review_abc",
        "guestName": "John Doe",
        "ratings": {...},
        "comment": "...",
        "createdAt": "2025-01-10T12:00:00Z"
      }
    ],
    "averageRating": 4.7,
    "total": 45
  }
}
```

---

### Cron Jobs (Protected)

These endpoints require a secret token for authentication.

#### `POST /api/cron/cleanup-bookings`

Clean up expired pending bookings.

**Headers:**
- `x-cron-secret` - Secret token

#### `POST /api/cron/cleanup-storage`

Remove orphaned files from storage.

**Headers:**
- `x-cron-secret` - Secret token

---

## Rate Limiting

- **Public endpoints**: 100 requests per 15 minutes per IP
- **Authenticated endpoints**: 300 requests per 15 minutes per user
- **Payment endpoints**: 10 requests per minute per user

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642165200
```

---

## Pagination

All paginated endpoints support:
- `page` (1-indexed)
- `pageSize` (default: 20, max: 100)

Response includes:
- `total` - Total items
- `page` - Current page
- `pageSize` - Items per page
- `hasMore` - Boolean indicating more pages

---

## Date Formats

All dates use ISO 8601 format:
- **Date only**: `2025-01-14`
- **Date with time**: `2025-01-14T12:00:00Z`

---

## Webhooks

### Stripe Webhooks

The platform listens for the following Stripe events:

- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed
- `customer.subscription.updated` - Subscription updated

**Webhook URL**: `https://enatebet.com/api/stripe/webhook`

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Create a booking
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`
  },
  body: JSON.stringify({
    listingId: 'listing_123',
    checkIn: '2025-02-01',
    checkOut: '2025-02-05',
    guests: { adults: 2, children: 0, infants: 0, pets: 0 }
  })
});

const data = await response.json();
```

### Mobile (React Native)

```typescript
import { getIdToken } from '@enatbet/firebase';

async function createBooking(bookingData) {
  const token = await getIdToken();

  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData)
  });

  return response.json();
}
```

---

## Testing

### Test Mode

Use Stripe test keys for development:
- Test cards: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

### Postman Collection

A Postman collection is available at `/docs/postman/enatebet-api.json`

---

## Versioning

API version is included in the base path. Current version: `v1`

Breaking changes will be introduced in new versions (e.g., `v2`).
