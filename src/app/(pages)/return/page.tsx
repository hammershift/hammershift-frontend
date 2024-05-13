import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId!);
  return session;
}

async function getInvoice(invoiceId: string) {
  if (!invoiceId) {
    throw new Error('Invoice ID cannot be null');
  }
  const invoice = await stripe.invoices.retrieve(invoiceId);
  return invoice;
}

export default async function CheckoutReturn({ searchParams }: any) {
  const stripeSessionId = searchParams.session_id;
  const stripeSession = await getSession(stripeSessionId);

  if (!stripeSession.invoice || typeof stripeSession.invoice !== 'string') {
    console.error('Stripe session does not have a valid invoice ID.');
    return (
      <div className='tw-w-full tw-mt-24 tw-flex tw-justify-center tw-items-center'>
        <div className=' tw-bg-sky-950 tw-w-1/2 tw-p-4 tw-gap-2 tw-rounded-md tw-flex tw-flex-col tw-justify-center tw-items-center'>
          <p className=''>Thank you for your purchase!</p>
          <p>
            A receipt with your transaction ID has been emailed to:
            {stripeSession.customer_details?.email}.
          </p>
          <p>You may also refresh this page to view your receipt.</p>
        </div>
      </div>
    );
  }

  try {
    const stripeInvoiceId = stripeSession.invoice as string;
    const stripeInvoice = await getInvoice(stripeInvoiceId);

    if (stripeSession?.status === 'open') {
      return (
        <div className='tw-w-full tw-mt-24 tw-flex tw-justify-center tw-items-center'>
          <div className=' tw-bg-sky-950 tw-w-1/2 tw-p-4 tw-gap-2 tw-rounded-md tw-flex tw-flex-col tw-justify-center tw-items-center'>
            <p className=''>Payment failed!</p>
          </div>
        </div>
      );
    }

    if (stripeSession?.status === 'complete') {
      return (
        <div className='tw-w-full tw-mt-24 tw-flex tw-justify-center tw-items-center'>
          <div className=' tw-bg-sky-950 tw-w-1/2 tw-p-4 tw-gap-2 tw-rounded-md tw-flex tw-flex-col tw-justify-center tw-items-center'>
            <p className=''>Thank you for your purchase!</p>
            <p>We appreciate your business, your Stripe customer ID is: {stripeSession.customer as string}.</p>
            <p>
              View Receipt{' '}
              <a className='tw-underline' href={stripeInvoice.hosted_invoice_url ?? ''} target='blank'>
                Here
              </a>
            </p>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error('Failed to retrieve invoice:', error);
  }

  return null;
}
