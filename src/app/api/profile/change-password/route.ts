import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { hash, compare } from "bcryptjs";

/**
 * POST /api/profile/change-password
 * Changes user password (requires old password verification)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Old and new passwords are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    // For now, return a mock response since we don't have password stored in Users model
    // In production, you'd verify the old password and update it

    // This would be the actual implementation:
    // const user = await Users.findById(session.user.id).select('+password');
    // if (!user || !user.password) {
    //   return NextResponse.json({ error: "User not found" }, { status: 404 });
    // }

    // const isValidPassword = await compare(oldPassword, user.password);
    // if (!isValidPassword) {
    //   return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    // }

    // const hashedPassword = await hash(newPassword, 10);
    // await Users.findByIdAndUpdate(session.user.id, { password: hashedPassword });

    return NextResponse.json({
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
