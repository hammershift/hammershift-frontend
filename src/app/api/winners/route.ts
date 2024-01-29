import clientPromise from '@/lib/mongodb';
import connectToDB from '@/lib/mongoose';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// get winners, URL: /api/winners
export async function GET(req: NextRequest) {
    try {
        const client = await clientPromise;
        const db = client.db();

        const winners = await db.collection('transactions').find({ transactionType: "winnings" }).sort({ userID: 1 }).toArray();

        if (!winners) {
            return NextResponse.json({ message: "no winners found" });
        }

        let data: { id: number, user: string, transaction: string }[] = []
        winners.map((item, index) => data.push({ id: index, user: item.userID, transaction: item.transactionType }))

        // Count the number of transactions for each user
        let userCounts: { [key: string]: number } = {};
        data.forEach(item => {
            if (item.user in userCounts) {
                userCounts[item.user]++;
            } else {
                userCounts[item.user] = 1;
            }
        });


        // Rank the users based on the number of transactions
        let winnersRank = Object.entries(userCounts)
            .map(([user, numberOfWinnings]) => ({ user, numberOfWinnings }))
            .sort((a, b) => b.numberOfWinnings - a.numberOfWinnings)
            .map((item, index) => ({ rank: index + 1, user: item.user, numberOfWinnings: item.numberOfWinnings }));


        // For checking
        // const total = data.length;
        // let totalAfter = winnersRank.reduce((a, b) => a + b.numberOfWinnings, 0);


        return NextResponse.json({ winners: winnersRank });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' });
    }
}