import mongoose from 'mongoose';

import { NextRequest, NextResponse } from 'next/server';
import getServerSession from 'next-auth/next';

import Wager from '@/models/wager';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import connectToDB from '@/lib/mongoose';
import { ObjectId } from 'mongodb';
import Transaction from '@/models/transaction';

export const dynamic = 'force-dynamic';

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) {
//     console.log('Unauthorized: No session found');
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const requestBody = await req.json();
//     console.log('Received Wager Data:', requestBody);

//     const { auctionID, priceGuessed, wagerAmount, user, auctionIdentifierId } = requestBody;

//     // validate the fields
//     if (!auctionID || priceGuessed === undefined || wagerAmount === undefined || auctionIdentifierId === undefined) {
//       console.log('Missing required fields:', requestBody);
//       return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
//     }

//     // convert auctionID from string to ObjectId
//     let convertedAuctionID;
//     try {
//       convertedAuctionID = new mongoose.Types.ObjectId(auctionID);
//     } catch (error) {
//       console.error('Invalid auctionID:', auctionID, error);
//       return NextResponse.json({ message: 'Invalid auctionID' }, { status: 400 });
//     }

//     const newWager = new Wager({
//       _id: new mongoose.Types.ObjectId(),
//       auctionID: convertedAuctionID,
//       priceGuessed,
//       wagerAmount,
//       user,
//       auctionIdentifierId,
//     });

//     await newWager.save();

//     const client = await clientPromise;
//     const db = client.db();

//     await db.collection('users').updateOne({ _id: newWager.user._id }, { $push: { wagers: newWager._id } });

//     // calculate the total wager for the auction
//     const totalWagerAggregation = await db
//       .collection('wagers')
//       .aggregate([{ $match: { auctionID: convertedAuctionID } }, { $group: { _id: '$auctionID', totalWager: { $sum: '$wagerAmount' } } }])
//       .toArray();

//     const totalWager = totalWagerAggregation.length > 0 ? totalWagerAggregation[0].totalWager : 0;

//     console.log('Wager created successfully. Total wager for auction:', Math.floor(totalWager * 0.88));

//     return NextResponse.json({ message: 'Wager created successfully' }, { status: 201 });
//   } catch (error) {
//     console.error('Error in wager creation:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();
  const mongoSession = client.startSession();

  let transactionCommitted = false;

  try {
    await mongoSession.startTransaction();
    console.log('Transaction started');

    const requestBody = await req.json();
    console.log('Received Wager Data:', requestBody);

    const { auctionID, priceGuessed, wagerAmount, user, auctionIdentifierId } = requestBody;
    if (!auctionID || priceGuessed === undefined || wagerAmount === undefined || auctionIdentifierId === undefined) {
      console.log('Missing required fields:', requestBody);
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let convertedAuctionID;
    try {
      convertedAuctionID = new mongoose.Types.ObjectId(auctionID);
    } catch (error) {
      console.error('Invalid auctionID:', auctionID, error);
      return NextResponse.json({ message: 'Invalid auctionID' }, { status: 400 });
    }

    // check user's balance before creating a wager
    const userBalance = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(user._id) });
    if (!userBalance || userBalance.balance < wagerAmount) {
      return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
    }

    const newWager = new Wager({
      _id: new mongoose.Types.ObjectId(),
      auctionID: convertedAuctionID,
      priceGuessed,
      wagerAmount,
      user,
      auctionIdentifierId,
    });

    await newWager.save({ session: mongoSession });

    const transaction = new Transaction({
      userID: new mongoose.Types.ObjectId(user._id),
      wagerID: newWager._id,
      auctionID: convertedAuctionID,
      transactionType: 'wager',
      amount: wagerAmount,
      type: '-',
      transactionDate: new Date(),
    });

    await transaction.save({ session: mongoSession });

    // await db.collection('users').updateOne({ _id: new mongoose.Types.ObjectId(user._id) }, { $inc: { balance: -wagerAmount } }, { session: mongoSession });

    await mongoSession.commitTransaction();
    console.log('Transaction committed');
    console.log('Wager and transaction created successfully');
    transactionCommitted = true;

    const totalWagerAggregation = await db
      .collection('wagers')
      .aggregate([{ $match: { auctionID: convertedAuctionID } }, { $group: { _id: '$auctionID', totalWager: { $sum: '$wagerAmount' } } }], { session: mongoSession })
      .toArray();

    const totalWager = totalWagerAggregation.length > 0 ? totalWagerAggregation[0].totalWager : 0;
    console.log('Wager created successfully. Total wager for auction:', Math.floor(totalWager * 0.88));

    return NextResponse.json({ message: 'Wager created successfully' }, { status: 201 });
  } catch (error) {
    console.log('An error occurred');
    if (!transactionCommitted) {
      console.log('Aborting transaction');
      await mongoSession.abortTransaction();
    }
    console.error('Error in wager creation:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    console.log('Ending session');
    await mongoSession.endSession();
  }
}

