import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/app/model/userSchema';

// mock user data for testing
const users = [{ id: '1', email: 'johndoe@gmail.com', password: 'password123' }];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@gmail.com' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        console.log('Attempting login with:', credentials);

        const user = users.find((user) => user.email === credentials?.email && user.password === credentials?.password);

        if (user) {
          console.log('Login successful for user:', user);
          return { id: user.id, email: user.email, name: 'John Doe' };
        } else {
          console.log('Login failed');
          return null;
        }
      },
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
