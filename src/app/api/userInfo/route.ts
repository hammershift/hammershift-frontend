import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   console.log('Session:', session);
//   if (!session) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
//   }

//   // extract additional profile information from the request body
//   const { fullName, username, country, state, aboutMe } = await req.json();

//   // validation
//   if (!fullName || !username || !country || !state) {
//     return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
//   }

//   // update or create the user's profile in the MongoDB database
//   try {
//     const client = await clientPromise;
//     const db = client.db();

//     const result = await db.collection('users').updateOne({ email: session.user.email }, { $set: { fullName, username, country, state, aboutMe } }, { upsert: true });
//     console.log('Database operation result:', result);

//     if (result.upsertedCount > 0) {
//       return NextResponse.json({ message: 'Profile created successfully' }, { status: 201 });
//     } else {
//       return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
//     }
//   } catch (error) {
//     console.error('Error during profile creation/update:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
  }

  const { fullName, username, country, state, aboutMe } = await req.json();

  if (!fullName || !username || !country || !state) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const userId = new ObjectId(session.user.id);

    // update the user's profile information
    await db.collection('users').updateOne(
      { _id: userId },
      {
        $set: { fullName, username, country, state, aboutMe },
      },
      { upsert: true }
    );

    let walletBalance: number;

    // Ensure the user has a wallet balance
    const existingWallet = await db.collection('wallet').findOne({ userId });
    if (existingWallet) {
      walletBalance = existingWallet.balance;
    } else {
      // If the wallet does not exist, create one with a default balance
      const insertResult = await db.collection('wallet').insertOne({
        userId,
        balance: 100, // Default wallet balance
      });
      // Use the inserted ID and balance for the response
      walletBalance = 100; // Since we just created it with this balance
    }

    // Respond with a success message and include the wallet balance
    return NextResponse.json(
      {
        message: 'Profile and Wallet updated successfully',
        walletBalance, // Now walletBalance is correctly referenced
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during profile creation/update:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
