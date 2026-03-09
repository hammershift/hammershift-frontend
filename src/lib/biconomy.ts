import { createSmartAccountClient, PaymasterMode } from '@biconomy/account';
import { createWalletClient, custom } from 'viem';
import { polygon } from 'viem/chains';

/**
 * Creates a Biconomy Smart Account for a given Privy embedded wallet provider.
 * The smart account wraps the Privy EIP-1193 provider as an ERC-4337 Smart Account,
 * enabling gasless USDC trades via the Biconomy Paymaster.
 *
 * @param embeddedWalletProvider - EIP-1193 provider from Privy (embeddedWallet.getEthereumProvider())
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createBiconomySmartAccount(embeddedWalletProvider: any) {
  const walletClient = createWalletClient({
    chain: polygon,
    transport: custom(embeddedWalletProvider),
  });

  const smartAccount = await createSmartAccountClient({
    signer: walletClient,
    bundlerUrl: `https://bundler.biconomy.io/api/v2/137/${process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY}`,
    biconomyPaymasterApiKey: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY!,
    rpcUrl: 'https://polygon-rpc.com',
  });

  return smartAccount;
}

// Re-export PaymasterMode so callers don't need a direct @biconomy/account import
export { PaymasterMode };

/**
 * Minimal ABI for the PolygonMarket prediction contract.
 * TODO: Replace with the full ABI once smart contract deployment artefacts are available.
 */
export const MARKET_ABI = [
  {
    name: 'buyShares',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'outcome', type: 'uint8' },   // 0 = YES, 1 = NO
      { name: 'amount', type: 'uint256' },  // USDC amount in 6 decimals
    ],
    outputs: [],
  },
] as const;
