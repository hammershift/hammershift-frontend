import connectToDB from "@/lib/mongoose";
import EmailModel from "@/models/email.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const { email } = await req.json();
    await EmailModel.create({ email });
    return NextResponse.json({ message: "Subscription successful!" });
  } catch (error) {
    return NextResponse.json({message: 'Internal server error'})
  }
}
