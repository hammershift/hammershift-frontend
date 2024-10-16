'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import GoogleSocial from '../../../../public/images/social-google-logo.svg';
import FacebookSocial from '../../../../public/images/social-facebook-logo.svg';
import TwitterSocial from '../../../../public/images/social-twitter-logo.svg';
import AppleSocial from '../../../../public/images/social-apple-logo.svg';
import CancelIcon from '../../../../public/images/x-icon.svg';
import CheckIcon from '../../../../public/images/check-black.svg';
import Onfido from '../../../../public/images/onfido.svg';
import SingleNeutral from '../../../../public/images/single-neutral-id-card-3.svg';
import UserImage from '../../../../public/images/user-single-neutral-male--close-geometric-human-person-single-up-user-male.svg';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import PasswordInput from '@/app/components/password_input';
import { BounceLoader, PulseLoader } from 'react-spinners';

const CreateAccount = () => {
  type createAccountPageProps = 'sign in' | 'reset password';
  const [createAccountPage, setCreateAccountPage] = useState<createAccountPageProps>('sign in');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetPasswordLoading, setIsResetPasswordLoading] = useState(false);

  const router = useRouter();

  // Forgot/Reset Password
  const [resetEmail, setResetEmail] = useState('');

  const handleResetPassword = async () => {
    setIsResetPasswordLoading(true);
    try {
      const response = await fetch('/api/forgotPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsResetPasswordLoading(false);
        localStorage.setItem('passwordResetEmail', resetEmail); // store the email in local storage
        localStorage.setItem('isNewPasswordResetProcess', 'true'); // set the flag for password reset flow process
        router.push('/password_reset_flow');
      } else {
        setIsResetPasswordLoading(false);
        setError(data.message);
        console.log(data.message);
      }
    } catch (error) {
      console.error('Error during password reset request:', error);
      setError('An error occurred while processing the password reset request.');
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signIn('credentials', {
        redirect: false,
        email: email,
        password: password,
      });

      console.log('signIn result:', result);

      if (!result?.error) {
        console.log('Login successful');
        router.push('/');
        return;
      }

      if (result.error === 'Your account has been banned') {
        setError('✕ Your account has been banned. Please contact support');
        return;
      }

      // for any other errors
      setError('✕ Invalid credentials. Please try again');
    } catch (error) {
      console.error('An unexpected error occurred during login:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // for Google signin
  const handleGoogleSignIn = async (provider: string) => {
    try {
      const result = await signIn(provider, { callbackUrl: '/' });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error(`Error during ${provider} sign in:`, error);
    }
  };

  // for Facebook sign-in
  const handleFacebookSignIn = async (provider: string) => {
    try {
      const result = await signIn('facebook', { callbackUrl: '/' });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error during Facebook sign in:', error);
    }
  };

  // for Twitter sign-in
  const handleTwitterSignIn = async (provider: string) => {
    try {
      const result = await signIn('twitter', { callbackUrl: '/' });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error during Twitter sign in:', error);
    }
  };

  return (
    <div className='tw-w-screen md:tw-h-screen tw-absolute tw-top-0 tw-z-[-1] tw-flex tw-justify-center tw-items-center tw-mt-16 md:tw-mt-0'>
      {/* Loading */}
      {isLoading ? (
        <div className='tw-flex tw-justify-center tw-items-center tw-h-full'>
          <BounceLoader color='#696969' loading={isLoading} />
        </div>
      ) : (
        <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-h-[505px] tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
          <div>
            <div className='tw-flex tw-justify-between md:tw-justify-start'>
              <div className='tw-font-bold tw-text-2xl md:tw-text-4xl'>Sign In</div>
              <Image onClick={() => router.push('/')} src={CancelIcon} width={20} height={20} alt='' className='tw-w-[20px] tw-h-[20px] sm:tw-hidden' />
            </div>
            <div className='tw-mt-1'>
              {"Don't have an account?"}
              <Link href={'/create_account'} className='tw-text-[#F2CA16] tw-ml-2 underline'>
                Create an account here
              </Link>
            </div>
          </div>
          <div className='tw-flex tw-flex-col tw-gap-6 tw-text-sm'>
            <div className='tw-flex tw-flex-col tw-gap-2'>
              <label>Email</label>
              <input className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' placeholder='you@email.com' value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} />
              {error && <div className='tw-text-sm tw-text-red-500'>{error}</div>}
            </div>
            <div className='tw-flex tw-flex-col tw-gap-2'>
              <label>Password</label>
              <PasswordInput value={password} onChange={setPassword} />
            </div>
          </div>
          <div className='tw-flex tw-justify-between tw-text-sm sm:tw-text-base'>
            <div className='tw-relative tw-flex tw-items-center tw-gap-2'>
              <input
                type='checkbox'
                className='tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-md tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]'
                value='All'
              />
              <div className='tw-pointer-events-none tw-absolute tw-top-3 tw-left-[14px] tw--translate-y-2/4 tw--translate-x-2/4 tw-text-white tw-opacity-0 tw-transition-opacity peer-checked:tw-opacity-100'>
                <Image src={CheckIcon} width={12} height={7} alt='dropdown arrow' className='tw-w-[10px] tw-h-[7px] tw-mr-2' />
              </div>
              <label>Keep me logged in</label>
            </div>
            <button
              className='tw-appearance-none tw-text-[#F2CA16] underline'
              onClick={() => {
                setCreateAccountPage('reset password');
              }}
            >
              Forgot password
            </button>
          </div>
          <button onClick={handleSignIn} className='btn-yellow'>
            Sign In
          </button>

          <div className='tw-w-full tw-grid tw-grid-cols-4 tw-gap-2 tw-mt-8 clickable-icon'>
            <div onClick={() => handleGoogleSignIn('google')} className='tw-bg-white tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
              <Image src={GoogleSocial} width={24} height={24} alt='google logo' className='tw-w-6 tw-h-6' />
            </div>
            <div onClick={() => handleFacebookSignIn('facebook')} className='tw-bg-[#1877F2] tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
              <Image src={FacebookSocial} width={24} height={24} alt='facebook logo' className='tw-w-6 tw-h-6' />
            </div>
            <div
              className='tw-bg-white tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]
            tw-cursor-auto tw-opacity-30 tw-disabled'
            >
              <Image src={AppleSocial} width={24} height={24} alt='apple logo' className='tw-w-6 tw-h-6' />
            </div>
            <div onClick={() => handleTwitterSignIn('twitter')} className='tw-bg-[#1DA1F2] tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
              <Image src={TwitterSocial} width={24} height={24} alt='twitter logo' className='tw-w-6 tw-h-6' />
            </div>
          </div>
          <div className='tw-text-center tw-opacity-50'>{'By logging in, you agree to HammerShift’s Privacy Policy and Terms of Use.'}</div>
        </div>
      )}
      {createAccountPage === 'reset password' && (
        <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-h-[505px] tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
          <div>
            <div className='tw-flex tw-justify-between md:tw-justify-start'>
              <div className='tw-font-bold tw-text-2xl md:tw-text-4xl'>Reset Password</div>
            </div>
            <div className='tw-mt-1'>Enter your email to receive instructions on how to reset your password.</div>
          </div>
          <div className='tw-flex tw-flex-col tw-gap-6 tw-text-sm'>
            <div className='tw-flex tw-flex-col tw-gap-2'>
              <label>Email</label>
              <input className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' placeholder='you@email.com' value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
            </div>
          </div>
          {isResetPasswordLoading ? (
            <button className='btn-yellow'>
              <PulseLoader color='#000000' size={8} />
            </button>
          ) : (
            <button type='submit' className='btn-yellow' onClick={handleResetPassword}>
              RESET
            </button>
          )}
          <div>
            Or return to
            <button
              className='tw-appearance-none tw-text-[#F2CA16] tw-ml-2 underline'
              onClick={() => {
                setCreateAccountPage('sign in');
              }}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAccount;
