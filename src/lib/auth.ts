import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcrypt';
import { User, Credentials } from '@/app/types/userTypes';
import { NextAuthOptions, getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';

import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

// Google providers
function getGoogleCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || clientId.length === 0) {
    throw new Error('Missing GOOGLE_CLIENT_ID');
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error('Missing GOOGLE_CLIENT_SECRET');
  }

  return { clientId, clientSecret };
}

const emailExistsInDatabase = async (email: string): Promise<boolean> => {
  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection<User>('users').findOne({ email: email });
  return !!user;
};

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@gmail.com' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials: Credentials | undefined) => {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error('Missing credentials');
        }

        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection<User>('users').findOne({ email: credentials.email });

        if (user?.isBanned) {
          throw new Error('Your account has been banned');
        }
        if (!user || !user.password || !(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error('Invalid credentials');
        }

        return { id: user._id.toString(), email: user.email };
      },
    }),
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.provider = token.provider; // test
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id.toString();
        token.provider = account?.provider; // test
      }
      return token;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
