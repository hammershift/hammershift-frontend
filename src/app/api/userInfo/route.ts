import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

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

// URL: api/userInfo?id=<id>
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // if not  logged in, return error
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
  }

  const ID = req.nextUrl.searchParams.get('id');
  //if ID is not provided, return error
  if (!ID) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }
  try {
    const client = await clientPromise;
    const db = client.db();
    // const userId = new ObjectId(session.user.id);

    // fetch the user's profile information
    const userInfo = await db.collection('users').findOne({ _id: new ObjectId(ID) });

    return NextResponse.json({ user: userInfo }, { status: 200 });
  } catch (error) {
    console.error('Error during profile update:', error);
    return NextResponse.json({ message: 'Server error during profile update' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
  // }

  const { userId, updatedFields } = await req.json();

  if (!userId || !updatedFields) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const objectIdUserId = new ObjectId(userId);

    const updatedUser = await db.collection('users').findOneAndUpdate(
      { _id: objectIdUserId },
      {
        $set: updatedFields,
      },
      {
        returnDocument: 'after',
      }
    );

    return NextResponse.json(
      {
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during user information update:', error);
    return NextResponse.json({ message: 'Server error during user information update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 400 });
  }

  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const objectIdUserId = new ObjectId(userId);

    const deleteResult = await db.collection('users').deleteOne({ _id: objectIdUserId });

    if (deleteResult.deletedCount === 1) {
      return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error during user deletion:', error);
    return NextResponse.json({ message: 'Server error during user deletion' }, { status: 500 });
  }
}
