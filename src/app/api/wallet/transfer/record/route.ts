import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import { getClientIp } from '@/lib/rateLimit';
import { getAddress, isAddress } from 'viem';
import TransferLogs from '@/models/transferLog.model';
import VerifiedAddresses from '@/models/verifiedAddress.model';

export const dynamic = 'force-dynamic';

/**
 * POST /api/wallet/transfer/record
 *
 * Records a completed (or failed) transfer for the audit trail.
 * Called by the client after the Privy wallet signs and broadcasts.
 * Body: { toAddress, amount, txHash, status }
 */
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?._id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    toAddress?: string;
    amount?: number;
    txHash?: string | null;
    status?: string;
    failReason?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const { toAddress, amount, txHash, status, failReason } = body;

  if (!toAddress || !amount || !status) {
    return NextResponse.json({ message: 'toAddress, amount, and status are required' }, { status: 400 });
  }

  if (!isAddress(toAddress)) {
    return NextResponse.json({ message: 'Invalid address' }, { status: 400 });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ message: 'Amount must be a positive number' }, { status: 400 });
  }

  const validStatuses = ['PENDING', 'BROADCAST', 'CONFIRMED', 'FAILED'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  }

  const checksummed = getAddress(toAddress);
  const ip = getClientIp(req);

  await connectToDB();

  // Verify this is a verified address for this user
  const verified = await VerifiedAddresses.findOne({
    userId: session.user._id,
    address: checksummed,
  });
  if (!verified) {
    return NextResponse.json({ message: 'Address not verified' }, { status: 403 });
  }

  const log = await TransferLogs.create({
    userId: session.user._id,
    toAddress: checksummed,
    amount,
    txHash: txHash ?? null,
    status,
    failReason: failReason ?? null,
    ipAddress: ip,
    deviceFingerprint: req.headers.get('x-device-fp') ?? null,
  });

  // Update lastUsedAt on the address
  await VerifiedAddresses.updateOne(
    { _id: verified._id },
    { $set: { lastUsedAt: new Date() } }
  );

  return NextResponse.json({ success: true, transferId: log._id });
}
