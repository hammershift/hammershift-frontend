"use client";

import { useEffect, useState } from "react";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error("Failed to retrieve session:", error);
    throw error;
  }
}

async function getInvoice(invoiceId: string) {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return invoice;
  } catch (error) {
    console.error("Failed to retrieve invoice:", error);
    throw error;
  }
}

export default function CheckoutReturn({ searchParams }: any) {
  const stripeSessionId = searchParams.session_id;
  const [isLoading, setIsLoading] = useState(true);
  const [stripeSession, setStripeSession] =
    useState<Stripe.Checkout.Session | null>(null);
  const [stripeInvoice, setStripeInvoice] = useState<Stripe.Invoice | null>(
    null
  );

  useEffect(() => {
    const fetchSessionAndInvoice = async () => {
      try {
        const session = await getSession(stripeSessionId);
        setStripeSession(session);

        if (session && session.invoice) {
          const invoice = await getInvoice(session.invoice as string);
          setStripeInvoice(invoice);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching session or invoice:", error);
        setIsLoading(false);
      }
    };

    fetchSessionAndInvoice();
  }, [stripeSessionId]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!stripeSession || !stripeSession.invoice) {
    return <p>No invoice found.</p>;
  }

  if (stripeSession.status === "open") {
    return <p>Payment did not work. Please try again.</p>;
  }

  if (stripeSession.status === "complete") {
    return (
      <div className="section-container">
        <p className="tw">Thank you for your purchase!</p>
        <p>
          We appreciate your business. Your Stripe customer ID is:{" "}
          {stripeSession.customer as string}.
        </p>
        <p>
          View Receipt Here:
          <a
            href={stripeInvoice?.hosted_invoice_url ?? ""}
            target="_blank"
            rel="noopener noreferrer"
          >
            Stripe Receipt
          </a>
        </p>
      </div>
    );
  }

  return null;
}
