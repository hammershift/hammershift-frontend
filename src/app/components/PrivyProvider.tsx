'use client';

import { PrivyProvider as PrivySDKProvider } from '@privy-io/react-auth';

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivySDKProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ['email', 'google'],
        appearance: {
          theme: 'dark',
          accentColor: '#10B981',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivySDKProvider>
  );
}
