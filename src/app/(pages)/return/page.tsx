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
      <div className="w-1/2 mt-24 flex justify-center items-center">
        <div className=" bg-sky-950 w-1/2 p-4 gap-2 rounded-md flex flex-col justify-center items-center">
          <p className="">Thank you for your purchase!</p>
          <p>
            A receipt with your transaction ID has been emailed to:
            {stripeSession.customer_details?.email}.
          </p>
        </div>
      </div>
    );
  }

  try {
    const stripeInvoiceId = stripeSession.invoice as string;
    const stripeInvoice = await getInvoice(stripeInvoiceId);

    if (stripeSession?.status === "open") {
      return (
        <div className="w-full mt-24 flex justify-center items-center">
          <div className=" bg-sky-950 w-1/2 p-4 gap-2 rounded-md flex flex-col justify-center items-center">
            <p className="">Payment failed!</p>
          </div>
        </div>
      );
    }

    if (stripeSession?.status === "complete") {
      return (
        <div className="w-full mt-24 flex justify-center items-center">
          <div className=" bg-sky-950 w-1/2 p-4 gap-2 rounded-md flex flex-col justify-center items-center">
            <p className="">Thank you for your purchase!</p>
            <p>Total Amount Purchased: ${stripeInvoice.amount_paid / 100}</p>
            <p>
              View Receipt{" "}
              <a
                className="underline"
                href={stripeInvoice.hosted_invoice_url ?? ""}
                target="blank"
              >
                Here
              </a>
            </p>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error("Failed to retrieve invoice:", error);
  }

  return null;
}
