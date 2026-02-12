# Velocity Markets - Quick Deploy Checklist

**Use this checklist when deploying to production**

---

## Pre-Deployment

- [ ] Run `npm run build` - verify build succeeds
- [ ] All tests passing (if applicable)
- [ ] MongoDB connection string ready
- [ ] NextAuth secret generated (`openssl rand -base64 32`)
- [ ] Vercel account ready

---

## Vercel Setup

- [ ] Create new project or select existing
- [ ] Connect GitHub repository
- [ ] Framework preset: **Next.js** (auto-detected)
- [ ] Build command: `npm run build` (default)
- [ ] Output directory: `.next` (default)

---

## Environment Variables (Minimum Required)

Add these in Vercel → Settings → Environment Variables:

```bash
# REQUIRED - App will not work without these
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=<paste generated secret here>
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# OPTIONAL - App works without these
CUSTOMERIO_SITE_ID=
CUSTOMERIO_API_KEY=
POSTHOG_API_KEY=
POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_SENTRY_DSN=
```

- [ ] All required variables added
- [ ] Optional variables added (or skipped for now)

---

## Deploy

- [ ] Click **Deploy** button
- [ ] Wait for build to complete (3-5 minutes)
- [ ] Note deployment URL

---

## Post-Deploy Verification (5 minutes)

Visit your deployment URL and test:

- [ ] Homepage loads
- [ ] Auction page loads
- [ ] Sign up works
- [ ] Log in works
- [ ] Make prediction works
- [ ] Leaderboard loads
- [ ] Profile page loads
- [ ] No console errors in browser DevTools

---

## MongoDB Verification

Check MongoDB Atlas → Browse Collections:

- [ ] `user_events` collection exists
- [ ] Events are being saved (after page views)
- [ ] `predictions` collection has data
- [ ] `users` collection has new users (after signup)

---

## If Something Goes Wrong

**Build fails:**
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing dependencies → check package.json
# - TypeScript errors → check error message
# - Environment variables → check are set correctly
```

**App loads but auth doesn't work:**
```bash
# Check NEXTAUTH_URL matches deployment URL exactly
# Check NEXTAUTH_SECRET is set
# Check MongoDB connection string is correct
```

**MongoDB errors:**
```bash
# In MongoDB Atlas:
# - Network Access → Add IP 0.0.0.0/0 (allow all for Vercel)
# - Database Access → Ensure user has read/write permissions
```

**Rollback if needed:**
```bash
# Vercel Dashboard → Deployments → Previous deployment → Promote
```

---

## Success Criteria

✅ Build completes successfully
✅ All pages load without errors
✅ Users can sign up and log in
✅ Predictions can be submitted
✅ Events are tracking to MongoDB

**If all checked, deployment is successful!**

---

## Next Steps After Deploy

1. Monitor for 24 hours for any errors
2. Check Vercel Analytics for traffic
3. Verify MongoDB Atlas metrics
4. Plan backend scoring integration (see DEPLOYMENT_READY.md Section 5)
5. Add analytics API keys when ready (see DEPLOYMENT_READY.md Section 2)

---

**Need help?** See full documentation in `DEPLOYMENT_READY.md`
