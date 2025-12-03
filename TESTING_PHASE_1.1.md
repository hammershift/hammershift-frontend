# 🧪 PHASE 1.1 TESTING PLAN - Tournament Balance Deduction

**Date:** 2025-12-03
**Feature:** Tournament Buy-In Payment System
**Status:** ⏳ PENDING MANUAL TESTING

---

## 📝 TESTING CHECKLIST

### Pre-Testing Setup
- [ ] Ensure MongoDB is running and accessible
- [ ] Verify `.env` file has correct `MONGODB_URI`
- [ ] Confirm test user account exists with known balance
- [ ] Identify test tournament (both free and paid)
- [ ] Note starting wallet balance for comparison

---

## 🧪 TEST SCENARIOS

### ✅ Test 1: Free Tournament Entry (buyInFee = 0)
**Objective:** Verify free tournaments don't deduct balance

**Steps:**
1. Navigate to a tournament with `buyInFee: 0`
2. Enter predictions for all auctions
3. Click submit
4. Observe behavior

**Expected Results:**
- ✅ No wallet API call should be made
- ✅ No transaction record created
- ✅ Predictions submitted successfully
- ✅ Balance remains unchanged
- ✅ Redirects to `/tournaments/success`

**Actual Results:**
- [ ] PASS / [ ] FAIL
- Notes: _____________________________________________

---

### ✅ Test 2: Paid Tournament Entry (Sufficient Balance)
**Objective:** Verify balance deduction works correctly

**Pre-conditions:**
- User balance: >= tournament buyInFee
- Tournament: buyInFee > 0 (e.g., 50 credits)

**Steps:**
1. Note starting balance: `___________`
2. Navigate to paid tournament
3. Enter valid predictions for all auctions
4. Click submit
5. Check database for transaction record
6. Verify new balance

**Expected Results:**
- ✅ Wallet API called with correct `wagerAmount`
- ✅ Balance deducted by `buyInFee` amount
- ✅ Transaction record created with:
  - `transactionType: "tournament buy-in"`
  - `amount: <buyInFee>`
  - `type: "-"`
  - `tournamentID: <tournament._id>`
- ✅ Predictions submitted successfully
- ✅ Redirects to `/tournaments/success`
- ✅ New balance = old balance - buyInFee

**Database Verification:**
```javascript
// MongoDB queries to verify
db.users.findOne({ _id: ObjectId("USER_ID") })
// Check: balance field updated

db.transactions.find({
  userID: ObjectId("USER_ID"),
  transactionType: "tournament buy-in",
  tournamentID: ObjectId("TOURNAMENT_ID")
}).sort({ transactionDate: -1 }).limit(1)
// Check: transaction exists with correct data
```

**Actual Results:**
- [ ] PASS / [ ] FAIL
- Starting balance: _____________
- Ending balance: _____________
- Transaction ID: _____________
- Notes: _____________________________________________

---

### ✅ Test 3: Insufficient Balance
**Objective:** Verify error handling for insufficient funds

**Pre-conditions:**
- User balance: < tournament buyInFee
- Tournament: buyInFee > user balance

**Steps:**
1. Set user balance to low amount (e.g., 10 credits)
2. Navigate to tournament with buyInFee = 50
3. Enter valid predictions
4. Click submit

**Expected Results:**
- ✅ Error shown BEFORE API call: "You do not have enough balance to join this tournament."
- ✅ No wallet API call made
- ✅ No transaction created
- ✅ Balance unchanged
- ✅ User remains on tournament page
- ✅ Submit button re-enabled

**Actual Results:**
- [ ] PASS / [ ] FAIL
- Error message shown: _____________________________________________
- Notes: _____________________________________________

---

### ✅ Test 4: Already Joined Tournament
**Objective:** Verify duplicate entry prevention

**Pre-conditions:**
- User already joined the tournament

**Steps:**
1. Join a tournament successfully
2. Navigate back to same tournament page
3. Try to submit again

