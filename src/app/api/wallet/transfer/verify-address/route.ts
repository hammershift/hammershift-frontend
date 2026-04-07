import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sendOtpEmail } from '@/lib/mail';
import { randomInt, createHash } from 'crypto';
import { isAddress, getAddress } from 'viem';
import VerifiedAddresses from '@/models/verifiedAddress.model';
import AddressOtps from '@/models/addressOtp.model';
import TransferLogs from '@/models/transferLog.model';
import Users from '@/models/user.model';

export const dynamic = 'force-dynamic';

const MAX_ADDRESSES_PER_USER = 10;
const DAILY_TRANSFER_LIMIT_STANDARD = 500;
const DAILY_TRANSFER_LIMIT_TRUSTED = 2500;
const MAX_TRANSFERS_PER_DAY = 5;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

/**
 * POST /api/wallet/transfer/verify-address
 *
 * Sends an OTP to the user's registered email to verify a new withdrawal address.
 * Body: { address: string, label: string }
 */
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?._id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const ip = getClientIp(req);
  const { allowed, retryAfter } = checkRateLimit(`transfer-otp:${session.user._id}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { message: 'Too many OTP requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  let body: { address?: string; label?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const { address, label } = body;

  if (!address || !label) {
    return NextResponse.json({ message: 'Address and label are required' }, { status: 400 });
  }

  if (label.length > 50) {
    return NextResponse.json({ message: 'Label must be 50 characters or fewer' }, { status: 400 });
  }

  if (!isAddress(address)) {
    return NextResponse.json({ message: 'Invalid Polygon address format' }, { status: 400 });
  }

  const checksummed = getAddress(address);

  await connectToDB();

  // Check if already verified
  const existing = await VerifiedAddresses.findOne({
    userId: session.user._id,
    address: checksummed,
  });
  if (existing) {
    return NextResponse.json({ message: 'Address already verified', addressId: existing._id }, { status: 200 });
  }

  // Check address count limit
  const count = await VerifiedAddresses.countDocuments({ userId: session.user._id });
  if (count >= MAX_ADDRESSES_PER_USER) {
    return NextResponse.json(
      { message: `Maximum ${MAX_ADDRESSES_PER_USER} saved addresses allowed. Remove one first.` },
      { status: 400 }
    );
  }

  // Generate OTP
  const otp = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete any existing OTP for this user+address
  await AddressOtps.deleteMany({ userId: session.user._id, address: checksummed });

  await AddressOtps.create({
    userId: session.user._id,
    address: checksummed,
    code: hashOtp(otp),
    attempts: 0,
    expiresAt,
  });

  // Send OTP email to the session email
  const emailResult = await sendOtpEmail({ to: session.user.email, otp });
  if (!emailResult.success) {
    console.error('Failed to send transfer OTP email:', emailResult.error);
    return NextResponse.json({ message: 'Failed to send verification email' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Verification code sent to your email',
  });
}
