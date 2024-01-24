import clientPromise from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import { ObjectId } from 'mongodb';

export async function createWinningTransaction(userID: ObjectId, amount: number): Promise<void> {
  const client = await clientPromise;
  const db = client.db();

  const transaction = new Transaction({
    userID,
    transactionType: 'winnings',
    amount,
    type: '+',
    transactionDate: new Date(),
  });

  await db.collection('transactions').insertOne(transaction);
}
