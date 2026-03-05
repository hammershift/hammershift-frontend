# Web3 / Polygon Integration

This directory contains the Wagmi configuration and Web3 provider setup for connecting to Polygon network.

## Dependencies Installed

- **wagmi** (^3.5.0): React hooks for Ethereum/Polygon wallet connectivity
- **viem** (^2.46.3): TypeScript interface for Ethereum/Polygon
- **@tanstack/react-query** (^5.90.21): Data fetching and caching
- **@web3modal/wagmi** (^5.1.11): Wallet connection UI modal

## Configuration Files

### `/lib/web3/config.ts`
Wagmi configuration with:
- Polygon mainnet (chainId: 137)
- Polygon Mumbai testnet (chainId: 80001)
- Wallet connectors:
  - Injected (MetaMask, Brave, etc.)
  - WalletConnect (mobile wallets)
  - Coinbase Wallet

### `/lib/web3/Web3Provider.tsx`
React provider component that wraps:
- `WagmiProvider` - Wallet connection state
- `QueryClientProvider` - React Query for data fetching

### `/lib/web3/index.ts`
Exports all Web3 utilities for easy importing

## Environment Variables

Add to `.env.local`:

```bash
# WalletConnect Project ID - Get from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: Custom RPC URLs (defaults provided)
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
```

## Usage

### 1. Wrap your app with Web3Provider

In your root layout or `_app.tsx`:

```tsx
import { Web3Provider } from '@/lib/web3';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
```

### 2. Use Wagmi hooks in components

```tsx
'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { polygon } from '@/lib/web3';

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        <p>Connected: {address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  );
}
```

### 3. Network switching

```tsx
import { useSwitchChain } from 'wagmi';
import { polygon } from '@/lib/web3';

export function NetworkSwitcher() {
  const { switchChain } = useSwitchChain();

  return (
    <button onClick={() => switchChain({ chainId: polygon.id })}>
      Switch to Polygon
    </button>
  );
}
```

## TypeScript Support

All Wagmi types are properly configured. TypeScript will autocomplete:
- Chain IDs
- Connector options
- Hook return types
- Transaction parameters

## Testing

Verified:
- ✅ TypeScript compiles without errors (`npx tsc --noEmit`)
- ✅ Next.js builds successfully (`npm run build`)
- ✅ All dependencies installed
- ✅ Polygon mainnet and Mumbai testnet configured

## Next Steps

1. Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` to `.env.local`
2. Wrap your app layout with `<Web3Provider>`
3. Create wallet connection UI components
4. Implement USDC balance checking and trading hooks
