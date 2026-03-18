import { NextRequest, NextResponse } from 'next/server';
import { privyClient } from '@/lib/privy';
import connectToDB from '@/lib/mongoose';
import Users from '@/models/user.model';
import mongoose from 'mongoose';
import { sendWelcomeEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Missing token' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { userId: privyDid } = await privyClient.verifyAuthToken(token);
    const privyUser = await privyClient.getUser(privyDid);

    // Resolve email from privy-linked email or Google OAuth, always lowercase
    const rawEmail = privyUser.email?.address ?? privyUser.google?.email ?? null;
    if (!rawEmail) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 });
    }
    const email = rawEmail.toLowerCase();

    // Resolve embedded wallet address from linked accounts
    const embeddedWallet = (privyUser as any).linkedAccounts?.find(
      (a: any) => a.type === 'wallet' && a.walletClient === 'privy'
    );
    const embeddedWalletAddress: string | null = embeddedWallet?.address?.toLowerCase() ?? null;

    await connectToDB();

    let dbUser = await Users.findOne({ email });
    let isNewUser = false;

    if (!dbUser) {
      isNewUser = true;
      // Derive a display name: Google name takes priority, then email prefix
      const fullName = privyUser.google?.name ?? email.split('@')[0];
      const username =
        email.split('@')[0] + '_' + Math.floor(Math.random() * 9000 + 1000);

      dbUser = await Users.create({
        _id: new mongoose.Types.ObjectId(),
        email,
        username,
        fullName,
        balance: 500,
        isActive: true,
        isBanned: false,
        provider: 'privy',
        role: 'USER',
        embeddedWalletAddress,
      });
    } else if (embeddedWalletAddress && dbUser.embeddedWalletAddress !== embeddedWalletAddress) {
      // Persist the wallet address if it has changed or was not previously stored
      await Users.updateOne(
        { _id: dbUser._id },
        { $set: { embeddedWalletAddress } }
      );
      dbUser.embeddedWalletAddress = embeddedWalletAddress;
    }

    // Send welcome email to new users — non-blocking
    if (isNewUser) {
      try {
        await sendWelcomeEmail({
          to: email,
          fullName: dbUser.fullName || dbUser.username,
        });
      } catch (emailError) {
        console.error('Welcome email failed (non-blocking):', emailError);
      }
    }

    return NextResponse.json({
      user: {
        _id: dbUser._id.toString(),
        id: dbUser._id.toString(),
        email: dbUser.email,
        username: dbUser.username,
        fullName: dbUser.fullName,
        balance: dbUser.balance,
        role: dbUser.role,
        provider: dbUser.provider ?? 'privy',
        embeddedWalletAddress: dbUser.embeddedWalletAddress ?? embeddedWalletAddress,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('/api/auth/privy-session error:', msg);
    return NextResponse.json({ message: msg }, { status: 401 });
  }
}
