'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import PaymentForm from '@/app/components/payment_form';
import Image from 'next/image';
import { redirect, usePathname, useSearchParams } from 'next/navigation';

import DepositIcon from '../../../../public/images/arrow-up.svg';
import WithdrawalIcon from '../../../../public/images/arrow-down-2.svg';
import PlusIcon from '../../../../public/images/load-icon.svg';
import ArrowDownIcon from '../../../../public/images/withdraw-icon.svg';
import DeniedIcon from '../../../../public/images/denied.svg';
import WalletIcon from '../../../../public/images/wallet--money-payment-finance-wallet.svg';
import Link from 'next/link';
import WithdrawForm from '@/app/components/withdraw_form';

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
  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [showSuccessfulWithdrawNotification, setShowSuccessfulWithdrawNotification] = useState(false);
  const [latestDepositTransaction, setLatestDepositTransaction] = useState({});
  const [showFailedWithdrawNotification, setShowFailedWithdrawNotification] = useState(false);
  const [showSuccessfulLoadNotification, setShowSuccessfulLoadNotification] = useState(false);
  const [showFailedLoadNotification, setShowFailedLoadNotification] = useState(false);

  const isDisabled = process.env.NEXT_PUBLIC_DISABLE_DEPOSIT;

  const { data: session } = useSession();
  const userId = session?.user.id;
  const userEmail = session?.user.email;
  const userStripeId = session?.user.stripeCustomerId;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  useEffect(() => {
    const fetchPrices = async () => {
      const res = await fetch('/api/getProducts', { method: 'GET' });
      if (!res.ok) {
        throw new Error('Unable to fetch prices');
      }
      const data = await res.json();
      const sortedData = data.sort((a: { unit_amount: number }, b: { unit_amount: number }) => a.unit_amount - b.unit_amount);
      setPrices(sortedData);
    };
    fetchPrices();
  }, []);

  useEffect(() => {
    const fetchUserTransactions = async () => {
      if (!userId) {
        console.error('User ID is undefined');
        return;
      }
      const res = await fetch(`/api/transaction?userID=${userId}`, {
        method: 'GET',
      });
      if (!res.ok) {
        throw new Error('Unable to fetch user transactions');
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
          const res = await fetch('/api/wallet', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await res.json();
          if (res.ok) {
            setWalletBalance(data.balance);
            setLoading(false);
          } else {
            console.error('Failed to fetch wallet balance:', data.message);
          }
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
        }
      }
    };
    fetchWalletBalance();
  }, [session]);

  useEffect(() => {
    if (isPaymentModalOpen || isWithdrawModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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
    transactions.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.transactionDate).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as { [key: string]: UserTransaction[] });
  };

  const groupedTransactions = groupAndSortTransactionsByDate(userTransactions);

  // remove notif and refresh page after successful/failed withdrawal
  const showNotification = (setShowNotification: React.Dispatch<React.SetStateAction<boolean>>) => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      window.location.reload();
    }, 5000);
  };

  // remove notif and refresh page when stripe payment is successful
  useEffect(() => {
    if (success === 'true') {
      const timeoutId = setTimeout(() => {
        window.location.href = '/my_wallet';
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
    window.addEventListener('resize', handleResize); // Add resize event listener

    return () => {
      window.removeEventListener('resize', handleResize); // Clean up event listener on unmount
    };
  }, []);

  return (
    <div className='section-container tw-flex tw-flex-col tw-justify-evenly max-sm:tw-w-full'>
      <div className='tw-flex tw-flex-col tw-justify-center tw-self-center tw-w-2/3 tw-rounded-md max-sm:tw-w-full'>
        <h2 className='tw-p-4 tw-text-3xl tw-font-bold'>My Wallet</h2>
        <div className='tw-p-4 tw-flex tw-flex-col tw-gap-1 tw-bg-[#49C74233] tw-rounded-md'>
          <div className='tw-flex tw-justify-between tw-items-center tw-rounded-md max-sm:tw-flex-col'>
            <div className='tw-flex max-sm:tw-self-start'>
              <Image alt='wallet' src={WalletIcon} />
              <div className='tw-px-4'>
                {' '}
                {loading ? <p className='tw-text-xl'>Loading</p> : <p className='tw-text-xl tw-font-bold'>${walletBalance.toFixed(2)}</p>}
                <p className='tw-text-sm tw-text-white/70'>Balance</p>
              </div>
            </div>
            <div>
              <button className='tw-p-1 tw-m-1 tw-border-2 tw-rounded-md tw-border-yellow-500'>
                <div className='tw-flex tw-p-1'>
                  <Image alt='arrow-down' src={ArrowDownIcon} />{' '}
                  <p className='tw-text-[#F2CA16] tw-pl-2' onClick={() => setIsWithdrawModalOpen(true)}>
                    WITHDRAW
                  </p>
                </div>
              </button>
              {isDisabled === 'true' ? (
                <button
                  className='tw-p-1 tw-px-3 tw-m-1 tw-bg-[#929292] tw-text-black tw-font-bold tw-rounded-md'
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled
                  title='Temporarily disabled'
                >
                  <div className='tw-flex tw-p-1'>
                    <Image alt='deposit' src={PlusIcon} /> <p className='tw-pl-2'>LOAD</p>
                  </div>
                </button>
              ) : (
                <button className='tw-p-1 tw-px-3 tw-m-1 tw-bg-[#F2CA16] tw-text-black tw-font-bold tw-rounded-md' onClick={() => setIsPaymentModalOpen(true)}>
                  <div className='tw-flex tw-p-1'>
                    <Image alt='deposit' src={PlusIcon} /> <p className='tw-pl-2'>LOAD</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        {isPaymentModalOpen && (
          <PaymentForm
            handleClosePaymentModal={handleClosePaymentModal}
            prices={prices}
            userId={userId}
            userEmail={userEmail}
            setShowSuccessfulLoadNotification={() => showNotification(setShowSuccessfulLoadNotification)}
          />
        )}
      </div>
      <div>
        {isWithdrawModalOpen && (
          <WithdrawForm
            handleCloseWithdrawModal={handleCloseWithdrawModal}
            setShowSuccessfulWithdrawNotification={() => showNotification(setShowSuccessfulWithdrawNotification)}
            setShowFailedWithdrawNotification={() => showNotification(setShowFailedWithdrawNotification)}
          />
        )}
      </div>
      <div className='tw-flex tw-flex-col tw-justify-center tw-self-center tw-w-2/3 tw-rounded-md max-sm:tw-w-full'>
        {Object.entries(groupedTransactions).map(([date, transactions]) => (
          <div key={date} className='tw-p-4 tw-mt-4 max-sm:tw-p-1'>
            <h3 className='tw-py-1'>{date}</h3>
            <hr className='tw-p-[1px] tw-mb-4 tw-border-0 tw-bg-white/5' />
            {transactions.map((transaction) => (
              <div key={transaction._id} className='tw-flex tw-justify-between'>
                {transaction.transactionType === 'deposit' && transaction.status === 'success' && (
                  <div className='tw-flex tw-w-full tw-justify-between tw-items-center'>
                    <div className='tw-flex tw-items-center tw-m-2'>
                      {' '}
                      <Image alt='deposit' src={DepositIcon} />
                      <div className='tw-px-4'>
                        <p className='tw-text-md'>Credit</p>
                        <p className='tw-text-sm tw-text-white/50'>
                          Loaded from{' '}
                          {isSmallScreen ? (
                            <a target='blank' href={transaction.invoice_url} className='tw-underline'>
                              Stripe
                            </a>
                          ) : (
                            'Stripe'
                          )}
                          {!isSmallScreen && (
                            <>
                              {' | Invoice ID: '}
                              <a target='blank' href={transaction.invoice_url} className='tw-underline'>
                                {transaction.invoice_id}
                              </a>
                            </>
                          )}
                        </p>
                        <p className='tw-text-sm tw-text-white/50'>{new Date(transaction.transactionDate).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <p className='tw-text-xl'>${transaction.amount}</p>
                  </div>
                )}
                {transaction.transactionType === 'deposit' && transaction.status === 'failed' && (
                  <div className='tw-flex tw-w-full tw-justify-between tw-items-center'>
                    <div className='tw-flex tw-items-center tw-m-2'>
                      {' '}
                      <Image alt='denied' src={DeniedIcon} />
                      <div className='tw-px-4'>
                        <p className='tw-text-md'>Denied Transaction</p>
                        <p className='tw-text-sm tw-text-white/50'>Failed to add funds</p>
                        <p className='tw-text-sm tw-text-white/50'>{new Date(transaction.transactionDate).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <p className='tw-text-xl'>${transaction.amount}</p>
                  </div>
                )}
                {transaction.transactionType === 'withdraw' && (
                  <div className='tw-flex tw-w-full tw-justify-between tw-items-center'>
                    <div className='tw-flex tw-items-center tw-m-2'>
                      <Image alt='deposit' src={transaction.status === 'failed' ? DeniedIcon : WithdrawalIcon} />
                      <div className='tw-px-4'>
                        <p className='tw-text-md'>Withdrawal</p>
                        <p className='tw-text-sm tw-text-white/50'>
                          Bank account ending {transaction.accountNumber?.slice(-4)}
                          {transaction.status === 'processing' ? ' (Processing)' : ''}
                          {transaction.status === 'successful' ? ' (Successful)' : ''}
                          {transaction.status === 'failed' ? ' (Failed)' : ''}
                        </p>
                        <p className='tw-text-sm tw-text-white/50'>{new Date(transaction.transactionDate).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <p className={`tw-text-xl ${transaction.status === 'successful' ? '' : 'tw-text-muted-foreground'}`}>
                      {transaction.type}${transaction.amount}
                    </p>
                  </div>
                )}
                {transaction.transactionType === 'wager' && (
                  <div className='tw-flex tw-w-full tw-justify-between tw-items-center'>
                    <div className='tw-flex tw-items-center tw-m-2'>
                      {' '}
                      <Image alt='deposit' src={WithdrawalIcon} />
                      <div className='tw-px-4'>
                        <p className='tw-text-md'>Wager</p>
                        <p className='tw-text-sm tw-text-white/50'>
                          Placed wager on Auction{' '}
                          <Link target='blank' href={`/auctions/car_view_page/${transaction.auction_id}`} className='tw-underline'>
                            [{transaction.auction_id}]
                          </Link>
                        </p>
                        <p className='tw-text-sm tw-text-white/50'>{new Date(transaction.transactionDate).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <p className='tw-text-xl'>
                      {transaction.type}${transaction.amount}
                    </p>
                  </div>
                )}
                {transaction.transactionType === 'tournament buy-in' && (
                  <div className='tw-flex tw-w-full tw-justify-between tw-items-center'>
                    <div className='tw-flex tw-items-center tw-m-2'>
                      {' '}
                      <Image alt='deposit' src={WithdrawalIcon} />
                      <div className='tw-px-4'>
                        <p className='tw-text-md'>Tournament Buy-in</p>
                        <p className='tw-text-sm tw-text-white/50'>
                          Placed buy-in for Tournament{' '}
                          <Link target='blank' href={`/tournaments/${transaction.tournamentID}`} className='tw-underline'>
                            [{transaction.tournamentID}]
                          </Link>
                        </p>
                        <p className='tw-text-sm tw-text-white/50'>{new Date(transaction.transactionDate).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <p className='tw-text-xl'>
                      {transaction.type}${transaction.amount}
                    </p>
                  </div>
                )}
                {transaction.transactionType === 'winnings' && (
                  <div className='tw-flex tw-w-full tw-justify-between tw-items-center'>
                    <div className='tw-flex tw-items-center tw-m-2'>
                      {' '}
                      <Image alt='deposit' src={DepositIcon} />
                      <div className='tw-px-4'>
                        <p className='tw-text-md'>Winnings</p>
                        <p className='tw-text-sm tw-text-white/50'>
                          Winnings from{' '}
                          <Link target='blank' href={`/auctions/car_view_page/${transaction.auction_id}`} className='tw-underline'>
                            [{transaction.auction_id}]
                          </Link>
                        </p>
                        <p className='tw-text-sm tw-text-white/50'>{new Date(transaction.transactionDate).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <p className='tw-text-xl'>
                      {transaction.type}${Math.round(transaction.amount)}
                    </p>
                  </div>
                )}
                {transaction.transactionType === 'refund' && (
                  <div className='tw-flex tw-w-full tw-justify-between tw-items-center'>
                    <div className='tw-flex tw-items-center tw-m-2'>
                      {' '}
                      <Image alt='deposit' src={DepositIcon} />
                      <div className='tw-px-4'>
                        <p className='tw-text-md'>Refund</p>
                        <p className='tw-text-sm tw-text-white/50'>Refunded from cancelled game</p>
                        <p className='tw-text-sm tw-text-white/50'>{new Date(transaction.transactionDate).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <p className='tw-text-xl'>${transaction.amount}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {showSuccessfulWithdrawNotification && (
        <div className='tw-fixed tw-p-4 tw-left-1/2 tw-rounded-md tw-text-sm tw-top-5 tw-z-40 tw-bg-[#49C74233] tw-backdrop-blur-xl'>
          <p>Withdrawal Request Completed</p>
        </div>
      )}
      {showFailedWithdrawNotification && (
        <div className='tw-fixed tw-p-4 tw-left-1/2 tw-rounded-md tw-text-sm tw-top-5 tw-z-40 tw-bg-red-700'>
          <p>Withdrawal Request Failed</p>
        </div>
      )}
      {success === 'true' && (
        <div className='tw-fixed tw-p-4 tw-left-1/2 tw-rounded-md tw-text-sm tw-top-5 tw-z-40 tw-bg-[#49C74233] tw-backdrop-blur-xl'>
          <p>Wallet Successfully Loaded</p>
        </div>
      )}
      {showFailedLoadNotification && (
        <div className='tw-fixed tw-p-4 tw-left-1/2 tw-rounded-md tw-text-sm tw-top-5 tw-z-40 tw-bg-red-700'>
          <p>Wallet Top-up Failed</p>
        </div>
      )}
    </div>
  );
};

export default MyWalletPage;
