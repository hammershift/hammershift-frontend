import { NextRequest, NextResponse } from 'next/server';
import { privyClient } from '@/lib/privy';
import connectToDB from '@/lib/mongoose';
import Users from '@/models/user.model';
import mongoose from 'mongoose';

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

    // Resolve email from privy-linked email or Google OAuth
    const email = privyUser.email?.address ?? privyUser.google?.email ?? null;
    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 });
    }

    await connectToDB();

    let dbUser = await Users.findOne({ email });

    if (!dbUser) {
      // Derive a display name: Google name takes priority, then email prefix
      const fullName = privyUser.google?.name ?? email.split('@')[0];
      const username =
        email.split('@')[0] + '_' + Math.floor(Math.random() * 9999);

      dbUser = await Users.create({
        _id: new mongoose.Types.ObjectId(),
        email,
        username,
        fullName,
        balance: 500,
        isActive: true,
        isBanned: false,
        provider: 'privy',
        role: 'user',
      });
    }

    const embeddedWallet = (privyUser as any).linkedAccounts?.find(
      (a: any) => a.type === 'wallet' && a.walletClient === 'privy'
    );
    const embeddedWalletAddress = embeddedWallet?.address ?? null;

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
        embeddedWalletAddress,
      },
    });
  } catch (error) {
    console.error('/api/auth/privy-session error:', error);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
  }
}
