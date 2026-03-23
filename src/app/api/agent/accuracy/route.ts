import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    const db = (await import('mongoose')).default.connection.db;
    if (!db) throw new Error('DB not connected');

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') ?? '0', 10);
    const make = searchParams.get('make');

    const collection = db.collection('agent_predictions');

    const matchFilter: Record<string, unknown> = { status: 'GRADED' };
    if (days > 0) {
      matchFilter.finalPriceCapturedAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }
    if (make) {
      matchFilter.make = { $regex: new RegExp(`^${make}$`, 'i') };
    }

    const [mainStats] = await collection.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalGraded: { $sum: 1 },
          withinFivePct: { $sum: { $cond: ['$withinFivePct', 1, 0] } },
          withinTenPct: { $sum: { $cond: ['$withinTenPct', 1, 0] } },
          withinTwentyPct: { $sum: { $cond: ['$withinTwentyPct', 1, 0] } },
          meanAbsoluteErrorPct: { $avg: '$absoluteErrorPct' },
          gradeA: { $sum: { $cond: [{ $eq: ['$grade', 'A'] }, 1, 0] } },
          gradeB: { $sum: { $cond: [{ $eq: ['$grade', 'B'] }, 1, 0] } },
          gradeC: { $sum: { $cond: [{ $eq: ['$grade', 'C'] }, 1, 0] } },
          gradeD: { $sum: { $cond: [{ $eq: ['$grade', 'D'] }, 1, 0] } },
          gradeF: { $sum: { $cond: [{ $eq: ['$grade', 'F'] }, 1, 0] } },
        },
      },
    ]).toArray();

    const totalPending = await collection.countDocuments({ status: 'PENDING' });

    const byConfidence = await collection.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$confidence', count: { $sum: 1 },
          withinTenPct: { $sum: { $cond: ['$withinTenPct', 1, 0] } },
          meanError: { $avg: '$absoluteErrorPct' },
        },
      },
      {
        $project: {
          confidence: '$_id', count: 1,
          accuracyPct: { $round: [{ $multiply: [{ $divide: ['$withinTenPct', '$count'] }, 100] }, 1] },
          meanError: { $round: ['$meanError', 1] },
        },
      },
    ]).toArray();

    const byMake = await collection.aggregate([
      { $match: { ...matchFilter, make: { $ne: null } } },
      {
        $group: {
          _id: '$make', count: { $sum: 1 },
          withinTenPct: { $sum: { $cond: ['$withinTenPct', 1, 0] } },
          meanError: { $avg: '$absoluteErrorPct' },
        },
      },
      { $match: { count: { $gte: 3 } } },
      {
        $project: {
          make: '$_id', count: 1,
          accuracyPct: { $round: [{ $multiply: [{ $divide: ['$withinTenPct', '$count'] }, 100] }, 1] },
          meanError: { $round: ['$meanError', 1] },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]).toArray();

    const trend = await db.collection('agent_accuracy_log')
      .find({}).sort({ date: -1 }).limit(30)
      .project({ date: 1, cumulativeAccuracyPct: 1, totalGraded: 1, withinTenPct: 1 })
      .toArray();

    const stats = mainStats ?? {
      totalGraded: 0, withinFivePct: 0, withinTenPct: 0, withinTwentyPct: 0,
      meanAbsoluteErrorPct: 0, gradeA: 0, gradeB: 0, gradeC: 0, gradeD: 0, gradeF: 0,
    };

    return NextResponse.json({
      overview: {
        totalGraded: stats.totalGraded,
        totalPending,
        accuracyPct: stats.totalGraded > 0
          ? Math.round((stats.withinTenPct / stats.totalGraded) * 10000) / 100 : 0,
        withinFivePct: stats.withinFivePct,
        withinTenPct: stats.withinTenPct,
        withinTwentyPct: stats.withinTwentyPct,
        meanAbsoluteErrorPct: Math.round((stats.meanAbsoluteErrorPct ?? 0) * 100) / 100,
        gradeDistribution: { A: stats.gradeA, B: stats.gradeB, C: stats.gradeC, D: stats.gradeD, F: stats.gradeF },
      },
      byConfidence,
      byMake,
      trend: trend.reverse(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Agent API] Error fetching accuracy:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
