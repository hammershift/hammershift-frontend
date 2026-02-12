# Workstream 1 Integration Checklist

## Before Starting Workstream 2/3/4

### Database Setup
- [ ] Verify MongoDB connection works
- [ ] Run app in dev mode (`npm run dev`)
- [ ] Verify new collections are created on first write
- [ ] Test TTL indexes work (user_events expires after 90 days)

### Auth Testing
- [ ] Sign up flow works with NextAuth
- [ ] Login flow works with NextAuth
- [ ] Session persists across page reloads
- [ ] Logout works correctly
- [ ] Password reset flow works

### Event Tracking Testing
- [ ] POST /api/events/track returns 401 when not authenticated
- [ ] POST /api/events/track creates UserEvent document when authenticated
- [ ] Rate limiting works (try 101 requests in 15 minutes)
- [ ] useTrackEvent hook can be imported and called

### Model Testing
- [ ] Can create User with new fields
- [ ] Can create Prediction with bonus_modifiers
- [ ] Can create Tournament with scoring_version
- [ ] Can create Auction with prediction_count
- [ ] Streak model enforces unique user_id
- [ ] Badge model allows duplicate user_id but not same badge_type per user

### Utilities Testing
- [ ] streakManager.updateStreak returns correct data structure
- [ ] badgeManager check functions can be called
- [ ] scoringEngine.calculateScoreV2 returns correct score object

## Customer.io Setup (External - Not Code)
- [ ] Create Customer.io account
- [ ] Get SITE_ID and API_KEY
- [ ] Add to .env.local
- [ ] Configure 3 Welcome Series emails in UI
- [ ] Configure 3 Transactional emails in UI
- [ ] Configure 5 Retention campaigns in UI
- [ ] Set up event forwarding (connect to user_events)

## PostHog Setup (External - Not Code)
- [ ] Create PostHog account (or use existing)
- [ ] Get API_KEY
- [ ] Add to .env.local
- [ ] Configure event ingestion
- [ ] Set up custom events dashboard

## Ready for Next Workstreams
- [ ] Workstream 1 fully complete ✅
- [ ] Build passes ✅
- [ ] Dev server runs without errors ✅
- [ ] All models tested ✅

## Notes

### Environment Variables Added
The following environment variables need to be set in `.env.local`:
```
CUSTOMERIO_SITE_ID=
CUSTOMERIO_API_KEY=
POSTHOG_API_KEY=
POSTHOG_HOST=https://app.posthog.com
```

### New Collections Created
The following Mongoose models have been added to `src/models/`:
- `userEvent.model.ts` - Event tracking with 90-day TTL
- `leaderboardSnapshot.model.ts` - Pre-computed rankings
- `streak.model.ts` - Streak tracking with unique user_id
- `badge.model.ts` - Achievement system
- `emailLog.model.ts` - Email engagement tracking

### New Utilities Added
The following utilities have been added to `src/lib/`:
- `streakManager.ts` - Streak calculation and freeze token logic
- `badgeManager.ts` - Badge checking and awarding
- `scoringEngine.ts` - V2 scoring formula implementation
- `useTrackEvent.ts` - Client-side event tracking hook

### API Routes Added
- `POST /api/events/track` - Event tracking endpoint with rate limiting

### Known Build Warnings
The production build succeeds with the following non-blocking warnings:
- React hooks exhaustive-deps warnings (existing code, not Workstream 1)
- Next.js Image component suggestions (existing code, not Workstream 1)
- Dynamic server usage for some API routes (expected behavior)
- url.parse() deprecation (from Next.js internals)

These warnings do not affect functionality and can be addressed in future workstreams.
