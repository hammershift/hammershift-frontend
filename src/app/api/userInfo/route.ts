import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
//   }

//   const { fullName, username, country, state, aboutMe } = await req.json();

//   if (!fullName || !username || !country || !state) {
//     return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
//   }

//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const userId = new ObjectId(session.user.id);

//     // update the user's profile information
//     await db.collection('users').updateOne(
//       { _id: userId },
//       {
//         $set: { fullName, username, country, state, aboutMe },
//       },
//       { upsert: true }
//     );

//     let walletBalance: number;

//     // ensure the user has a wallet balance
//     const existingWallet = await db.collection('wallet').findOne({ userId });
//     if (existingWallet) {
//       walletBalance = existingWallet.balance;
//     } else {
//       // If the wallet does not exist, create one with a default balance
//       const insertResult = await db.collection('wallet').insertOne({
//         userId,
//         balance: 100, // Default wallet balance
//       });
//       // Use the inserted ID and balance for the response
//       walletBalance = 100; // default balance
//     }

//     return NextResponse.json(
//       {
//         message: 'Profile and Wallet updated successfully',
//         walletBalance,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error during profile creation/update:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

export async function GET(req: NextRequest) {
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
    const userInfo = await db.collection('users').findOne({ _id: userId });

    return NextResponse.json(
      {
        user: userInfo
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during profile update:', error);
    return NextResponse.json({ message: 'Server error during profile update' }, { status: 500 });
  }

}



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
    const updatedUser = await db.collection('users').findOneAndUpdate(
      { _id: userId },
      {
        $set: { fullName, username, country, state, aboutMe },
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    );

    // check if the wallet balance exists, if not, initialize it
    const walletBalance = updatedUser.value?.balance ?? 100;

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        walletBalance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during profile update:', error);
    return NextResponse.json({ message: 'Server error during profile update' }, { status: 500 });
  }
}
