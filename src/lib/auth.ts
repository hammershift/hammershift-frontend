import { Credentials } from "@/app/types/userTypes";
import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { NextAuthOptions, getServerSession } from "next-auth";

import Users from "@/models/user.model";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import connectToDB from "./mongoose";

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
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@gmail.com" },
      },
      authorize: async (credentials: Credentials | undefined) => {
        if (!credentials || !credentials.email)
          throw new Error("Missing credentials");
        await connectToDB();
        const user = await Users.findOne({ email: credentials.email });

        if (user?.isBanned) throw new Error("Your account has been banned");
        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          provider: user.provider,
        };
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
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
        //session.user.id = token.id;
        session.user._id = token._id;
        session.user.email = token.email;
        session.user.fullName = token.fullName;
        session.user.username = token.username;
        session.user.role = token.role;
        // session.user.image = token.image;
        session.user.provider = token.provider;
        session.user.isNewUser = token.isNewUser;
        session.user.emailExists = token.emailExists;
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
      const dbUser = await Users.findOne({ email: token.email });

      if (dbUser) {
        token.fullName = dbUser.fullName;
        token.username = dbUser.username;
        // token.image = dbUser.image;
        token.isActive = dbUser.isActive;
        token.balance = dbUser.balance;
        // token.stripeCustomerId = dbUser.stripeCustomerId;
        token.isBanned = dbUser.isBanned;
        token.about = dbUser.about;
        token._id = dbUser._id.toString();
        token.role = dbUser.role;
        if (!dbUser.createdAt) {
          const createdAt = new Date();
          await Users.updateOne(
            { email: token.email },
            { $set: { createdAt } }
          );
          token.createdAt = createdAt;
        } else {
          token.createdAt = dbUser.createdAt;
        }

        if (dbUser.isActive === undefined) {
          dbUser.isActive = true;
          dbUser.balance = 500;
          await Users.updateOne(
            { email: token.email },
            { $set: { isActive: true, balance: 500 } }
          );
        }
      }

      await Users.updateOne(
        { email: token.email },
        { $set: { updatedAt: new Date() } }
      );

      return token;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
