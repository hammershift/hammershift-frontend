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
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/app/components/ui/input';

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
      const result = await signIn('email', {
        redirect: false,
        email: email,
        callbackUrl: '/',
        authorizationParams: {
          email: email
        }
      });

      if (!result?.error) {
        console.log('Login successful');
        router.push('/login_info');
        return;
      }

      if (result.error === 'Your account has been banned') {
        setError('Your account has been banned. Please contact support');
        return;
      }

      // for any other errors
      setError('Invalid credentials. Please try again');
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
    <div className='w-screen md:h-screen top-0 z-[-1] flex justify-center items-center mt-16 md:mt-0'>
      {/* Loading */}
      {isLoading ? (
        <div className='flex justify-center items-center h-full'>
          <BounceLoader color='#696969' loading={isLoading} />
        </div>
      ) : (
        <div className='w-screen md:w-[640px] px-6 h-[505px] flex flex-col gap-8 pt-6'>
          <div>
            <div className='flex justify-between md:justify-start'>
              <div className='font-bold text-2xl md:text-4xl'>Sign In</div>
              <Image onClick={() => router.push('/')} src={CancelIcon} width={20} height={20} alt='' className='w-[20px] h-[20px] sm:hidden' />
            </div>
            <div className='mt-1'>
              {"Don't have an account?"}
              <Link href={'/create_account'} className='text-[#F2CA16] ml-2 underline'>
                Create an account here
              </Link>
            </div>
          </div>
          <form method="POST">
            <div className='flex flex-col gap-6 text-sm'>
              <div className='flex flex-col gap-2'>
                <label>Email</label>
                <Input
                  className='py-2.5 px-3 bg-[#1E2A36] border-[#1E2A36]'
                  type="email"
                  placeholder='Enter email here'
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  name="email"
                  autoComplete="email"
                />
                {error && (
                  <Alert variant="destructive" className="mt-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <button onClick={handleSignIn} className='btn-yellow'>
                  Sign In
                </button>
              </div>
            </div>
          </form>
          {/* <div className='flex justify-between text-sm sm:text-base'>
            <div className='relative flex items-center gap-2'>
              <input
                type='checkbox'
                className='relative peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/10 bg-white/5 transition-opacity checked:border-[#F2CA16] checked:bg-[#F2CA16]'
                value='All'
              />
              <div className='pointer-events-none absolute top-3 left-[14px] -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100'>
                <Image src={CheckIcon} width={12} height={7} alt='dropdown arrow' className='w-[10px] h-[7px] mr-2' />
              </div>
              <label>Keep me logged in</label>
            </div>
            <button
              className='appearance-none text-[#F2CA16] underline'
              onClick={() => {
                setCreateAccountPage('reset password');
              }}
            >
              Forgot password
            </button>
          </div> */}

          {/* <div className='w-full grid grid-cols-4 gap-2 mt-8 clickable-icon'>
            <div onClick={() => handleGoogleSignIn('google')} className='bg-white flex justify-center items-center rounded h-[48px]'>
              <Image src={GoogleSocial} width={24} height={24} alt='google logo' className='w-6 h-6' />
            </div>
            <div onClick={() => handleFacebookSignIn('facebook')} className='bg-[#1877F2] flex justify-center items-center rounded h-[48px]'>
              <Image src={FacebookSocial} width={24} height={24} alt='facebook logo' className='w-6 h-6' />
            </div>
            <div
              className='bg-white flex justify-center items-center rounded h-[48px]
            cursor-auto opacity-30 disabled'
            >
              <Image src={AppleSocial} width={24} height={24} alt='apple logo' className='w-6 h-6' />
            </div>
            <div onClick={() => handleTwitterSignIn('twitter')} className='bg-[#1DA1F2] flex justify-center items-center rounded h-[48px]'>
              <Image src={TwitterSocial} width={24} height={24} alt='twitter logo' className='w-6 h-6' />
            </div>
          </div> */}
          <div className='text-center opacity-50'>{'By logging in, you agree to Velocity Market\'s Privacy Policy and Terms of Use.'}</div>
        </div>
      )}
      {/* {createAccountPage === 'reset password' && (
        <div className='w-screen md:w-[640px] px-6 h-[505px] flex flex-col gap-8 pt-6'>
          <div>
            <div className='flex justify-between md:justify-start'>
              <div className='font-bold text-2xl md:text-4xl'>Reset Password</div>
            </div>
            <div className='mt-1'>Enter your email to receive instructions on how to reset your password.</div>
          </div>
          <div className='flex flex-col gap-6 text-sm'>
            <div className='flex flex-col gap-2'>
              <label>Email</label>
              <input className='py-2.5 px-3 bg-[#172431]' placeholder='you@email.com' value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
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
              className='appearance-none text-[#F2CA16] ml-2 underline'
              onClick={() => {
                setCreateAccountPage('sign in');
              }}
            >
              Login
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default CreateAccount;
