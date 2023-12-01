'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const PasswordResetFlow = () => {
  type ResetPageProps = 'enter otp' | 'reset password';
  const [resetPage, setResetPage] = useState<ResetPageProps>('enter otp');

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [otpExpired, setOtpExpired] = useState(false);
  const [otpVerificationSuccess, setOtpVerificationSuccess] = useState(false);

  const router = useRouter();

  const handleOtpVerification = async () => {
    try {
      const response = await fetch('/api/verifyOtpCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setResetPage('reset password');
        setError('');
        setOtpVerificationSuccess(true);
      } else {
        setError('Invalid OTP. Please try again.');
        setOtpVerificationSuccess(false);
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      setError('An error occurred while verifying the OTP code.');
      setOtpVerificationSuccess(false);
    }
  };

  // TODO
  const handlePasswordReset = async () => {
    router.push('/login_page/page.tsx');
  };

  const getInputStyle = () => {
    if (otpVerificationSuccess) {
      return 'tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-w-full tw-border-green-500';
    } else if (error) {
      return 'tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-w-full tw-border-red-500';
    }
    return 'tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-w-full tw-border tw-border-white';
  };

  useEffect(() => {
    if (timer > 0 && !otpExpired) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0) {
      setOtpExpired(true);
      setError('OTP code has expired.');
    }
  }, [timer, otpExpired]);

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className='tw-w-screen md:tw-h-screen tw-absolute tw-top-0 tw-z-[-1] tw-flex tw-justify-center tw-items-center tw-mt-16 md:tw-mt-0'>
      {resetPage === 'enter otp' && (
        <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-h-[505px] tw-flex tw-flex-col tw-gap-2 tw-pt-6'>
          <div className='tw-font-bold tw-text-2xl  md:tw-text-4xl'>Verification Code</div>
          {otpExpired ? (
            <div className='tw-text-sm tw-mb-2 tw-ml-2 tw-text-red-500'>OTP code has expired.</div>
          ) : error ? (
            <p className='tw-text-sm tw-ml-2'>{error}</p>
          ) : (
            <div className='tw-text-sm tw-mb-2 tw-ml-2'>Time Remaining: {formatTime()}</div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOtpVerification();
            }}
          >
            <div className='tw-flex tw-flex-col tw-gap-6'>
              <input className={getInputStyle()} type='text' value={otp} onChange={(e) => setOtp(e.target.value)} placeholder='Enter Code' required disabled={otpExpired} />{' '}
              {error && <p className='tw-text-sm'>{error}</p>}
              <button type='submit' className='btn-yellow tw-w-full' disabled={otpExpired}>
                Verify Code
              </button>
            </div>
          </form>
        </div>
      )}

      {resetPage === 'reset password' && (
        <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-h-[505px] tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
          <div className='tw-font-bold tw-text-2xl md:tw-text-4xl'>Reset Password</div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordReset();
            }}
          >
            <div className='tw-flex tw-flex-col tw-gap-6'>
              <input
                className='tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-w-full'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='New Password'
                required
              />
              <input
                className='tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-w-full'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm New Password'
                required
              />
              <button type='submit' className='btn-yellow tw-w-full tw-mt-4'>
                Reset Password
              </button>
            </div>
            {error && <p>{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default PasswordResetFlow;
