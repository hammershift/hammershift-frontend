import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { createHash } from 'crypto';
import { getAddress, isAddress } from 'viem';
import VerifiedAddresses from '@/models/verifiedAddress.model';
import AddressOtps from '@/models/addressOtp.model';

export const dynamic = 'force-dynamic';

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

/**
 * POST /api/wallet/transfer/confirm-otp
 *
 * Verifies the OTP and saves the address to the user's address book.
 * Body: { address: string, code: string, label: string }
 */
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?._id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const ip = getClientIp(req);
  const { allowed, retryAfter } = checkRateLimit(`transfer-verify:${session.user._id}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { message: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  let body: { address?: string; code?: string; label?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const { address, code, label } = body;

  if (!address || !code || !label) {
    return NextResponse.json({ message: 'Address, code, and label are required' }, { status: 400 });
  }

  if (!isAddress(address)) {
    return NextResponse.json({ message: 'Invalid address format' }, { status: 400 });
  }

  const checksummed = getAddress(address);

  await connectToDB();

  const otpRecord = await AddressOtps.findOne({
    userId: session.user._id,
    address: checksummed,
  });

  if (!otpRecord) {
    return NextResponse.json({ message: 'No pending verification for this address. Request a new code.' }, { status: 400 });
  }

  if (otpRecord.expiresAt < new Date()) {
    await AddressOtps.deleteOne({ _id: otpRecord._id });
    return NextResponse.json({ message: 'Verification code expired. Request a new one.' }, { status: 400 });
  }

  if (otpRecord.attempts >= 3) {
    await AddressOtps.deleteOne({ _id: otpRecord._id });
    return NextResponse.json({ message: 'Too many failed attempts. Request a new code.' }, { status: 400 });
  }

  const codeMatch = hashOtp(code.trim()) === otpRecord.code;

  if (!codeMatch) {
    await AddressOtps.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
    const remaining = 3 - (otpRecord.attempts + 1);
    return NextResponse.json(
      { message: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
      { status: 400 }
    );
  }

  // OTP valid — save the verified address
  const verifiedAddress = await VerifiedAddresses.create({
    userId: session.user._id,
    address: checksummed,
    label: label.slice(0, 50),
    verifiedAt: new Date(),
  });

  // Clean up OTP
  await AddressOtps.deleteOne({ _id: otpRecord._id });

  return NextResponse.json({
    success: true,
    addressId: verifiedAddress._id,
    message: 'Address verified and saved',
  });
}