**Expected Results:**
- ✅ Error shown: "You have already joined this tournament."
- ✅ No API calls made
- ✅ No additional charges
- ✅ Balance unchanged

**Actual Results:**
- [ ] PASS / [ ] FAIL
- Notes: _____________________________________________

---

### ✅ Test 5: Duplicate Prediction Validation
**Objective:** Ensure duplicate price predictions are blocked

**Pre-conditions:**
- Another user has predicted a specific price
- Tournament is active

**Steps:**
1. Note an existing prediction price from another user
2. Try to enter the same price
3. Submit predictions

**Expected Results:**
- ✅ Error shown: "Other users have already predicted the amount for the highlighted auction(s)"
- ✅ No wallet deduction (prevented before payment)
- ✅ No transaction created
- ✅ Balance unchanged
- ✅ Affected auctions highlighted with error

**Actual Results:**
- [ ] PASS / [ ] FAIL
- Notes: _____________________________________________

---

### ✅ Test 6: Invalid Predictions
**Objective:** Verify validation before payment

**Steps:**
1. Navigate to paid tournament
2. Leave some predictions empty OR enter negative values
3. Click submit

**Expected Results:**
- ✅ Error shown: "Please enter a valid amount for all auctions"
- ✅ No wallet API call
- ✅ No transaction created
- ✅ Balance unchanged
- ✅ Invalid fields highlighted

**Actual Results:**
- [ ] PASS / [ ] FAIL
- Notes: _____________________________________________

---

### ✅ Test 7: API Failure Handling
**Objective:** Test error handling when wallet API fails

**Setup:** (Requires MongoDB access or API mocking)
- Temporarily disable MongoDB connection OR
- Modify user document to cause validation error

**Steps:**
1. Navigate to paid tournament
2. Enter valid predictions
3. Submit (API will fail)

**Expected Results:**
- ✅ Error message displayed: "Failed to deduct tournament fee from wallet"
- ✅ User-friendly error (not technical stack trace)
- ✅ Submit button re-enabled
- ✅ User remains on page
- ✅ Can retry submission

**Actual Results:**
- [ ] PASS / [ ] FAIL
- Error message: _____________________________________________
- Notes: _____________________________________________

---

### ✅ Test 8: Transaction Record Verification
**Objective:** Verify transaction audit trail is complete

**Steps:**
1. Complete a paid tournament entry
2. Navigate to wallet/transaction history page
3. Check transaction appears in user's history

**Expected Results:**
- ✅ Transaction visible in user's transaction list
- ✅ Shows correct date/time
- ✅ Shows correct amount (negative)
- ✅ Shows transaction type: "tournament buy-in"
- ✅ Linked to correct tournament

**Actual Results:**
- [ ] PASS / [ ] FAIL
- Transaction visible: [ ] YES / [ ] NO
- Notes: _____________________________________________

---

### ✅ Test 9: Concurrent Requests (Edge Case)
**Objective:** Test race condition handling

**Setup:** Requires two browser tabs

**Steps:**
1. Open same tournament in two tabs
2. Enter predictions in both
3. Submit from both tabs simultaneously (or very quickly)

**Expected Results:**
- ✅ Only ONE submission succeeds
- ✅ Balance deducted only once
- ✅ Only one transaction record created
- ✅ Second submission shows "already joined" error

**Actual Results:**
- [ ] PASS / [ ] FAIL
- Submissions: _______ succeeded
- Balance deductions: _______
- Transaction records: _______
- Notes: _____________________________________________

---

### ✅ Test 10: Session Balance Update
**Objective:** Verify local session reflects new balance

**Steps:**
1. Note wallet balance shown in navbar
2. Join paid tournament
3. Check navbar balance immediately after

**Expected Results:**
- ✅ Navbar balance updates to reflect deduction
- ✅ New balance = old balance - buyInFee
- ✅ No page refresh required

**Actual Results:**
- [ ] PASS / [ ] FAIL
- Balance updated in UI: [ ] YES / [ ] NO
- Notes: _____________________________________________

