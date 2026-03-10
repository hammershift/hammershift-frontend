// src/app/api/cron/resolve-markets/route.ts
//
// Cron route: resolves expired prediction markets using final hammer price from oracle.
//
// Changed from original:
//   - Uses oracleResolver.resolveExpiredMarkets() instead of inline logic
//   - Waits for finalPrice (scraper-captured) before resolving — never uses sort.price
//   - Handles oracle failure grace period and HIGH_VALUE market hold
//   - Returns structured resolution summary for monitoring

import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';
import { resolveExpiredMarkets } from '@/lib/oracleResolver';

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

  const summary = await resolveExpiredMarkets(db);

  return NextResponse.json({
    ok: true,
    resolved: summary.resolved,
    waitingForPrice: summary.waitingForPrice,
    oracleFailed: summary.oracleFailed,
    highValueHold: summary.highValueHold,
    // Include full result detail only in non-production to avoid log bloat
    ...(process.env.NODE_ENV !== 'production' && { detail: summary.results }),
  });
}
