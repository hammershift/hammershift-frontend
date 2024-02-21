import clientPromise from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import { ObjectId } from 'mongodb';

export async function refundTournamentWagers(tournamentWagerIDs: ObjectId[]): Promise<void> {
  const client = await clientPromise;
  const db = client.db();

  try {
    const tournamentWagers = await db
      .collection('tournament_wagers')
      .find({ _id: { $in: tournamentWagerIDs.map((id) => new ObjectId(id)) } })
      .toArray();
    if (tournamentWagers.length === 0) {
      console.log('No tournament wagers found for provided IDs:', tournamentWagerIDs);
      return;
    }

    const userBalanceBulkOps = [];
    const transactionBulkOps = [];

    for (const tournamentWager of tournamentWagers) {
      try {
        const user = await db.collection('users').findOne({ _id: tournamentWager.user._id });
        if (!user) {
          console.log(`User not found for tournament wager ${tournamentWager._id}, skipping refund.`);
          continue;
        }

        const updatedBalance = (user.balance || 0) + tournamentWager.buyInAmount;

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
              wagerID: tournamentWager._id,
              transactionType: 'tournament refund',
              amount: tournamentWager.buyInAmount,
              type: '+',
              transactionDate: new Date(),
            }),
          },
        });
      } catch (error) {
        console.error(`Error processing refund for tournament wager ${tournamentWager._id}:`, error);
      }
    }

    if (userBalanceBulkOps.length > 0) {
      await db.collection('users').bulkWrite(userBalanceBulkOps);
      console.log('User balances updated for tournament refund.');
    }

    if (transactionBulkOps.length > 0) {
      await db.collection('transactions').bulkWrite(transactionBulkOps);
      console.log('Tournament refund transactions created.');
    }

    console.log(`Refunds processed for tournament wagers: ${tournamentWagerIDs}`);
  } catch (error) {
    console.error(`Error in refundTournamentWagers function:`, error);
  }
}
