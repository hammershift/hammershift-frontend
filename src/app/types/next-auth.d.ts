import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

type UserId = string;

declare module 'next-auth' {
  interface Session {
    user: {
      id: UserId;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: UserId;
  }
}
