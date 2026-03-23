import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    const db = (await import('mongoose')).default.connection.db;
    if (!db) throw new Error('DB not connected');

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);
    const status = searchParams.get('status');
    const make = searchParams.get('make');
    const confidence = searchParams.get('confidence');
    const grade = searchParams.get('grade');
    const sort = searchParams.get('sort') ?? 'predictedAt';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (make) filter.make = { $regex: new RegExp(`^${make}$`, 'i') };
    if (confidence) filter.confidence = confidence;
    if (grade) filter.grade = grade;

    const collection = db.collection('agent_predictions');

    const [predictions, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ [sort]: order })
        .skip((page - 1) * limit)
        .limit(limit)
        .project({
          auctionId: 1, title: 1, pageUrl: 1, imageUrl: 1,
          year: 1, make: 1, model: 1, trim: 1,
          predictedPrice: 1, confidence: 1, comparablesUsed: 1, pricingMethod: 1, priceRange: 1,
          status: 1, finalPrice: 1, predictionError: 1, predictionErrorPct: 1,
          absoluteErrorPct: 1, grade: 1, marketOutcome: 1,
          predictedAt: 1, finalPriceCapturedAt: 1, auctionDeadline: 1,
        })
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return NextResponse.json({
      predictions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Agent API] Error fetching predictions:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
