'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, FC } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default Providers;
