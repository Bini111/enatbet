import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Store failed attempts (in production, use Redis)
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// Your secret code hash - run: node -e "console.log(require('crypto').createHash('sha256').update('Enatbet@11').digest('hex'))"
const ADMIN_CODE_HASH = process.env.ADMIN_CODE_HASH || hashCode('Enatbet@11');

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // Check rate limiting
  const attempts = failedAttempts.get(ip);
  if (attempts && attempts.count >= MAX_ATTEMPTS) {
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    if (timeSinceLastAttempt < LOCKOUT_TIME) {
      const remainingTime = Math.ceil((LOCKOUT_TIME - timeSinceLastAttempt) / 60000);
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${remainingTime} minutes.` },
        { status: 429 }
      );
    } else {
      failedAttempts.delete(ip);
    }
  }

  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    const hashedInput = hashCode(code);
    
    if (hashedInput === ADMIN_CODE_HASH) {
      // Clear failed attempts on success
      failedAttempts.delete(ip);
      
      // Create response with cookie
      const response = NextResponse.json({ success: true });
      response.cookies.set('adminToken', 'enatbet_admin_verified_' + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 12 * 60 * 60, // 12 hours
      });
      
      return response;
    } else {
      // Track failed attempt
      const current = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
      failedAttempts.set(ip, {
        count: current.count + 1,
        lastAttempt: Date.now(),
      });
      
      const remaining = MAX_ATTEMPTS - (current.count + 1);
      return NextResponse.json(
        { error: `Invalid code. ${remaining} attempts remaining.` },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
