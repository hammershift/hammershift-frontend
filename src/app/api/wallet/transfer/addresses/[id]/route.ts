import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import VerifiedAddresses from '@/models/verifiedAddress.model';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/wallet/transfer/addresses/[id]
 *
 * Removes a verified address from the user's address book.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?._id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  const result = await VerifiedAddresses.deleteOne({
    _id: params.id,
    userId: session.user._id,
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ message: 'Address not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
