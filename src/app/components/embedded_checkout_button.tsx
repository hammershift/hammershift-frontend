"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useCallback, useRef, useState } from "react";

export default function EmbeddedCheckoutButton(props: any) {
  const { priceId, userId } = props;
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );
  const [showCheckout, setShowCheckout] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  const fetchClientSecret = useCallback(async () => {
    // Create a Checkout Session
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId: priceId, userId: userId }),
    });
    const data = await res.json();
    const clientSecret = data.client_secret;
    const clientId = data.id;
    console.log("client secret", clientSecret);
    console.log("client id", clientId);
    return clientSecret;
  }, [priceId, userId]);

  const options = { fetchClientSecret };

  const handleCheckoutClick = (priceId: string) => {
    setSelectedPriceId(priceId);
    console.log("selected price ID: ", selectedPriceId);
    setShowCheckout(true);
    modalRef.current?.showModal();
  };

  const handleCloseModal = () => {
    setShowCheckout(false);
    modalRef.current?.close();
  };

  return (
    <div className="my-4 w-full text-center btn-yellow">
      <button onClick={() => handleCheckoutClick(priceId)}>Add Funds</button>
      {showCheckout && (
        <div className="backdrop" onClick={handleCloseModal}></div>
      )}
      <dialog ref={modalRef} className="top w-3/4 rounded-lg relative">
        <div className="max-w-screen-2xl">
          <div className="flex items-end justify-end">
            <button
              className="self-end px-3 text-red-500 font-bold text-xl"
              onClick={handleCloseModal}
            >
              x
            </button>
          </div>
          <div className="w-full">
            {showCheckout && (
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={options}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
