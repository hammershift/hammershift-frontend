# 🧪 Quick Test Guide - Phase 1.1: Tournament Balance Deduction

**Dev Server:** http://localhost:3001
**Feature:** Tournament buy-in payment system
**Time Needed:** 5-10 minutes

---

## ✅ Pre-Test Checklist

Before you start:
- [ ] Dev server running (http://localhost:3001)
- [ ] You have a test user account (or can create one)
- [ ] You know your test user's email/password

---

## 🎯 Test #1: Free Tournament (No Payment) - 2 minutes

**Goal:** Verify free tournaments don't charge users

### Steps:
1. Open http://localhost:3001
2. Login with your test account
3. **Note your current balance** (shown in navbar): `_______` credits
4. Navigate to: Tournaments page
5. Find a tournament with **buyInFee = 0** (or "Free Play")
6. Enter predictions for all auctions
7. Click "Submit" or "Join Tournament"

### Expected Result:
- ✅ Predictions submitted successfully
- ✅ **Balance unchanged** (should still be same as step 3)
- ✅ Redirects to success page
- ✅ No errors

### Actual Result:
- [ ] PASS / [ ] FAIL
- Balance before: _______
- Balance after: _______
- Notes: _________________________________________________

---

## 🎯 Test #2: Paid Tournament (Sufficient Balance) - 3 minutes

**Goal:** Verify balance is deducted for paid tournaments

### Steps:
1. From tournaments page, find a **paid tournament** (buyInFee > 0)
2. **Note the tournament buy-in fee:** `_______` credits
3. **Note your current balance:** `_______` credits
4. Make sure: `balance >= buyInFee` (otherwise add credits first)
5. Click on the tournament
6. Enter valid predictions for all auctions
7. Click "Submit" or "Join Tournament"
8. **Watch the balance in navbar** - it should update immediately

### Expected Result:
- ✅ Loading state appears (button disabled)
- ✅ **Balance decreases** by buyInFee amount
- ✅ New balance = old balance - buyInFee
- ✅ Redirects to success page (`/tournaments/success`)
- ✅ Success message shown
- ✅ No errors in browser console (press F12 to check)

### Actual Result:
- [ ] PASS / [ ] FAIL
- Balance before: _______
- Buy-in fee: _______
- Balance after: _______
- **Calculation:** _______ - _______ = _______ ✅ Correct / ❌ Wrong
- Notes: _________________________________________________

---

## 🎯 Test #3: Insufficient Balance - 2 minutes

**Goal:** Verify error when user can't afford tournament

### Steps:
1. Find a paid tournament with high buy-in fee
2. Make sure your balance is **less than** the buy-in fee
   - (You can test this by trying to join an expensive tournament)
3. Try to submit predictions

### Expected Result:
- ✅ Error message appears: "You do not have enough balance to join this tournament."
- ✅ **No balance deduction**
- ✅ User stays on tournament page
- ✅ Can fix predictions and try again (button re-enabled)

### Actual Result:
- [ ] PASS / [ ] FAIL
- Error message shown: _____________________________________
- Balance changed: [ ] YES / [ ] NO
- Notes: _________________________________________________

---

## 🎯 Test #4: Already Joined Tournament - 1 minute

**Goal:** Verify duplicate entry prevention

### Steps:
1. Successfully join a tournament (from Test #2)
2. Navigate back to the same tournament page
3. Try to submit predictions again

### Expected Result:
- ✅ Error message: "You have already joined this tournament."
- ✅ **No additional charge**
- ✅ Balance unchanged

### Actual Result:
- [ ] PASS / [ ] FAIL
- Error shown: [ ] YES / [ ] NO
- Additional charge: [ ] YES / [ ] NO
- Notes: _________________________________________________

---

## 🎯 Test #5: Browser Console Check - 1 minute

**Goal:** Verify no JavaScript errors

### Steps:
1. Press **F12** (or right-click → Inspect → Console)
2. Clear the console
3. Submit a tournament entry (any type)
4. Watch for errors (red text)

### Expected Result:
- ✅ No errors in console (red text)
- ✅ May see logs (gray/blue text) - that's fine
- ✅ Network requests succeed (200 status codes)

### Actual Result:
- [ ] PASS / [ ] FAIL
- Errors found: [ ] YES / [ ] NO
- Error messages: _________________________________________
- Notes: _________________________________________________

---

## 📊 Database Verification (Optional - If you have MongoDB access)

### Check Transaction Record:

**Option 1: MongoDB Compass**
1. Open MongoDB Compass
2. Connect to: `mongodb+srv://hammershift-new:tgR7VWisuPLZ43eB@cluster0.kpemmst.mongodb.net/`
3. Select database: `hammershift`
4. Open collection: `transactions`
5. Filter: `{ transactionType: "tournament buy-in" }`
6. Sort by: `transactionDate: -1` (newest first)
7. Verify your transaction appears

**Option 2: MongoDB Shell**
```javascript
use hammershift

// Find your transaction
db.transactions.find({
  transactionType: "tournament buy-in"
}).sort({ transactionDate: -1 }).limit(5).pretty()

// Should show:
// - amount: <buyInFee>
// - type: "-"
// - tournamentID: <tournament._id>
// - userID: <your user._id>
// - transactionDate: <recent timestamp>
```

### Check User Balance:
```javascript
// Find your user
db.users.findOne({ email: "your-email@example.com" })

// Verify balance field matches what navbar shows
```

### Verification Result:
- [ ] Transaction record found: [ ] YES / [ ] NO
- [ ] Correct amount: [ ] YES / [ ] NO
- [ ] Correct type ("-"): [ ] YES / [ ] NO
- [ ] Tournament ID matches: [ ] YES / [ ] NO
- [ ] User balance in DB matches navbar: [ ] YES / [ ] NO

---

## ✅ TEST SUMMARY

| Test | Status | Notes |
|------|--------|-------|
| 1. Free Tournament | ⏳ / ✅ / ❌ | |
| 2. Paid Tournament | ⏳ / ✅ / ❌ | |
| 3. Insufficient Balance | ⏳ / ✅ / ❌ | |
| 4. Already Joined | ⏳ / ✅ / ❌ | |
| 5. Console Errors | ⏳ / ✅ / ❌ | |
| 6. Database Verification | ⏳ / ✅ / ❌ | (Optional) |

**Overall Result:**
- [ ] ✅ ALL TESTS PASS - Phase 1.1 COMPLETE
- [ ] ⚠️ SOME TESTS FAIL - Needs fixes
- [ ] ❌ CRITICAL FAILURE - Major issues

---

## 🐛 If Tests Fail:

### Common Issues & Solutions:

**Issue: Balance doesn't update in navbar**
- Solution: Refresh the page and check again
- Check browser console for errors

**Issue: Error "Unauthorized" or "Not logged in"**
- Solution: Log out and log back in
- Clear browser cookies

**Issue: Can't find paid tournaments**
- Solution: Check tournaments page, look for buyInFee > 0
- Or ask admin to create test tournament

**Issue: MongoDB connection fails**
- Solution: Check Network Access in MongoDB Atlas
- Add your IP to whitelist

---

## 📝 Report Results:

After testing, update:
1. This file with your results
2. [TESTING_PHASE_1.1.md](TESTING_PHASE_1.1.md) with detailed findings
3. [OPTIMIZATION_TRACKER.md](OPTIMIZATION_TRACKER.md) - mark testing as complete

Or just let me know:
- ✅ "All tests passed"
- ⚠️ "Tests X, Y failed" (tell me which)
- ❌ "Critical error: [describe issue]"

---

## 🚀 After Testing:

### If All Tests Pass:
1. Mark Phase 1.1 as fully complete ✅
2. Proceed to Phase 1.2 (Error Handling)
3. Or Phase 1.3 (Toast Notifications)

### If Tests Fail:
1. Report the failing test(s)
2. I'll fix the issues
3. Re-test after fixes

---

**Started Testing:** _______________
**Completed Testing:** _______________
**Tester:** _______________
**Result:** ⏳ Pending / ✅ Pass / ❌ Fail

---

*Server URL: http://localhost:3001*
*Branch: feature/optimization-phase-1*
*Commit: 1dacfba*
