'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/app/components/ui/sheet';
import { useSession } from 'next-auth/react';
import { useWallets } from '@privy-io/react-auth';
import { useVelocityAuth } from '@/hooks/useVelocityAuth';
import { usePolygonUSDCBalance } from '@/hooks/usePolygonUSDCBalance';
import { createBiconomySmartAccount, MARKET_ABI, PaymasterMode } from '@/lib/biconomy';
import { encodeFunctionData, parseUnits } from 'viem';

interface Market {
  _id: string;
  contractAddress?: string;   // optional — may not exist on all markets yet
  onChainMarketId?: string;   // bytes32 keccak256(auctionId) used on-chain
  question: string;
  yesPrice: number;
  noPrice: number;
  predictedPrice: number;
  auction: { title: string | null; image: string | null };
}

interface AMMQuote {
  sharesReceived: number;
  pricePerShare: number;
  fee: number;
  slippagePct: number;
  newYesPrice: number;
  newNoPrice: number;
  currentYesPrice: number;
  currentNoPrice: number;
}

interface TradeReceipt {
  tradeId: string;
  sharesReceived: number;
  pricePerShare: number;
  fee: number;
  usdcSpent: number;
  outcome: 'YES' | 'NO';
  newYesPrice: number;
  newNoPrice: number;
  slippagePct: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  market: Market | null;
  initialSide?: 'YES' | 'NO';
}

