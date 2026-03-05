import { http, createConfig } from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

// WalletConnect Project ID - get from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
}

// Define chains based on environment
const chains = [polygon, polygonMumbai] as const;

export const config = createConfig({
  chains,
  connectors: [
    // Injected connector (MetaMask, etc.)
    injected({
      shimDisconnect: true,
    }),
    // WalletConnect
    walletConnect({
      projectId,
      metadata: {
        name: 'Velocity Markets',
        description: 'Predict car auction outcomes and trade on Polygon',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://velocitymarkets.io',
        icons: [typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : 'https://velocitymarkets.io/logo.png'],
      },
      showQrModal: false, // We'll use @web3modal/wagmi's modal
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: 'Velocity Markets',
      appLogoUrl: typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : 'https://velocitymarkets.io/logo.png',
    }),
  ],
  transports: {
    [polygon.id]: http(
      process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com'
    ),
    [polygonMumbai.id]: http(
      process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com'
    ),
  },
  ssr: true, // Enable SSR support for Next.js
});

// Export chain configs for reference
export const supportedChains = chains;
export { polygon, polygonMumbai };
