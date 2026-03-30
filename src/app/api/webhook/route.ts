import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import Transaction from "@/models/transaction";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature");
  const client = await clientPromise;
  const db = client.db();

  let stripeCustomerId;
  let amountPaid;
  let userId;

  try {
    let event = stripe.webhooks.constructEvent(
      payload,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("event", event.type);

    // Event handlers
    switch (event.type) {
      case "payment_intent.created":
        console.log("PaymentIntent was created.");
        break;

      case "payment_intent.succeeded":
        console.log("PaymentIntent succeeded.");
        // PaymentIntent succeeded but we wait for the invoice.payment_succeeded event to create the transaction
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        const invoiceId = invoice.id;
        const invoiceURL = invoice.hosted_invoice_url;

        stripeCustomerId = invoice.customer as string;
        amountPaid = invoice.amount_paid / 100;
        userId = invoice.metadata?.userId;

        let matchedUser = await db
          .collection("users")
          .findOne({ stripeCustomerId: stripeCustomerId });

        if (!matchedUser && userId) {
          // Fallback: look up user by metadata.userId carried on the invoice
          try {
            const { ObjectId } = await import("mongodb");
            matchedUser = await db
              .collection("users")
              .findOne({ _id: new ObjectId(userId) });
            if (matchedUser) {
              console.log(
                `invoice.payment_succeeded: resolved user via metadata.userId ${userId} (stripeCustomerId ${stripeCustomerId} not matched)`
              );
            }
          } catch (idErr) {
            console.error(
              `invoice.payment_succeeded: metadata.userId "${userId}" is not a valid ObjectId — cannot fall back`,
              idErr
            );
          }
        }

        if (!matchedUser) {
          console.error(
            `invoice.payment_succeeded: UNRESOLVED — no user found for stripeCustomerId "${stripeCustomerId}" and metadata.userId "${userId ?? "absent"}". Manual reconciliation required.`
          );
          break;
        }

        const updateUserBalance = await db
          .collection("users")
          .updateOne(
            { stripeCustomerId: stripeCustomerId },
            { $inc: { balance: amountPaid } }
          );
        console.log(
          `Updated user balance for ${stripeCustomerId}:`,
          updateUserBalance
        );

        const successfulDepositTransaction = new Transaction({
          userID: matchedUser._id,
          transactionType: "deposit",
          amount: amountPaid,
          type: "+",
          transactionDate: new Date(),
          invoice_id: invoiceId,
          invoice_url: invoiceURL,
          status: "success",
        });

        const createSuccessfulDepositTransaction = await db
          .collection("transactions")
          .insertOne(successfulDepositTransaction);
        console.log(
          `Created successful deposit transaction for user id: ${String(matchedUser._id)} with stripe ID: ${stripeCustomerId} and invoice ID: ${invoiceId}:`,
          createSuccessfulDepositTransaction
        );
        break;

      case "checkout.session.completed":
        const checkoutSession = event.data.object as Record<string, any>;
        const depositType = checkoutSession.metadata?.type;

        if (depositType === "usd_deposit") {
          const depositUserId = checkoutSession.metadata?.userId;
          const depositAmount = parseFloat(
            checkoutSession.metadata?.depositAmount ?? "0"
          );
          const checkoutSessionId = checkoutSession.id as string;

          if (!depositUserId || depositAmount <= 0) {
            console.error(
              `checkout.session.completed: missing userId or invalid amount. userId=${depositUserId}, amount=${depositAmount}`
            );
            break;
          }

          // Idempotency check
          const existingCheckoutTx = await db
            .collection("transactions")
            .findOne({ stripeSessionId: checkoutSessionId });

          if (existingCheckoutTx) {
            console.log(
              `checkout.session.completed: duplicate — transaction already recorded for sessionId=${checkoutSessionId}`
            );
            break;
          }

          // Credit user balance (USD)
          const { ObjectId: ObjId } = await import("mongodb");
          const depositBalanceUpdate = await db
            .collection("users")
            .updateOne(
              { _id: new ObjId(depositUserId) },
              { $inc: { balance: depositAmount } }
            );
          console.log(
            `checkout.session.completed: credited $${depositAmount} USD to user ${depositUserId}:`,
            depositBalanceUpdate
          );

          // Record transaction
          const depositTransaction = {
            userID: new ObjId(depositUserId),
            transactionType: "deposit",
            method: "stripe_checkout",
            amount: depositAmount,
            type: "+",
            transactionDate: new Date(),
            stripeSessionId: checkoutSessionId,
            status: "success",
          };

          const depositInsertResult = await db
            .collection("transactions")
            .insertOne(depositTransaction);
          console.log(
            `checkout.session.completed: recorded deposit transaction for user ${depositUserId}:`,
            depositInsertResult
          );
        } else {
          console.log(
            `checkout.session.completed: non-deposit session, ignoring`
          );
        }
        break;

      case "payment_intent.payment_failed":
        const paymentIntent = event.data.object;
        stripeCustomerId = paymentIntent.customer;
        amountPaid = paymentIntent.amount / 100;
        userId = paymentIntent.metadata?.userId;

        const failedDepositTransaction = new Transaction({
          userID: new mongoose.Types.ObjectId(userId),
          transactionType: "deposit",
          amount: amountPaid,
          type: "+",
          transactionDate: new Date(),
          status: "failed",
        });

        const createFailedDepositTransaction = await db
          .collection("transactions")
          .insertOne(failedDepositTransaction);
        console.log(
          `Created failed deposit transaction for user id: ${userId} with stripe ID: ${stripeCustomerId}:`,
          createFailedDepositTransaction
        );

        break;

      default:
        if ((event.type as string) === "crypto.onramp_session_updated") {
          const session = event.data.object as Record<string, any>;
          const status = session.status;

          if (status === "fulfillment_complete") {
            const txDetails = session.transaction_details ?? {};
            const usdcAmount = parseFloat(
              txDetails.destination_crypto_amount ?? "0"
            );
            const walletAddress =
              txDetails.wallet_address ??
              txDetails.wallet_addresses?.polygon ??
              null;
            const stripeSessionId = session.id as string;

            if (!walletAddress || usdcAmount <= 0) {
              console.error(
                `crypto.onramp_session_updated: missing wallet address or invalid amount. walletAddress=${walletAddress}, amount=${usdcAmount}`
              );
              break;
            }

            // Idempotency check
            const existingTx = await db
              .collection("transactions")
              .findOne({ stripeSessionId });

            if (existingTx) {
              console.log(
                `crypto.onramp_session_updated: duplicate — transaction already recorded for stripeSessionId=${stripeSessionId}`
              );
              break;
            }

            // Find user by embedded wallet address
            const onrampUser = await db
              .collection("users")
              .findOne({ embeddedWalletAddress: walletAddress });

            if (!onrampUser) {
              console.error(
                `crypto.onramp_session_updated: no user found for embeddedWalletAddress="${walletAddress}". Manual reconciliation required.`
              );
              break;
            }

            // Credit user balance
            const balanceUpdate = await db
              .collection("users")
              .updateOne(
                { _id: onrampUser._id },
                { $inc: { balance: usdcAmount } }
              );
            console.log(
              `crypto.onramp_session_updated: credited $${usdcAmount} to user ${String(onrampUser._id)}:`,
              balanceUpdate
            );

            // Record transaction
            const onrampTransaction = {
              userID: onrampUser._id,
              transactionType: "deposit",
              method: "stripe_onramp",
              amount: usdcAmount,
              type: "+",
              transactionDate: new Date(),
              stripeSessionId,
              status: "success",
            };

            const insertResult = await db
              .collection("transactions")
              .insertOne(onrampTransaction);
            console.log(
              `crypto.onramp_session_updated: recorded deposit transaction for user ${String(onrampUser._id)}, stripeSessionId=${stripeSessionId}:`,
              insertResult
            );
          } else {
            console.log(
              `crypto.onramp_session_updated: ignoring status="${status}"`
            );
          }
        } else {
          console.log(`Unhandled event type ${event.type}`);
        }
    }

    return NextResponse.json({ status: "Success", event: event.type });
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    return NextResponse.json({ status: "Failed", error: error });
  }
}
