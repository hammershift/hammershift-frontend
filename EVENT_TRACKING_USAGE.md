# Event Tracking System - Usage Guide

## Overview

The event tracking system consists of three components:
1. API Route: `/api/events/track` (POST)
2. Client Hook: `useTrackEvent()`
3. Server Utility: `trackServerEvent()`

## Components

### 1. API Route

**Location:** `/Users/rickdeaconx/hammershift-frontend/src/app/api/events/track/route.ts`

**Features:**
- Session validation using NextAuth `getServerSession`
- Rate limiting: 100 requests per 15 minutes per user
- MongoDB persistence via UserEvent model
- Automatic connection handling
- Error handling with proper status codes

**Response Codes:**
- `201` - Event tracked successfully
- `400` - Invalid event_type
- `401` - Unauthorized (no valid session)
- `429` - Rate limit exceeded
- `500` - Internal server error

### 2. Client Hook

**Location:** `/Users/rickdeaconx/hammershift-frontend/src/hooks/useTrackEvent.ts`

**Usage:**

```typescript
import { useTrackEvent } from '@/hooks/useTrackEvent';

function MyComponent() {
  const track = useTrackEvent();

  const handleAction = () => {
    // Track a simple event
    track('button_clicked');

    // Track an event with data
    track('auction_viewed', {
      auction_id: '123',
      price: 50000,
      make: 'Porsche'
    });
  };

  return <button onClick={handleAction}>View Auction</button>;
}
```

### 3. Server Utility

**Location:** `/Users/rickdeaconx/hammershift-frontend/src/lib/trackServerEvent.ts`

**Usage:**

```typescript
import { trackServerEvent } from '@/lib/trackServerEvent';

// In an API route or server component
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Track server-side event
  await trackServerEvent(
    session.user._id,
    'prediction_made',
    {
      auction_id: '123',
      prediction_amount: 75000,
      wager_amount: 100
    }
  );

  // ... rest of your logic
}
```

## Event Data Structure

Events are stored in MongoDB with the following schema:

```typescript
{
  user_id: ObjectId,        // Reference to User model
  event_type: string,        // Event name (e.g., 'auction_viewed')
  event_data?: object,       // Optional metadata
  created_at: Date           // Auto-set, 90-day TTL
}
```

## Core Events (PRD Section 5.2)

As per PRD v2.1, the following core events should be tracked:

### Client-Side Events
- `auction_viewed` - When user views auction detail page
- `prediction_made` - When user submits a prediction
- `tournament_joined` - When user joins a tournament
- `leaderboard_viewed` - When user views leaderboard

### Server-Side Events
- `prediction_submitted` - Server confirmation of prediction
- `tournament_entry_confirmed` - Server confirmation of tournament entry
- `wallet_transaction` - When user adds/spends funds

## Rate Limiting

The API route implements in-memory rate limiting:
- **Limit:** 100 requests per 15 minutes per user
- **Implementation:** Simple Map-based storage
- **Cleanup:** Automatic cleanup every hour
- **Response:** 429 status when limit exceeded

## Error Handling

All components use silent error handling:
- Errors are logged to console
- Errors never throw to client
- Failed tracking doesn't break user experience

## Integration with Customer.io

These events will be used by the Customer.io integration (PRD Section 5.3) for:
- Email campaign triggers
- User segmentation
- Behavioral analytics

## Next Steps

After implementation, wire these tracking calls into:
1. Auction detail pages (`auction_viewed`)
2. Prediction submission flow (`prediction_made`)
3. Tournament join flow (`tournament_joined`)
4. Leaderboard page (`leaderboard_viewed`)
