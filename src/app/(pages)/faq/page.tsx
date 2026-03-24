import React from "react";
import { Card } from "@/app/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#0A0A1A]">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-[#E94560] text-sm font-mono font-semibold tracking-widest uppercase mb-3">
            Support
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h1>
        </div>

        {/* ── General ─────────────────────────────────────────────── */}
        <Card className="bg-[#16181f] border-white/[0.08] mb-6">
          <div className="p-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-4">
              General
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <Item value="g-1" q="What is Velocity Markets?">
                Velocity Markets is a prediction market platform for car
                auctions. We turn every Bring a Trailer auction into a
                tradeable market where you predict whether a car will sell
                above or below an AI-generated price line.
              </Item>
              <Item value="g-2" q="Is this gambling?">
                Velocity Markets is a skill-based prediction platform. Your
                success depends on your knowledge of cars, auction history,
                and market trends — not on chance. Every market is tied to a
                real-world event (a BaT auction) with a verifiable outcome.
              </Item>
              <Item value="g-3" q="Do I need an account?">
                Yes. Creating an account takes about 30 seconds with Google
                or email. You need an account to trade, track your positions,
                and withdraw winnings. You must be 18 or older to use the
                platform, and 21 or older in jurisdictions that require it.
              </Item>
              <Item value="g-4" q="How is the opening price set?">
                Our AI pricing engine analyzes thousands of completed BaT
                auction results to find comparable sales for each car. It
                then uses Claude AI to factor in mileage, condition, trim,
                modifications, and market trends to generate a predicted
                sale price. That price becomes the over/under line for the
                market. After that, crowd trading moves the price.
              </Item>
            </Accordion>
          </div>
        </Card>

        {/* ── Trading ─────────────────────────────────────────────── */}
        <Card className="bg-[#16181f] border-white/[0.08] mb-6">
          <div className="p-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-4">
              Trading
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <Item value="t-1" q="How do I place a trade?">
                Go to any live market, pick YES (car sells above the line)
                or NO (car sells below), enter your dollar amount, and
                confirm. You&apos;ll see exactly how many shares you&apos;ll
                receive and your potential payout before confirming.
              </Item>
              <Item value="t-2" q="What do YES and NO prices mean?">
                YES and NO prices always add up to $1.00. A YES price of
                $0.65 means the crowd thinks there&apos;s a 65% chance the
                car sells above the line. A NO price of $0.35 means a 35%
                chance it sells below. If you disagree with the crowd,
                that&apos;s your trading opportunity.
              </Item>
              <Item value="t-3" q="How much can I win?">
                Winning shares resolve at $1.00 each. If you buy YES shares
                at $0.30, each share returns $1.00 — a 233% return. The
                cheaper the shares when you buy, the higher the potential
                return. Your maximum loss is the amount you trade.
              </Item>
              <Item value="t-4" q="What is slippage?">
                Slippage is the price movement caused by your trade. Small
                trades have minimal slippage. Large trades relative to the
                market&apos;s liquidity will move the price more, meaning
                you&apos;ll get slightly fewer shares than the displayed
                price suggests. The trade confirmation screen shows you the
                exact impact before you commit.
              </Item>
              <Item value="t-5" q="Is there a minimum or maximum trade?">
                Minimum trade is $1.00. Maximum trade is $10,000 per
                position. These limits protect both you and market integrity.
              </Item>
            </Accordion>
          </div>
        </Card>

        {/* ── Settlement ──────────────────────────────────────────── */}
        <Card className="bg-[#16181f] border-white/[0.08] mb-6">
          <div className="p-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-4">
              Settlement &amp; Payouts
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <Item value="s-1" q="How are markets settled?">
                When a Bring a Trailer auction ends, the final hammer price
                is recorded. If the car sold above the predicted line, YES
                wins. If it sold below, NO wins. Settlement happens
                automatically — no action required from you.
              </Item>
              <Item value="s-2" q="Where does the payout money come from?">
                Winners are paid exclusively from real money deposited by
                traders. Losers&apos; deposits fund the winners. The
                platform never pays from its own funds and never creates
                money that doesn&apos;t exist. Real dollars in, real dollars
                out.
              </Item>
              <Item value="s-3" q="What if there aren't enough people on the losing side?">
                If a market doesn&apos;t have enough activity on both sides
                to fully pay winners, every participant is automatically
                refunded their original trade amount. Nobody wins, nobody
                loses. You always either win, lose your trade amount, or
                get a full refund — never anything in between.
              </Item>
              <Item value="s-4" q="How long does settlement take?">
                Markets are settled within minutes of the BaT auction
                ending. Winnings are credited to your wallet immediately
                after settlement. You&apos;ll receive an email notification
                with the result.
              </Item>
            </Accordion>
          </div>
        </Card>

        {/* ── Fees & Payments ─────────────────────────────────────── */}
        <Card className="bg-[#16181f] border-white/[0.08] mb-6">
          <div className="p-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest mb-4">
              Fees &amp; Payments
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <Item value="f-1" q="What fees does Velocity Markets charge?">
                <span className="font-mono text-white">2%</span> trading fee
                when you place a trade, and{" "}
                <span className="font-mono text-white">2%</span> settlement
                fee on winnings. Total platform rake is up to{" "}
                <span className="font-mono text-[#FFB547]">4%</span> per
                round trip. There are no account fees, subscription fees, or
                withdrawal fees.
              </Item>
              <Item value="f-2" q="How do I deposit funds?">
                Go to your wallet and click Deposit. We accept credit cards
                and debit cards through Stripe. Your deposit is available
                for trading immediately.
              </Item>
              <Item value="f-3" q="How do I withdraw?">
                Go to your wallet and click Withdraw. Withdrawals are
                processed through Stripe and typically arrive within 1–3
                business days depending on your bank.
              </Item>
              <Item value="f-4" q="Is my payment information secure?">
                All payments are processed securely through Stripe. We never
                store your card details. Your personal and financial
                information is encrypted and protected under
                industry-standard security practices.
              </Item>
            </Accordion>
          </div>
        </Card>

        {/* ── Contact ─────────────────────────────────────────────── */}
        <div className="bg-[#16181f] border border-white/[0.08] rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm">
            Still have questions?{" "}
            <a
              href="mailto:support@velocity-markets.com"
              className="text-[#E94560] hover:underline"
            >
              support@velocity-markets.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable accordion item ────────────────────────────────────────────── */
function Item({
  value,
  q,
  children,
}: {
  value: string;
  q: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value} className="border-white/[0.08]">
      <AccordionTrigger className="text-left text-sm font-semibold">
        {q}
      </AccordionTrigger>
      <AccordionContent className="text-gray-400 text-sm leading-relaxed">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
