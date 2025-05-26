"use client";

// import React, { useCallback } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// export default function PaymentPage() {
//   const fetchClientSecret = useCallback(async () => {
//     const res = await fetch('/api/payment', {
//       method: 'POST',
//     });
//     if (!res.ok) {
//       throw new Error('Network response was not ok');
//     }
//     const data = await res.json();
//     return data.sessionId;
//   }, []);

//   const options = { fetchClientSecret };
//   console.log(fetchClientSecret());

//   return (
//     <div id='checkout'>
//       <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
//         <EmbeddedCheckout />
//       </EmbeddedCheckoutProvider>
//     </div>
//   );
// }
export default function PaymentPage() {
  return <div>PaymentPage</div>;
}