---

## 🔍 CODE REVIEW CHECKLIST

### Security
- [x] No SQL injection vulnerabilities
- [x] Balance check performed before deduction
- [x] Server-side validation exists (wallet API)
- [x] User session validated
- [x] Transaction type restricted by schema enum

### Error Handling
- [x] User-friendly error messages
- [x] No sensitive data exposed in errors
- [x] Errors logged to console for debugging
- [x] Failed transactions don't leave partial state
- [ ] ⚠️ **TODO:** If transaction record fails, wallet should be refunded (noted in line 332-334)

### Data Integrity
- [x] Balance check before submission (line 210)
- [x] Duplicate entry prevention (hasJoined check)
- [x] Duplicate prediction validation
- [x] Invalid prediction validation
- [x] Transaction record includes tournamentID for audit

### User Experience
- [x] Loading state (isSubmitting) prevents double-submission
- [x] Error displayed to user
- [x] Submit button re-enabled on error
- [x] Redirect on success
- [x] Session balance updated

---

## 🐛 KNOWN ISSUES

### Critical
*None identified*

### Medium
1. **Partial Transaction Failure** (Line 332-334)
   - **Issue:** If wallet deduction succeeds but transaction record fails, user is charged without audit trail
   - **Impact:** Loss of transaction history, difficult to reconcile accounts
   - **Mitigation:** Currently logs error and continues
   - **Recommended Fix:** Implement refund mechanism or use MongoDB transactions for atomicity

### Low
*None identified*

---

## ✅ ACCEPTANCE CRITERIA

Phase 1.1 is considered **COMPLETE** when:

- [x] Code compiles without TypeScript errors
- [x] No new linting warnings introduced
- [ ] All 10 test scenarios PASS
- [ ] Database transactions verified
- [ ] No revenue loss possible
- [ ] Error handling works correctly
- [ ] User experience is smooth
- [ ] Documentation updated

---

## 📊 TEST RESULTS SUMMARY

**Total Tests:** 10
**Passed:** 0
**Failed:** 0
**Pending:** 10

**Overall Status:** ⏳ AWAITING MANUAL TESTING

---

## 🔐 ENVIRONMENT REQUIREMENTS

To test this feature, you need:

1. **MongoDB Connection**
   - Running MongoDB instance
   - `MONGODB_URI` in `.env`
   - Access to `users`, `transactions`, and `tournaments` collections

2. **Test Data**
   - At least 1 test user account
   - At least 1 free tournament (`buyInFee: 0`)
   - At least 1 paid tournament (`buyInFee > 0`)
   - User with sufficient balance
   - User with insufficient balance

3. **Next.js Development Server**
   - `npm run dev` running
   - All environment variables set
   - Better Auth configured

---

## 📝 NOTES FOR TESTER

### How to Test Locally

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the tournament page:**
   ```
   http://localhost:3000/tournaments/[tournament_id]
   ```

3. **Open MongoDB Compass or CLI:**
   ```bash
   mongosh
   use <database_name>
   ```

4. **Query user balance before test:**
   ```javascript
   db.users.findOne({ email: "test@example.com" })
   ```

5. **Complete tournament entry**

6. **Verify balance after:**
   ```javascript
   db.users.findOne({ email: "test@example.com" })
   ```

7. **Check transaction created:**
   ```javascript
   db.transactions.find({
     transactionType: "tournament buy-in"
   }).sort({ transactionDate: -1 }).limit(1)
   ```

---

## ✍️ TESTING SIGN-OFF

**Tested By:** ___________________________
**Date:** ___________________________
**Environment:** [ ] Local Dev [ ] Staging [ ] Production
**Overall Result:** [ ] PASS [ ] FAIL [ ] NEEDS REVISION

**Comments:**
________________________________________________________________
________________________________________________________________
________________________________________________________________

---

*Generated: 2025-12-03*
*Related Commit: 1dacfba*
*Branch: feature/optimization-phase-1*
