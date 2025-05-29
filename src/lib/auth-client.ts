import { createAuthClient } from "better-auth/react";
import { emailOTPClient, usernameClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  plugins: [emailOTPClient(), usernameClient()],
});

export const { signIn, signOut, useSession } = authClient;
