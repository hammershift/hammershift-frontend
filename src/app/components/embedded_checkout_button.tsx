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
    console.log('client secret', clientSecret);
    console.log('client id', clientId);
    return clientSecret;
  }, [priceId, userId]);

  const options = { fetchClientSecret };

  const handleCheckoutClick = (priceId: string) => {
    console.log(selectedPriceId);
    setSelectedPriceId(priceId);
    setShowCheckout(true);
    modalRef.current?.showModal();
  };

  const handleCloseModal = () => {
    setShowCheckout(false);
    modalRef.current?.close();
  };

  return (
    <div id='checkout' className='my-4'>
      <button className='btn' onClick={() => handleCheckoutClick(priceId)}>
        Open Modal with Embedded Checkout
      </button>
      <dialog ref={modalRef} className='modal'>
        <div className='modal-box w-100 max-w-screen-2xl'>
          <h3 className='font-bold text-lg'>Embedded Checkout</h3>
          <div className='py-4'>
            {showCheckout && (
              <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>
          <div className='modal-action'>
            <form method='dialog'>
              <button className='btn' onClick={handleCloseModal}>
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
