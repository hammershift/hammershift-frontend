import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId!);
  return session;
}

async function getInvoice(invoiceId: string) {
  if (!invoiceId) {
    throw new Error("Invoice ID cannot be null");
  }
  const invoice = await stripe.invoices.retrieve(invoiceId);
  return invoice;
}

export default async function CheckoutReturn({ searchParams }: any) {
  const stripeSessionId = searchParams.session_id;
  const stripeSession = await getSession(stripeSessionId);

  if (!stripeSession.invoice || typeof stripeSession.invoice !== "string") {
    console.error("Stripe session does not have a valid invoice ID.");
    return (
      <div className="section-container tw-flex tw-flex-col tw-justify-center tw-items-center">
        <p className="tw">Thank you for your purchase!</p>
        <p className="tw">
          A receipt with your transaction ID has been emailed to{" "}
          {stripeSession.customer_details?.email}
        </p>
        <p className="tw">
          You can also refresh this page to view your receipt
        </p>
      </div>
    );
  }

  try {
    const stripeInvoiceId = stripeSession.invoice as string;
    const stripeInvoice = await getInvoice(stripeInvoiceId);

    if (stripeSession?.status === "open") {
      return (
        <div className="section-container tw-flex tw-flex-col tw-justify-center tw-items-center">
          <p className="tw">Payment Failed</p>
        </div>
      );
    }

    if (stripeSession?.status === "complete") {
      return (
        <div className="section-container tw-flex tw-flex-col tw-justify-center tw-items-center">
          <p className="tw">Thank you for your purchase!</p>
          <p>
            We appreciate your business Your Stripe customer ID is:{" "}
            {stripeSession.customer as string}.
          </p>
          <p>
            View Receipt Here:{" "}
            <a href={stripeInvoice.hosted_invoice_url ?? ""} target="blank">
              Stripe Receipt
            </a>
          </p>
        </div>
      );
    }
  } catch (error) {
    console.error("Failed to retrieve invoice:", error);
  }

  return null;
}
