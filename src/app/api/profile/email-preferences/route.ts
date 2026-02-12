import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Users from "@/models/user.model";

/**
 * PATCH /api/profile/email-preferences
 * Updates user email preferences
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email_preferences } = body;

    if (!email_preferences) {
      return NextResponse.json(
        { error: "Email preferences are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedUser = await Users.findByIdAndUpdate(
      session.user.id,
      { email_preferences },
      { new: true, runValidators: true }
    ).select("email_preferences");

    return NextResponse.json({
      message: "Email preferences updated successfully",
      email_preferences: updatedUser?.email_preferences
    });
  } catch (error) {
    console.error("Error updating email preferences:", error);
    return NextResponse.json(
      { error: "Failed to update email preferences" },
      { status: 500 }
    );
  }
}
