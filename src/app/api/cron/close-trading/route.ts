/**
 * GET /api/cron/close-trading
 *
 * Closes trading for markets where tradingClosesAt has passed.
 * Transitions ACTIVE → TRADING_CLOSED.
 * Run every 30 minutes.
 *
 * Authorization: x-cron-secret header required.
 */

import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

function isAuthorized(req: Request): boolean {
  const secret = req.headers.get('x-cron-secret');
  return !!secret && secret === process.env.CRON_SECRET;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();
  const db = mongoose.connection.db!;
  const now = new Date();

  const result = await db.collection('polygon_markets').updateMany(
    {
      status: 'ACTIVE',
      tradingClosesAt: { $lte: now },
    },
    {
      $set: {
        status: 'TRADING_CLOSED',
        updatedAt: now,
      },
    }
  );

  return NextResponse.json({
    ok: true,
    marketsClosed: result.modifiedCount,
    checkedAt: now.toISOString(),
  });
}
