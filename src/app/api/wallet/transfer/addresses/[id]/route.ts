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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session?.user?._id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await connectToDB();

  const result = await VerifiedAddresses.deleteOne({
    _id: id,
    userId: session.user._id,
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ message: 'Address not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