export async function GET(req: NextRequest) {
  try {
    // await connectToDB();
    const client = await clientPromise;
    const db = client.db();

    const id = req.nextUrl.searchParams.get('id');
    const user = req.nextUrl.searchParams.get('user_id');

    if (id && user) {
      const wager = await db.collection('wagers').find({
        auctionID: new ObjectId(id),
        'user._id': new ObjectId(user),
      }).toArray();
      return NextResponse.json(wager);
    }

    //IMPORTANT use the _id instead of auction_id when fetching wagers
    // api/wager?auction_id=656e95bc8727754b7cb5ec6b to get all wagers with the same auctionID
    if (id) {
      const auctionWagers = await db.collection('wagers').find({ auctionID: new ObjectId(id) }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json(auctionWagers);
    }

    if (user) {
      const userWagers = await db.collection('wagers').find({ 'user._id': new ObjectId(user) }).toArray();
      return NextResponse.json(userWagers);
    }
    // api/wager to get all wagers
    const wagers = await db.collection('wagers').find().toArray();
    return NextResponse.json({ wagers: wagers });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' });
  }
}

// export async function PUT(req: NextRequest): Promise<NextResponse<any>> {
//   try {
//     await connectToDB();
//     const id = req.nextUrl.searchParams.get('id');

//     if (!id) {
//       return NextResponse.json({ message: "Invalid request: 'id' parameter is missing" }, { status: 400 });
//     }

//     const edits = await req.json();
//     const editedWager = await Wager.findOneAndUpdate({ $and: [{ _id: new ObjectId(id) }] }, { $set: edits }, { new: true });

//     if (editedWager) {
//       return NextResponse.json(editedWager, { status: 202 });
//     } else {
//       return NextResponse.json({ message: 'Wager not found' }, { status: 404 });
//     }
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const id = req.nextUrl.searchParams.get('id');
//     const user = req.nextUrl.searchParams.get('user_id');

//     let query = {};

//     if (id && user) {
//       query = { auctionID: new ObjectId(id), 'user._id': new ObjectId(user) };
//     } else if (id) {
//       query = { auctionID: new ObjectId(id) };
//     } else if (user) {
//       query = { 'user._id': new ObjectId(user) };
//     }

//     const wagers = await db.collection('wagers').find(query).toArray();
//     return NextResponse.json({ wagers });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: 'Internal server error' });
//   }
// }

export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: "Invalid request: 'id' parameter is missing" }, { status: 400 });
    }

    const edits = await req.json();

    const currentWager = await db.collection('wagers').findOne({ _id: new ObjectId(id) });

    if (!currentWager) {
      return NextResponse.json({ message: 'Wager not found' }, { status: 404 });
    }

    // check if the wager has already been refunded
    if (currentWager.refunded) {
      return NextResponse.json({ message: 'Refund already processed' }, { status: 409 });
    }

    const updateResult = await db.collection('wagers').findOneAndUpdate({ _id: new ObjectId(id) }, { $set: edits }, { returnDocument: 'after' });

    if (updateResult.value) {
      return NextResponse.json(updateResult.value, { status: 202 });
    } else {
      return NextResponse.json({ message: 'Wager not found' }, { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}