export default function TradingDrawer({
  open,
  onClose,
  market,
  initialSide = 'YES',
}: Props) {
  const [side, setSide] = useState<'YES' | 'NO'>(initialSide);
  const [amount, setAmount] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [quote, setQuote] = useState<AMMQuote | null>(null);
  const [quoteFetching, setQuoteFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradeReceipt, setTradeReceipt] = useState<TradeReceipt | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: session } = useSession();
  const { wallets } = useWallets();
  const { authenticated: privyAuthenticated, embeddedWalletAddress } = useVelocityAuth();
  const { balance: usdcBalance, refetch: refetchBalance } = usePolygonUSDCBalance(embeddedWalletAddress);

  // User is authenticated if they have a NextAuth session OR are logged in via Privy
  const isAuthenticated = !!session?.user || privyAuthenticated;

  // Sync side when initialSide prop changes (new market opened)
  useEffect(() => {
    setSide(initialSide);
    setAmount('');
    setQuote(null);
    setError(null);
    setTradeReceipt(null);
  }, [initialSide, market?._id]);

  // Debounced AMM quote fetch — fires 400ms after the user stops typing
  const fetchQuote = useCallback(
    async (marketId: string, outcome: 'YES' | 'NO', usdcAmount: number) => {
      if (usdcAmount <= 0 || usdcAmount > 10000) {
        setQuote(null);
        return;
      }
      setQuoteFetching(true);
      try {
        const res = await fetch(
          `/api/polygon-markets/${marketId}/quote?outcome=${outcome}&usdcAmount=${usdcAmount}&maxSlippage=0.05`
        );
        if (!res.ok) {
          setQuote(null);
          return;
        }
        const data: AMMQuote = await res.json();
        setQuote(data);
      } catch {
        setQuote(null);
      } finally {
        setQuoteFetching(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const amountNum = parseFloat(amount);
    if (!market || isNaN(amountNum) || amountNum <= 0) {
      setQuote(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchQuote(market._id, side, amountNum);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [amount, side, market, fetchQuote]);

  if (!market) return null;

  const price = side === 'YES' ? (market.yesPrice ?? 0.5) : (market.noPrice ?? 0.5);
  const color = side === 'YES' ? '#00D4AA' : '#EF4444';
  const amountNum = parseFloat(amount);
  const isValidAmount = !isNaN(amountNum) && amountNum >= 1 && amountNum <= 10000;

  // On-chain balance guard: only relevant when market has a contractAddress
  const isOnChainMarket = !!market.contractAddress;
  const hasInsufficientBalance = isOnChainMarket && isValidAmount && amountNum > usdcBalance;

  // POST to the REST trade API (used for markets without contractAddress, and to
  // record trades in DB after on-chain execution)
  const postRestTrade = async (): Promise<TradeReceipt> => {
    const res = await fetch(`/api/polygon-markets/${market._id}/trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outcome: side,
        usdcAmount: amountNum,
        maxSlippage: 0.05,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message ?? 'Trade failed. Please try again.');
    }
    return data as TradeReceipt;
  };

  const handleTrade = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to trade.');
      return;
    }
    if (!amount || !market || !isValidAmount) return;

    setIsPlacing(true);
    setError(null);

    try {
      // Path A — on-chain via Biconomy/Privy for markets with a contract address
      if (market.contractAddress) {
        const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
        if (!embeddedWallet) {
          // No embedded wallet — fall through to REST-only path
        } else {
          await embeddedWallet.switchChain(137); // Polygon mainnet
          const provider = await embeddedWallet.getEthereumProvider();

          const smartAccount = await createBiconomySmartAccount(provider);

          const outcomeIndex = side === 'YES' ? 0 : 1;
          const usdcAmount = parseUnits(amount, 6); // USDC has 6 decimals

          // onChainMarketId is the bytes32 keccak256(auctionId) stored on the
          // market document. Fall back to a zero-hash if somehow absent so the
          // call still compiles, but this should never be reached for markets
          // that have a contractAddress set.
          const marketIdBytes32 = (market.onChainMarketId ??
            '0x0000000000000000000000000000000000000000000000000000000000000000') as `0x${string}`;

          const data = encodeFunctionData({
            abi: MARKET_ABI,
            functionName: 'buyShares',
            // ABI order: marketId (bytes32), outcome (uint8), usdcAmount (uint256), minSharesOut (uint256)
            args: [marketIdBytes32, outcomeIndex, usdcAmount, BigInt(0)],
          });

          const userOpResponse = await smartAccount.sendTransaction(
            {
              to: market.contractAddress as `0x${string}`,
              data,
            },
            {
              paymasterServiceData: {
                mode: PaymasterMode.SPONSORED,
              },
            }
          );

          const { transactionHash } = await userOpResponse.waitForTxHash();
          console.log('Trade executed on-chain:', transactionHash);

          // Record the trade in DB after on-chain execution
          const receipt = await postRestTrade();
          setTradeReceipt(receipt);
          // Refresh on-chain balance display after successful trade
          await refetchBalance();
          return;
        }
      }

      // Path B — REST-only trade (no contractAddress, or no embedded wallet)
      const receipt = await postRestTrade();
      setTradeReceipt(receipt);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Trade failed. Please try again.';
      setError(message);
    } finally {
      setIsPlacing(false);
    }
  };

  // Success receipt view
  if (tradeReceipt) {
    const receiptColor = tradeReceipt.outcome === 'YES' ? '#00D4AA' : '#EF4444';
    return (
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent>
          <SheetHeader>
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              Trade Confirmed
            </p>
            <SheetTitle>{market.auction.title ?? 'Market'}</SheetTitle>
          </SheetHeader>

          <div className="p-6 flex flex-col gap-5">
            <div
              className="rounded-lg border p-4 flex flex-col gap-3 text-sm font-mono"
              style={{ borderColor: receiptColor, backgroundColor: `${receiptColor}11` }}
            >
              <div className="flex justify-between text-slate-300">
                <span>Outcome</span>
                <span style={{ color: receiptColor }} className="font-bold">
                  {tradeReceipt.outcome}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shares received</span>
                <span className="text-white">{tradeReceipt.sharesReceived.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Price per share</span>
                <span className="text-white">
                  {(tradeReceipt.pricePerShare * 100).toFixed(1)}¢
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform fee</span>
                <span className="text-[#E94560]">-${tradeReceipt.fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-white border-t border-white/10 pt-2">
                <span>Total spent</span>
                <span>${tradeReceipt.usdcSpent.toFixed(2)} USDC</span>
              </div>
            </div>

            <button
              onClick={() => {
                setTradeReceipt(null);
                setAmount('');
                setQuote(null);
                onClose();
              }}
              className="w-full py-4 rounded-lg font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              Done
            </button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            Prediction Market
          </p>
          <SheetTitle>{market.auction.title ?? 'Market'}</SheetTitle>
          <p className="text-sm text-slate-300 leading-snug">{market.question}</p>
        </SheetHeader>

        <div className="p-6 flex flex-col gap-5">
          {/* Side toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(['YES', 'NO'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={`py-3 rounded-lg font-bold text-sm transition-all ${
                  side === s
                    ? s === 'YES'
                      ? 'bg-[#00D4AA] text-black'
                      : 'bg-[#EF4444] text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {s}
                <span className="block text-xs font-mono font-normal mt-0.5">
                  {Math.round(
                    (s === 'YES' ? (market.yesPrice ?? 0.5) : (market.noPrice ?? 0.5)) * 100
                  )}
                  ¢
                </span>
              </button>
            ))}
          </div>

          {/* USDC amount input */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
              Amount (USDC)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                $
              </span>
              <input
                type="number"
                min="1"
                max="10000"
                step="1"
                placeholder="10"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                className="w-full bg-[#16181f] border border-white/10 rounded-lg py-3 pl-7 pr-4 text-[#F8FAFC] font-mono text-sm focus:outline-none focus:border-white/30"
              />
            </div>
            {isOnChainMarket && (
              <p className={`text-sm font-mono mt-1.5 ${hasInsufficientBalance ? 'text-[#E94560]' : 'text-gray-400'}`}>
                {hasInsufficientBalance
                  ? 'Insufficient USDC balance'
                  : `Available: $${usdcBalance.toFixed(2)} USDC`}
              </p>
            )}
          </div>

          {/* Live AMM quote preview */}
          {quoteFetching && (
            <div className="text-xs text-slate-500 font-mono text-center">
              Fetching quote...
            </div>
          )}

          {quote && !quoteFetching && (
            <div className="rounded-lg bg-[#1A2233] border border-white/[0.08] p-3 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Shares you receive</span>
                <span className="text-white">{quote.sharesReceived.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Price per share</span>
                <span className="text-white">{(quote.pricePerShare * 100).toFixed(1)}¢</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Platform fee (2%)</span>
                <span className="text-[#E94560]">-${quote.fee.toFixed(2)}</span>
              </div>
              {quote.slippagePct > 0.01 && (
                <div className="flex justify-between text-gray-400">
                  <span>Slippage</span>
                  <span
                    className={
                      quote.slippagePct > 0.03 ? 'text-[#E94560]' : 'text-[#FFB547]'
                    }
                  >
                    {(quote.slippagePct * 100).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Fallback static order summary when no live quote is available */}
          {!quote && !quoteFetching && (
            <div className="bg-[#16181f] rounded-lg p-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Price per share</span>
                <span className="font-mono" style={{ color }}>
                  {Math.round(price * 100)}¢
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shares (est.)</span>
                <span className="font-mono text-[#F8FAFC]">
                  {isValidAmount ? (amountNum / price).toFixed(2) : '—'}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-[#F8FAFC] pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="font-mono">${isValidAmount ? amount : '0'} USDC</span>
              </div>
            </div>
          )}

          {/* Auth / error feedback */}
          {error && (
            <p className="text-xs text-[#E94560] text-center font-mono">{error}</p>
          )}

          {/* CTA */}
          <button
            onClick={handleTrade}
            disabled={!isValidAmount || isPlacing || hasInsufficientBalance}
            className="w-full py-4 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: color,
              color: side === 'YES' ? 'black' : 'white',
            }}
          >
            {isPlacing
              ? 'Placing...'
              : `Buy ${side} — $${isValidAmount ? amount : '0'} USDC`}
          </button>

          <div className="space-y-1.5 text-center">
            <p className="text-xs text-slate-500">
              No gas fees — transactions are sponsored by Velocity Markets
            </p>
            <p className="text-[10px] text-slate-600">
              Trades are settled in USDC, a regulated US dollar stablecoin. Not FDIC insured.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
