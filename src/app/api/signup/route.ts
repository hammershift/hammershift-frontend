import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  console.log('Received request to the registration endpoint');

  if (req.method !== 'POST') {
    console.log('Request method is not POST');
    return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405 });
  }

  const data = await req.json();
  const { email, password } = data;
  console.log(`Received email: ${email}`);

  if (!email || !password || !email.includes('@') || password.trim().length < 7) {
    return new Response(JSON.stringify({ message: 'Invalid input' }), { status: 422 });
  }

  let client;
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MongoDB URI not set in environment variables');
    }
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: 'User already exists' }), { status: 422 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await db.collection('users').insertOne({
      email,
      password: hashedPassword,
    });

    console.log('User created successfully');
    return new Response(JSON.stringify({ message: 'User created' }), { status: 201 });
  } catch (error: any) {
    console.error('Error during registration process:', error);
    const errorMessage = typeof error === 'string' ? error : error.message;
    return new Response(JSON.stringify({ message: 'Something went wrong', error: errorMessage }), { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
