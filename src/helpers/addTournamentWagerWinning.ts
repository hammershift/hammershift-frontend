import clientPromise from '@/lib/mongodb';
import { ClientSession, ObjectId } from 'mongodb';

export async function addTournamentWagerWinning(wagerID: ObjectId, prize: number): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || undefined);

    if (prize || prize !== 0) {
      await db.collection('tournament_wagers').findOneAndUpdate({ _id: new ObjectId(wagerID) }, { $set: { prize: prize } }, { returnDocument: 'after' });
      console.log('Wager Winners Updated');
    }
  } catch (error) {
    console.error(error);
  }
}
