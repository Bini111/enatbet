import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

export async function getServerSession() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    return {
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        displayName: decodedClaims.name,
      },
    };
  } catch (error) {
    return null;
  }
}