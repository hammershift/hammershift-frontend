// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VelocityMarkets
 * @notice Binary prediction market contract using CPMM AMM.
 *
 * AMM math mirrors amm.ts exactly:
 *   k = yesPool × noPool  (constant product invariant)
 *   yesPrice = noPool / (yesPool + noPool)
 *
 *   Buying YES with usdcAfterFee:
 *     newYesPool = yesPool + usdcAfterFee
 *     newNoPool  = k / newYesPool
 *     sharesOut  = oldNoPool - newNoPool
 *
 *   Buying NO with usdcAfterFee:
 *     newNoPool  = noPool + usdcAfterFee
 *     newYesPool = k / newNoPool
 *     sharesOut  = oldYesPool - newYesPool
 *
 * All USDC amounts use 6 decimals (1 USDC = 1_000_000 units).
 * Shares are in the same USDC units — 1 winning share pays 1 USDC minus fees.
 *
 * Market IDs on-chain: keccak256(abi.encodePacked(auctionId))
 * where auctionId is the BaT string auction ID stored in MongoDB.
 */
contract VelocityMarkets is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Constants ──────────────────────────────────────────────────────────
    uint256 public constant PLATFORM_FEE_BPS   = 200;       // 2.00%
    uint256 public constant SETTLEMENT_FEE_BPS = 200;       // 2.00%
    uint256 public constant BPS_DENOMINATOR    = 10_000;
    uint256 public constant MIN_TRADE_USDC     = 1_000_000; // $1.00 minimum
    uint256 public constant MIN_POOL_USDC      = 50_000_000; // $50 each side

    // ── Enums ──────────────────────────────────────────────────────────────
    enum Outcome { UNRESOLVED, YES, NO, VOIDED }

    // ── Structs ────────────────────────────────────────────────────────────
    struct Market {
        bool     exists;
        bool     tradingClosed;
        uint64   tradingClosesAt; // unix timestamp — trading window closes
        uint64   closesAt;        // unix timestamp — auction ends
        uint128  yesPool;         // USDC reserve for YES side
        uint128  noPool;          // USDC reserve for NO side
        uint128  totalVolume;     // cumulative USDC traded
        Outcome  winningOutcome;
    }

    struct Position {
        uint128 yesShares; // USDC units, redeemable at $1 each if YES wins
        uint128 noShares;  // USDC units, redeemable at $1 each if NO wins
        bool    redeemed;
    }

    // ── State ──────────────────────────────────────────────────────────────
    IERC20 public immutable usdc;

    // marketId = keccak256(abi.encodePacked(auctionId))
    mapping(bytes32 => Market)                          public markets;
    mapping(bytes32 => mapping(address => Position))    public positions;

    uint256 public collectedFees; // accumulated platform + settlement fees

    // ── Events ─────────────────────────────────────────────────────────────
    event MarketCreated(
        bytes32 indexed marketId,
        uint256 yesPool,
        uint256 noPool,
        uint256 tradingClosesAt,
        uint256 closesAt
    );
    event SharesBought(
        bytes32 indexed marketId,
        address indexed buyer,
        uint8   outcome,
        uint256 usdcIn,
        uint256 sharesOut,
        uint256 fee,
        uint256 newYesPool,
        uint256 newNoPool
    );
    event TradingClosed(bytes32 indexed marketId);
    event MarketResolved(bytes32 indexed marketId, Outcome winningOutcome);
    event Redeemed(
        bytes32 indexed marketId,
        address indexed user,
        uint256 winningShares,
        uint256 netPayout
    );
    event FeesWithdrawn(address indexed to, uint256 amount);

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address _usdc) Ownable(msg.sender) {
        require(_usdc != address(0), "USDC address required");
        usdc = IERC20(_usdc);
    }

    // ── Admin: Create market ───────────────────────────────────────────────

    /**
     * @notice Create a new prediction market with seeded liquidity.
     * @param marketId       keccak256(abi.encodePacked(auctionId)) — must match frontend
     * @param yesPoolAmount  Initial YES pool in USDC units (min $50 = 50_000_000)
     * @param noPoolAmount   Initial NO pool in USDC units  (min $50 = 50_000_000)
     * @param tradingClosesAt Unix timestamp when trading closes (4hr before closesAt)
     * @param closesAt        Unix timestamp when the BaT auction ends
     */
    function createMarket(
        bytes32 marketId,
        uint128 yesPoolAmount,
        uint128 noPoolAmount,
        uint64  tradingClosesAt,
        uint64  closesAt
    ) external onlyOwner {
        require(!markets[marketId].exists,            "Market already exists");
        require(yesPoolAmount >= MIN_POOL_USDC,       "Min YES pool is $50");
        require(noPoolAmount  >= MIN_POOL_USDC,       "Min NO pool is $50");
        require(tradingClosesAt < closesAt,           "Trading must close before auction");
        require(closesAt > block.timestamp,           "Auction already ended");

        uint256 totalSeed = uint256(yesPoolAmount) + uint256(noPoolAmount);
        usdc.safeTransferFrom(msg.sender, address(this), totalSeed);

        markets[marketId] = Market({
            exists:          true,
            tradingClosed:   false,
            tradingClosesAt: tradingClosesAt,
            closesAt:        closesAt,
            yesPool:         yesPoolAmount,
            noPool:          noPoolAmount,
            totalVolume:     0,
            winningOutcome:  Outcome.UNRESOLVED
        });

        emit MarketCreated(marketId, yesPoolAmount, noPoolAmount, tradingClosesAt, closesAt);
    }

    // ── User: Buy shares ───────────────────────────────────────────────────

    /**
     * @notice Buy YES (outcome=0) or NO (outcome=1) shares with USDC.
     *
     * Caller must approve this contract to spend usdcAmount before calling.
     *
     * @param marketId     Target market
     * @param outcome      0 = YES, 1 = NO
     * @param usdcAmount   Total USDC to spend including the 2% fee (6 decimals)
     * @param minSharesOut Minimum shares to receive — reverts if slippage exceeded
     */
    function buyShares(
        bytes32 marketId,
        uint8   outcome,
        uint256 usdcAmount,
        uint256 minSharesOut
    ) external nonReentrant {
        require(outcome == 0 || outcome == 1,  "outcome must be 0 (YES) or 1 (NO)");
        require(usdcAmount >= MIN_TRADE_USDC,  "Minimum trade is $1 USDC");

        Market storage m = markets[marketId];
        require(m.exists,                                   "Market not found");
        require(m.winningOutcome == Outcome.UNRESOLVED,     "Market already resolved");
        require(!m.tradingClosed,                           "Trading is closed");
        require(block.timestamp < m.tradingClosesAt,        "Trading window ended");

        // 2% platform fee deducted before AMM calculation (mirrors amm.ts)
        uint256 fee          = (usdcAmount * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 usdcAfterFee = usdcAmount - fee;

        // CPMM — exact mirror of amm.ts calcSharesOut()
        uint256 yp = uint256(m.yesPool);
        uint256 np = uint256(m.noPool);
        uint256 k  = yp * np;

        uint256 sharesOut;
        uint256 newYesPool;
        uint256 newNoPool;

        if (outcome == 0) {
            // Buying YES: USDC flows into YES reserve
            newYesPool = yp + usdcAfterFee;
            newNoPool  = k / newYesPool;
            sharesOut  = np - newNoPool;
        } else {
            // Buying NO: USDC flows into NO reserve
            newNoPool  = np + usdcAfterFee;
            newYesPool = k / newNoPool;
            sharesOut  = yp - newYesPool;
        }

        require(sharesOut > 0,              "Zero shares out - pool too small");
        require(sharesOut >= minSharesOut,  "Slippage exceeded minSharesOut");

        // Transfer USDC from caller (requires prior approval)
        usdc.safeTransferFrom(msg.sender, address(this), usdcAmount);

        // Update pool state
        m.yesPool     = uint128(newYesPool);
        m.noPool      = uint128(newNoPool);
        m.totalVolume = uint128(uint256(m.totalVolume) + usdcAmount);

        // Accumulate fee
        collectedFees += fee;

        // Update caller's position
        Position storage pos = positions[marketId][msg.sender];
        if (outcome == 0) {
            pos.yesShares = uint128(uint256(pos.yesShares) + sharesOut);
        } else {
            pos.noShares  = uint128(uint256(pos.noShares)  + sharesOut);
        }

        emit SharesBought(marketId, msg.sender, outcome, usdcAmount, sharesOut, fee, newYesPool, newNoPool);
    }

    // ── Admin: Close trading window ────────────────────────────────────────

    /**
     * @notice Permissionless — anyone can call once tradingClosesAt has passed.
     */
    function closeTradingWindow(bytes32 marketId) external {
        Market storage m = markets[marketId];
        require(m.exists,                              "Market not found");
        require(block.timestamp >= m.tradingClosesAt,  "Trading window not yet ended");
        require(!m.tradingClosed,                      "Already closed");
        m.tradingClosed = true;
        emit TradingClosed(marketId);
    }

    // ── Admin: Resolve market ──────────────────────────────────────────────

    /**
     * @notice Resolve a market after the auction closes. Owner only.
     * @param winningOutcome 1 = YES won, 2 = NO won
     */
    function resolveMarket(bytes32 marketId, uint8 winningOutcome) external onlyOwner {
        require(winningOutcome == 1 || winningOutcome == 2, "Resolve to YES(1) or NO(2)");
        Market storage m = markets[marketId];
        require(m.exists,                               "Market not found");
        require(m.winningOutcome == Outcome.UNRESOLVED, "Already resolved");
        require(block.timestamp >= m.closesAt,          "Auction not yet ended");
        m.winningOutcome = Outcome(winningOutcome);
        emit MarketResolved(marketId, Outcome(winningOutcome));
    }

    // ── User: Redeem winnings ──────────────────────────────────────────────

    /**
     * @notice Redeem winning shares after resolution.
     * Each winning share pays out $1 USDC minus the 2% settlement fee.
     */
    function redeem(bytes32 marketId) external nonReentrant {
        Market storage m = markets[marketId];
        require(m.exists,                                   "Market not found");
        require(m.winningOutcome != Outcome.UNRESOLVED,    "Not yet resolved");

        Position storage pos = positions[marketId][msg.sender];
        require(!pos.redeemed, "Already redeemed");

        uint256 winningShares;
        if (m.winningOutcome == Outcome.YES) {
            winningShares = pos.yesShares;
        } else {
            winningShares = pos.noShares;
        }
        require(winningShares > 0, "No winning shares to redeem");

        pos.redeemed = true;

        // 1 share = 1 USDC unit (since shares are extracted from USDC pool)
        // Settlement fee: 2% on gross payout (mirrors calcSettlementPayout in amm.ts)
        uint256 grossPayout   = winningShares;
        uint256 settleFee     = (grossPayout * SETTLEMENT_FEE_BPS) / BPS_DENOMINATOR;
        uint256 netPayout     = grossPayout - settleFee;

        collectedFees += settleFee;
        usdc.safeTransfer(msg.sender, netPayout);

        emit Redeemed(marketId, msg.sender, winningShares, netPayout);
    }

    // ── Admin: Withdraw fees ───────────────────────────────────────────────

    function withdrawFees(address to) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        uint256 amount = collectedFees;
        require(amount > 0, "No fees to withdraw");
        collectedFees = 0;
        usdc.safeTransfer(to, amount);
        emit FeesWithdrawn(to, amount);
    }

    // ── View functions ─────────────────────────────────────────────────────

    function getMarket(bytes32 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    function getPosition(bytes32 marketId, address user) external view returns (Position memory) {
        return positions[marketId][user];
    }

    /// @notice Returns YES price scaled to 1e18 (e.g. 0.6 → 600000000000000000)
    function getYesPrice(bytes32 marketId) external view returns (uint256) {
        Market storage m = markets[marketId];
        uint256 total = uint256(m.yesPool) + uint256(m.noPool);
        if (total == 0) return 5e17;
        return (uint256(m.noPool) * 1e18) / total;
    }

    /// @notice Quote a trade without executing. Returns (sharesOut, newYesPriceE18, fee).
    function quoteBuy(
        bytes32 marketId,
        uint8   outcome,
        uint256 usdcAmount
    ) external view returns (uint256 sharesOut, uint256 newYesPriceE18, uint256 fee) {
        require(outcome == 0 || outcome == 1, "Invalid outcome");
        Market storage m = markets[marketId];
        require(m.exists, "Market not found");

        fee              = (usdcAmount * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 usdcAmt  = usdcAmount - fee;
        uint256 yp       = uint256(m.yesPool);
        uint256 np       = uint256(m.noPool);
        uint256 k        = yp * np;

        uint256 newYp;
        uint256 newNp;
        if (outcome == 0) {
            newYp     = yp + usdcAmt;
            newNp     = k / newYp;
            sharesOut = np - newNp;
        } else {
            newNp     = np + usdcAmt;
            newYp     = k / newNp;
            sharesOut = yp - newYp;
        }
        uint256 total  = newYp + newNp;
        newYesPriceE18 = total == 0 ? 5e17 : (newNp * 1e18) / total;
    }

    // ── Utility: compute on-chain marketId from auctionId string ──────────

    /// @notice Returns the bytes32 marketId for a given BaT auctionId string.
    function getMarketId(string calldata auctionId) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(auctionId));
    }
}
