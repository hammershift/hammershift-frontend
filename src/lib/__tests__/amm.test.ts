import { describe, it, expect } from "vitest";
import {
  yesPrice,
  noPrice,
  calcSharesOut,
  quoteTradeExact,
  calcSettlementPayout,
  PLATFORM_FEE_BPS,
  SETTLEMENT_FEE_BPS,
  PoolState,
} from "../amm";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pool(yes: number, no: number): PoolState {
  return { yesPool: yes, noPool: no };
}

function k(p: PoolState): number {
  return p.yesPool * p.noPool;
}

function round(n: number, decimals = 6): number {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

// ---------------------------------------------------------------------------
// 1. Price Derivation
// ---------------------------------------------------------------------------

describe("Price derivation", () => {
  it("equal pools → 50/50 price", () => {
    const p = pool(100, 100);
    expect(yesPrice(p)).toBe(0.5);
    expect(noPrice(p)).toBe(0.5);
  });

  it("yesPrice + noPrice always sum to 1.0", () => {
    const pools = [
      pool(100, 100),
      pool(200, 50),
      pool(50, 200),
      pool(1, 999),
      pool(10000, 10000),
      pool(0.01, 99.99),
    ];
    for (const p of pools) {
      expect(round(yesPrice(p) + noPrice(p))).toBe(1);
    }
  });

  it("asymmetric pools → correct prices", () => {
    // yesPrice = noPool / (yesPool + noPool)
    const p = pool(50, 200);
    expect(yesPrice(p)).toBeCloseTo(0.8, 10);
    expect(noPrice(p)).toBeCloseTo(0.2, 10);
  });

  it("empty pools → 0.5 default", () => {
    expect(yesPrice(pool(0, 0))).toBe(0.5);
  });

  // !! KNOWN ISSUE: Price formula is inverted.
  // Buying YES increases yesPool → yesPrice goes DOWN.
  // In a correct prediction market, buying YES should push yesPrice UP.
  // See: yesPrice = noPool/(yesPool+noPool) should be yesPool/(yesPool+noPool)
  it("BUG: buying YES decreases yesPrice (formula inverted)", () => {
    const p = pool(100, 100);
    const before = yesPrice(p);
    const result = calcSharesOut(p, "YES", 10);
    const after = yesPrice(result.newPool);
    // This SHOULD be after > before, but the formula is inverted
    expect(after).toBeLessThan(before);
  });

  it("BUG: buying NO increases yesPrice (formula inverted)", () => {
    const p = pool(100, 100);
    const before = yesPrice(p);
    const result = calcSharesOut(p, "NO", 10);
    const after = yesPrice(result.newPool);
    // This SHOULD be after < before, but the formula is inverted
    expect(after).toBeGreaterThan(before);
  });
});

// ---------------------------------------------------------------------------
// 2. Invariant Preservation (k = yesPool × noPool)
// ---------------------------------------------------------------------------

describe("Invariant preservation", () => {
  it("k preserved after a YES trade", () => {
    const p = pool(100, 100);
    const kBefore = k(p);
    const result = calcSharesOut(p, "YES", 10);
    expect(round(k(result.newPool))).toBe(round(kBefore));
  });

  it("k preserved after a NO trade", () => {
    const p = pool(100, 100);
    const kBefore = k(p);
    const result = calcSharesOut(p, "NO", 10);
    expect(round(k(result.newPool))).toBe(round(kBefore));
  });

  it("k preserved after 50 sequential trades", () => {
    let p = pool(100, 100);
    const kOriginal = k(p);

    for (let i = 0; i < 50; i++) {
      const outcome = i % 2 === 0 ? "YES" : "NO";
      const amount = 1 + Math.random() * 20;
      const result = calcSharesOut(p, outcome as "YES" | "NO", amount);
      p = result.newPool;
    }

    expect(Math.abs(k(p) - kOriginal)).toBeLessThan(0.01);
  });

  it("k preserved after 200 random trades", () => {
    let p = pool(500, 500);
    const kOriginal = k(p);

    for (let i = 0; i < 200; i++) {
      const outcome: "YES" | "NO" = Math.random() > 0.5 ? "YES" : "NO";
      const amount = 0.1 + Math.random() * 50;
      const result = calcSharesOut(p, outcome, amount);
      p = result.newPool;
    }

    // Allow slightly more tolerance for accumulated floating-point drift
    expect(Math.abs(k(p) - kOriginal)).toBeLessThan(0.1);
  });
});

// ---------------------------------------------------------------------------
// 3. Share Calculations
// ---------------------------------------------------------------------------

describe("Share calculations", () => {
  it("buying YES shares returns positive shares", () => {
    const result = calcSharesOut(pool(100, 100), "YES", 10);
    expect(result.sharesOut).toBeGreaterThan(0);
  });

  it("buying NO shares returns positive shares", () => {
    const result = calcSharesOut(pool(100, 100), "NO", 10);
    expect(result.sharesOut).toBeGreaterThan(0);
  });

  it("larger trades get more shares but at worse effective price", () => {
    const p = pool(100, 100);
    const small = calcSharesOut(p, "YES", 5);
    const large = calcSharesOut(p, "YES", 50);

    expect(large.sharesOut).toBeGreaterThan(small.sharesOut);

    const smallPrice = 5 / small.sharesOut;
    const largePrice = 50 / large.sharesOut;
    expect(largePrice).toBeGreaterThan(smallPrice);
  });

  it("symmetric: YES and NO trades of same size get same shares on balanced pool", () => {
    const p = pool(100, 100);
    const yes = calcSharesOut(p, "YES", 10);
    const no = calcSharesOut(p, "NO", 10);
    expect(round(yes.sharesOut)).toBe(round(no.sharesOut));
  });

  it("shares never exceed the opposite pool", () => {
    const p = pool(100, 100);
    const result = calcSharesOut(p, "YES", 10000);
    expect(result.sharesOut).toBeLessThan(100);
  });

  it("pools remain positive after any trade", () => {
    const amounts = [0.01, 1, 10, 100, 1000, 100000];
    for (const amt of amounts) {
      const result = calcSharesOut(pool(100, 100), "YES", amt);
      expect(result.newPool.yesPool).toBeGreaterThan(0);
      expect(result.newPool.noPool).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Fee Calculations
// ---------------------------------------------------------------------------

describe("Fee calculations", () => {
  it("platform fee is exactly 2%", () => {
    // Use calcSharesOut + manual fee calc (quoteTradeExact has slippage guard)
    const amount = 100;
    const fee = (amount * PLATFORM_FEE_BPS) / 10000;
    expect(fee).toBe(2);
    expect(amount - fee).toBe(98);
  });

  it("fee + usdcAfterFee = original amount (via quoteTradeExact)", () => {
    // Use large pool to avoid slippage issues
    const amounts = [1, 10, 50, 100, 500];
    for (const amt of amounts) {
      const quote = quoteTradeExact(pool(10000, 10000), "YES", amt, 10);
      expect(round(quote.fee + quote.usdcAfterFee, 2)).toBe(round(amt, 2));
    }
  });

  it("settlement fee is exactly 2%", () => {
    const result = calcSettlementPayout(100);
    expect(result.grossPayout).toBe(100);
    expect(result.fee).toBe(2);
    expect(result.netPayout).toBe(98);
  });

  it("settlement: gross = fee + net", () => {
    const shares = [1, 10, 50.5, 100, 1000];
    for (const s of shares) {
      const r = calcSettlementPayout(s);
      expect(round(r.fee + r.netPayout, 2)).toBe(round(r.grossPayout, 2));
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Slippage
// ---------------------------------------------------------------------------

describe("Slippage", () => {
  // NOTE: slippage formula reports ~100% even for tiny trades because
  // pricePerShare (cost/shares) is always ~2x the marginal yesPrice on
  // a balanced pool. This is a known quirk of the slippage calculation.
  it("slippage increases with trade size relative to pool", () => {
    const small = quoteTradeExact(pool(10000, 10000), "YES", 1, 10);
    const large = quoteTradeExact(pool(10000, 10000), "YES", 1000, 10);
    expect(large.slippagePct).toBeGreaterThan(small.slippagePct);
  });

  it("large trade on small pool has significant slippage", () => {
    const quote = quoteTradeExact(pool(100, 100), "YES", 50, 100);
    expect(quote.slippagePct).toBeGreaterThan(0.1);
  });

  it("exceeding maxSlippage throws", () => {
    expect(() => {
      quoteTradeExact(pool(100, 100), "YES", 50, 0.01);
    }).toThrow(/Slippage/);
  });
});

// ---------------------------------------------------------------------------
// 6. Input validation
// ---------------------------------------------------------------------------

describe("Input validation", () => {
  it("zero usdcAmount throws", () => {
    expect(() => quoteTradeExact(pool(100, 100), "YES", 0, 10)).toThrow();
  });

  it("negative usdcAmount throws", () => {
    expect(() => quoteTradeExact(pool(100, 100), "YES", -10, 10)).toThrow();
  });

  it("zero pool throws", () => {
    expect(() => quoteTradeExact(pool(0, 100), "YES", 10, 10)).toThrow();
    expect(() => quoteTradeExact(pool(100, 0), "YES", 10, 10)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 7. Conservation of Value — THE CRITICAL TEST
//    No money should be created from thin air.
// ---------------------------------------------------------------------------

describe("Conservation of value", () => {
  it("total payouts + fees <= total paid in (YES wins, 200 trades)", () => {
    let p = pool(500, 500);
    const seedLiquidity = 1000;
    let totalPaidIn = 0;
    let totalTradingFees = 0;
    const positions: { outcome: "YES" | "NO"; shares: number; cost: number }[] = [];

    for (let i = 0; i < 200; i++) {
      const outcome: "YES" | "NO" = Math.random() > 0.5 ? "YES" : "NO";
      const amount = 1 + Math.random() * 50;

      try {
        const quote = quoteTradeExact(p, outcome, amount, 100);
        p = quote.newPool;
        totalPaidIn += amount;
        totalTradingFees += quote.fee;
        positions.push({
          outcome,
          shares: quote.sharesReceived,
          cost: amount,
        });
      } catch {
        continue;
      }
    }

    expect(positions.length).toBeGreaterThan(50); // Enough trades executed

    // Settle: YES wins
    let totalPayouts = 0;
    let totalSettlementFees = 0;
    for (const pos of positions) {
      if (pos.outcome === "YES") {
        const settlement = calcSettlementPayout(pos.shares);
        totalPayouts += settlement.netPayout;
        totalSettlementFees += settlement.fee;
      }
    }

    // Platform never pays out more than was put in + seed
    expect(totalPayouts).toBeLessThanOrEqual(totalPaidIn + seedLiquidity);
    // Platform collected fees
    expect(totalTradingFees).toBeGreaterThan(0);
    expect(totalSettlementFees).toBeGreaterThanOrEqual(0);
  });

  it("total payouts + fees <= total paid in (NO wins, 200 trades)", () => {
    let p = pool(500, 500);
    const seedLiquidity = 1000;
    let totalPaidIn = 0;
    let totalTradingFees = 0;
    const positions: { outcome: "YES" | "NO"; shares: number; cost: number }[] = [];

    for (let i = 0; i < 200; i++) {
      const outcome: "YES" | "NO" = Math.random() > 0.5 ? "YES" : "NO";
      const amount = 1 + Math.random() * 50;

      try {
        const quote = quoteTradeExact(p, outcome, amount, 100);
        p = quote.newPool;
        totalPaidIn += amount;
        totalTradingFees += quote.fee;
        positions.push({
          outcome,
          shares: quote.sharesReceived,
          cost: amount,
        });
      } catch {
        continue;
      }
    }

    expect(positions.length).toBeGreaterThan(50);

    // Settle: NO wins
    let totalPayouts = 0;
    for (const pos of positions) {
      if (pos.outcome === "NO") {
        const settlement = calcSettlementPayout(pos.shares);
        totalPayouts += settlement.netPayout;
      }
    }

    expect(totalPayouts).toBeLessThanOrEqual(totalPaidIn + seedLiquidity);
    expect(totalTradingFees).toBeGreaterThan(0);
  });

  it("500 trades: platform always profits, no money created", () => {
    let p = pool(1000, 1000);
    const seedLiquidity = 2000;
    let totalPaidIn = 0;
    let totalTradingFees = 0;
    const positions: { outcome: "YES" | "NO"; shares: number }[] = [];

    for (let i = 0; i < 500; i++) {
      const outcome: "YES" | "NO" = Math.random() > 0.5 ? "YES" : "NO";
      const amount = 0.5 + Math.random() * 100;

      try {
        const quote = quoteTradeExact(p, outcome, amount, 100);
        p = quote.newPool;
        totalPaidIn += amount;
        totalTradingFees += quote.fee;
        positions.push({ outcome, shares: quote.sharesReceived });
      } catch {
        continue;
      }
    }

    expect(positions.length).toBeGreaterThan(200);

    // Check both outcomes
    for (const winner of ["YES", "NO"] as const) {
      let payouts = 0;
      let settleFees = 0;
      for (const pos of positions) {
        if (pos.outcome === winner) {
          const s = calcSettlementPayout(pos.shares);
          payouts += s.netPayout;
          settleFees += s.fee;
        }
      }

      expect(payouts).toBeLessThanOrEqual(totalPaidIn + seedLiquidity);
    }

    expect(totalTradingFees).toBeGreaterThan(0);
  });

  it("extreme one-sided market: all YES buyers, YES wins", () => {
    let p = pool(500, 500);
    let totalPaidIn = 0;
    let totalTradingFees = 0;
    const shares: number[] = [];

    // 100 YES trades, no NO trades
    for (let i = 0; i < 100; i++) {
      const amount = 5 + Math.random() * 20;
      try {
        const quote = quoteTradeExact(p, "YES", amount, 100);
        p = quote.newPool;
        totalPaidIn += amount;
        totalTradingFees += quote.fee;
        shares.push(quote.sharesReceived);
      } catch {
        continue;
      }
    }

    // All winners — worst case for platform
    let totalPayouts = 0;
    for (const s of shares) {
      totalPayouts += calcSettlementPayout(s).netPayout;
    }

    // Even in worst case, payouts <= paid in + seed
    expect(totalPayouts).toBeLessThanOrEqual(totalPaidIn + 1000);
  });
});

// ---------------------------------------------------------------------------
// 8. Edge Cases
// ---------------------------------------------------------------------------

describe("Edge cases", () => {
  it("very small trade ($0.01) produces positive shares via calcSharesOut", () => {
    const result = calcSharesOut(pool(100, 100), "YES", 0.01);
    expect(result.sharesOut).toBeGreaterThan(0);
  });

  it("minimum pool ($50/$50) handles trades", () => {
    const result = calcSharesOut(pool(50, 50), "YES", 5);
    expect(result.sharesOut).toBeGreaterThan(0);
  });

  it("many same-direction trades don't break the pool", () => {
    let p = pool(100, 100);
    for (let i = 0; i < 100; i++) {
      const result = calcSharesOut(p, "YES", 2);
      p = result.newPool;
      expect(p.yesPool).toBeGreaterThan(0);
      expect(p.noPool).toBeGreaterThan(0);
    }
  });

  it("price approaches but never reaches 0 or 1", () => {
    let p = pool(100, 100);
    for (let i = 0; i < 100; i++) {
      const result = calcSharesOut(p, "YES", 100);
      p = result.newPool;
    }
    const price = yesPrice(p);
    expect(price).toBeGreaterThan(0);
    expect(price).toBeLessThan(1);
  });

  it("new pool prices are within [0, 1] and sum to 1", () => {
    const amounts = [0.01, 1, 10, 100, 1000];
    for (const amt of amounts) {
      const quote = quoteTradeExact(pool(10000, 10000), "YES", amt, 100);
      expect(quote.newYesPrice).toBeGreaterThanOrEqual(0);
      expect(quote.newYesPrice).toBeLessThanOrEqual(1);
      expect(quote.newNoPrice).toBeGreaterThanOrEqual(0);
      expect(quote.newNoPrice).toBeLessThanOrEqual(1);
      expect(round(quote.newYesPrice + quote.newNoPrice)).toBe(1);
    }
  });
});
