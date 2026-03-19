import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import connectToDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const { marketId } = await params;

  await connectToDB();
  const db = mongoose.connection.db;
  if (!db) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: '#0A0A1A',
            color: 'white',
            fontSize: 32,
          }}
        >
          Velocity Markets
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  let market: any = null;
  try {
    market = await db.collection('polygon_markets').findOne({
      _id: new mongoose.Types.ObjectId(marketId),
    });
  } catch {
    /* invalid ObjectId or DB error */
  }

  if (!market) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: '#0A0A1A',
            color: 'white',
            fontSize: 32,
          }}
        >
          Velocity Markets
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Get auction for background image
  let auction: any = null;
  if (market.auctionId) {
    try {
      auction = await db.collection('auctions').findOne({
        $or: [
          { auction_id: market.auctionId },
          { _id: new mongoose.Types.ObjectId(market.auctionId) },
        ],
      });
    } catch {
      /* ignore */
    }
  }

  const yesPercent = Math.round((market.yesPrice ?? 0.5) * 100);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#0A0A1A',
          position: 'relative',
        }}
      >
        {/* Background image if available */}
        {auction?.image && (
          <img
            src={auction.image}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.3,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(135deg, rgba(10,10,26,0.95) 0%, rgba(10,10,26,0.7) 100%)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 80px',
            width: '100%',
          }}
        >
          {/* Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 24,
              color: '#E94560',
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            VELOCITY MARKETS
          </div>

          {/* Question */}
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: 'white',
              marginBottom: 24,
              lineHeight: 1.2,
              maxWidth: 800,
            }}
          >
            {market.question ?? 'Market'}
          </div>

          {/* Probability */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: yesPercent > 50 ? '#16c784' : '#f44b5a',
              }}
            >
              {yesPercent}%
            </span>
            <span style={{ fontSize: 24, color: '#9CA3AF' }}>say YES</span>
          </div>

          {/* CTA */}
          <div style={{ fontSize: 18, color: '#9CA3AF' }}>
            Make your prediction at velocitymarkets.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
