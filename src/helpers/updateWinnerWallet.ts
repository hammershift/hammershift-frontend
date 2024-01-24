import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// export async function updateWinnerWallet(userID: ObjectId, amount: number): Promise<void> {
//   const client = await clientPromise;
//   const db = client.db();

//   // retrieve the current balance from the user document
//   const user = await db.collection('users').findOne({ _id: userID });
//   const currentBalance = user?.balance ?? 0;

//   // calculate the new balance
//   const newBalance = currentBalance + amount;

//   // update the user's wallet balance
//   const updateResult = await db.collection('users').updateOne({ _id: userID }, { $set: { balance: newBalance } });

//   console.log(`Attempted to update wallet balance for userID: ${userID}, Amount: ${amount}`);
//   console.log('Update wallet result:', updateResult);

//   if (updateResult.modifiedCount === 0) {
//     console.log(`No updates made to the wallet for userID: ${userID}.`);
//   } else {
//     console.log(`Wallet balance updated for user ${userID}.`);
//   }
// }

export async function updateWinnerWallet(userID: ObjectId, amount: number): Promise<void> {
  const client = await clientPromise;
  const session = client.startSession(); 

  try {
    session.startTransaction();

    // retrieve the current balance and update it within the transaction
    const user = await client.db().collection('users').findOne({ _id: userID }, { session });
    const currentBalance = user?.balance ?? 0; // 0 if balance does not exist
    const newBalance = currentBalance + amount;

    const updateResult = await client
      .db()
      .collection('users')
      .updateOne(
        { _id: userID },
        { $set: { balance: newBalance } },
        { session } 
      );

    console.log(`Attempted to update wallet balance for userID: ${userID}, Amount: ${amount}`);
    console.log('Update wallet result:', updateResult);

    // if the update was successful, commit the transaction
    if (updateResult.modifiedCount > 0) {
      await session.commitTransaction();
      console.log(`Transaction committed: Wallet balance updated for user ${userID}.`);
    } else {
      await session.abortTransaction();
      console.log(`Transaction aborted: No updates made to the wallet for userID: ${userID}.`);
    }
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error updating wallet balance for userID: ${userID}:`, error);
  } finally {
    await session.endSession();
  }
}
