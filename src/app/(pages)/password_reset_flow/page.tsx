'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordInput from '@/app/components/password_input';

const PasswordResetFlow = () => {
  type ResetPageProps = 'enter otp' | 'reset password';

  const [resetPage, setResetPage] = useState<ResetPageProps>('enter otp');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [timer, setTimer] = useState(60);
  const [otpExpired, setOtpExpired] = useState(false);
  const [otpVerificationSuccess, setOtpVerificationSuccess] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [isOtpLengthValid, setIsOtpLengthValid] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    setIsOtpLengthValid(otp.length === 6);
  }, [otp]);

  useEffect(() => {
    if (newPassword && confirmPassword) {
      if (newPassword === confirmPassword) {
        setPasswordMatch(true);
        setPasswordError('');
      } else {
        setPasswordMatch(false);
        setPasswordError('Passwords do not match');
      }
    } else {
      setPasswordMatch(false);
      setPasswordError('');
    }
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('passwordResetEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.push('/login_page');
      return;
    }

    clearInterval(intervalRef.current);

    if (otpExpired) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          setOtpExpired(true);
          clearInterval(intervalRef.current);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      if (otpExpired) {
        localStorage.removeItem('passwordResetEmail');
      }
    };
  }, [otpExpired]);

  const handleAction = async (e: any) => {
    e.preventDefault();
    if (otpExpired) {
      await handleResendOtp();
    } else {
      await handleOtpVerification();
    }
  };

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
        setOtpSuccessMessage('Verified');
        setError('');
        setOtpVerificationSuccess(true);
      } else {
        setError('Invalid OTP. Please try again');
        setOtpVerificationSuccess(false);
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      setError('An error occurred while verifying the OTP code.');
      setOtpVerificationSuccess(false);
    }
  };

  const handlePasswordReset = async (e: any) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    // Proceed only if passwords match
    setPasswordError('');
    try {
      const response = await fetch('/api/resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setPasswordSuccessMessage('Password reset successfully');
        setTimeout(() => {
          router.push('/login_page');
        }, 1000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      setError('An error occurred while resetting the password.');
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
        setOtpExpired(false);
        setError('');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error during OTP resend:', error);
      setError('An error occurred while resending the OTP code.');
    }
  };

  const getInputStyle = () => {
    let baseStyle = 'tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-w-full';
    let borderColorStyle = '';

    if (otp.length === 6) {
      borderColorStyle = 'tw-border-green-500';
    } else if (error) {
      borderColorStyle = 'tw-border-red-500';
    } else {
      borderColorStyle = '';
    }

    return `${baseStyle} ${borderColorStyle}`;
  };

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className='tw-w-screen md:tw-h-screen tw-absolute tw-top-0 tw-z-[-1] tw-flex tw-justify-center tw-items-center tw-mt-16 md:tw-mt-0'>
      {resetPage === 'enter otp' && (
        <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-h-[505px] tw-flex tw-flex-col tw-gap-2 tw-pt-6'>
          <div className='tw-font-bold tw-text-2xl md:tw-text-4xl'>Verification Code</div>
          {!otpExpired && <div className='tw-text-sm tw-mb-2 tw-ml-2'>Time Remaining: {formatTime()}</div>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction(e);
            }}
          >
            <div className='tw-flex tw-flex-col tw-gap-6'>
              <input className={getInputStyle()} type='text' value={otp} onChange={(e) => setOtp(e.target.value)} placeholder='Enter Code' required disabled={otpExpired} />
              {error && <p className='tw-text-sm tw-ml-2 tw-text-red-500'>{error}</p>}
              <button type='submit' className='btn-yellow tw-w-full'>
                {otpExpired ? 'Resend Code' : 'Verify Code'}
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
              handlePasswordReset(e);
            }}
          >
            <div className='tw-flex tw-flex-col tw-gap-6'>
              <PasswordInput value={newPassword} onChange={setNewPassword} />
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} />
              {passwordMatch && <p className='tw-text-green-500'>Passwords match!</p>}
              {!passwordMatch && passwordError && <p className='tw-text-red-500 tw-text-sm'>{passwordError}</p>}
              <button type='submit' className='btn-yellow tw-w-full '>
                Reset Password
              </button>
            </div>
            {error && <p className='tw-text-red-500 tw-text-sm'>{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default PasswordResetFlow;
