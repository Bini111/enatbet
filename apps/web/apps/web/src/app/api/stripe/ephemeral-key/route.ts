/**
 * Create Ephemeral Key for Mobile PaymentSheet
 * Secure by default. Harden with env flags.
 *
 * Env:
 *   STRIPE_MOBILE_SDK_API_VERSION  e.g. '2024-11-20.acacia' (must match mobile SDK)
 *   ENABLE_EPHKEY_RATELIMIT        '1' to enable rate limiting (optional)
 *   ENABLE_EPHKEY_CORS             '1' to enable CORS (optional)
 *   CORS_ALLOW_ORIGIN              e.g. 'https://app.enatbet.com' (when CORS enabled)
 *   REQUIRE_CONNECT_CUSTOMER       '1' if Customers live on connected accounts
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase-admin';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Optional shared rate limiter (Upstash-backed with in-memory fallback)
import { enforceRateLimit, getRequestIdentifier } from '@enatbet/shared';

const API_VERSION = process.env.STRIPE_MOBILE_SDK_API_VERSION || '';
const ENABLE_RATELIMIT = process.env.ENABLE_EPHKEY_RATELIMIT === '1';
const ENABLE_CORS = process.env.ENABLE_EPHKEY_CORS === '1';
const CORS_ORIGIN = process.env.CORS_ALLOW_ORIGIN || '';
const REQUIRE_CONNECT_CUSTOMER = process.env.REQUIRE_CONNECT_CUSTOMER === '1';

const BodySchema = z.object({
  customerId: z.string().min(1),
  listingId: z.string().min(1).optional(),
});

function withCors(json: unknown, status = 200) {
  const res = NextResponse.json(json as any, { status });
  if (ENABLE_CORS && CORS_ORIGIN) {
    res.headers.set('Access-Control-Allow-Origin', CORS_ORIGIN);
    res.headers.set('Vary', 'Origin');
  }
  return res;
}

export async function OPTIONS() {
  if (!ENABLE_CORS || !CORS_ORIGIN) return withCors({}, 204);
  const res = new NextResponse(null, { status: 204 });
  res.headers.set('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Vary', 'Origin');
  return res;
}

export async function POST(req: NextRequest) {
  // 0) Rate limit (optional)
  if (ENABLE_RATELIMIT) {
    const key = getRequestIdentifier({ headers: Object.fromEntries(req.headers.entries()) });
    const rl = await enforceRateLimit(`ek:${key}`, 'api');
    if (!rl.allowed) return withCors({ error: 'Rate limit exceeded' }, 429);
  }

  // 1) Auth
  const session = await auth(req);
  if (!session?.user?.id) return withCors({ error: 'Unauthorized' }, 401);

  // 2) Parse input
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return withCors({ error: 'Invalid request body' }, 400);
  }
  const { customerId, listingId } = body;

  // 3) Config check
  if (!API_VERSION) {
    return withCors({ error: 'Server misconfigured: STRIPE_MOBILE_SDK_API_VERSION' }, 500);
  }

  // 4) Ownership check
  const userSnap = await db.collection('users').doc(session.user.id).get();
  if (!userSnap.exists) return withCors({ error: 'User not found' }, 404);

  const user = userSnap.data() || {};
  const userCustomerId: string | undefined = user.stripeCustomerId;
  const userConnectAccountId: string | undefined = user.stripeAccountId;

  if (REQUIRE_CONNECT_CUSTOMER) {
    if (!userConnectAccountId) return withCors({ error: 'Stripe connected account not linked' }, 400);
    if (userCustomerId !== customerId) return withCors({ error: 'Customer mismatch' }, 403);
  } else {
    if (userCustomerId !== customerId) return withCors({ error: 'Customer mismatch' }, 403);
  }

  // Optional: scope by listing ownership
  if (listingId) {
    const listingSnap = await db.collection('listings').doc(listingId).get();
    const listing = listingSnap.data() || {};
    if (!listingSnap.exists || listing.hostId !== session.user.id) {
      return withCors({ error: 'Listing access denied' }, 403);
    }
  }

  // 5) Create ephemeral key
  try {
    let ephKey: Stripe.EphemeralKey;

    if (REQUIRE_CONNECT_CUSTOMER && userConnectAccountId) {
      ephKey = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: API_VERSION, stripeAccount: userConnectAccountId }
      );
    } else {
      ephKey = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: API_VERSION }
      );
    }

    return withCors({
      ephemeralKey: ephKey.secret,
      customerId,
      // publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, // optional
    });
  } catch (err: any) {
    if (err?.type) {
      return withCors({ error: err.message, type: err.type, code: err.code }, err.statusCode || 500);
    }
    return withCors({ error: err?.message || 'Failed to create ephemeral key' }, 500);
  }
}
