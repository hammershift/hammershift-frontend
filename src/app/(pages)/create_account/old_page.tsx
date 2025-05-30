'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import PasswordInput from '@/app/components/password_input';
import { Country, ICountry, IState, State } from 'country-state-city';
import { getSession, signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Onfido from '../../../../public/images/onfido.svg';
import Passport from '../../../../public/images/passport.svg';
import IDCard from '../../../../public/images/single-neutral-id-card-1.svg';
import SingleNeutral from '../../../../public/images/single-neutral-id-card-3.svg';
import AppleSocial from '../../../../public/images/social-apple-logo.svg';
import FacebookSocial from '../../../../public/images/social-facebook-logo.svg';
import GoogleSocial from '../../../../public/images/social-google-logo.svg';
import TwitterSocial from '../../../../public/images/social-twitter-logo.svg';
import UserImage from '../../../../public/images/user-single-neutral-male--close-geometric-human-person-single-up-user-male.svg';
import CancelIcon from '../../../../public/images/x-icon.svg';

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
  const [facebookSignInError, setFacebookSignInError] = useState<string | null>(null); // test
  const [twitterSignInError, setTwitterSignInError] = useState<string | null>(null); // test

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
      const isNewUser = session.user.isNewUser;
      const emailExists = session.user.emailExists;

      console.log('Session user data:', session.user);
      console.log('Email Exists:', emailExists);
      console.log('Is New User:', isNewUser);

      if (provider === 'credentials' && !emailExistsError) {
        console.log('Credentials provider and no email error. Redirecting to account setup.');
        setCreateAccountPage('page two');
        return;
      }

      if (provider === 'google' || provider === 'facebook' || provider === 'twitter') {
        console.log(`Provider: ${provider}`);
        if (emailExists && !isNewUser) {
          console.log('User already exists. Redirecting to home.');
          setIsLoading(true);
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else if (isNewUser) {
          console.log('User is new. Redirecting to account setup.');
          setCreateAccountPage('page two');
        } else {
          console.log('Email does not exist. Proceeding to account setup.');
          setCreateAccountPage('page two');
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

  // const handleInputChange = (field: keyof UserDetails, value: string) => {
  //   setUserDetails({ ...userDetails, [field]: value });
  //   setTouchedFields({ ...touchedFields, [field]: value });

  //   switch (field) {
  //     case 'email':
  //       setEmailExistsError(false);
  //       setValidity({
  //         ...validity,
  //         isEmailValid: validateEmail(value),
  //       });
  //       if (validateEmail(value)) {
  //         checkUserExistence('email', value);
  //       }
  //       break;
  //     case 'password':
  //       setValidity({
  //         ...validity,
  //         isPasswordValid: validatePassword(value),
  //       });
  //       break;
  //     case 'fullName':
  //       setValidity({
  //         ...validity,
  //         isFullNameValid: validateFullName(value),
  //       });
  //       break;
  //     case 'username':
  //       setValidity({
  //         ...validity,
  //         isUsernameValid: validateUsername(value),
  //       });
  //       if (validateUsername(value)) {
  //         checkUserExistence('username', value);
  //       }
  //       break;
  //     case 'country':
  //       setValidity({
  //         ...validity,
  //         isCountryValid: isCountrySelected(value),
  //       });
  //       break;
  //     case 'state':
  //       setValidity({
  //         ...validity,
  //         isStateValid: isStateSelected(value),
  //       });
  //       break;
  //   }
  // };

  const handleInputChange = (field: keyof UserDetails, value: string) => {
    let updatedValue = value;

    // force email and password to be lowercase
    if (field === 'email') {
      updatedValue = value.toLowerCase();
    }

    setUserDetails({ ...userDetails, [field]: updatedValue });
    setTouchedFields({ ...touchedFields, [field]: true });

    switch (field) {
      case 'email':
        setEmailExistsError(false);
        setValidity({
          ...validity,
          isEmailValid: validateEmail(updatedValue),
        });
        if (validateEmail(updatedValue)) {
          checkUserExistence('email', updatedValue);
        }
        break;
      case 'password':
        setValidity({
          ...validity,
          isPasswordValid: validatePassword(updatedValue),
        });
        break;
      case 'fullName':
        setValidity({
          ...validity,
          isFullNameValid: validateFullName(updatedValue),
        });
        break;
      case 'username':
        setValidity({
          ...validity,
          isUsernameValid: validateUsername(updatedValue),
        });
        if (validateUsername(updatedValue)) {
          checkUserExistence('username', updatedValue);
        }
        break;
      case 'country':
        setValidity({
          ...validity,
          isCountryValid: isCountrySelected(updatedValue),
        });
        break;
      case 'state':
        setValidity({
          ...validity,
          isStateValid: isStateSelected(updatedValue),
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
    setSubmitClicked(true); // ignore

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

  // TWITTER SIGNIN
  const handleTwitterSignIn = async () => {
    console.log('Twitter sign-in initiated');
    setIsLoading(true);
    setTwitterSignInError(null);

    try {
      const result = await signIn('twitter', { redirect: false });
      console.log('Twitter sign-in result:', result);

      if (result?.error) {
        console.error('Twitter sign-in error:', result.error);
        setTwitterSignInError(result.error);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // test delay

        const session = await getSession();
        console.log('Session after Twitter sign-in:', session);

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
            setTwitterSignInError('An account with this email already exists. Redirecting to login page...');
            setTimeout(() => {
              router.push('/login_page');
            }, 2000);
          } else {
            console.log('Email does not exist. Proceeding to account setup.');
            setCreateAccountPage('page two');
          }
        } else {
          console.error('No email found in session after Twitter sign-in');
          setTwitterSignInError('Failed to retrieve account details. Please try again.');
        }
      }
    } catch (error) {
      console.error('An unexpected error occurred during Twitter sign-in:', error);
      setTwitterSignInError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onTwitterSignInClick = () => {
    setUserDetails({ ...userDetails, provider: 'twitter' }); // set provider to twitter
    handleTwitterSignIn();
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
    <div className='w-screen md:h-screen top-0 z-[-1] flex justify-center items-center mt-16 md:mt-0'>
      {isLoading ? (
        <div className='flex justify-center items-center h-full'>
          <BounceLoader color='#696969' loading={isLoading} />
        </div>
      ) : (
        <>
          {createAccountPage === 'page one' && !isSignedInWithGoogle && (
            <div className='w-screen md:w-[640px] px-6 h-[505px] flex flex-col gap-8 pt-6'>
              <div>
                <div className='flex justify-between md:justify-start'>
                  <div className='font-bold text-2xl md:text-4xl'>Create Account</div>
                  <Image onClick={() => router.push('/')} src={CancelIcon} width={20} height={20} alt='' className='w-[20px] h-[20px] sm:hidden' />
                </div>
                <div className='mt-1'>
                  Already a member?
                  <Link href={'/login_page'} className='text-[#F2CA16] ml-2 underline'>
                    Login Here
                  </Link>
                </div>
              </div>
              <div className='flex flex-col gap-6 text-sm'>
                <div className='flex flex-col gap-2'>
                  <label>Email</label>
                  <input
                    id='email'
                    type='email'
                    className='py-2.5 px-3 bg-[#172431]'
                    placeholder='you@email.com'
                    value={userDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => checkUserExistence('email', userDetails.email)}
                  />
                  {googleSignInError && <p className='text-red-500'>{googleSignInError}</p>}
                  {facebookSignInError && <p className='text-red-500'>{facebookSignInError}</p>}
                  {twitterSignInError && <p className='text-red-500'>{twitterSignInError}</p>}
                  {emailExistsError && (
                    <div className='text-red-500'>
                      An account with this email already exists. <span className='text-white'>Redirecting to login page...</span>
                    </div>
                  )}

                  {!submitClicked && touchedFields.email && !uniqueFields.isEmailUnique && <div className='text-sm text-red-500'>✕ Email is already in use</div>}
                  {touchedFields.email && uniqueFields.isEmailUnique && validity.isEmailValid && <div className='text-sm text-green-500'>✔</div>}
                  {touchedFields.email && !validity.isEmailValid && <div className='text-sm text-red-500'>✕ Invalid Email</div>}
                </div>

                <div className='flex flex-col gap-2'>
                  <label htmlFor='password'>Password</label>
                  <PasswordInput value={userDetails.password} onChange={(value) => handleInputChange('password', value)} />
                  <div className={touchedFields.password && !validity.isPasswordValid ? 'text-sm text-red-500' : 'text-sm text-green-500'}>
                    {touchedFields.password && (validity.isPasswordValid ? '✔' : '✕ Password must be at least 8 characters')}
                  </div>
                </div>
                <button className='btn-yellow' onClick={handleAccountCreation}>
                  CREATE ACCOUNT
                </button>
              </div>
              <div className='w-full grid grid-cols-4 gap-2 clickable-icon'>
                {!isSignedInWithGoogle && (
                  <div onClick={onGoogleSignInClick} className='bg-white flex justify-center items-center rounded h-[48px]'>
                    <Image src={GoogleSocial} width={24} height={24} alt='google logo' className='w-6 h-6' />
                  </div>
                )}
                {!isSignedInWithGoogle && (
                  <div onClick={onFacebookSignInClick} className='bg-[#1877F2] flex justify-center items-center rounded h-[48px]'>
                    <Image src={FacebookSocial} width={24} height={24} alt='facebook logo' className='w-6 h-6' />
                  </div>
                )}
                <div className='bg-white flex justify-center items-center rounded h-[48px] opacity-30 disabled cursor-default'>
                  <Image src={AppleSocial} width={24} height={24} alt='apple logo' className='w-6 h-6' />
                </div>
                <div onClick={onTwitterSignInClick} className='bg-[#1DA1F2] flex justify-center items-center rounded h-[48px]'>
                  <Image src={TwitterSocial} width={24} height={24} alt='twitter logo' className='w-6 h-6' />
                </div>
              </div>

              <div className='text-center opacity-50'>{'By creating an account, you agree to HammerShift’s Privacy Policy and Terms of Use.'}</div>
            </div>
          )}
          {createAccountPage === 'page two' && (
            <div className='w-screen md:w-[640px] px-6 flex flex-col gap-8 pt-6'>
              <div className='font-bold text-4xl sm:text-[44px]'>Setup your profile</div>
              <div className='flex flex-col sm:flex-row gap-6'>
                {/* Profile picture */}
                <div className='bg-[#F2CA16] rounded-full w-[120px] h-[120px] flex justify-center items-center'>
                  <Image src={UserImage} width={52} height={52} alt='user profile' className='w-[52px] h-[52px]' />
                </div>
                {/* Full Name */}
                <div className='flex flex-col justify-center gap-2 grow'>
                  <label>Full Name *</label>
                  <input
                    className='py-2.5 px-3 bg-[#172431]'
                    placeholder='full name'
                    value={userDetails.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                  <div className={touchedFields.fullName && !validity.isFullNameValid ? 'text-sm text-red-500' : 'text-sm text-green-500'}>
                    {touchedFields.fullName && (validity.isFullNameValid ? '✔' : '✕ Full Name is required')}
                  </div>
                </div>
              </div>
              {/* Username */}
              <div className='flex flex-col justify-center gap-2'>
                <label>Username *</label>
                <input
                  className='py-2.5 px-3 bg-[#172431]'
                  value={userDetails.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  onBlur={() => checkUserExistence('username', userDetails.username)}
                />
                {touchedFields.username && !uniqueFields.isUsernameUnique && <div className='text-sm text-red-500'>Username is already taken</div>}
                {touchedFields.username && validity.isUsernameValid && uniqueFields.isUsernameUnique && <div className='text-sm text-green-500'>✔ Username is available</div>}
                {touchedFields.username && !validity.isUsernameValid && <div className='text-sm text-red-500'>✕ Must be at least 3 characters</div>}
              </div>

              {/* Country and State Selection */}
              <div className='grid grid-cols-2 gap-5'>
                {/* Country */}
                <div className='flex flex-col gap-2'>
                  <label>Country *</label>
                  <select className='py-2.5 px-3 bg-[#172431]' value={selectedCountry?.isoCode || ''} onChange={(e) => handleCountrySelect(e.target.value)}>
                    <option value=''>Select Country</option>
                    {countries.map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {touchedFields.country && !validity.isCountryValid && <div className='text-sm text-red-500'>✕ Country is required</div>}
                  {touchedFields.country && validity.isCountryValid && <div className='text-sm text-green-500'>✔</div>}{' '}
                </div>
                {/* State */}
                <div className='flex flex-col gap-2'>
                  <label>State *</label>
                  <select
                    className='py-2.5 px-3 bg-[#172431]'
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
                  {touchedFields.state && !validity.isStateValid && <div className='text-sm text-red-500'>✕ State is required</div>}
                  {touchedFields.state && validity.isStateValid && <div className='text-sm text-green-500'>✔</div>}{' '}
                </div>
              </div>

              {/* About Me */}
              <div className='flex flex-col justify-center gap-2'>
                <label>About Me</label>
                <textarea
                  className='py-2.5 px-3 bg-[#172431]'
                  placeholder='Tell the community about yourself'
                  rows={8}
                  value={userDetails.aboutMe}
                  onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                />
              </div>
              {/* Buttons */}
              <div className='flex flex-col gap-2'>
                <button className='cursor-auto btn-yellow disabled opacity-40' onClick={handleProfileSubmission}>
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
            <div className='w-screen md:w-[640px] px-6 flex flex-col gap-8 pt-6'>
              <div>
                <div className='font-bold text-4xl sm:text-[44px] py-1'>Select document to upload</div>
                <div>We need your identification. Data is processed securely.</div>
              </div>
              <div className='flex gap-2 items-center'>
                <span>Powered by</span>
                <Image src={Onfido} width={107} height={24} alt='user profile' className='w-[107px] h-[24px]' />
              </div>
              <div className='grid gap-4'>
                <div className='flex justify-between bg-[#172431] p-4 items-center'>
                  <div className='flex items-center gap-4  rounded'>
                    <div className='w-14 h-14 bg-[#184C80] rounded flex justify-center items-center'>
                      <Image src={SingleNeutral} width={36} height={36} alt='user profile' className='w-[36px] h-[36px]' />
                    </div>
                    <div>{"Driver's License"}</div>
                  </div>
                  <input
                    type='radio'
                    className='relative peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-white/10 bg-white/5 transition-opacity checked:border-[#F2CA16] checked:bg-[#F2CA16]'
                    value='All'
                  />
                </div>
                <div className='flex justify-between bg-[#172431] p-4 items-center'>
                  <div className='flex items-center gap-4  rounded'>
                    <div className='w-14 h-14 bg-[#184C80] rounded flex justify-center items-center'>
                      <Image src={Passport} width={36} height={36} alt='user profile' className='w-[36px] h-[36px]' />
                    </div>
                    <div>Passport</div>
                  </div>
                  <input
                    type='radio'
                    className='relative peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-white/10 bg-white/5 transition-opacity checked:border-[#F2CA16] checked:bg-[#F2CA16]'
                    value='All'
                  />
                </div>
                <div className='flex justify-between bg-[#172431] p-4 items-center'>
                  <div className='flex items-center gap-4  rounded'>
                    <div className='w-14 h-14 bg-[#184C80] rounded flex justify-center items-center'>
                      <Image src={IDCard} width={36} height={36} alt='user profile' className='w-[36px] h-[36px]' />
                    </div>
                    <div>Identity Card</div>
                  </div>
                  <input
                    type='radio'
                    className='relative peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-white/10 bg-white/5 transition-opacity checked:border-[#F2CA16] checked:bg-[#F2CA16]'
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
