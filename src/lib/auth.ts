import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcryptjs from "bcryptjs";
import { User, Credentials } from "@/app/types/userTypes";
import { NextAuthOptions, getServerSession } from "next-auth";
import { ObjectId } from "mongodb";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import EmailProvider from "next-auth/providers/email";
import connectToDB from "./mongoose";
import Users from "@/models/user.model";
import { privyClient } from "./privy";

async function doesEmailExist(email: string): Promise<boolean> {
  await connectToDB();
  const user = await Users.findOne({
    email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });
  return !!user;
}

// Google providers
function getGoogleCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || clientId.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_SECRET");
  }

  return { clientId, clientSecret };
}

// Facebook providers
function getFacebookCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  if (!clientId || clientId.length === 0) {
    throw new Error("Missing FACEBOOK_CLIENT_ID");
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing FACEBOOK_CLIENT_SECRET");
  }

  return { clientId, clientSecret };
}

// Twitter providers
function getTwitterCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  if (!clientId || clientId.length === 0) {
    throw new Error("Missing TWITTER_CLIENT_ID");
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing TWITTER_CLIENT_SECRET");
  }

  return { clientId, clientSecret };
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: Credentials | undefined) => {
        if (!credentials || !credentials.email || !credentials.password)
          throw new Error("Missing credentials");
        await connectToDB();
        const user = await Users.findOne({ email: credentials.email }).select('+password');

        if (!user) throw new Error("Invalid credentials");
        if (user.isBanned) throw new Error("Your account has been banned");
        if (!user.password) throw new Error("No password set — use Forgot Password to create one");

        const passwordMatch = await bcryptjs.compare(credentials.password, user.password);
        if (!passwordMatch) throw new Error("Invalid credentials");

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          provider: user.provider,
        };
      },
    }),
    CredentialsProvider({
      id: "privy-bridge",
      name: "Privy Bridge",
      credentials: {
        privyToken: { type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials?.privyToken) return null;
        try {
          const { userId: privyDid } = await privyClient.verifyAuthToken(credentials.privyToken);
          const privyUser = await privyClient.getUser(privyDid);
          const rawEmail = privyUser.email?.address ?? privyUser.google?.email ?? null;
          if (!rawEmail) return null;
          const email = rawEmail.toLowerCase();

          await connectToDB();
          // Case-insensitive email lookup to avoid duplicate accounts
          const dbUser = await Users.findOne({ email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });

          if (!dbUser) {
            // Don't auto-create — user should sign up first or use privy-session route
            console.error("privy-bridge: no DB user found for email", email);
            return null;
          }

          return {
            id: dbUser._id.toString(),
            email: dbUser.email,
            username: dbUser.username,
            fullName: dbUser.fullName,
            provider: dbUser.provider ?? "privy",
          };
        } catch (err) {
          console.error("privy-bridge authorize error:", err);
          return null;
        }
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT ? parseInt(process.env.EMAIL_SERVER_PORT, 10) : undefined,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    // GoogleProvider({
    //   clientId: getGoogleCredentials().clientId,
    //   clientSecret: getGoogleCredentials().clientSecret,
    //   allowDangerousEmailAccountLinking: true,
    //   profile: (profile) => ({
    //     id: profile.sub,
    //     name: profile.name,
    //     email: profile.email,
    //     image: profile.picture,
    //     provider: 'google',
    //   }),
    // }),
    // FacebookProvider({
    //   clientId: getFacebookCredentials().clientId,
    //   clientSecret: getFacebookCredentials().clientSecret,
    //   allowDangerousEmailAccountLinking: true,
    //   userinfo: {
    //     url: 'https://graph.facebook.com/v19.0/me',
    //     params: {
    //       fields: 'id,name,email,first_name,last_name',
    //     },
    //     async request({ tokens, client, provider }) {
    //       // eslint-disable-next-line
    //       return await client.userinfo(tokens.access_token!, {
    //         // @ts-expect-error
    //         params: provider.userinfo?.params,
    //       });
    //     },
    //   },
    //   profile: (_profile) => {
    //     return {
    //       id: _profile.id,
    //       firstName: _profile.first_name,
    //       lastName: _profile.last_name,
    //       email: _profile.email,
    //       provider: 'facebook',
    //     };
    //   },
    // }),
    // TwitterProvider({
    //   clientId: getTwitterCredentials().clientId,
    //   clientSecret: getTwitterCredentials().clientSecret,
    //   allowDangerousEmailAccountLinking: true,
    //   profile: (profile) => ({
    //     id: profile.id_str,
    //     name: profile.name,
    //     email: profile.email,
    //     image: profile.profile_image_url_https,
    //     provider: 'twitter',
    //   }),
    // }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (token) {
        session.user._id = token._id;
        session.user.id = token._id as string;
        session.user.email = token.email;
        session.user.fullName = token.fullName;
        session.user.username = token.username;
        session.user.role = token.role;
        // session.user.image = token.image;
        session.user.provider = token.provider;
        session.user.isNewUser = token.isNewUser;
        session.user.emailExists = token.emailExists;
        session.user.balance = token.balance as number ?? 0;
        session.user.isActive = token.isActive as boolean ?? true;
        session.user.isInvited = token.isInvited;
        session.user.referralCode = token.referralCode;
        // session.user.stripeCustomerId = token.stripeCustomerId;
      }
      return session;
    },
    async jwt({ token, user, account, isNewUser }: any) {
      if (user) {
        token.fullName = user.fullName;
        token.username = user.username;
        token.email = user.email;
        // token.image = user.image;
        token.provider = account.provider;
        // token.stripeCustomerId = user.stripeCustomerId;
      }
      const existingUser = await doesEmailExist(token.email);
      token.emailExists = !!existingUser;

      // if (isNewUser && existingUser && typeof existingUser !== 'boolean') {
      //   token.isNewUser = false;
      //   if ((existingUser as any).provider !== account.provider) {
      //     connectToDB();
      //     await Users.updateOne({ email: token.email }, { $set: { provider: account.provider } });
      //   }
      // } else {
      //   token.isNewUser = isNewUser;
      // }

      await connectToDB();
      const emailRegex = new RegExp(`^${token.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      const dbUser = await Users.findOne({ email: { $regex: emailRegex } });

      if (dbUser) {
        token.fullName = dbUser.fullName;
        token.username = dbUser.username;
        token.isActive = dbUser.isActive;
        token.balance = dbUser.balance;
        token.isBanned = dbUser.isBanned;
        token.about = dbUser.about;
        token._id = dbUser._id.toString();
        token.role = dbUser.role;
        token.isInvited = dbUser.isInvited === true;
        token.referralCode = dbUser.referralCode;
        if (!dbUser.createdAt) {
          const createdAt = new Date();
          await Users.updateOne(
            { _id: dbUser._id },
            { $set: { createdAt } }
          );
          token.createdAt = createdAt;
        } else {
          token.createdAt = dbUser.createdAt;
        }

        if (!dbUser.isActive) {
          await Users.updateOne(
            { _id: dbUser._id },
            { $set: { isActive: true } }
          );
          token.isActive = true;
          token.balance = dbUser.balance ?? 0;
        }

        await Users.updateOne(
          { _id: dbUser._id },
          { $set: { updatedAt: new Date() } }
        );
      }

      return token;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
