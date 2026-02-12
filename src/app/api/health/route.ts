import { NextResponse } from "next/server";
import connectToDB from "@/lib/mongoose";

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
    env_vars_present: {
      MONGODB_URI: !!process.env.MONGODB_URI,
      MONGODB_URI_length: process.env.MONGODB_URI?.length || 0,
      DB_NAME: process.env.DB_NAME || 'not set',
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    },
    env_keys: Object.keys(process.env)
      .filter(k => !k.includes('SECRET') && !k.includes('PASSWORD') && !k.includes('KEY'))
      .sort(),
  };

  // Test MongoDB connection
  try {
    await connectToDB();
    diagnostics.mongodb_connection = 'SUCCESS';
  } catch (error: any) {
    diagnostics.mongodb_connection = 'FAILED';
    diagnostics.mongodb_error = error.message;
  }

  return NextResponse.json(diagnostics, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    }
  });
}
