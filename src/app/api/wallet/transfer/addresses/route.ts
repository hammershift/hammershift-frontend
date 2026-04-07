import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import VerifiedAddresses from '@/models/verifiedAddress.model';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wallet/transfer/addresses
 *
 * Returns the user's saved verified withdrawal addresses.
 */
export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?._id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  const addresses = await VerifiedAddresses.find({ userId: session.user._id })
    .sort({ lastUsedAt: -1, createdAt: -1 })
    .lean();

  return NextResponse.json({
    addresses: addresses.map((a) => ({
      _id: a._id,
      address: a.address,
      label: a.label,
      verifiedAt: a.verifiedAt,
      lastUsedAt: a.lastUsedAt,
    })),
  });
}
