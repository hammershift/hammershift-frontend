import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId!);
  return session;
}

export default async function CheckoutReturn({ searchParams }: any) {
  const sessionId = searchParams.session_id;
  const session = await getSession(sessionId);

  console.log(session);

<<<<<<< HEAD
  if (session?.status === 'open') {
    return <p>Payment did not work.</p>;
=======
  if (session?.status === "open") {
    return <p>Payment failed.</p>;
>>>>>>> 56c3f1b77ad65aaaea3e0a8171afae1c6f119e7d
  }

  if (session?.status === 'complete') {
    return (
<<<<<<< HEAD
      <h3>
        We appreciate your business! Your Stripe customer ID is:
        {session.customer as string}.
      </h3>
=======
      <div className="section-container">
        <h3>
          Payment succeeded! Your Stripe customer ID is:
          {session.customer as string}.
        </h3>
      </div>
>>>>>>> 56c3f1b77ad65aaaea3e0a8171afae1c6f119e7d
    );
  }

  return null;
}
