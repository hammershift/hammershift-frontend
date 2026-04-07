"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useVelocityAuth } from "@/hooks/useVelocityAuth";
import { usePolygonUSDCBalance } from "@/hooks/usePolygonUSDCBalance";
import PaymentForm from "@/app/components/payment_form";
import DepositModal from "@/app/components/DepositModal";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

import DepositIcon from "../../../../public/images/arrow-up.svg";
import WithdrawalIcon from "../../../../public/images/arrow-down-2.svg";
import PlusIcon from "../../../../public/images/load-icon.svg";
import ArrowDownIcon from "../../../../public/images/withdraw-icon.svg";
import DeniedIcon from "../../../../public/images/denied.svg";
import WalletIcon from "../../../../public/images/wallet--money-payment-finance-wallet.svg";
import Link from "next/link";
import WithdrawForm from "@/app/components/withdraw_form";

export interface ProductPrice {
  unit_amount: number;
  id: string;
}

interface UserTransaction {
  _id: string;
  transactionType: string;
  amount: number;
  transactionDate: Date;
  type: string;
  invoiceId?: string;
  auctionID?: string;
  tournamentID?: string;
  auction_id?: string;
  invoice_url?: string;
  invoice_id?: string;
  accountNumber?: string;
  status?: string;
}

const MyWalletPage = () => {
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>(
    []
  );
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [
    showSuccessfulWithdrawNotification,
    setShowSuccessfulWithdrawNotification,
  ] = useState(false);
  const [latestDepositTransaction, setLatestDepositTransaction] = useState({});
  const [showFailedWithdrawNotification, setShowFailedWithdrawNotification] =
    useState(false);
  const [showSuccessfulLoadNotification, setShowSuccessfulLoadNotification] =
    useState(false);
  const [showFailedLoadNotification, setShowFailedLoadNotification] =
    useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [onrampStatus, setOnrampStatus] = useState<'pending' | 'complete' | null>(null);
  const [onrampAmount, setOnrampAmount] = useState<number>(0);

  const isDisabled = process.env.NEXT_PUBLIC_DISABLE_DEPOSIT;

  const { data: session } = useSession();
  const userId = session?.user.id;
  const userEmail = session?.user.email;

  // On-chain USDC balance via Privy embedded wallet
  const { embeddedWalletAddress } = useVelocityAuth();
  const {
    balance: onChainBalance,
    loading: balLoading,
    error: balError,
    refetch: refetchBalance,
  } = usePolygonUSDCBalance(embeddedWalletAddress);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const depositStatus = searchParams.get("deposit");
  const depositSessionId = searchParams.get("session_id");
  const depositAmount = searchParams.get("amount");

  useEffect(() => {
    const fetchPrices = async () => {
      const res = await fetch("/api/getProducts", { method: "GET" });
      if (!res.ok) {
        throw new Error("Unable to fetch prices");
      }
      const data = await res.json();
      const sortedData = data.sort(
        (a: { unit_amount: number }, b: { unit_amount: number }) =>
          a.unit_amount - b.unit_amount
      );
      setPrices(sortedData);
    };
    fetchPrices();
  }, []);

  useEffect(() => {
    const fetchUserTransactions = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/transaction?userID=${userId}`, {
          method: "GET",
        });
        if (!res.ok) {
          console.error("Unable to fetch user transactions:", res.status);
          return;
        }
        const data = await res.json();
        setUserTransactions(data);
      } catch (err) {
        console.error("Error fetching user transactions:", err);
      }
    };
    fetchUserTransactions();
  }, [userId]);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!session) return;
      setLoading(true);
      try {
        const res = await fetch("/api/wallet", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (res.ok) {
          setWalletBalance(data.balance ?? 0);
        } else {
          console.error("Failed to fetch wallet balance:", data.message);
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletBalance();
  }, [session]);

  useEffect(() => {
    if (isPaymentModalOpen || isWithdrawModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPaymentModalOpen, isWithdrawModalOpen]);

  const handleClosePaymentModal = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsPaymentModalOpen(false);
    // Refresh on-chain balance after deposit flow closes
    refetchBalance();
  };

  const handleCloseWithdrawModal = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsWithdrawModalOpen(false);
  };

  const groupAndSortTransactionsByDate = (transactions: UserTransaction[]) => {
    transactions.sort(
      (a, b) =>
        new Date(b.transactionDate).getTime() -
        new Date(a.transactionDate).getTime()
    );

    return transactions.reduce(
      (groups, transaction) => {
        const date = new Date(transaction.transactionDate).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
      },
      {} as { [key: string]: UserTransaction[] }
    );
  };

  const groupedTransactions = groupAndSortTransactionsByDate(userTransactions);

  // remove notif and refresh page after successful/failed withdrawal
  const showNotification = (
    setShowNotification: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      window.location.reload();
    }, 5000);
  };

  // remove notif and refresh page when stripe payment is successful
  useEffect(() => {
    if (success === "true") {
      const timeoutId = setTimeout(() => {
        window.location.href = "/my_wallet";
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [success]);

  // Stripe Checkout return — verify and credit deposit
  const [checkoutVerified, setCheckoutVerified] = useState<'pending' | 'success' | 'failed' | null>(null);
  useEffect(() => {
    if (depositStatus !== 'success' || !depositSessionId) return;
    setCheckoutVerified('pending');
    fetch('/api/stripe/verify-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: depositSessionId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (data.credited) {
          setCheckoutVerified('success');
          // Refresh balance
          if (session) {
            const balRes = await fetch('/api/wallet');
            if (balRes.ok) {
              const balData = await balRes.json();
              setWalletBalance(balData.balance);
            }
          }
        } else {
          setCheckoutVerified('failed');
        }
      })
      .catch(() => setCheckoutVerified('failed'));
  }, [depositStatus, depositSessionId, session]);

  // Onramp return handling
  useEffect(() => {
    const stored = localStorage.getItem('vm_onramp_session');
    if (!stored) return;

    try {
      const { sessionId, amount, timestamp } = JSON.parse(stored);
      // Expire after 1 hour
      if (Date.now() - timestamp > 3600000) {
        localStorage.removeItem('vm_onramp_session');
        return;
      }

      setOnrampAmount(amount);
      setOnrampStatus('pending');

      // Poll on-chain balance every 10 seconds for up to 5 minutes
      let attempts = 0;
      const maxAttempts = 30;
      const interval = setInterval(() => {
        attempts++;
        refetchBalance();
        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 10000);

      // Try to verify via our API (succeeds once webhook has fired)
      const checkCompletion = async () => {
        try {
          const res = await fetch('/api/stripe/onramp-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          if (res.ok) {
            setOnrampStatus('complete');
            localStorage.removeItem('vm_onramp_session');
            clearInterval(interval);
            refetchBalance();
          }
        } catch {
          // Webhook hasn't fired yet — keep polling
        }
      };

      checkCompletion();
      const verifyInterval = setInterval(checkCompletion, 15000);

      return () => {
        clearInterval(interval);
        clearInterval(verifyInterval);
      };
    } catch {
      localStorage.removeItem('vm_onramp_session');
    }
  }, [refetchBalance]);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="section-container flex flex-col justify-evenly max-sm:w-full">
      <div className="flex w-2/3 flex-col justify-center self-center rounded-md max-sm:w-full">
        <h2 className="p-4 text-3xl font-bold">My Wallet</h2>

        {/* Primary balance card */}
        <div className="flex flex-col gap-1 rounded-md bg-[#0A0A1A] border border-[#00D4AA]/30 p-4 mb-3">
          <div className="flex items-center justify-between rounded-md max-sm:flex-col">
            <div className="flex max-sm:self-start">
              <Image alt="wallet" src={WalletIcon} />
              <div className="px-4">
                {loading || balLoading ? (
                  <p className="text-xl font-mono animate-pulse text-white/60">
                    Loading…
                  </p>
                ) : (
                  <p className="text-2xl font-bold font-mono text-[#00D4AA]">
                    ${(walletBalance + (embeddedWalletAddress ? onChainBalance : 0)).toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-[#00D4AA]/70 mt-0.5">
                  Velocity Markets Balance
                </p>
                {embeddedWalletAddress && (
                  <p className="text-xs text-white/30 mt-0.5 font-mono">
                    {embeddedWalletAddress.slice(0, 6)}…
                    {embeddedWalletAddress.slice(-4)}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Link
                href="/wallet/transfer"
                className="inline-block m-1 rounded-md border-2 border-[#00D4AA] p-1"
              >
                <div className="flex p-1 items-center">
                  <Image alt="arrow-down" src={ArrowDownIcon} />
                  <p className="pl-2 text-[#00D4AA] text-sm font-bold">
                    TRANSFER USDC
                  </p>
                </div>
              </Link>
              <button className="m-1 rounded-md border-2 border-[#E94560] p-1">
                <div className="flex p-1">
                  <Image alt="arrow-down" src={ArrowDownIcon} />{" "}
                  <p
                    className="pl-2 text-[#E94560]"
                    onClick={() => setIsWithdrawModalOpen(true)}
                  >
                    WITHDRAW
                  </p>
                </div>
              </button>
              {isDisabled === "true" ? (
                <button
                  className="m-1 rounded-md bg-[#929292] p-1 px-3 font-bold text-black"
                  onClick={() => setIsDepositModalOpen(true)}
                  disabled
                  title="Temporarily disabled"
                >
                  <div className="flex p-1">
                    <Image alt="deposit" src={PlusIcon} />{" "}
                    <p className="pl-2">DEPOSIT</p>
                  </div>
                </button>
              ) : (
                <button
                  className="m-1 rounded-md bg-[#E94560] p-1 px-3 font-bold text-white"
                  onClick={() => setIsDepositModalOpen(true)}
                >
                  <div className="flex p-1">
                    <Image alt="deposit" src={PlusIcon} />{" "}
                    <p className="pl-2">DEPOSIT</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-2 mb-1">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Secured by Stripe
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Funds held in USD
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Withdraw anytime
          </span>
        </div>

        {/* Balance breakdown — shown when both on-chain and platform balances exist */}
        {embeddedWalletAddress && (walletBalance > 0 || onChainBalance > 0) && (
          <div className="flex flex-wrap items-center gap-4 px-4 py-2 rounded-md bg-[#49C74233] mb-3">
            {walletBalance > 0 && (
              <span className="text-sm text-white/50">
                Platform: <span className="font-mono text-white/70">${walletBalance.toFixed(2)}</span>
              </span>
            )}
            {onChainBalance > 0 && (
              <span className="text-sm text-white/50">
                On-chain USDC: <span className="font-mono text-white/70">${onChainBalance.toFixed(2)}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Onramp status banner */}
      {onrampStatus === 'pending' && (
        <div className="flex w-2/3 self-center max-sm:w-full">
          <div className="w-full flex items-center gap-3 rounded-lg border border-[#FFB547]/30 bg-[#FFB547]/10 px-4 py-3 mb-3">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFB547]/30 border-t-[#FFB547]" />
            <p className="text-sm text-[#FFB547]">
              Processing your ${onrampAmount} deposit… This may take a few minutes.
            </p>
          </div>
        </div>
      )}
      {onrampStatus === 'complete' && (
        <div className="flex w-2/3 self-center max-sm:w-full">
          <div className="w-full flex items-center gap-3 rounded-lg border border-[#00D4AA]/30 bg-[#00D4AA]/10 px-4 py-3 mb-3">
            <span className="text-[#00D4AA]">✓</span>
            <p className="text-sm text-[#00D4AA]">
              ${onrampAmount} deposit complete! Your balance has been updated.
            </p>
          </div>
        </div>
      )}

      {/* Checkout deposit status banner */}
      {checkoutVerified === 'pending' && (
        <div className="flex w-2/3 self-center max-sm:w-full">
          <div className="w-full flex items-center gap-3 rounded-lg border border-[#FFB547]/30 bg-[#FFB547]/10 px-4 py-3 mb-3">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFB547]/30 border-t-[#FFB547]" />
            <p className="text-sm text-[#FFB547]">
              Verifying your ${depositAmount ?? ''} deposit…
            </p>
          </div>
        </div>
      )}
      {checkoutVerified === 'success' && (
        <div className="flex w-2/3 self-center max-sm:w-full">
          <div className="w-full flex items-center gap-3 rounded-lg border border-[#00D4AA]/30 bg-[#00D4AA]/10 px-4 py-3 mb-3">
            <span className="text-[#00D4AA]">&#10003;</span>
            <p className="text-sm text-[#00D4AA]">
              ${depositAmount ?? ''} deposit confirmed! Your balance has been updated.
            </p>
          </div>
        </div>
      )}
      {checkoutVerified === 'failed' && (
        <div className="flex w-2/3 self-center max-sm:w-full">
          <div className="w-full flex items-center gap-3 rounded-lg border border-[#E94560]/30 bg-[#E94560]/10 px-4 py-3 mb-3">
            <span className="text-[#E94560]">!</span>
            <p className="text-sm text-[#E94560]">
              Could not verify deposit. If you completed payment, your balance will update shortly.
            </p>
          </div>
        </div>
      )}

      {/* ACH Bank Transfer — Coming Soon */}
      <div className="flex w-2/3 flex-col justify-center self-center rounded-md max-sm:w-full mt-4">
        <div className="rounded-lg border border-white/[0.08] bg-[#16181f] p-5 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium text-sm">
                Bank Transfer (ACH)
              </h4>
              <p className="text-white/40 text-xs mt-0.5">Coming Soon</p>
            </div>
            <span className="text-xs bg-[#0A0A1A] border border-white/[0.08] text-white/30 px-3 py-1.5 rounded-lg cursor-not-allowed select-none">
              Coming Soon
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-2">Pay with card instead:</p>
      </div>

      <DepositModal
        open={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          refetchBalance();
        }}
      />
      <div>
        {isWithdrawModalOpen && (
          <WithdrawForm
            handleCloseWithdrawModal={handleCloseWithdrawModal}
            setShowSuccessfulWithdrawNotification={() =>
              showNotification(setShowSuccessfulWithdrawNotification)
            }
            setShowFailedWithdrawNotification={() =>
              showNotification(setShowFailedWithdrawNotification)
            }
          />
        )}
      </div>
      <div className="flex w-2/3 flex-col justify-center self-center rounded-md max-sm:w-full">
        {Object.entries(groupedTransactions).map(([date, transactions]) => (
          <div key={date} className="mt-4 p-4 max-sm:p-1">
            <h3 className="py-1">{date}</h3>
            <hr className="mb-4 border-0 bg-white/5 p-[1px]" />
            {transactions.map((transaction) => (
              <div key={transaction._id} className="flex justify-between">
                {transaction.transactionType === "deposit" &&
                  transaction.status === "success" && (
                    <div className="flex w-full items-center justify-between">
                      <div className="m-2 flex items-center">
                        {" "}
                        <Image alt="deposit" src={DepositIcon} />
                        <div className="px-4">
                          <p className="text-md">Credit</p>
                          <p className="text-sm text-white/50">
                            Loaded from{" "}
                            {isSmallScreen ? (
                              <a
                                target="blank"
                                href={transaction.invoice_url}
                                className="underline"
                              >
                                Stripe
                              </a>
                            ) : (
                              "Stripe"
                            )}
                            {!isSmallScreen && (
                              <>
                                {" | Invoice ID: "}
                                <a
                                  target="blank"
                                  href={transaction.invoice_url}
                                  className="underline"
                                >
                                  {transaction.invoice_id}
                                </a>
                              </>
                            )}
                          </p>
                          <p className="text-sm text-white/50">
                            {new Date(
                              transaction.transactionDate
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-xl">${transaction.amount}</p>
                    </div>
                  )}
                {transaction.transactionType === "deposit" &&
                  transaction.status === "failed" && (
                    <div className="flex w-full items-center justify-between">
                      <div className="m-2 flex items-center">
                        {" "}
                        <Image alt="denied" src={DeniedIcon} />
                        <div className="px-4">
                          <p className="text-md">Denied Transaction</p>
                          <p className="text-sm text-white/50">
                            Failed to add funds
                          </p>
                          <p className="text-sm text-white/50">
                            {new Date(
                              transaction.transactionDate
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-xl">${transaction.amount}</p>
                    </div>
                  )}
                {transaction.transactionType === "withdraw" && (
                  <div className="flex w-full items-center justify-between">
                    <div className="m-2 flex items-center">
                      <Image
                        alt="deposit"
                        src={
                          transaction.status === "failed"
                            ? DeniedIcon
                            : WithdrawalIcon
                        }
                      />
                      <div className="px-4">
                        <p className="text-md">Withdrawal</p>
                        <p className="text-sm text-white/50">
                          Bank account ending{" "}
                          {transaction.accountNumber?.slice(-4)}
                          {transaction.status === "processing"
                            ? " (Processing)"
                            : ""}
                          {transaction.status === "successful"
                            ? " (Successful)"
                            : ""}
                          {transaction.status === "failed" ? " (Failed)" : ""}
                        </p>
                        <p className="text-sm text-white/50">
                          {new Date(
                            transaction.transactionDate
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-xl ${transaction.status === "successful" ? "" : "text-muted-foreground"}`}
                    >
                      {transaction.type}${transaction.amount}
                    </p>
                  </div>
                )}
                {transaction.transactionType === "wager" && (
                  <div className="flex w-full items-center justify-between">
                    <div className="m-2 flex items-center">
                      {" "}
                      <Image alt="deposit" src={WithdrawalIcon} />
                      <div className="px-4">
                        <p className="text-md">Wager</p>
                        <p className="text-sm text-white/50">
                          Placed wager on Auction{" "}
                          <Link
                            target="blank"
                            href={`/auctions/car_view_page/${transaction.auction_id}`}
                            className="underline"
                          >
                            [{transaction.auction_id}]
                          </Link>
                        </p>
                        <p className="text-sm text-white/50">
                          {new Date(
                            transaction.transactionDate
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl">
                      {transaction.type}${transaction.amount}
                    </p>
                  </div>
                )}
                {transaction.transactionType === "tournament buy-in" && (
                  <div className="flex w-full items-center justify-between">
                    <div className="m-2 flex items-center">
                      {" "}
                      <Image alt="deposit" src={WithdrawalIcon} />
                      <div className="px-4">
                        <p className="text-md">Tournament Buy-in</p>
                        <p className="text-sm text-white/50">
                          Placed buy-in for Tournament{" "}
                          <Link
                            target="blank"
                            href={`/tournaments/${transaction.tournamentID}`}
                            className="underline"
                          >
                            [{transaction.tournamentID}]
                          </Link>
                        </p>
                        <p className="text-sm text-white/50">
                          {new Date(
                            transaction.transactionDate
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl">
                      {transaction.type}${transaction.amount}
                    </p>
                  </div>
                )}
                {transaction.transactionType === "winnings" && (
                  <div className="flex w-full items-center justify-between">
                    <div className="m-2 flex items-center">
                      {" "}
                      <Image alt="deposit" src={DepositIcon} />
                      <div className="px-4">
                        <p className="text-md">Winnings</p>
                        <p className="text-sm text-white/50">
                          Winnings from{" "}
                          <Link
                            target="blank"
                            href={`/auctions/car_view_page/${transaction.auction_id}`}
                            className="underline"
                          >
                            [{transaction.auction_id}]
                          </Link>
                        </p>
                        <p className="text-sm text-white/50">
                          {new Date(
                            transaction.transactionDate
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl">
                      {transaction.type}${Math.round(transaction.amount)}
                    </p>
                  </div>
                )}
                {transaction.transactionType === "refund" && (
                  <div className="flex w-full items-center justify-between">
                    <div className="m-2 flex items-center">
                      {" "}
                      <Image alt="deposit" src={DepositIcon} />
                      <div className="px-4">
                        <p className="text-md">Refund</p>
                        <p className="text-sm text-white/50">
                          Refunded from cancelled game
                        </p>
                        <p className="text-sm text-white/50">
                          {new Date(
                            transaction.transactionDate
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl">${transaction.amount}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {showSuccessfulWithdrawNotification && (
        <div className="fixed left-1/2 top-5 z-40 rounded-md bg-[#49C74233] p-4 text-sm backdrop-blur-xl">
          <p>Withdrawal Request Completed</p>
        </div>
      )}
      {showFailedWithdrawNotification && (
        <div className="fixed left-1/2 top-5 z-40 rounded-md bg-red-700 p-4 text-sm">
          <p>Withdrawal Request Failed</p>
        </div>
      )}
      {success === "true" && (
        <div className="fixed left-1/2 top-5 z-40 rounded-md bg-[#49C74233] p-4 text-sm backdrop-blur-xl">
          <p>Wallet Successfully Loaded</p>
        </div>
      )}
      {showFailedLoadNotification && (
        <div className="fixed left-1/2 top-5 z-40 rounded-md bg-red-700 p-4 text-sm">
          <p>Wallet Top-up Failed</p>
        </div>
      )}
    </div>
  );
};

export default MyWalletPage;
