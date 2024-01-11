import 'next-auth';
import { NextApiRequest } from 'next';

declare module 'next-auth' {
  interface User {
    action?: 'create' | 'login';
  }

  interface Session {
    user: {
      id?: string;
      isActive?: boolean;
      action?: 'create' | 'login';
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    isActive?: boolean;
    action?: 'create' | 'login';
  }
}

declare module 'next' {
  interface NextApiRequest {
    query: {
      isCreatingAccount?: string;
    };
  }
}
