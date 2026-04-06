import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import connectToDB from '@/lib/mongoose';
import Users from '@/models/user.model';

export const dynamic = 'force-dynamic';

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(
    new Uint8Array(Buffer.from(a)),
    new Uint8Array(Buffer.from(b))
  );
}

/**
 * GET /api/admin/search-user?q=andy
 *
 * Admin-only endpoint to search users by name, username, or email.
 * Auth: CRON_SECRET header
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? '';
  const expected = process.env.CRON_SECRET ?? '';
  if (!secret || !expected || !secureCompare(secret, expected)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) {
    return NextResponse.json({ message: 'Query must be at least 2 characters' }, { status: 400 });
  }

  await connectToDB();

  const regex = new RegExp(q, 'i');
  const users = await Users.find(
    { $or: [{ username: regex }, { email: regex }, { name: regex }] },
    { username: 1, email: 1, name: 1, balance: 1, createdAt: 1 }
  ).limit(10).lean();

  return NextResponse.json({ results: users });
}
