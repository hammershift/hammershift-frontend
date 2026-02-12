import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Tournaments from "@/models/tournament.model";
import Users from "@/models/user.model";

export const dynamic = "force-dynamic";

/**
 * POST /api/tournaments/[id]/join
 * Allows a user to join a tournament
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();

    const tournament = await Tournaments.findById(params.id);

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Check if tournament is active
    if (!tournament.isActive) {
      return NextResponse.json(
        { error: "Tournament is not active" },
        { status: 400 }
      );
    }

    // Check if tournament has started
    const now = new Date();
    if (new Date(tournament.startTime) > now) {
      return NextResponse.json(
        { error: "Tournament has not started yet" },
        { status: 400 }
      );
    }

    // Check if tournament has ended
    if (new Date(tournament.endTime) < now) {
      return NextResponse.json(
        { error: "Tournament has already ended" },
        { status: 400 }
      );
    }

    // Check if already joined
    const alreadyJoined = tournament.users.some(
      (u: any) => u.userId.toString() === session.user.id
    );

    if (alreadyJoined) {
      return NextResponse.json(
        { error: "You have already joined this tournament" },
        { status: 400 }
      );
    }

    // Check max participants
    if (tournament.max_participants &&
        tournament.users.length >= tournament.max_participants) {
      return NextResponse.json(
        { error: "Tournament is full" },
        { status: 400 }
      );
    }

    // Handle entry fee for paid tournaments
    if (tournament.type === 'paid' && tournament.buyInFee > 0) {
      const user = await Users.findById(session.user.id);

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      if (user.balance < tournament.buyInFee) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 }
        );
      }

      // Deduct entry fee from user balance
      await Users.findByIdAndUpdate(
        session.user.id,
        { $inc: { balance: -tournament.buyInFee } }
      );

      // Add to prize pool
      await Tournaments.findByIdAndUpdate(
        params.id,
        { $inc: { prizePool: tournament.buyInFee } }
      );
    }

    // Add user to tournament
    const updatedTournament = await Tournaments.findByIdAndUpdate(
      params.id,
      {
        $push: {
          users: {
            userId: session.user.id,
            fullName: session.user.name,
            username: session.user.username || session.user.email?.split('@')[0],
            role: session.user.role || 'USER'
          }
        }
      },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Successfully joined tournament",
        tournament: updatedTournament
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error joining tournament:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
