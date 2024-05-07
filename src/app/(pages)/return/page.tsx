import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId!);
  return session;
}

async function getInvoice(invoiceId: string) {
  const invoice = await stripe.invoices.retrieve(invoiceId);
  return invoice;
}

export default async function CheckoutReturn({ searchParams }: any) {
  const stripeSessionId = searchParams.session_id;
  const stripeSession = await getSession(stripeSessionId);

  // Ensure stripeSession.invoice is not null before proceeding
  if (!stripeSession.invoice) {
    console.error("Stripe session does not have an invoice.");
    return <p>Payment did not work.</p>; // Or return a different UI message
  }

  // Assert that stripeSession.invoice is a string
  const stripeInvoiceId = stripeSession.invoice as string;
  const stripeInvoice = await getInvoice(stripeInvoiceId);

  console.log(stripeSession);

  if (stripeSession?.status === 'open') {
    return <p>Payment did not work.</p>;
  }

  if (stripeSession?.status === 'complete') {
    return (
      <div className="section-container">
        <p className="tw">Thank you for your purchase!</p>
        <p>
          We appreciate your business Your Stripe customer ID is:
          {stripeSession.customer as string}.
        </p>
        <p>
          View Receipt Here:
          <a href={stripeInvoice.hosted_invoice_url ?? ""} target="blank">
            Stripe Receipt
          </a>
        </p>
      </div>
    );
  }

  return null;
}
