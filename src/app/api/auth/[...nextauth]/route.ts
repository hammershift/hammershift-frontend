// import clientPromise from '@/app/lib/mongodb';
// import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
// import NextAuth from 'next-auth/next';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import bcrypt from 'bcrypt';
// import { User, Credentials } from '@/app/types/types';

// // TEST IMPLEMENTATION
// export const authOptions = {
//   adapter: MongoDBAdapter(clientPromise),
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'email', placeholder: 'you@gmail.com' },
//         password: { label: 'Password', type: 'password' },
//       },
//       authorize: async (credentials: Credentials | undefined) => {
//         if (!credentials || !credentials.email || !credentials.password) {
//           console.error('Missing credentials');
//           throw new Error('Missing credentials');
//         }

//         const client = await clientPromise;
//         const db = client.db();
//         const user = await db.collection<User>('users').findOne({ email: credentials.email });

//         if (!user) {
//           console.error(`Login attempt failed: Incorrect password for user ${credentials.email}`);
//           throw new Error('User not found');
//         }

//         const isPassValid = await bcrypt.compare(credentials.password, user.password);
//         if (!isPassValid) {
//           console.error(`Login attempt failed: Incorrect password for user ${user.email}`);
//           throw new Error('Password is incorrect');
//         }

//         console.log(`Login successful for user: ${user.email}`);
//         return { id: user._id, email: user.email };
//       },
//     }),
//   ],
// };
//
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

import { authOptions } from '@/app/lib/auth';
import NextAuth from 'next-auth/next';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
