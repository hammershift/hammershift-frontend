// "use client";

import React, { useState } from 'react';
import Image from 'next/image';

import CancelIcon from '../../../public/images/x-icon.svg';
import { useSession } from 'next-auth/react';

const WithdrawForm = (props: any) => {
  const { handleCloseWithdrawModal, setShowSuccessfulWithdrawNotification, setShowFailedWithdrawNotification } = props;
  const { data: session } = useSession();
  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [wireRoutingNumber, setWireRoutingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          accountName,
          accountNumber,
          bankName,
          wireRoutingNumber,
          userId: session?.user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccessfulWithdrawNotification(true);
        handleCloseWithdrawModal(e as unknown as React.MouseEvent<HTMLButtonElement>);
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err) {
      setError('An error occurred');
      setShowFailedWithdrawNotification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-black/80 w-screen h-screen flex justify-center items-start md:items-center absolute top-0 left-0'>
      <div className='relative bg-[#0F1923] w-[640px] h-[720px] p-6'>
        <div className='flex justify-between mb-12'>
          <div className='text-3xl font-bold'>Withdraw</div>
          <div className='w-[35px] h-[35px] flex justify-center items-center'>
            <button onClick={handleCloseWithdrawModal}>
              <Image src={CancelIcon} width={20} height={20} alt='x' className='w-[20px] h-[20px]' />
            </button>
          </div>
        </div>
        <hr className='border-white/5' />
        <form className='flex flex-col gap-5 my-5' onSubmit={handleWithdraw}>
          <div className='flex flex-col gap-2'>
            <label>Amount *</label>
            <div className='flex'>
              {' '}
              <span className='rounded-sm text-white/60 bg-[#172431] h-auto py-2 md:py-2 px-2'>$</span>{' '}
              <input type='number' className='rounded-sm bg-[#172431] h-auto py-2 md:py-2 px-2 w-full' onChange={(e) => setAmount(e.target.value)}></input>
            </div>
          </div>
          <hr className='border-white/5' />
          <div className='flex flex-col gap-2'>
            <label>Account Name *</label>
            <input type='text' className='rounded-sm bg-[#172431] h-auto py-2 md:py-2 px-2 w-full' onChange={(e) => setAccountName(e.target.value)}></input>
          </div>
          <div className='flex flex-col gap-2'>
            <label>Account Number *</label>
            <input
              type='number'
              className='rounded-sm bg-[#172431] h-auto py-2 md:py-2 px-2 w-full'
              onChange={(e) => setAccountNumber(e.target.value)}
            ></input>
          </div>
          <div className='flex flex-col gap-2'>
            <label>Bank Name *</label>
            <input type='text' className='rounded-sm bg-[#172431] h-auto py-2 md:py-2 px-2 w-full' onChange={(e) => setBankName(e.target.value)}></input>
          </div>
          <div className='flex flex-col gap-2'>
            <label>SWIFT Code / IBAN / ACH / Wire Routing Number *</label>
            <input
              type='text'
              className='rounded-sm bg-[#172431] h-auto py-2 md:py-2 px-2 w-full'
              onChange={(e) => setWireRoutingNumber(e.target.value)}
            ></input>
          </div>
          <button type='submit' disabled={loading} className='btn-yellow'>
            Submit
          </button>
          {error && <p className='text-red-500 mt-4'>{error}</p>}
          {success && <p className='text-green-500 mt-4'>{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default WithdrawForm;
