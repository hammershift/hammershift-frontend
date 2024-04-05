import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
      .updateOne({ _id: userID }, { $set: { balance: newBalance } }, { session });

    console.log(`Attempting to update wallet balance for user ID: ${userID}, Amount: ${amount}`);
    console.log(`Update result for user ID: ${userID}: ${JSON.stringify(updateResult)}`);

    // if the update was successful, commit the transaction
    if (updateResult.modifiedCount > 0) {
      await session.commitTransaction();
      console.log(`Transaction committed: Wallet balance successfully updated for user ID: ${userID}. New Balance: ${newBalance}`);
    } else {
      await session.abortTransaction();
      console.log(`Transaction aborted: No update made to wallet balance for user ID: ${userID}.`);
    }
  } catch (error) {
    await session.abortTransaction();
    console.error(`Failed to update wallet balance for user ID: ${userID}, Error: ${error}`);
  } finally {
    await session.endSession();
  }
}
