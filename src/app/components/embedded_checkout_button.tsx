'use client';

import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useCallback, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function EmbeddedCheckoutButton(props: any) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  if (!userId) {
    console.log('User ID is undefined. Session:', session);
  }

  const { priceId } = props;
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  const [showCheckout, setShowCheckout] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  console.log('priceId at button click:', priceId);

  const fetchClientSecret = useCallback(async () => {
    console.log('Fetching with priceId:', priceId, 'and userId:', userId);

    // Create a Checkout Session
    const res = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId: priceId, userId: userId }),
    });

    const data = await res.json();
    const clientSecret = data.client_secret;
    const clientId = data.id;

    console.log('Client Secret: ', clientSecret);
    console.log('ClientID: ', clientId);

    return clientSecret;
  }, [priceId, userId]);

  const options = { fetchClientSecret };

  const handleCheckoutClick = (priceId: string) => {
    setSelectedPriceId(priceId);
    console.log('Selected priceID: ', selectedPriceId);
    setShowCheckout(true);
    modalRef.current?.showModal();
  };

  const handleCloseModal = () => {
    setShowCheckout(false);
    modalRef.current?.close();
  };

  return (
    <div className='tw-my-4'>
      <button className='btn-yellow tw-text-xs' onClick={() => handleCheckoutClick(priceId)}>
        Add Funds
      </button>
      {showCheckout && <div className='backdrop' onClick={handleCloseModal}></div>}
      <dialog ref={modalRef} className='top tw-w-3/4 tw-rounded-lg tw-relative tw-z-10'>
        <div className='tw-max-w-screen-2xl'>
          <div className='tw-flex tw-items-end tw-justify-end'>
            <button className='tw-self-end tw-px-3 tw-text-red-500 tw-font-bold tw-text-xl' onClick={handleCloseModal}>
              x
            </button>
          </div>
          <div className='tw-w-full'>
            {showCheckout && (
              <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
