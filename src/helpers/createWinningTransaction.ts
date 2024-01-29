import clientPromise from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import { ObjectId } from 'mongodb';

export async function createWinningTransaction(userID: ObjectId, amount: number): Promise<ObjectId> {
  const client = await clientPromise;
  const db = client.db();

  const transaction = new Transaction({
    userID,
    transactionType: 'winnings',
    amount,
    type: '+',
    transactionDate: new Date(),
  });

  const result = await db.collection('transactions').insertOne(transaction);
  return result.insertedId;
}
