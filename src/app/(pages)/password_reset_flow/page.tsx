'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordInput from '@/app/components/password_input';
import { BounceLoader } from 'react-spinners';

const PasswordResetFlow = () => {
  const [resetPage, setResetPage] = useState<'enter otp' | 'reset password'>('enter otp');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [timer, setTimer] = useState<number | null>(60);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const router = useRouter();

  // handle password matching
  const passwordMatch = newPassword === confirmPassword && newPassword !== '';

  // handle timer expiration
  const timerExpired = timer === 0;

  // handle OTP expiration
  const otpExpired = timerExpired && resetPage === 'enter otp';

  // handle OTP entry completion
  const otpEntryCompleted = resetPage === 'reset password' || otpExpired;

  // handle otp/code input validation
  const isOtpLengthValid = otp.length === 6;

  // format time remaining for display
  const formatTime = () => {
    const minutes = Math.floor((timer || 0) / 60);
    const seconds = (timer || 0) % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // common error handling function
  const handleCommonError = (error: string) => {
    console.error('Error:', error);
    setError('An error occurred.');
  };

  useEffect(() => {
    const startCountdown = (startTime: number) => {
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        const remainingTime = 60 - elapsedTime;

        if (remainingTime <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = undefined;
          setTimer(0);
        } else {
          setTimer(remainingTime);
        }
      }, 1000);
    };

    const handleNewProcess = () => {
      const newStartTime = Date.now();
      const newSessionId = newStartTime.toString();
      localStorage.setItem('timerStartTime', newSessionId);
      localStorage.setItem('passwordResetSessionId', newSessionId);
      setTimerStartTime(newStartTime);
      startCountdown(newStartTime);
    };

    const handleExistingProcess = (startTime: number) => {
      const currentTime = Date.now();
      const timeElapsed = currentTime - startTime;

      if (timeElapsed < 60000) {
        setTimerStartTime(startTime);
        startCountdown(startTime);
      } else {
        localStorage.removeItem('timerStartTime');
      }
    };

    // retrieve the email from localStorage
    const storedEmail = localStorage.getItem('passwordResetEmail');
    if (!storedEmail) {
      router.push('/login_page');
      return;
    }
    setEmail(storedEmail);

    // retrieve the session state (or flag) from localStorage
    const isNewProcess = localStorage.getItem('isNewPasswordResetProcess') === 'true';
    localStorage.removeItem('isNewPasswordResetProcess'); // clear the flag for a new process

    const storedStartTime = localStorage.getItem('timerStartTime');
    if (isNewProcess || !storedStartTime) {
      handleNewProcess();
    } else {
      handleExistingProcess(parseInt(storedStartTime, 10));
    }

    // Cleanup function to clear the interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [resetPage, otpExpired, otpEntryCompleted]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpExpired) {
      await handleResendOtp();
    } else {
      await handleOtpVerification();
    }
  };

  const handleOtpVerification = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/verifyOtpCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setResetPage('reset password');
        setError('');
      } else {
        setError('Invalid OTP. Please try again');
      }
    } catch (error: any) {
      handleCommonError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordMatch) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setTimeout(() => {
          router.push('/login_page');
        }, 1000);
      } else {
        setError(data.message);
      }
    } catch (error: any) {
      handleCommonError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch('/api/resendOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setTimer(60);
        // Store the current time as the timer start time
        setTimerStartTime(Date.now());
      } else {
        setError(data.message);
      }
    } catch (error: any) {
      handleCommonError(error);
    }
  };

  const getInputStyle = () => {
    let baseStyle = 'tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-w-full';
    let borderColorStyle = '';

    if (isOtpLengthValid) {
      borderColorStyle = 'tw-border-green-500';
    } else if (error) {
      borderColorStyle = 'tw-border-red-500';
    }

    return `${baseStyle} ${borderColorStyle}`;
  };

  return (
    <div className='tw-w-screen md:tw-h-screen tw-absolute tw-top-0 tw-z-[-1] tw-flex tw-justify-center tw-items-center tw-mt-16 md:tw-mt-0'>
      {/* Loading */}
      {isLoading ? (
        <div className='tw-flex tw-justify-center tw-items-center tw-h-full'>
          <BounceLoader color='#696969' loading={isLoading} />
        </div>
      ) : (
        <>
          {resetPage === 'enter otp' && (
            <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-h-[505px] tw-flex tw-flex-col tw-gap-2 tw-pt-6'>
              <div className='tw-font-bold tw-text-2xl md:tw-text-4xl'>Verification Code</div>
              {!otpExpired && <div className='tw-text-sm tw-mb-2 tw-ml-2'>Time Remaining: {formatTime()}</div>}
              <form onSubmit={handleAction}>
                <div className='tw-flex tw-flex-col tw-gap-6'>
                  <input
                    className={getInputStyle()}
                    type='text'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder='Enter Code'
                    required
                    disabled={otpExpired || isLoading}
                  />
                  {error && <p className='tw-text-sm tw-ml-2 tw-text-red-500'>{error}</p>}
                  <button type='submit' className='btn-yellow tw-w-full' disabled={isLoading}>
                    {isLoading ? <BounceLoader size={20} color='#ffffff' /> : otpExpired ? 'Resend Code' : 'Verify Code'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {resetPage === 'reset password' && (
            <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-h-[505px] tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
              <div className='tw-font-bold tw-text-2xl md:tw-text-4xl'>Reset Password</div>
              <form onSubmit={handlePasswordReset}>
                <div className='tw-flex tw-flex-col tw-gap-6'>
                  <PasswordInput value={newPassword} onChange={setNewPassword} />
                  <PasswordInput value={confirmPassword} onChange={setConfirmPassword} />
                  {passwordMatch && <p className='tw-text-green-500 tw-text-sm'>Passwords match!</p>}
                  {!passwordMatch && passwordError && <p className='tw-text-red-500 tw-text-sm'>{passwordError}</p>}
                  <button type='submit' className='btn-yellow tw-w-full' disabled={isLoading}>
                    {isLoading ? <BounceLoader size={20} color='#ffffff' /> : 'Reset Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PasswordResetFlow;
