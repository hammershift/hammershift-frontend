import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { hash, compare } from "bcryptjs";

/**
 * POST /api/profile/change-password
 * Changes user password (requires old password verification)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?._id ?? session?.user?.id;

    if (!session || !userId || !session.user?.email) {
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

    const user = await Users.findById(userId).select('+password');
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "No password set — use Forgot Password to create one" },
        { status: 400 }
      );
    }

    const isValidPassword = await compare(oldPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    const hashedPassword = await hash(newPassword, 10);
    await Users.findByIdAndUpdate(userId, { password: hashedPassword });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
