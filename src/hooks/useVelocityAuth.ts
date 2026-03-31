'use client';

import { usePrivy } from '@privy-io/react-auth';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';

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
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const [velocityUser, setVelocityUser] = useState<VelocityUser | null>(null);
  const [loading, setLoading] = useState(true);
  const bridgingRef = useRef(false);

  // Bridge Privy → NextAuth when Privy is authenticated but NextAuth is not
  useEffect(() => {
    if (!ready || !authenticated || nextAuthStatus === 'loading') return;
    if (nextAuthSession?.user || bridgingRef.current) return;

    bridgingRef.current = true;
    getAccessToken().then(async (token) => {
      if (!token) {
        bridgingRef.current = false;
        return;
      }
      try {
        await signIn('privy-bridge', { privyToken: token, redirect: false });
      } catch (err) {
        console.error('[useVelocityAuth] privy→nextauth bridge failed:', err);
      }
      bridgingRef.current = false;
    });
  }, [ready, authenticated, nextAuthSession, nextAuthStatus, getAccessToken]);

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
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('[useVelocityAuth] privy-session failed:', res.status, data.message);
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
