// import 'next-auth';
// import { NextApiRequest } from 'next';

// declare module 'next-auth' {
//   interface User {
//     action?: 'create' | 'login';
//     wagers?: ObjectId[]; // test
//     winnings?: ObjectId[]; // test
//   }

//   interface Session {
//     user: {
//       id?: string;
//       isActive?: boolean;
//       action?: 'create' | 'login';
//       wagers?: ObjectId[]; // test
//       winnings?: ObjectId[]; // test
//     } & DefaultSession['user'];
//   }
// }

// declare module 'next-auth/jwt' {
//   interface JWT {
//     id?: string;
//     isActive?: boolean;
//     action?: 'create' | 'login';
//     wagers?: ObjectId[]; // test
//     winnings?: ObjectId[]; // test
//   }
// }

// declare module 'next' {
//   interface NextApiRequest {
//     query: {
//       isCreatingAccount?: string;
//     };
//   }
// }

import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string;
    fullName?: string;
    email?: string;
    image?: string;
    isActive?: boolean;
    balance?: number;
    isBanned?: boolean;
    username?: string;
    about?: string;
    createdAt?: Date;
  }

  interface Session {
    user: {
      id: string;
      name?: string;
      fullName?: string;
      email?: string;
      image?: string;
      isActive?: boolean;
      balance?: number;
      isBanned?: boolean;
      username?: string;
      about?: string;
      createdAt?: Date;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
    image?: string;
    isActive?: boolean;
    balance?: number;
    isBanned?: boolean;
    username?: string;
    createdAt?: Date;
  }
}
