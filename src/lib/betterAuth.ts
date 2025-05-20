import { betterAuth, User } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username, emailOTP } from "better-auth/plugins";
import { sendEmail } from "@/helpers/email";
import { MongoClient } from "mongodb";

interface VelocityUser extends User {
  username: string;
}
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI');
}
const client = new MongoClient(process.env.MONGODB_URI || "");
const db = client.db();
export const auth = betterAuth({
  appName: "Velocity Markets",
  database: mongodbAdapter(db),
  user: {
    modelName: "users",
    fields: {
      name: "fullName",
    },
    additionalFields: {
      balance: {
        type: "number",
        required: false,
        defaultValue: 500,
        input: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
      isBanned: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail(user.email, user.name, url);
    },
  },
  plugins: [
    username({
      usernameValidator: (username: string) => {
        if (username === "admin") {
          return false;
        } else {
          return true;
        }
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {},
    }),
  ],
});
