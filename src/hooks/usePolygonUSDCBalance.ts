'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { polygon, polygonAmoy } from 'viem/chains';

const USDC_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function usePolygonUSDCBalance(walletAddress: string | null | undefined) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chainId = Number(process.env.NEXT_PUBLIC_VELOCITY_MARKETS_CHAIN_ID ?? 80002);
  const usdcAddress = process.env.NEXT_PUBLIC_VELOCITY_MARKETS_USDC as `0x${string}` | undefined;
  const chain = chainId === 137 ? polygon : polygonAmoy;

  const refetch = useCallback(async () => {
    if (!walletAddress || !usdcAddress) return;
    setLoading(true);
    try {
      const client = createPublicClient({ chain, transport: http() });
      const raw = await client.readContract({
        address: usdcAddress,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`],
      });
      setBalance(Number(formatUnits(raw, 6)));
      setError(null);
    } catch {
      setError('Could not fetch balance');
    } finally {
      setLoading(false);
    }
  }, [walletAddress, usdcAddress, chain]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { balance, loading, error, refetch };
}
