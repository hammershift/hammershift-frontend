import { addTournamentWagerWinning } from '@/helpers/addTournamentWagerWinning';
import { calculateTournamentScores } from '@/helpers/calculateTournamentScores';
import { createWinningTransaction } from '@/helpers/createWinningTransaction';
import prizeDistributionTournament from '@/helpers/prizeDistributionTournament';
import { refundTournamentWagers } from '@/helpers/refundTournamentWagers';
import { updateWinnerWallet } from '@/helpers/updateWinnerWallet';
import { authOptions } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { generateShortCode } from '@/lib/waitlist/codes';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - do not pre-render at build time
export const dynamic = 'force-dynamic';

interface TournamentWager {
  _id: ObjectId;
  tournamentID: ObjectId;
  wagers: Array<{
    auctionID: ObjectId;
    priceGuessed: number;
  }>;
  user: {
    _id: ObjectId;
    fullName: string;
    username: string;
    image: string;
  };
}

type Auction = {
  _id: mongoose.Types.ObjectId;
  finalSellingPrice: number;
  status: number; // test
};

interface Tournament {
  _id: ObjectId;
  auctions: ObjectId[];
  status: number;
}

export async function GET(req: NextRequest) {
  // Allow cron jobs via secret header OR authenticated users
  const cronSecret = req.headers.get('x-cron-secret');
  const isCron = cronSecret && cronSecret === process.env.CRON_SECRET;

  if (!isCron) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
  }

  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME || undefined);
  const mongoSession = client.startSession();

  try {
    await mongoSession.startTransaction();

    // Archive modern-schema tournaments whose endTime has passed.
    // Legacy code below uses numeric `status` (1=active, 2=completed), but tournaments
    // created by /api/cron/create-tournaments only carry the boolean `isActive` field.
    // Without this pass they'd remain isActive:true forever and keep showing up in
    // the UI's active list — flip them as soon as endTime is in the past.
    const now = new Date();
    const archiveResult = await db.collection('tournaments').updateMany(
      { isActive: true, endTime: { $lt: now } },
      { $set: { isActive: false, archivedAt: now } }
    );
    if (archiveResult.modifiedCount > 0) {
      console.log(`Archived ${archiveResult.modifiedCount} expired tournaments (isActive → false)`);
    }

    const activeTournaments: Tournament[] = (await db.collection('tournaments').find({ status: 1 }).toArray()) as Tournament[];
    const completedTournaments: Tournament[] = (await db.collection('tournaments').find({ status: 2 }).toArray()) as Tournament[];

    for (const tournament of activeTournaments) {
      const tournamentWagersArray: TournamentWager[] = (await db.collection('tournament_wagers').find({ tournamentID: tournament._id }).toArray()) as TournamentWager[];

      const playerCount = tournamentWagersArray.length;
      console.log('Players:', playerCount);

      const allAuctions = await db.collection('auctions').find({ tournamentID: tournament._id }).toArray();

      const auctionStatuses = allAuctions.map((auction) => {
        const statusAttribute = auction.attributes.find((attr: { key: string }) => attr.key === 'status');
        const status = statusAttribute ? statusAttribute.value : undefined;
        console.log(`Auction ID: ${auction._id}, Status: ${status}`);
        return statusAttribute ? parseInt(statusAttribute.value) : undefined;
      });
      console.log(`Auction statuses for tournament ${tournament._id}:`, auctionStatuses);

      // Part 1: Update Tournament Status
      const liveAuctionsCount = auctionStatuses.filter((status) => status === 1).length;
      const unsuccessfulAuctionsCount = auctionStatuses.filter((status) => status === 3).length;
      const successfulAuctionsCount = auctionStatuses.filter((status) => status === 2).length;
      const totalAuctionsCount = auctionStatuses.length;
      const allAuctionsComplete = (successfulAuctionsCount >= 4 && unsuccessfulAuctionsCount <= 1) || successfulAuctionsCount === totalAuctionsCount;

      if (liveAuctionsCount > 0) {
        console.log(`Tournament ${tournament._id} is still active with live auctions.`);
      } else if (playerCount <= 2 && unsuccessfulAuctionsCount < 2 && liveAuctionsCount === 0) {
        console.log(`Cancelling tournament ${tournament._id} due to insufficient buy-ins and no live auctions.`);
        await db.collection('tournaments').updateOne({ _id: tournament._id }, { $set: { status: 3, isActive: false, archivedAt: new Date() } });
        await refundTournamentWagers(tournamentWagersArray.map((wager) => wager._id));
        console.log(`Tournament ${tournament._id} cancelled and refunds processed.`);
      } else if (unsuccessfulAuctionsCount >= 2 && liveAuctionsCount === 0) {
        console.log(`Cancelling tournament ${tournament._id} due to unsuccessful auctions and no live auctions.`);
        await db.collection('tournaments').updateOne({ _id: tournament._id }, { $set: { status: 3, isActive: false, archivedAt: new Date() } });
        await refundTournamentWagers(tournamentWagersArray.map((wager) => wager._id));
        console.log(`Tournament ${tournament._id} cancelled and refunds processed.`);
      } else if (allAuctionsComplete && playerCount >= 3) {
        console.log(`All auctions are complete. Updating status for tournament ${tournament._id} to 2`);
        await db.collection('tournaments').updateOne({ _id: tournament._id }, { $set: { status: 2, isActive: false, archivedAt: new Date() } });
      } else {
        console.log(`Tournament ${tournament._id} is still active.`);
      }

      // Part 2: Update Tournament Scores
      const auctionIDs = tournamentWagersArray.flatMap((wager) => wager.wagers.map((wager) => wager.auctionID));

      const auctionDocuments = await db
        .collection('auctions')
        .find({ _id: { $in: auctionIDs } })
        .toArray();

      // create a map to store the status of each auction
      const auctionStatusMap = new Map();
      auctionDocuments.forEach((doc) => {
        const statusAttribute = doc.attributes.find((attr: { key: string }) => attr.key === 'status');
        if (statusAttribute) {
          auctionStatusMap.set(doc._id.toString(), Number(statusAttribute.value));
        }
      });

      const auctions: Auction[] = auctionDocuments.map((doc) => ({
        _id: doc._id,
        finalSellingPrice: doc.attributes.find((attr: { key: string }) => attr.key === 'price')?.value || 0,
        status: doc.attributes.find((attr: { key: string }) => attr.key === 'status')?.value || 0,
      }));

      const userWagers = tournamentWagersArray.map((tournamentWager) => ({
        userID: tournamentWager.user._id.toString(),
        username: tournamentWager.user.username,
        image: tournamentWager.user.image || '',
        wagers: tournamentWager.wagers.map((wager) => ({
          auctionID: wager.auctionID,
          priceGuessed: wager.priceGuessed,
        })),
      }));

      const tournamentResults = calculateTournamentScores(userWagers, auctions);
      console.log('Tournament Results:', JSON.stringify(tournamentResults, null, 2));

      // save the points to a separate collection
      for (const result of tournamentResults) {
        const auctionScoresWithAllAuctions = result.auctionScores.map((auctionScore) => ({
          ...auctionScore,
          isSuccessful: auctionStatusMap.get(auctionScore.auctionID) !== 3,
        }));

        const filter = {
          tournamentID: tournament._id,
          'user._id': new ObjectId(result.userID),
        };

        const update = {
          $set: {
            user: {
              _id: new ObjectId(result.userID),
              username: result.username,
              image: result.image,
            },
            auctionScores: auctionScoresWithAllAuctions,
          },
        };

        const options = { upsert: true };

        await db.collection('tournament_points').updateOne(filter, update, options);
      }
    }

    // Part three: Process Tournament Winners
    for (const tournament of completedTournaments) {
      if (tournament.status === 2) {
        const tournamentTransactions = await db
          .collection('transactions')
          .find({
            tournamentID: tournament._id,
            transactionType: 'tournament buy-in',
            type: '-',
          })
          .toArray();
        console.log('tournamentID:', tournamentTransactions);

        // Calculate the totalPot for the tournament
        const totalPot = 0.88 * tournamentTransactions.map((transaction) => transaction.amount).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        console.log('Total Pot:', totalPot);

        const tournamentWagersArray: TournamentWager[] = (await db.collection('tournament_wagers').find({ tournamentID: tournament._id }).toArray()) as TournamentWager[];
        const auctionIDs: ObjectId[] = tournamentWagersArray.flatMap((tournamentWager) => tournamentWager.wagers.map((wager) => wager.auctionID));
        console.log(`Auction IDs:`, auctionIDs);

        // fetch the corresponding auctions from the db
        const auctions = await db
          .collection('auctions')
          .find({ _id: { $in: auctionIDs } }, { projection: { _id: 1, 'attributes.key': 1, 'attributes.value': 1 } })
          .toArray();

        // Prepare the data for calculating tournament scores
        const auctionsToProcess = auctions.map((auction) => ({
          _id: auction._id,
          finalSellingPrice: auction.attributes.find((attr: { key: string }) => attr.key === 'price')?.value || 0,
          status: auction.attributes.find((attr: { key: string }) => attr.key === 'status')?.value || 0,
        }));

        const userWagers = tournamentWagersArray.map((tournamentWager) => ({
          userID: tournamentWager.user._id.toString(),
          username: tournamentWager.user.username,
          image: tournamentWager.user.image || '',
          wagers: tournamentWager.wagers.map((wager) => ({
            auctionID: wager.auctionID,
            priceGuessed: wager.priceGuessed,
          })),
        }));

        // Calculate the tournament results (scores)
        const tournamentResults = calculateTournamentScores(userWagers, auctionsToProcess);
        console.log('Tournament Results:', JSON.stringify(tournamentResults, null, 2));

        // Prize distribution
        const tournamentWagersForPrizeDistribution = tournamentResults.map((result) => {
          const tournamentWager = tournamentWagersArray.find((wager) => wager.user._id.toString() === result.userID.toString());

          if (!tournamentWager) {
            throw new Error(`Wager not found for user ${result.userID}`);
          }

          return {
            userID: result.userID.toString(),
            totalScore: result.totalScore,
            _id: tournamentWager._id,
          };
        });

        const tournamentWinners = prizeDistributionTournament(tournamentWagersForPrizeDistribution, totalPot);
        console.log('Tournament Winners:', tournamentWinners);

        // Create winning transactions and update the wallet balances for the winners
        for (const winner of tournamentWinners) {
          const user = await db.collection('users').findOne({ _id: new ObjectId(winner.userID) });
          const transactionId = await createWinningTransaction(new ObjectId(winner.userID), winner.prize);

          await updateWinnerWallet(new ObjectId(winner.userID), winner.prize);
          await addTournamentWagerWinning(new ObjectId(winner.wagerID), winner.prize);

          winner.transactionID = transactionId;
          winner.username = user ? user.username : '';
          winner.userImage = user && user.image ? user.image : '';
        }

        await db.collection('tournaments').updateOne(
          { _id: tournament._id },
          {
            $set: {
              status: 4,
              isActive: false,
              archivedAt: new Date(),
              winners: tournamentWinners.map((winner) => ({
                userID: winner.userID,
                username: winner.username,
                userImage: winner.userImage,
                transactionID: winner.transactionID,
                prize: winner.prize,
                rank: winner.rank,
                winningDate: new Date(),
              })),
            },
          }
        );

        // ── Tournament-finish share cards for top 10 ───────────────────────
        // One card per top-10 finisher so they can share a
        // `#N on Velocity Markets — XX% accuracy` unfurl. Mirrors the
        // Task 4.4 winner-card pattern in cron/settle-markets: raw
        // mongodb driver, per-user dedupe via existence check, inline
        // E11000 shortCode retry, and nested try/catch so no share-card
        // failure can block tournament finalization. No session passed —
        // matches the rest of this route; the outer transaction block
        // is legacy and is not currently binding any writes in this file.
        try {
          const cardNow = new Date();
          const tournamentIdHex = tournament._id.toString();
          const tournamentDoc = (await db
            .collection('tournaments')
            .findOne({ _id: tournament._id }, { projection: { name: 1 } })) as
            | { name?: string }
            | null;
          const tournamentName: string = tournamentDoc?.name ?? '';

          // finalSellingPrice lookup per auction id → per-auction accuracy.
          const priceById = new Map<string, number>(
            auctionsToProcess.map((a) => [a._id.toString(), Number(a.finalSellingPrice) || 0])
          );
          // auction status lookup — skip cancelled auctions (status 3) when
          // computing accuracy, matching calculateTournamentScores semantics.
          const statusById = new Map<string, number>(
            auctionsToProcess.map((a) => [a._id.toString(), Number(a.status) || 0])
          );

          const top10 = tournamentResults.slice(0, 10);
          for (let i = 0; i < top10.length; i++) {
            const result = top10[i];
            const placement = i + 1;
            let userId: ObjectId;
            try {
              userId = new ObjectId(result.userID);
            } catch (idErr) {
              console.error(
                `tournamentWinner: invalid userID ${result.userID} in tournament ${tournamentIdHex}:`,
                idErr
              );
              continue;
            }

            try {
              // Dedupe: one tournament card per (user, tournament).
              const existing = await db.collection('share_cards').findOne({
                userId,
                type: 'tournament',
                'payload.tournamentId': tournamentIdHex,
              });
              if (existing) continue;

              const userDoc = await db
                .collection('users')
                .findOne({ _id: userId }, { projection: { username: 1, referralCode: 1 } });
              const username: string = (userDoc?.username as string | undefined) ?? '';
              if (!username) continue; // no username → skip, not catastrophic
              const referralCode: string =
                (userDoc?.referralCode as string | undefined) ?? '';

              // Accuracy: mean per-auction closeness across successful auctions.
              // score = |guessed - actual|, so per-auction accuracy = 1 - score/actual,
              // clamped to [0, 1]. Skip auctions with status === 3 (cancelled) and
              // auctions with a non-positive actual price (guard against div-by-zero).
              let accSum = 0;
              let accCount = 0;
              for (const s of result.auctionScores) {
                const status = statusById.get(s.auctionID);
                if (status === 3) continue;
                const actual = priceById.get(s.auctionID);
                if (!actual || actual <= 0) continue;
                const perAuction = Math.max(0, 1 - s.score / actual);
                accSum += perAuction;
                accCount += 1;
              }
              const accuracyRaw = accCount === 0 ? 0 : accSum / accCount;
              const accuracy = Math.round(accuracyRaw * 10000) / 10000; // 4dp

              // Insert with inline shortCode collision retry. The shortCode has
              // a schema-level unique index — a race can still surface E11000
              // after a preflight find. Any other duplicate key is terminal.
              let inserted = false;
              for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
                const shortCode = generateShortCode();
                try {
                  await db.collection('share_cards').insertOne({
                    userId,
                    type: 'tournament',
                    payload: {
                      placement,
                      accuracy,
                      tournamentId: tournamentIdHex,
                      tournamentName,
                      username,
                      referralCode,
                    },
                    shortCode,
                    views: 0,
                    signups: 0,
                    createdAt: cardNow,
                    updatedAt: cardNow,
                  });
                  inserted = true;
                } catch (insertErr) {
                  const code = (insertErr as { code?: number }).code;
                  const keyPattern = (insertErr as { keyPattern?: Record<string, unknown> })
                    .keyPattern;
                  if (code !== 11000 || !keyPattern || !('shortCode' in keyPattern)) {
                    throw insertErr;
                  }
                  // loop → regenerate
                }
              }
              if (!inserted) {
                console.error(
                  `tournamentWinner: shortCode collision retries exhausted for user ${userId.toHexString()} in tournament ${tournamentIdHex}`
                );
              }
            } catch (cardErr) {
              // Per-user failure must not block other tournament cards.
              console.error(
                `tournamentWinner: tournament share card failed for user ${userId.toHexString()} in tournament ${tournamentIdHex}:`,
                cardErr
              );
            }
          }
        } catch (err) {
          // Aggregation/setup failure is non-fatal — tournament finalization already committed.
          console.error(
            `tournamentWinner: tournament share card block failed for tournament ${tournament._id.toString()}:`,
            err
          );
        }

        console.log(`Updated tournament status to 4 for tournamentId: ${tournament._id}`);
      }
    }

    await mongoSession.commitTransaction();
    return NextResponse.json({ message: 'Tournaments processed successfully' }, { status: 200 });
  } catch (error) {
    // Log the original error FIRST so it reaches CloudWatch even if abort
    // throws below.
    console.error('Error in tournamentWinner:', error);
    // Defensive abort: if startTransaction itself failed, there's no
    // transaction to abort and the driver will throw "no transaction in
    // progress" — which would escape this catch and produce a generic
    // empty-body 500 in production.
    try {
      if (mongoSession.inTransaction()) {
        await mongoSession.abortTransaction();
      }
    } catch (abortErr) {
      console.error('tournamentWinner: abortTransaction also failed:', abortErr);
    }
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Internal server error', detail },
      { status: 500 }
    );
  } finally {
    try {
      await mongoSession.endSession();
    } catch (endErr) {
      console.error('tournamentWinner: endSession failed:', endErr);
    }
  }
}
