'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Wallet from '../../../public/images/wallet--money-payment-finance-wallet.svg';
import ArrowRight from '../../../public/images/arrow-right.svg';
import { usePathname } from 'next/navigation';
import { BeatLoader } from 'react-spinners';
import PaymentForm from './payment_form';
import { ProductPrice } from '../(pages)/my_wallet/page';
import Tooltip from './tooltip';

const LoadWallet = () => {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [prices, setPrices] = useState<ProductPrice[]>([]);

  const isDisabled = process.env.NEXT_PUBLIC_DISABLE_DEPOSIT;

  const { data: session } = useSession();
  const userId = session?.user.id;
  const userEmail = session?.user.email;

  const pathname = usePathname();

  const isWalletDepositEnabled = process.env.NEXT_PUBLIC_WALLET_DEPOSIT_ENABLED === 'true';

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
    const fetchWalletBalance = async () => {
      if (session) {
        setIsLoading(true);
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
          } else {
            console.error('Failed to fetch wallet balance:', data.message);
          }
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchWalletBalance();
  }, [session]);

  useEffect(() => {
    if (isPaymentModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPaymentModalOpen]);

  const handleClosePaymentModal = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsPaymentModalOpen(false);
  };

  return (
    <div className='max-md:hidden'>
      {!session ? null : pathname === '/my_wallet' ? null : isLoading ? (
        <BeatLoader color='#696969' size={10} />
      ) : isDisabled === 'true' ? (
        <button
          className='fixed bottom-5 right-16 px-6 tw hover:cursor-pointer max-md:hidden lg:w-1/3 xl:w-1/5'
          onClick={() => setIsPaymentModalOpen(true)}
          title='Temporarily disabled'
          disabled
        >
          <div className='bg-[#49C74233] backdrop-blur-md  w-full px-6 py-4 rounded flex items-center gap-6'>
            <Image src={Wallet} width={32} height={32} alt='wallet icon' className='w-8 h-8' />
            <div className='flex flex-col items-start grow'>
              <span className='font-bold text-xl py-1'>${walletBalance.toFixed(2)}</span>
              <span className='text-[#49C742]'>Load Wallet Now</span>
            </div>
            <Image src={ArrowRight} width={32} height={32} alt='wallet icon' className='w-8 h-8' />
          </div>
        </button>
      ) : (
        <button
          className='fixed bottom-5 right-16 px-6 tw hover:cursor-pointer max-md:hidden lg:w-1/3 xl:w-1/5'
          onClick={() => setIsPaymentModalOpen(true)}
        >
          <div className='bg-[#49C74233] backdrop-blur-md  w-full px-6 py-4 rounded flex items-center gap-6'>
            <Image src={Wallet} width={32} height={32} alt='wallet icon' className='w-8 h-8' />
            <div className='flex flex-col items-start grow'>
              <span className='font-bold text-xl py-1'>${walletBalance.toFixed(2)}</span>
              <span className='text-[#49C742]'>Load Wallet Now</span>
            </div>
            <Image src={ArrowRight} width={32} height={32} alt='wallet icon' className='w-8 h-8' />
          </div>
        </button>
      )}
      {isPaymentModalOpen && <PaymentForm handleClosePaymentModal={handleClosePaymentModal} prices={prices} userId={userId} userEmail={userEmail} />}
    </div>
  );
};

export default LoadWallet;
