import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserEvent from '@/models/userEvent.model';
import connectToDB from '@/lib/mongoose';

// In-memory rate limiting map
// Structure: Map<userId, { count: number, resetAt: number }>
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 100;

// Clean up expired rate limit entries every hour
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitMap.entries());
  for (const [userId, data] of entries) {
    if (data.resetAt < now) {
      rateLimitMap.delete(userId);
    }
  }
}, 60 * 60 * 1000);

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || userLimit.resetAt < now) {
    // Initialize or reset the rate limit
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user._id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user._id;

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 100 requests per 15 minutes.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { event_type, event_data } = body;

    if (!event_type || typeof event_type !== 'string') {
      return NextResponse.json(
        { error: 'Invalid event_type. Must be a non-empty string.' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDB();

    // Create event document
    await UserEvent.create({
      user_id: userId,
      event_type,
      event_data: event_data || {},
    });

    return NextResponse.json(
      { success: true, message: 'Event tracked successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Event tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
