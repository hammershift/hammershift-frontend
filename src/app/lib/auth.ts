import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/app/lib/mongodb';
import bcrypt from 'bcrypt';
import { User, Credentials } from '@/app/types/userTypes';
import { NextAuthOptions, getServerSession } from 'next-auth';

import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import AppleProvider from 'next-auth/providers/apple';
import TwitterProvider from 'next-auth/providers/twitter';

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

// Facebook providers
function getFacebookCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  if (!clientId || clientId.length === 0) {
    throw new Error('Missing FACEBOOK_CLIENT_ID');
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error('Missing FACEBOOK_CLIENT_SECRET');
  }

  return { clientId, clientSecret };
}

// // Apple providers
// function getAppleCredentials(): { clientId: string; clientSecret: string } {
//   const clientId = process.env.APPLE_ID;
//   const clientSecret = process.env.APPLE_SECRET;
//   if (!clientId || clientId.length === 0) {
//     throw new Error('Missing APPLE_ID');
//   }

//   if (!clientSecret || clientSecret.length === 0) {
//     throw new Error('Missing APPLE_SECRET');
//   }

//   return { clientId, clientSecret };
// }

// Twitter providers
function getTwitterCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  if (!clientId || clientId.length === 0) {
    throw new Error('Missing TWITTER_CLIENT_ID');
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error('Missing TWITTER_CLIENT_SECRET');
  }

  return { clientId, clientSecret };
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
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

        if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
          throw new Error('Invalid credentials');
        }

        return { id: user._id, email: user.email };
      },
    }),
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
    FacebookProvider({
      clientId: getFacebookCredentials().clientId,
      clientSecret: getFacebookCredentials().clientSecret,
    }),
    // AppleProvider({
    //   clientId: getAppleCredentials().clientId,
    //   clientSecret: getAppleCredentials().clientSecret,
    // }),
    TwitterProvider({
      clientId: getTwitterCredentials().clientId,
      clientSecret: getTwitterCredentials().clientSecret,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id.toString();
        session.user.email = token.email;
        // will add more field
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id.toString();
        token.email = user.email;
      }
      return token;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
