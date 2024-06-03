'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BounceLoader } from 'react-spinners';
import { useSession } from 'next-auth/react';

const Authenticated: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (session && showLoader) {
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [session, showLoader, router]);

  return (
    <div className='tw-h-screen tw-flex tw-flex-col tw-items-center tw-justify-start tw-pt-16'>
      {showLoader ? (
        <div className='tw-flex tw-grow tw-items-center tw-justify-center'>
          <BounceLoader color='gray' />
        </div>
      ) : (
        <div className='tw-text-center'>
          <h1 className='tw-text-2xl tw-font-bold'>You are already logged in</h1>
          <p className='tw-text-muted-foreground tw-mt-2'>Redirecting you to homepage...</p>
        </div>
      )}
    </div>
  );
};

export default Authenticated;
