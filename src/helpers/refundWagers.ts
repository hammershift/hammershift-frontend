import clientPromise from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import { ObjectId } from 'mongodb';

export async function refundWagers(wagerIDs: ObjectId[]): Promise<void> {
  const client = await clientPromise;
  const db = client.db();

  try {
    const wagers = await db
      .collection('wagers')
      .find({ _id: { $in: wagerIDs.map((id) => new ObjectId(id)) } })
      .toArray();

    if (wagers.length === 0) {
      console.log('No wagers found for provided IDs:', JSON.stringify(wagerIDs));
      return;
    }

    const userBalanceBulkOps = [];
    const transactionBulkOps = [];

    console.log(`Starting refund process for wagers: ${JSON.stringify(wagerIDs)}`);

    for (const wager of wagers) {
      try {
        const user = await db.collection('users').findOne({ _id: wager.user._id });
        if (!user) {
          console.log(`User not found for Wager: ${wager._id}, skipping refund.`);
          continue;
        }

        const updatedBalance = (user.balance || 0) + wager.wagerAmount;

        // for updating user balance
        userBalanceBulkOps.push({
          updateOne: {
            filter: { _id: user._id },
            update: { $set: { balance: updatedBalance } },
          },
        });

        // for creating a transaction
        transactionBulkOps.push({
          insertOne: {
            document: new Transaction({
              userID: user._id,
              wagerID: wager._id,
              transactionType: 'refund',
              amount: wager.wagerAmount,
              type: '+',
              transactionDate: new Date(),
            }),
          },
        });
      } catch (error) {
        console.error(`Error processing refund for Wager: ${wager._id}:`, error);
      }
    }

    // if (userBalanceBulkOps.length > 0) {
    //   await db.collection('users').bulkWrite(userBalanceBulkOps);
    //   // console.log('User balances updated for refund.');
    //   console.log(`User balances updated for refunds: ${JSON.stringify(userBalanceBulkOps.map((op) => op.updateOne.filter._id))}`);
    // }

    if (userBalanceBulkOps.length > 0) {
      const updateBalancesResult = await db.collection('users').bulkWrite(userBalanceBulkOps);
      console.log(`User balances updated for refunds: ${updateBalancesResult.modifiedCount} of ${userBalanceBulkOps.length}`);
    }

    if (transactionBulkOps.length > 0) {
      const transactionsResult = await db.collection('transactions').bulkWrite(transactionBulkOps);
      console.log(`Refund transactions created: ${transactionsResult.insertedCount} of ${transactionBulkOps.length}`);
    }

    // if (transactionBulkOps.length > 0) {
    //   await db.collection('transactions').bulkWrite(transactionBulkOps);
    //   // console.log('Refund transactions created.');
    //   console.log(`Refund transactions created for wagers: ${JSON.stringify(transactionBulkOps.map((op) => op.insertOne.document.wagerID))}`);
    // }

    console.log(`Completed refunds for wagers: ${JSON.stringify(wagerIDs.map((id) => id.toString()))}`);
  } catch (error) {
    console.error(`Error in refundWagers function:`, error);
  }
}
