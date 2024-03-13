import { calculateTournamentScores } from '@/helpers/calculateTournamentScores';
import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

interface AuctionScore {
  score: number;
  isSuccessful: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { userWagers, auctions } = await req.json();

    if (!userWagers || !auctions) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }

    const tournamentResults = calculateTournamentScores(userWagers, auctions);
    return NextResponse.json({ tournamentResults });
  } catch (error) {
    console.error('Error in calculateTournamentScores:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// export async function GET(req: NextRequest) {
//   try {
//     const client = await clientPromise;
//     const db = client.db();
//     const limit = Number(req.nextUrl.searchParams.get('limit'));
//     const tournament_id = req.nextUrl.searchParams.get('tournament_id');
//     const user_id = req.nextUrl.searchParams.get('user_id');

//     if (user_id && tournament_id) {
//       const tournamentPoints = await db
//         .collection('tournament_points')
//         .find({
//           $and: [{ tournamentID: new mongoose.Types.ObjectId(tournament_id) }],
//         })
//         .limit(limit)
//         .toArray();

//       tournamentPoints.forEach((item) => {
//         let totalScore = item.auctionScores.reduce((acc: number, curr: { score: number }) => acc + curr.score, 0);
//         item.totalScore = totalScore;
//       });

//       tournamentPoints.sort((a, b) => a.totalScore - b.totalScore);

//       const placing = tournamentPoints.findIndex((item) => item.user._id == user_id);

//       return NextResponse.json({ placing: placing + 1, totalScore: tournamentPoints[placing].totalScore });
//     }

//     if (tournament_id) {
//       const tournamentPoints = await db
//         .collection('tournament_points')
//         .find({
//           $and: [{ tournamentID: new mongoose.Types.ObjectId(tournament_id) }],
//         })
//         .limit(limit) // Correct placement of limit method
//         .toArray();

//       return NextResponse.json(tournamentPoints);
//     }

//     const tournamentPoints = await db
//       .collection('tournament_points')
//       .find()
//       .limit(limit) // Correct placement of limit method
//       .toArray();

//     return NextResponse.json({
//       total: tournamentPoints.length,
//       tournament_points: tournamentPoints,
//     });
//   } catch {
//     return NextResponse.json({ message: 'Cannot find tournament_points' }, { status: 404 });
//   }
// }

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const limit = Number(req.nextUrl.searchParams.get('limit'));
    const tournament_id = req.nextUrl.searchParams.get('tournament_id');
    const user_id = req.nextUrl.searchParams.get('user_id');

    if (user_id && tournament_id) {
      const tournamentPoints = await db
        .collection('tournament_points')
        .find({
          tournamentID: new mongoose.Types.ObjectId(tournament_id),
        })
        .limit(limit)
        .toArray();

      tournamentPoints.forEach((item) => {
        let totalScore = item.auctionScores.filter((scoreObj: AuctionScore) => scoreObj.isSuccessful).reduce((acc: number, curr: AuctionScore) => acc + curr.score, 0);
        item.totalScore = totalScore;
      });

      tournamentPoints.sort((a, b) => a.totalScore - b.totalScore);

      const placing = tournamentPoints.findIndex((item) => item.user._id.toString() === user_id);

      return NextResponse.json({ placing: placing + 1, totalScore: tournamentPoints[placing]?.totalScore || 0 });
    }

    if (tournament_id) {
      const tournamentPoints = await db
        .collection('tournament_points')
        .find({
          tournamentID: new mongoose.Types.ObjectId(tournament_id),
        })
        .limit(limit)
        .toArray();

      tournamentPoints.forEach((item) => {
        let totalScore = item.auctionScores.filter((scoreObj: AuctionScore) => scoreObj.isSuccessful).reduce((acc: number, curr: AuctionScore) => acc + curr.score, 0);
        item.totalScore = totalScore;
      });

      return NextResponse.json(tournamentPoints);
    }

    const tournamentPoints = await db.collection('tournament_points').find().limit(limit).toArray();

    return NextResponse.json({
      total: tournamentPoints.length,
      tournament_points: tournamentPoints,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Cannot find tournament_points' }, { status: 404 });
  }
}
