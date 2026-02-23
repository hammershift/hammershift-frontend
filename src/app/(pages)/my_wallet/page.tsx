"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PaymentForm from "@/app/components/payment_form";
import { ACHDepositForm } from "@/app/components/ACHDepositForm";
import Image from "next/image";
import { redirect, usePathname, useSearchParams } from "next/navigation";

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
  const [showACHForm, setShowACHForm] = useState(false);

  const isDisabled = process.env.NEXT_PUBLIC_DISABLE_DEPOSIT;

  const { data: session } = useSession();
  const userId = session?.user.id;
  const userEmail = session?.user.email;
  //const userStripeId = session?.user.stripeCustomerId;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

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
      if (!userId) {
        console.error("User ID is undefined");
        return;
      }
      const res = await fetch(`/api/transaction?userID=${userId}`, {
        method: "GET",
      });
      if (!res.ok) {
        throw new Error("Unable to fetch user transactions");
      }
      const data = await res.json();
      setUserTransactions(data);
    };
    fetchUserTransactions();
  }, [userId]);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      setLoading(true);
      if (session) {
        try {
          const res = await fetch("/api/wallet", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          if (res.ok) {
            setWalletBalance(data.balance);
            setLoading(false);
          } else {
            console.error("Failed to fetch wallet balance:", data.message);
          }
        } catch (error) {
          console.error("Error fetching wallet balance:", error);
        }
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

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768); // Adjust the width as needed
    };

    handleResize(); // Check screen size on initial render
    window.addEventListener("resize", handleResize); // Add resize event listener

    return () => {
      window.removeEventListener("resize", handleResize); // Clean up event listener on unmount
    };
  }, []);

  return (
    <div className="section-container flex flex-col justify-evenly max-sm:w-full">
      <div className="flex w-2/3 flex-col justify-center self-center rounded-md max-sm:w-full">
        <h2 className="p-4 text-3xl font-bold">My Wallet</h2>
        <div className="flex flex-col gap-1 rounded-md bg-[#49C74233] p-4">
          <div className="flex items-center justify-between rounded-md max-sm:flex-col">
            <div className="flex max-sm:self-start">
              <Image alt="wallet" src={WalletIcon} />
              <div className="px-4">
                {" "}
                {loading ? (
                  <p className="text-xl">Loading</p>
                ) : (
                  <p className="text-xl font-bold">
                    ${walletBalance.toFixed(2)}
                  </p>
                )}
                <p className="text-sm text-white/70">Balance</p>
              </div>
            </div>
            <div>
              <button className="m-1 rounded-md border-2 border-yellow-500 p-1">
                <div className="flex p-1">
                  <Image alt="arrow-down" src={ArrowDownIcon} />{" "}
                  <p
                    className="pl-2 text-[#F2CA16]"
                    onClick={() => setIsWithdrawModalOpen(true)}
                  >
                    WITHDRAW
                  </p>
                </div>
              </button>
              {isDisabled === "true" ? (
                <button
                  className="m-1 rounded-md bg-[#929292] p-1 px-3 font-bold text-black"
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled
                  title="Temporarily disabled"
                >
                  <div className="flex p-1">
                    <Image alt="deposit" src={PlusIcon} />{" "}
                    <p className="pl-2">LOAD</p>
                  </div>
                </button>
              ) : (
                <button
                  className="m-1 rounded-md bg-[#F2CA16] p-1 px-3 font-bold text-black"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  <div className="flex p-1">
                    <Image alt="deposit" src={PlusIcon} />{" "}
                    <p className="pl-2">LOAD</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ACH Bank Transfer deposit option */}
      <div className="flex w-2/3 flex-col justify-center self-center rounded-md max-sm:w-full mt-4">
        <div className="rounded-lg border border-[#1E2A36] bg-[#13202D] p-5 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium text-sm">Bank Transfer (ACH)</h4>
              <p className="text-[#00D4AA] text-xs mt-0.5">Save 2-3% vs card</p>
            </div>
            <button
              onClick={() => setShowACHForm(!showACHForm)}
              className="text-xs bg-[#0A0A1A] border border-[#1E2A36] text-white px-3 py-1.5 rounded-lg hover:border-[#E94560]/50 transition-colors"
            >
              {showACHForm ? "Cancel" : "Deposit"}
            </button>
          </div>
          {showACHForm && (
            <ACHDepositForm
              onSuccess={() => {
                setShowACHForm(false);
                setTimeout(() => window.location.reload(), 2500);
              }}
              onCancel={() => setShowACHForm(false)}
            />
          )}
        </div>
        <p className="text-xs text-gray-500 mb-2">Pay with card instead:</p>
      </div>
      <div>
        {isPaymentModalOpen && (
          <PaymentForm
            handleClosePaymentModal={handleClosePaymentModal}
            prices={prices}
            userId={userId}
            userEmail={userEmail}
            setShowSuccessfulLoadNotification={() =>
              showNotification(setShowSuccessfulLoadNotification)
            }
          />
        )}
      </div>
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
