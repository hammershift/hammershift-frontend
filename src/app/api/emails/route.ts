import clientPromise from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/mongoose';
import EmailModel from '@/models/email.model';

// export async function POST(req: NextRequest) {
//   try {
//     await connectToDB();
//     const { email } = await req.json();

//     const existingEmail = await EmailModel.findOne({ email });

//     if (existingEmail) {
//       return NextResponse.json({ message: 'Email already subscribed!' });
//     } else {
//       await EmailModel.create({ email });
//       return NextResponse.json({ message: 'Subscription successful!' });
//     }
//   } catch (error) {
//     return NextResponse.json({ message: 'Internal server error' });
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     await connectToDB();
//     const emails = await EmailModel.find({}, 'email');
//     return NextResponse.json({ emails });
//   } catch (error) {
//     return NextResponse.json({ message: 'Internal server error' });
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { email } = await req.json();

    const existingEmail = await db.collection('emails').findOne({ email });

    if (existingEmail) {
      return NextResponse.json({ message: 'Email already subscribed!' });
    } else {
      // insert/save new email
      await db.collection('emails').insertOne({ email });
      return NextResponse.json({ message: 'Subscription successful!' });
    }
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ message: 'Internal server error' });
  }
}

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    // retrieve all emails
    const emails = await db
      .collection('emails')
      .find({}, { projection: { email: 1 } })
      .toArray();
    return NextResponse.json({ emails });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ message: 'Internal server error' });
  }
}
