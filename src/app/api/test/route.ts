import { sendReceiptEmail } from '@/lib/sendReceiptEmail';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   try {
//     const { wagers, finalSellingPrice, totalPot } = await req.json();

//     const winners = prizeDistribution(wagers, finalSellingPrice, totalPot);

//     return NextResponse.json({ winners });
//   } catch (error) {
//     console.error('Error in testPrizeDistribution:', error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

export async function POST(req: NextRequest) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, amountPaid } = await req.json();
    if (!email || !amountPaid) {
      return NextResponse.json({ message: 'Email and amountPaid are required' }, { status: 400 });
    }

    const emailResult = await sendReceiptEmail({ to: email, amountPaid });
    if (!emailResult.success) {
      return NextResponse.json({ message: 'Failed to send email', error: emailResult.error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully', messageId: emailResult.messageId });
  } catch (error: any) {
    console.error('Error in sendReceiptEmail:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
