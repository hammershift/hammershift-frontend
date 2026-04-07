# USDC Transfer via Privy Embedded Wallet

**Date:** 2026-04-07
**Status:** Approved
**Page:** `/wallet/transfer`

## Overview

Client-side USDC transfer from Privy embedded wallet to any Polygon address. Three-layer security: NextAuth session, email OTP for new addresses, Privy wallet signing on every transfer.

## Architecture

- Standalone page `/wallet/transfer` behind auth gate
- All USDC transfers execute client-side via Privy `useWallets()` — server has no signing authority
- Address book with email OTP verification for first-time addresses
- Server-side rate limiting and audit logging

## Security Model

| Layer | What | When |
|-------|------|------|
| Auth gate | NextAuth session | Page load |
| Email OTP | 6-digit code to registered email | First transfer to new address |
| Wallet signing | Privy popup | Every transfer |

### Rate Limits
- Standard users: $500/day, 5-min cooldown, max 5 transfers/day
- Trusted/admin: $2,500/day, 5-min cooldown, max 5 transfers/day
- Enforced server-side before OTP sent

### OTP Rules
- 6-digit numeric, 10-min expiry
- Max 3 attempts per code
- Max 5 OTP requests/hour/user
- Sent to NextAuth session email only

### Address Book
- Max 10 saved addresses per user
- Valid Polygon format required (0x, 42 chars, checksum)
- Label required
- Deleting requires re-verification to re-add

## Collections

### `verified_addresses`
```
userId: ObjectId
address: string (checksummed)
label: string
verifiedAt: Date
lastUsedAt: Date | null
createdAt: Date
Index: { userId: 1, address: 1 } unique
```

### `transfer_logs`
```
userId: ObjectId
toAddress: string
amount: number (USDC dollars)
txHash: string | null
status: PENDING | BROADCAST | CONFIRMED | FAILED
failReason: string | null
ipAddress: string
deviceFingerprint: string | null
createdAt: Date
Index: { userId: 1, createdAt: -1 }
No TTL — permanent audit
```

### `address_otps`
```
userId: ObjectId
address: string
code: string (hashed)
attempts: number
expiresAt: Date (TTL index, 10 min)
createdAt: Date
```

## API Routes

| Route | Method | Body | Returns |
|-------|--------|------|---------|
| `/api/wallet/transfer/verify-address` | POST | `{ address, label }` | `{ success, message }` |
| `/api/wallet/transfer/confirm-otp` | POST | `{ address, code }` | `{ success, addressId }` |
| `/api/wallet/transfer/addresses` | GET | — | `{ addresses: [...] }` |
| `/api/wallet/transfer/addresses/[id]` | DELETE | — | `{ success }` |
| `/api/wallet/transfer/record` | POST | `{ toAddress, amount, txHash, status }` | `{ success, transferId }` |
| `/api/wallet/transfer/check-limits` | GET | — | `{ dailyUsed, dailyLimit, cooldownRemaining, transfersToday }` |

## Client-Side Execution

1. Fetch USDC balance on-chain via Privy provider
2. Check limits via `/check-limits`
3. Validate destination address (warn if no history, block if invalid format)
4. User clicks "Confirm & Sign"
5. Privy wallet popup — ERC-20 `transfer()` call
6. USDC contract: `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` (Polygon)
7. Amount in 6 decimals
8. POST `/record` with txHash
9. Show receipt with Polygonscan link

## UI

Dark theme, single-column centered (max-w-lg). Design tokens: #0A0A1A bg, #13202D cards, #E94560 buttons, #00D4AA success, font-mono on amounts. Address book with saved addresses, inline "Add New" with OTP flow, confirmation modal with address validation warnings.
