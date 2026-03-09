'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

interface VelocityUser {
  _id: string;
  id: string;
  email: string;
  username: string;
  fullName: string;
  balance: number;
  role: string;
  provider: string;
  embeddedWalletAddress: string | null;
}

export function useVelocityAuth() {
  const { ready, authenticated, user, logout, login, getAccessToken } = usePrivy();
  const [velocityUser, setVelocityUser] = useState<VelocityUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated || !user) {
      setVelocityUser(null);
      setLoading(false);
      return;
    }

    getAccessToken().then(async (token) => {
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch('/api/auth/privy-session', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVelocityUser(data.user);
      }
      setLoading(false);
    });
  }, [ready, authenticated, user, getAccessToken]);

  const embeddedWallet = user?.linkedAccounts?.find(
    (a) =>
      a.type === 'wallet' &&
      ('walletClientType' in a) &&
      (a.walletClientType === 'privy' || a.walletClientType === 'privy-v2')
  );

  const embeddedWalletAddress =
    embeddedWallet && 'address' in embeddedWallet
      ? (embeddedWallet.address as string)
      : null;

  return {
    user: velocityUser,
    loading: !ready || loading,
    authenticated,
    login,
    logout,
    embeddedWalletAddress,
  };
}
