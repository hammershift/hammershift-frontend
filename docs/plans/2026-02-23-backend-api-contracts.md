# Velocity Markets — Backend API Contracts

**Date:** February 23, 2026
**For:** Backend team
**Context:** These are the API endpoints the frontend will call for Track 2 features. Frontend stubs are already built — they call these endpoints and handle loading/error states. Backend owns implementation.

---

## 6. Guest Mode — `POST /api/guest/migrate`

**When called:** After a guest user signs up (0–3 picks stored in localStorage `vm_guest_predictions`).

```
POST /api/guest/migrate
Authorization: NextAuth session (user must be authenticated)

Body:
{
  predictions: Array<{
    auctionId: string       // MongoDB ObjectId string
    predictedPrice: number  // integer, user's price guess
  }>
}

Response 200:
{
  migrated: number     // how many predictions were saved
  skipped: number      // duplicates ignored (same user + auctionId already exists)
}

Response 400:
{
  error: string
}
```

**Rules:**
- Idempotent — if user already has a prediction for an auctionId, skip it (don't error)
- Max 3 guest predictions per migrate call
- Prediction should be saved as if the user made it at the original timestamp (use `timestamp` field from guest prediction if available)

---

## 7. Wallet / ACH

### `POST /api/wallet/deposit/ach`

```
POST /api/wallet/deposit/ach
Authorization: NextAuth session

Body:
{
  amount: number                // in cents
  routingNumber: string
  accountNumber: string
  accountType: 'checking' | 'savings'
}

Response 200:
{
  transactionId: string
  status: 'pending'
  availableDate: string         // ISO 8601 date, typically T+3 business days
}

Response 400:
{
  error: string                 // e.g. "Invalid routing number"
}
```

### `GET /api/wallet/ach-status`

```
GET /api/wallet/ach-status
Authorization: NextAuth session

Response 200:
{
  isLinked: boolean
  lastFour: string | null        // last 4 digits of linked account
  preferredMethod: 'ach' | 'card'
}
```

### `PATCH /api/wallet/preferred-method`

```
PATCH /api/wallet/preferred-method
Authorization: NextAuth session

Body:
{
  method: 'ach' | 'card'
}

Response 200:
{
  success: boolean
}
```

**Frontend behavior:** Frontend shows ACH as primary for users where `deposit_count > 1`. Backend should track `deposit_count` on the user record.

---

## 8. Auction Close Notifications

### `POST /api/notifications/push/subscribe`

```
POST /api/notifications/push/subscribe
Authorization: NextAuth session

Body:
{
  subscription: PushSubscription  // standard Web Push API subscription object
  // shape: { endpoint: string, keys: { p256dh: string, auth: string } }
}

Response 200:
{
  success: boolean
}
```

### `GET /api/notifications/preferences`

```
GET /api/notifications/preferences
Authorization: NextAuth session

Response 200:
{
  email_30min: boolean
  email_rank_drop: boolean
  push_30min: boolean
  sms_30min: boolean
  phone: string | null
}
```

### `PATCH /api/notifications/preferences`

```
PATCH /api/notifications/preferences
Authorization: NextAuth session

Body:
{
  email_30min?: boolean
  email_rank_drop?: boolean
  push_30min?: boolean
  sms_30min?: boolean
  phone?: string | null
}

Response 200:
{
  success: boolean
}
```

**Notification triggers (backend owns these — frontend does not trigger them):**
- `email_30min` / `push_30min`: Fire when `sort.deadline` is ~30 min away for any auction the user has a prediction on
- `email_rank_drop`: Fire when user's rank drops (any prediction where another user's prediction is inserted above them)
- SMS via Twilio or equivalent — backend team to choose provider

---

## 9. Ladder Tiers

**Tier thresholds (must match frontend constants exactly):**
```
Rookie:  0–99 points
Silver:  100–299 points
Gold:    300–749 points
Pro:     750+ points
```

### `GET /api/tournaments/ladder/me`

```
GET /api/tournaments/ladder/me
Authorization: NextAuth session

Response 200:
{
  tier: 'rookie' | 'silver' | 'gold' | 'pro'
  points: number
  rank: number                  // rank within current tier
  nextTierThreshold: number     // points needed for next tier (750 if already Pro)
  qualificationWindow: {
    required: number            // tournaments needed in last 14 days to stay qualified
    completed: number           // how many user has done
  }
}
```

### `GET /api/tournaments/schedule`

```
GET /api/tournaments/schedule
Authorization: Optional (public)

Response 200:
Array<{
  id: string
  tier: 'rookie' | 'silver' | 'gold' | 'pro'
  type: 'qualifier' | 'final' | 'playoff'
  startDate: string             // ISO 8601
  prizePool: number             // in dollars
  filledSpots: number
  totalSpots: number
  entryFee: number              // in cents, 0 = free
  isEligible: boolean           // true if current user meets tier requirement
}>
```

**Padlock logic:** Frontend shows padlock on tournament cards where `isEligible: false`.

---

## 10. Analytics Funnel (Admin Only)

### `GET /api/analytics/funnel`

```
GET /api/analytics/funnel
Authorization: NextAuth session with admin role

Query params:
  period: '7d' | '30d' | '90d'

Response 200:
{
  signupToFirstPick: number             // percentage (0–100)
  pickToDeposit: number                 // percentage
  weeklyActiveUsers: number             // unique users with ≥1 event in last 7d
  entriesPerUserPerWeek: number         // avg tournament entries
  depositConversionByRail: {
    ach: number                         // % of deposit-started that completed via ACH
    card: number                        // % via card
  }
  tournamentFillRate: number            // avg % of seats filled across all tournaments
  tierChurnRate: {
    rookie: number                      // % of users who dropped from this tier in period
    silver: number
    gold: number
    pro: number
  }
}
```

**Event types the frontend will send (via existing `useTrackEvent` hook → `POST /api/events/track`):**

```typescript
// These are the event_type strings backend should expect in userEvent collection
'deposit_started'           // { method: 'ach' | 'card', amount: number }
'deposit_completed'         // { method, amount, transactionId }
'pick_submitted_guest'      // { auctionId, predictedPrice }
'signup_from_guest_gate'    // { picksCount: number }
'tournament_joined'         // { tournamentId, tier, entryFee }
'share_card_opened'         // { auctionId, predictionId }
'share_card_shared'         // { platform: 'twitter' | 'copy' | 'native' }
'notification_opted_in'     // { channel: 'push' | 'sms' | 'email' }
'daily_challenge_completed' // { challengeId, xpEarned }
'ladder_page_viewed'        // { currentTier }
```

---

## Existing Endpoints (Frontend Uses These Now)

These already exist and are NOT changing. Listed for reference:

```
POST /api/events/track        — event ingestion (frontend sends all events here)
GET  /api/myPredictions       — user's predictions, supports ?since=today param
GET  /api/cars                — auction list with filters
GET  /api/cars?auction_id=    — single auction
GET  /api/wallet              — wallet balance
POST /api/wallet/deposit      — card deposit (existing Stripe flow)
```

---

## Integration Notes

1. **Auth:** All protected endpoints use NextAuth. Check `getServerSession()` — session has `user.id` (MongoDB ObjectId string).
2. **MongoDB:** Shared cluster. Frontend models are in `src/models/`. Do not change existing schema fields — only add.
3. **User model:** `deposit_count` field may need to be added if not present. Check `src/models/user.model.ts`.
4. **No breaking changes:** All new endpoints are additive. Existing frontend routes must not change signature.
5. **CORS:** Not needed — same origin for all frontend → backend calls.
