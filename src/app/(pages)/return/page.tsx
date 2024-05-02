import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId!);
  return session;
}

export default async function CheckoutReturn({ searchParams }: any) {
  const stripeSessionId = searchParams.session_id;
  const stripeSession = await getSession(stripeSessionId);

  console.log(stripeSession);

  if (stripeSession?.status === "open") {
    return <p>Payment did not work.</p>;
  }

  if (stripeSession?.status === "complete") {
    return (
      <h3>
        We appreciate your business! Your Stripe customer ID is:
        {stripeSession.customer as string}.
      </h3>
    );
  }

  return null;
}
