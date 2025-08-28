import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  usernameClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    usernameClient(),
    inferAdditionalFields({
      user: {
        balance: {
          type: "number",
          required: true,
          defaultValue: 0,
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
    }),
  ],
});

export const { signIn, signOut, useSession } = authClient;
