// apps/web/src/lib/firebase-admin.ts
// Server-only Firebase Admin singleton for Next.js (App Router)

import 'server-only';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function normalizePrivateKey(raw: string): string {
  // Supports keys stored with literal "\n" or real newlines
  return raw.replace(/\\n/g, '\n');
}

function getBucketName(projectId: string): string {
  // Prefer explicit public bucket env; otherwise fall back to default pattern
  return (
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    `${projectId}.appspot.com`
  );
}

function initAdmin(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = required('FIREBASE_PROJECT_ID');
  const clientEmail = required('FIREBASE_CLIENT_EMAIL');
  const privateKey = normalizePrivateKey(required('FIREBASE_PRIVATE_KEY'));

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: getBucketName(projectId),
  });
}

const app = initAdmin();

// Firestore: keep behavior sane for partial objects
const adminDb = getFirestore(app);
adminDb.settings({ ignoreUndefinedProperties: true });

const adminAuth = getAuth(app);
const adminStorage = getStorage(app);

export { adminDb, adminAuth, adminStorage };
