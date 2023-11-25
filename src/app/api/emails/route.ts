import connectToDB from "@/lib/mongoose";
import EmailModel from "@/models/email.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const { email } = await req.json();

    const existingEmail = await EmailModel.findOne({ email });

    if (existingEmail) {
      return NextResponse.json({ message: "Email already subscribed!" });
    } else {
      await EmailModel.create({ email });
      return NextResponse.json({ message: "Subscription successful!" });
    }
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const emails = await EmailModel.find({}, "email");
    return NextResponse.json({ emails });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" });
  }
}
