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

type createAccountPageProps = 'page one' | 'page two' | 'page three';

interface UserDetails {
  email: string;
  password: string;
  fullName: string;
  username: string;
  country: string;
  state: string;
  aboutMe: string;
  provider: string;
}

interface ValidityState {
  isEmailValid: boolean;
  isPasswordValid: boolean;
  isFullNameValid: boolean;
  isUsernameValid: boolean;
  isCountryValid: boolean;
  isStateValid: boolean;
}

interface UserExistenceResponse {
  emailExists: boolean;
  usernameExists: boolean;
}

interface UniqueFieldsState {
  isEmailUnique: boolean;
  isUsernameUnique: boolean;
}

const CreateAccount = () => {
  const [createAccountPage, setCreateAccountPage] = useState<createAccountPageProps>('page one');
  const [userDetails, setUserDetails] = useState<UserDetails>({
    email: '',
    password: '',
    fullName: '',
    username: '',
    country: '',
    state: '',
    aboutMe: '',
    provider: 'credentials', // default to credentials
  });
  const [validity, setValidity] = useState<ValidityState>({
    isEmailValid: true,
    isPasswordValid: true,
    isFullNameValid: true,
    isUsernameValid: true,
    isCountryValid: true,
    isStateValid: true,
  });
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
    fullName: false,
    username: false,
    country: false,
    state: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedState, setSelectedState] = useState<IState | null>(null);
  const [emailExistsError, setEmailExistsError] = useState(false);
  const [uniqueFields, setUniqueFields] = useState<UniqueFieldsState>({
    isEmailUnique: true,
    isUsernameUnique: true,
  });
  const [submitClicked, setSubmitClicked] = useState(false);
  const [isSignedInWithGoogle, setIsSignedInWithGoogle] = useState(false);
  const [googleSignInError, setGoogleSignInError] = useState<string | null>(null);
  const [facebookSignInError, setFacebookSignInError] = useState<string | null>(null); //test

  // session and routing
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchCountries = () => {
      setCountries(Country.getAllCountries());
    };

    const handleSession = async () => {
      if (!session || !session.user) {
        console.log('No session user found or session user is invalid.');
        return;
      }

      const provider = session.user.provider;
      console.log('Session user data:', session.user);

      if (provider === 'credentials' && !emailExistsError) {
        console.log('Credentials provider and no email error. Redirecting to account setup.');
        setCreateAccountPage('page two');
        return;
      }

      if (provider === 'google' || provider === 'facebook') {
        console.log(`Provider: ${provider}`);
        if (session.user.isNewUser) {
          console.log('User is new. Redirecting to account setup.');
          setCreateAccountPage('page two');
        } else {
          console.log('User is not new. Redirecting to home.');
          setIsLoading(true);
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }
        return;
      }

      console.log('Unhandled provider type or condition.');
    };

    const checkSession = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500)); // test delay
      await handleSession();
    };

    fetchCountries();
    checkSession();
  }, [session, emailExistsError, router]);

  const validateEmail = (email: string): boolean => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
  const validatePassword = (password: string): boolean => password.trim().length >= 8;
  const validateFullName = (fullName: string): boolean => fullName.trim().length > 0;
  const validateUsername = (username: string): boolean => username.trim().length >= 3;
  const isCountrySelected = (country: string): boolean => country !== '';
  const isStateSelected = (state: string): boolean => state !== '';

  const handleInputChange = (field: keyof UserDetails, value: string) => {
    setUserDetails({ ...userDetails, [field]: value });
    setTouchedFields({ ...touchedFields, [field]: value });

    switch (field) {
      case 'email':
        setEmailExistsError(false);
        setValidity({
          ...validity,
          isEmailValid: validateEmail(value),
        });
        if (validateEmail(value)) {
          checkUserExistence('email', value);
        }
        break;
      case 'password':
        setValidity({
          ...validity,
          isPasswordValid: validatePassword(value),
        });
        break;
      case 'fullName':
        setValidity({
          ...validity,
          isFullNameValid: validateFullName(value),
        });
        break;
      case 'username':
        setValidity({
          ...validity,
          isUsernameValid: validateUsername(value),
        });
        if (validateUsername(value)) {
          checkUserExistence('username', value);
        }
        break;
      case 'country':
        setValidity({
          ...validity,
          isCountryValid: isCountrySelected(value),
        });
        break;
      case 'state':
        setValidity({
          ...validity,
          isStateValid: isStateSelected(value),
        });
        break;
    }
  };

  const checkUserExistence = async (field: 'email' | 'username', value: string) => {
    try {
      const response = await fetch('/api/checkUserExistence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: UserExistenceResponse = await response.json();
      setUniqueFields((prevState) => ({
        ...prevState,
        ...(field === 'email' && { isEmailUnique: !data.emailExists }),
        ...(field === 'username' && {
          isUsernameUnique: !data.usernameExists,
        }),
      }));
    } catch (error) {
      console.error('Error during user existence check:', error);
    }
  };

  // COUNTRY AND STATE
  const handleCountrySelect = (countryCode: string) => {
    const selected = Country.getCountryByCode(countryCode);
    if (selected) {
      setSelectedCountry(selected);
      setStates(State.getStatesOfCountry(selected.isoCode));
      handleInputChange('country', selected.name);
    }
  };

  const handleStateSelect = (stateCode: string) => {
    if (selectedCountry) {
      const selected = State.getStateByCodeAndCountry(stateCode, selectedCountry.isoCode);
      if (selected) {
        setSelectedState(selected);
        handleInputChange('state', selected.name);
      }
    }
  };

  // ACCOUNT CREATION
  const handleAccountCreation = async () => {
    setSubmitClicked(true); // ignore this

    if (!validity.isEmailValid || !validity.isPasswordValid) {
      console.error('Invalid email or password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userDetails.email,
          password: userDetails.password,
          provider: userDetails.provider,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Registration failed:', data.message);
        if (data.message === 'User already exists') {
          setEmailExistsError(true);
          setTimeout(() => {
            router.push('/login_page');
          }, 2000);
        }
        return;
      }

      console.log('Registration successful:', await response.json());
      const signInResponse = await signIn('credentials', {
        redirect: false,
        email: userDetails.email,
        password: userDetails.password,
      });

      if (signInResponse?.error) {
        console.error('Sign-in failed:', signInResponse.error);
        return;
      }

      setCreateAccountPage('page two');
    } catch (error) {
      console.error('Error during account creation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // PROFILE SUBMISSION
  const handleProfileSubmission = async () => {
    const { isFullNameValid, isUsernameValid, isCountryValid, isStateValid } = validity;

    if (!isFullNameValid || !isUsernameValid || !isCountryValid || !isStateValid) {
      console.error('Profile information is invalid');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        fullName: userDetails.fullName,
        username: userDetails.username,
        country: userDetails.country,
        state: userDetails.state,
        aboutMe: userDetails.aboutMe,
      };

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
        await getSession();
        handleVerifyLater();
      } else {
        console.error('Error updating profile:', data.message);
      }
    } catch (error) {
      console.error('Error during profile submission:', error);
    }

    setIsLoading(false);
  };

  // GOOGLE SIGNIN
  const handleGoogleSignIn = async () => {
    console.log('Google sign-in initiated');
    setIsLoading(true);
    setGoogleSignInError(null);

    try {
      const result = await signIn('google', { redirect: false });
      console.log('Google sign-in result:', result);

      if (result?.error) {
        console.error('Google sign-in error:', result.error);
        setGoogleSignInError(result.error);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // test delay

        const session = await getSession();
        console.log('Session after Google sign-in:', session);

        if (session?.user?.email) {
          const response = await fetch('/api/checkUserExistence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session.user.email }),
          });

          const data = await response.json();
          console.log('User existence check response:', data);

          if (data.emailExists) {
            console.log('Email already exists. Redirecting to login page.');
            setEmailExistsError(true);
            setGoogleSignInError('An account with this email already exists. Redirecting to login page...');
            setTimeout(() => {
              router.push('/login_page');
            }, 2000);
          } else {
            console.log('Email does not exist. Proceeding to account setup.');
            setCreateAccountPage('page two');
          }
        } else {
          console.error('No email found in session after Google sign-in');
          setGoogleSignInError('Failed to retrieve account details. Please try again.');
        }
      }
    } catch (error) {
      console.error('An unexpected error occurred during Google sign-in:', error);
      setGoogleSignInError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSignInClick = () => {
    setUserDetails({ ...userDetails, provider: 'google' }); // set provider to google
    handleGoogleSignIn();
  };

  // FACEBOOK SIGN-IN
  const handleFacebookSignIn = async () => {
    console.log('Facebook sign-in initiated');
    setIsLoading(true);
    setFacebookSignInError(null);

    try {
      const result = await signIn('facebook', { redirect: false });
      console.log('Facebook sign-in result:', result);

      if (result?.error) {
        console.error('Facebook sign-in error:', result.error);
        setFacebookSignInError(result.error);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // test delay

        const session = await getSession();
        console.log('Session after Facebook sign-in:', session);

        if (session?.user?.email) {
          const response = await fetch('/api/checkUserExistence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: session.user.email }),
          });

          const data = await response.json();
          console.log('User existence check response:', data);

          if (data.emailExists) {
            console.log('Email already exists. Redirecting to login page.');
            setEmailExistsError(true);
            setTimeout(() => {
              router.push('/login_page');
            }, 2000);
          } else {
            console.log('Email does not exist. Proceeding to account setup.');
            setCreateAccountPage('page two');
          }
        } else {
          console.error('No email found in session after Facebook sign-in');
          // setFacebookSignInError('Failed to retrieve account details. Please try again.');
        }
      }
    } catch (error) {
      console.error('An unexpected error occurred during Facebook sign-in:', error);
      setFacebookSignInError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onFacebookSignInClick = () => {
    setUserDetails({ ...userDetails, provider: 'facebook' }); // set provider to facebook
    handleFacebookSignIn();
  };

  // VERIFY LATER
  const handleVerifyLater = async () => {
    console.log('handleVerifyLater called');

    setTouchedFields({
      email: true,
      password: true,
      fullName: true,
      username: true,
      country: true,
      state: true,
    });

    const provider = session?.user?.provider || 'credentials';

    const emailToValidate = userDetails.email || session?.user?.email || '';
    const passwordToValidate = userDetails.password || '';

    console.log('Email to validate:', emailToValidate);
    console.log('Password to validate:', passwordToValidate);

    const newValidity = {
      isEmailValid: validateEmail(emailToValidate),
      isPasswordValid: provider === 'credentials' ? validatePassword(passwordToValidate) : true,
      isFullNameValid: validateFullName(userDetails.fullName),
      isUsernameValid: validateUsername(userDetails.username),
      isCountryValid: isCountrySelected(userDetails.country),
      isStateValid: isStateSelected(userDetails.state),
    };

    console.log('New validity state:', newValidity);
    setValidity(newValidity);

    if (
      !newValidity.isEmailValid ||
      !newValidity.isPasswordValid ||
      !newValidity.isFullNameValid ||
      !newValidity.isUsernameValid ||
      !newValidity.isCountryValid ||
      !newValidity.isStateValid
    ) {
      console.error('Profile information is invalid');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/userInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: userDetails.fullName,
          username: userDetails.username,
          country: userDetails.country,
          state: userDetails.state,
          aboutMe: userDetails.aboutMe,
        }),
      });

      const data = await response.json();
      console.log('Response from userInfo API:', data);

      if (response.ok) {
        console.log('Profile updated successfully:', data.message);
        await getSession();
        router.push('/');
      } else {
        console.error('Failed to update profile:', data.message);
      }
    } catch (error) {
      console.error('Error during profile update:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='tw-w-screen md:tw-h-screen tw-absolute tw-top-0 tw-z-[-1] tw-flex tw-justify-center tw-items-center tw-mt-16 md:tw-mt-0'>
      {isLoading ? (
        <div className='tw-flex tw-justify-center tw-items-center tw-h-full'>
          <BounceLoader color='#696969' loading={isLoading} />
        </div>
      ) : (
        <>
          {createAccountPage === 'page one' && !isSignedInWithGoogle && (
            <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-h-[505px] tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
              <div>
                <div className='tw-flex tw-justify-between md:tw-justify-start'>
                  <div className='tw-font-bold tw-text-2xl md:tw-text-4xl'>Create Account</div>
                  <Image onClick={() => router.push('/')} src={CancelIcon} width={20} height={20} alt='' className='tw-w-[20px] tw-h-[20px] sm:tw-hidden' />
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
                  <input
                    id='email'
                    type='email'
                    className='tw-py-2.5 tw-px-3 tw-bg-[#172431]'
                    placeholder='you@email.com'
                    value={userDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => checkUserExistence('email', userDetails.email)}
                  />
                  {googleSignInError && <p className='tw-text-red-500'>{googleSignInError}</p>}
                  {facebookSignInError && <p className='tw-text-red-500'>{facebookSignInError}</p>}
                  {emailExistsError && (
                    <div className='text-red-500'>
                      An account with this email already exists. <span className='tw-text-white'>Redirecting to login page...</span>
                    </div>
                  )}

                  {!submitClicked && touchedFields.email && !uniqueFields.isEmailUnique && <div className='tw-text-sm tw-text-red-500'>✕ Email is already in use</div>}
                  {touchedFields.email && uniqueFields.isEmailUnique && validity.isEmailValid && <div className='tw-text-sm tw-text-green-500'>✔</div>}
                  {touchedFields.email && !validity.isEmailValid && <div className='tw-text-sm tw-text-red-500'>✕ Invalid Email</div>}
                </div>

                <div className='tw-flex tw-flex-col tw-gap-2'>
                  <label htmlFor='password'>Password</label>
                  <PasswordInput value={userDetails.password} onChange={(value) => handleInputChange('password', value)} />
                  <div className={touchedFields.password && !validity.isPasswordValid ? 'tw-text-sm tw-text-red-500' : 'tw-text-sm tw-text-green-500'}>
                    {touchedFields.password && (validity.isPasswordValid ? '✔' : '✕ Password must be at least 8 characters')}
                  </div>
                </div>
                <button className='btn-yellow' onClick={handleAccountCreation}>
                  CREATE ACCOUNT
                </button>
              </div>
              <div className='tw-w-full tw-grid tw-grid-cols-4 tw-gap-2 clickable-icon'>
                {!isSignedInWithGoogle && (
                  <div onClick={onGoogleSignInClick} className='tw-bg-white tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                    <Image src={GoogleSocial} width={24} height={24} alt='google logo' className='tw-w-6 tw-h-6' />
                  </div>
                )}
                {!isSignedInWithGoogle && (
                  <div onClick={onFacebookSignInClick} className='tw-bg-[#1877F2] tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                    <Image src={FacebookSocial} width={24} height={24} alt='facebook logo' className='tw-w-6 tw-h-6' />
                  </div>
                )}
                <div className='tw-bg-white tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px] tw-opacity-30 tw-disabled tw-cursor-default'>
                  <Image src={AppleSocial} width={24} height={24} alt='apple logo' className='tw-w-6 tw-h-6' />
                </div>
                <div className='tw-bg-[#1DA1F2] tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px] tw-opacity-30 tw-disabled tw-cursor-default'>
                  <Image src={TwitterSocial} width={24} height={24} alt='twitter logo' className='tw-w-6 tw-h-6' />
                </div>
              </div>

              <div className='tw-text-center tw-opacity-50'>{'By creating an account, you agree to HammerShift’s Privacy Policy and Terms of Use.'}</div>
            </div>
          )}
          {createAccountPage === 'page two' && (
            <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
              <div className='tw-font-bold tw-text-4xl sm:tw-text-[44px]'>Setup your profile</div>
              <div className='tw-flex tw-flex-col sm:tw-flex-row tw-gap-6'>
                {/* Profile picture */}
                <div className='tw-bg-[#F2CA16] tw-rounded-full tw-w-[120px] tw-h-[120px] tw-flex tw-justify-center tw-items-center'>
                  <Image src={UserImage} width={52} height={52} alt='user profile' className='tw-w-[52px] tw-h-[52px]' />
                </div>
                {/* Full Name */}
                <div className='tw-flex tw-flex-col tw-justify-center tw-gap-2 tw-grow'>
                  <label>Full Name *</label>
                  <input
                    className='tw-py-2.5 tw-px-3 tw-bg-[#172431]'
                    placeholder='full name'
                    value={userDetails.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                  <div className={touchedFields.fullName && !validity.isFullNameValid ? 'tw-text-sm tw-text-red-500' : 'tw-text-sm tw-text-green-500'}>
                    {touchedFields.fullName && (validity.isFullNameValid ? '✔' : '✕ Full Name is required')}
                  </div>
                </div>
              </div>
              {/* Username */}
              <div className='tw-flex tw-flex-col tw-justify-center tw-gap-2'>
                <label>Username *</label>
                <input
                  className='tw-py-2.5 tw-px-3 tw-bg-[#172431]'
                  value={userDetails.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  onBlur={() => checkUserExistence('username', userDetails.username)}
                />
                {touchedFields.username && !uniqueFields.isUsernameUnique && <div className='tw-text-sm tw-text-red-500'>Username is already taken</div>}
                {touchedFields.username && validity.isUsernameValid && uniqueFields.isUsernameUnique && <div className='tw-text-sm tw-text-green-500'>✔ Username is available</div>}
                {touchedFields.username && !validity.isUsernameValid && <div className='tw-text-sm tw-text-red-500'>✕ Must be at least 3 characters</div>}
              </div>

              {/* Country and State Selection */}
              <div className='tw-grid tw-grid-cols-2 tw-gap-5'>
                {/* Country */}
                <div className='tw-flex tw-flex-col tw-gap-2'>
                  <label>Country *</label>
                  <select className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' value={selectedCountry?.isoCode || ''} onChange={(e) => handleCountrySelect(e.target.value)}>
                    <option value=''>Select Country</option>
                    {countries.map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {touchedFields.country && !validity.isCountryValid && <div className='tw-text-sm tw-text-red-500'>✕ Country is required</div>}
                  {touchedFields.country && validity.isCountryValid && <div className='tw-text-sm tw-text-green-500'>✔</div>}{' '}
                </div>
                {/* State */}
                <div className='tw-flex tw-flex-col tw-gap-2'>
                  <label>State *</label>
                  <select
                    className='tw-py-2.5 tw-px-3 tw-bg-[#172431]'
                    value={selectedState?.isoCode || ''}
                    onChange={(e) => handleStateSelect(e.target.value)}
                    disabled={!selectedCountry}
                  >
                    <option value=''>Select State</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  {touchedFields.state && !validity.isStateValid && <div className='tw-text-sm tw-text-red-500'>✕ State is required</div>}
                  {touchedFields.state && validity.isStateValid && <div className='tw-text-sm tw-text-green-500'>✔</div>}{' '}
                </div>
              </div>

              {/* About Me */}
              <div className='tw-flex tw-flex-col tw-justify-center tw-gap-2'>
                <label>About Me</label>
                <textarea
                  className='tw-py-2.5 tw-px-3 tw-bg-[#172431]'
                  placeholder='Tell the community about yourself'
                  rows={8}
                  value={userDetails.aboutMe}
                  onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                />
              </div>
              {/* Buttons */}
              <div className='tw-flex tw-flex-col tw-gap-2'>
                <button className='tw-cursor-auto btn-yellow tw-disabled tw-opacity-40' onClick={handleProfileSubmission}>
                  Proceed to Account Verification
                </button>
                <button className='btn-transparent-yellow' onClick={handleVerifyLater}>
                  Verify Later
                </button>
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
