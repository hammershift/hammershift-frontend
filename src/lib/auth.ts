import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { User, Credentials } from "@/app/types/userTypes";
import { NextAuthOptions, getServerSession } from "next-auth";
import { ObjectId } from "mongodb";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

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

const emailExistsInDatabase = async (email: string): Promise<boolean> => {
  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection<User>("users").findOne({ email: email });
  return !!user;
};

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
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: Credentials | undefined) => {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error("Missing credentials");
        }

        const client = await clientPromise;
        const db = client.db();
        const user = await db
          .collection<User>("users")
          .findOne({ email: credentials.email });

        if (user?.isBanned) {
          throw new Error("Your account has been banned");
        }
        if (
          !user ||
          !user.password ||
          !(await bcrypt.compare(credentials.password, user.password))
        ) {
          throw new Error("Invalid credentials");
        }

        return { id: user._id, email: user.email };
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
        session.user.email = token.email;
        session.user.name = token.fullName;
        session.user.fullName = token.fullName;
        session.user.username = token.username;
        session.user.image = token.image;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.fullName = user.name;
        token.id = user.id;
        token.email = user.email;
        token.image = user.image;
      }

      const client = await clientPromise;
      const db = client.db();
      const dbUser = await db
        .collection("users")
        .findOne({ _id: new ObjectId(token.id) });

      console.log("JWT callback - Fetched User from DB:", dbUser);

      if (dbUser) {
        token.fullName = dbUser.name;
        token.username = dbUser.username;
        token.image = dbUser.image;
        token.isActive = dbUser.isActive;
        token.balance = dbUser.balance;
        token.isBanned = dbUser.isBanned;

        // check if the user doesn't have a createdAt field and set it
        if (!dbUser.createdAt) {
          const createdAt = new Date();
          await db
            .collection("users")
            .updateOne(
              { _id: new ObjectId(token.id) },
              { $set: { createdAt } }
            );

          token.createdAt = createdAt;
        } else {
          token.createdAt = dbUser.createdAt;
        }

        // update isActive and balance if undefined
        if (dbUser.isActive === undefined) {
          dbUser.isActive = true;
          dbUser.balance = 100;
          await db
            .collection("users")
            .updateOne(
              { _id: new ObjectId(token.id) },
              { $set: { isActive: true, balance: 100 } }
            );
        }
      }
      console.log("Token: ", token);
      return token;
    },
    async signIn({ user, account, req }: any) {
      const isCreatingAccount = req?.query?.isCreatingAccount === "true";

      if (account.provider === "google" && isCreatingAccount) {
        const client = await clientPromise;
        const db = client.db();
        const dbUser = await db
          .collection<User>("users")
          .findOne({ email: user.email });

        if (dbUser && dbUser.isBanned) {
          return false;
        }

        const emailExists = await emailExistsInDatabase(user.email);
        if (emailExists) {
          return `/create_account?emailExists=true`;
        }
      }
      return true;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
