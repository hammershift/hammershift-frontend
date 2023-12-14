'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import GoogleSocial from '../../../../public/images/social-google-logo.svg';
import FacebookSocial from '../../../../public/images/social-facebook-logo.svg';
import TwitterSocial from '../../../../public/images/social-twitter-logo.svg';
import AppleSocial from '../../../../public/images/social-apple-logo.svg';
import CancelIcon from '../../../../public/images/x-icon.svg';
import Onfido from '../../../../public/images/onfido.svg';
import SingleNeutral from '../../../../public/images/single-neutral-id-card-3.svg';
import UserImage from '../../../../public/images/user-single-neutral-male--close-geometric-human-person-single-up-user-male.svg';
import Passport from '../../../../public/images/passport.svg';
import IDCard from '../../../../public/images/single-neutral-id-card-1.svg';
import { signIn, useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ICountry, IState, Country, State } from 'country-state-city';
import PasswordInput from '@/app/components/password_input';

import { BounceLoader } from 'react-spinners';

const CreateAccount = () => {
  type createAccountPageProps = 'page one' | 'page two' | 'page three';
  const [createAccountPage, setCreateAccountPage] = useState<createAccountPageProps>('page one');

  // TEST
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [aboutMe, setAboutMe] = useState('');

  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [emailValidationMessage, setEmailValidationMessage] = useState<string>('');

  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [passwordValidationMessage, setPasswordValidationMessage] = useState<string>('');

  // for country and state selection
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedState, setSelectedState] = useState<IState | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [isFullNameValid, setIsFullNameValid] = useState(true);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isCountryValid, setIsCountryValid] = useState(true);
  const [isStateValid, setIsStateValid] = useState(true);

  // session and routing
  const { data: session } = useSession();
  const router = useRouter();

  // for component mounting, set countries
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // navigate to page two if session exists
  useEffect(() => {
    if (session) {
      setCreateAccountPage('page two');
    }
  }, [session]);

  // COUNTRY AND STATE
  const handleCountrySelect = (countryCode: string) => {
    const country = Country.getCountryByCode(countryCode);
    if (country) {
      setSelectedCountry(country);
      setStates(State.getStatesOfCountry(country.isoCode));
      setCountry(country.name);
    }
  };

  const handleStateSelect = (stateCode: string) => {
    if (selectedCountry) {
      const state = State.getStateByCodeAndCountry(stateCode, selectedCountry.isoCode);
      if (state) {
        setSelectedState(state);
        setState(state.name);
      }
    }
  };

  // EMAIL VALIDATION
  const handleEmailChange = (email: string) => {
    setEmail(email);
    if (email.length === 0) {
      setIsEmailValid(true);
      setEmailValidationMessage('');
    } else if (email.includes('@')) {
      setIsEmailValid(true);
      setEmailValidationMessage('✔');
    } else {
      setIsEmailValid(false);
      setEmailValidationMessage('Please enter a valid email address');
    }
  };

  // PASSWORD VALIDATION
  const handlePasswordChange = (password: string) => {
    setPassword(password);
    if (password.length === 0) {
      setIsPasswordValid(true);
      setPasswordValidationMessage('');
    } else if (password.length >= 8) {
      setIsPasswordValid(true);
      setPasswordValidationMessage('✔');
    } else {
      setIsPasswordValid(false);
      setPasswordValidationMessage('Password must be at least 8 characters long');
    }
  };

  // ACCOUNT CREATION
  const handleAccountCreation = async () => {
    if (!isPasswordValid) {
      console.error('Invalid password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful:', data.message);
        const signInResponse = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (signInResponse?.error) {
          console.error('Sign-in failed:', signInResponse.error);
        } else {
          setCreateAccountPage('page two');
        }
      } else {
        console.error('Registration failed:', data.message);
      }
    } catch (error) {
      console.error('Error during account creation:', error);
    }

    setIsLoading(false);
  };

  // PROFILE SUBMISSION
  const handleProfileSubmission = async () => {
    let isValid = true;

    if (!fullName) {
      setIsFullNameValid(false);
      isValid = false;
    }

    if (!username) {
      setIsUsernameValid(false);
      isValid = false;
    }

    if (!selectedCountry?.name) {
      setIsCountryValid(false);
      isValid = false;
    }

    if (!selectedState?.name) {
      setIsStateValid(false);
      isValid = false;
    }

    if (!isValid) {
      setIsLoading(false);
      return; // Stop further processing if validation fails
    }
    const profileData = { fullName, username, country: selectedCountry?.name, state: selectedState?.name, aboutMe };

    setIsLoading(true);

    try {
      const response = await fetch('/api/userInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Profile updated successfully:', data.message);
        // setCreateAccountPage('page three');
        await getSession();
        handleVerifyLater();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error during profile submission:', error);
    }

    setIsLoading(false);
  };

  // GOOGLE SIGNIN
  const handleGoogleSignIn = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: window.location.href });
    } catch (error) {
      console.error(`Error during ${provider} sign in:`, error);
    }
  };

  // VERIFY LATER
  const handleVerifyLater = async () => {
    let isValid = true;

    if (!fullName) {
      setIsFullNameValid(false);
      isValid = false;
    } else {
      setIsFullNameValid(true);
    }

    if (!username) {
      setIsUsernameValid(false);
      isValid = false;
    } else {
      setIsUsernameValid(true);
    }

    if (!selectedCountry?.name) {
      setIsCountryValid(false);
      isValid = false;
    } else {
      setIsCountryValid(true);
    }

    if (!selectedState?.name) {
      setIsStateValid(false);
      isValid = false;
    } else {
      setIsStateValid(true);
    }

    if (!isValid) {
      setIsLoading(false);
      return; // Stop further processing if validation fails
    }

    setIsLoading(true);

    const userData = { fullName, username, country, state, aboutMe };
    try {
      const response = await fetch('/api/userInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Profile updated successfully:', data.message);
        await getSession();

        setIsLoading(false);
        router.push('/');
      } else {
        console.error('Failed to update profile:', data.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error during profile update:', error);
      setIsLoading(false);
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
        <>
          {createAccountPage === 'page one' && (
            <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-h-[505px] tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
              <div>
                <div className='tw-flex tw-justify-between md:tw-justify-start'>
                  <div className='tw-font-bold tw-text-2xl md:tw-text-4xl'>Create Account</div>
                  <Image src={CancelIcon} width={20} height={20} alt='' className='tw-w-[20px] tw-h-[20px] sm:tw-hidden' />
                </div>
                <div className='tw-mt-1'>
                  Already a member?
                  <Link href={'/login_page'} className='tw-text-[#F2CA16] tw-ml-2 underline'>
                    Login Here
                  </Link>
                </div>
              </div>
              <div className='tw-flex tw-flex-col tw-gap-6 tw-text-sm'>
                <div className='tw-flex tw-flex-col tw-gap-2'>
                  <label>Email</label>
                  <input className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' placeholder='you@email.com' value={email} onChange={(e) => handleEmailChange(e.target.value)} />
                  <div className={isEmailValid ? 'tw-text-sm tw-text-green-500' : 'tw-text-sm tw-text-red-500'}>{emailValidationMessage}</div>
                </div>
                <div className='tw-flex tw-flex-col tw-gap-2'>
                  <label>Password</label>
                  <PasswordInput value={password} onChange={handlePasswordChange} />
                  <div className={isPasswordValid ? 'tw-text-sm tw-text-green-500' : 'tw-text-sm tw-text-red-500'}>{passwordValidationMessage}</div>{' '}
                </div>
                <button className='btn-yellow' onClick={handleAccountCreation}>
                  CREATE ACCOUNT
                </button>
              </div>
              <div className='tw-w-full tw-grid tw-grid-cols-4 tw-gap-2 clickable-icon'>
                <div onClick={() => handleGoogleSignIn('google')} className='tw-bg-white tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                  <Image src={GoogleSocial} width={24} height={24} alt='google logo' className='tw-w-6 tw-h-6' />
                </div>
                <div className='tw-bg-[#1877F2] tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                  <Image src={FacebookSocial} width={24} height={24} alt='facebook logo' className='tw-w-6 tw-h-6' />
                </div>
                <div className='tw-bg-white tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                  <Image src={AppleSocial} width={24} height={24} alt='apple logo' className='tw-w-6 tw-h-6' />
                </div>
                <div className='tw-bg-[#1DA1F2] tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                  <Image src={TwitterSocial} width={24} height={24} alt='twitter logo' className='tw-w-6 tw-h-6' />
                </div>
              </div>
              <div className='tw-text-center tw-opacity-50'>{'By creating an account, you agree to HammerShift’s Privacy Policy and Terms of Use.'}</div>
            </div>
          )}
          {createAccountPage === 'page two' && (
            // Setup your profile
            <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
              <div className='tw-font-bold tw-text-4xl sm:tw-text-[44px]'>Setup your profile</div>
              <div className='tw-flex tw-flex-col tw-gap-5'>
                {/* Profile picture and Full name */}
                <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-6'>
                  <div className='tw-bg-[#F2CA16] tw-rounded-full tw-w-[120px] tw-h-[120px] tw-flex tw-justify-center tw-items-center'>
                    <Image src={UserImage} width={52} height={52} alt='user profile' className='tw-w-[52px] tw-h-[52px]' />
                  </div>

                  {/* Full Name */}
                  <div className='tw-flex tw-flex-col tw-justify-center tw-gap-2 tw-grow'>
                    <label>Full Name *</label>
                    <input
                      className='tw-py-2.5 tw-px-3 tw-bg-[#172431]'
                      placeholder='full name'
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setIsFullNameValid(true);
                      }}
                    />
                    {!isFullNameValid && !fullName && <div className='tw-text-sm tw-text-red-500'>✕ Full Name is required</div>}
                    {isFullNameValid && fullName && <div className='tw-text-green-500'>✓</div>}
                  </div>
                </div>

                {/* Username */}
                <div className='tw-flex tw-flex-col tw-justify-center tw-gap-2 tw-grow'>
                  <label>Username *</label>
                  <input
                    className='tw-py-2.5 tw-px-3 tw-bg-[#172431]'
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setIsUsernameValid(true);
                    }}
                  />
                  {!isUsernameValid && !username && <div className='tw-text-sm tw-text-red-500'>✕ Username is required</div>}
                  {isUsernameValid && username && <div className='tw-text-green-500'>✓</div>}
                  <div className='tw-text-sm tw-opacity-40'>At least x characters with no special symbols</div>
                </div>

                {/* Country and State */}
                <div className='tw-grid tw-grid-cols-2 tw-gap-5'>
                  {/* Country */}
                  <div className='tw-flex tw-flex-col tw-gap-2 tw-grow'>
                    <label>Country *</label>
                    <select
                      className='tw-py-2.5 tw-px-3 tw-bg-[#172431]'
                      value={selectedCountry?.isoCode || ''}
                      onChange={(e) => {
                        handleCountrySelect(e.target.value);
                        setIsCountryValid(true);
                      }}
                    >
                      <option value=''>Select Country</option>
                      {countries.map((country) => (
                        <option key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    {!isCountryValid && <div className='tw-text-red-500'>✕ Country is required</div>}
                    {isCountryValid && selectedCountry && <div className='tw-text-green-500'>✓</div>}
                  </div>

                  {/* State */}
                  <div className='tw-flex tw-flex-col tw-gap-2 tw-grow'>
                    <label>State *</label>
                    <select
                      className='tw-py-2.5 tw-px-3 tw-bg-[#172431]'
                      value={selectedState?.isoCode || ''}
                      onChange={(e) => {
                        handleStateSelect(e.target.value);
                        setIsStateValid(true);
                      }}
                      disabled={!selectedCountry}
                    >
                      <option value=''>Select State</option>
                      {selectedCountry &&
                        states.map((state) => (
                          <option key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </option>
                        ))}
                    </select>
                    {!isStateValid && <div className='tw-text-red-500'>✕ State is required</div>}
                    {isStateValid && selectedState && <div className='tw-text-green-500'>✓</div>}
                  </div>
                </div>

                {/* About Me */}
                <div className='tw-flex tw-flex-col tw-justify-center tw-gap-2 tw-grow'>
                  <label>About Me</label>
                  <textarea
                    className='tw-py-2.5 tw-px-3 tw-bg-[#172431]'
                    placeholder='Tell the community about yourself'
                    rows={8}
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                  />
                </div>

                <div className='tw-flex tw-flex-col tw-gap-2'>
                  <button className='btn-yellow' onClick={handleProfileSubmission}>
                    Proceed to Account Verification
                  </button>
                  <button className='btn-transparent-yellow' onClick={handleVerifyLater}>
                    Verify Later
                  </button>
                </div>
              </div>
            </div>
          )}
          {createAccountPage === 'page three' && (
            //Account Verification
            // TODO: Integrate Onfido for user verification process
            <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
              <div>
                <div className='tw-font-bold tw-text-4xl sm:tw-text-[44px] tw-py-1'>Select document to upload</div>
                <div>We need your identification to lorem ipsum dolor sit amet. Data is processed securely.</div>
              </div>
              <div className='tw-flex tw-gap-2 tw-items-center'>
                <span>Powered by</span>
                <Image src={Onfido} width={107} height={24} alt='user profile' className='tw-w-[107px] tw-h-[24px]' />
              </div>
              <div className='tw-grid tw-gap-4'>
                <div className='tw-flex tw-justify-between tw-bg-[#172431] tw-p-4 tw-items-center'>
                  <div className='tw-flex tw-items-center tw-gap-4  tw-rounded'>
                    <div className='tw-w-14 tw-h-14 tw-bg-[#184C80] tw-rounded tw-flex tw-justify-center tw-items-center'>
                      <Image src={SingleNeutral} width={36} height={36} alt='user profile' className='tw-w-[36px] tw-h-[36px]' />
                    </div>
                    <div>{"Driver's License"}</div>
                  </div>
                  <input
                    type='radio'
                    className='tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-full tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]'
                    value='All'
                  />
                </div>
                <div className='tw-flex tw-justify-between tw-bg-[#172431] tw-p-4 tw-items-center'>
                  <div className='tw-flex tw-items-center tw-gap-4  tw-rounded'>
                    <div className='tw-w-14 tw-h-14 tw-bg-[#184C80] tw-rounded tw-flex tw-justify-center tw-items-center'>
                      <Image src={Passport} width={36} height={36} alt='user profile' className='tw-w-[36px] tw-h-[36px]' />
                    </div>
                    <div>Passport</div>
                  </div>
                  <input
                    type='radio'
                    className='tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-full tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]'
                    value='All'
                  />
                </div>
                <div className='tw-flex tw-justify-between tw-bg-[#172431] tw-p-4 tw-items-center'>
                  <div className='tw-flex tw-items-center tw-gap-4  tw-rounded'>
                    <div className='tw-w-14 tw-h-14 tw-bg-[#184C80] tw-rounded tw-flex tw-justify-center tw-items-center'>
                      <Image src={IDCard} width={36} height={36} alt='user profile' className='tw-w-[36px] tw-h-[36px]' />
                    </div>
                    <div>Identity Card</div>
                  </div>
                  <input
                    type='radio'
                    className='tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-full tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]'
                    value='All'
                  />
                </div>
              </div>
              <button className='btn-yellow'>Continue</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CreateAccount;
