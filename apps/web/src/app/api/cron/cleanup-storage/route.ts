import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Allow Vercel Cron or manual Bearer secret for testing
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const isManual = req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;
  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bucket = adminStorage.bucket();
    const [files] = await bucket.getFiles({ prefix: 'temp/' });

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days
    let deleted = 0;

    for (const file of files) {
      const [meta] = await file.getMetadata();
      const created = new Date(meta.timeCreated).getTime();
      if (created < cutoff) {
        await file.delete();
        deleted++;
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: deleted,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Storage cleanup error:', err);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
