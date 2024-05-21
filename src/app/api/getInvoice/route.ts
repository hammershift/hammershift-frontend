// pages/api/getInvoice.js

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const invoiceId = searchParams.get("invoiceId");

    if (!customerId || !invoiceId) {
      return NextResponse.json(
        { error: "Missing customerId or invoiceId" },
        { status: 400 }
      );
    }

    const invoice = await stripe.invoices.retrieve(invoiceId);

    if (invoice.customer !== customerId) {
      return NextResponse.json(
        { error: "Invoice does not belong to the customer" },
        { status: 403 }
      );
    }

    return NextResponse.json(invoice, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to retrieve invoice" },
      { status: 500 }
    );
  }
}
