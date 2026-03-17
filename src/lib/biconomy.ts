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
 * Full ABI for VelocityMarkets.sol
 * Matches contracts/contracts/VelocityMarkets.sol exactly.
 */
export const MARKET_ABI = [
  // ── Write functions ──────────────────────────────────────────────────
  {
    name: 'buyShares',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'marketId',     type: 'bytes32' },
      { name: 'outcome',      type: 'uint8'   }, // 0=YES, 1=NO
      { name: 'usdcAmount',   type: 'uint256' }, // USDC 6-decimal units
      { name: 'minSharesOut', type: 'uint256' }, // slippage protection
    ],
    outputs: [],
  },
  {
    name: 'redeem',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'marketId', type: 'bytes32' }],
    outputs: [],
  },
  {
    name: 'closeTradingWindow',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'marketId', type: 'bytes32' }],
    outputs: [],
  },
  // ── Read functions ───────────────────────────────────────────────────
  {
    name: 'getMarket',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'marketId', type: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'exists',          type: 'bool'    },
          { name: 'tradingClosed',   type: 'bool'    },
          { name: 'tradingClosesAt', type: 'uint64'  },
          { name: 'closesAt',        type: 'uint64'  },
          { name: 'yesPool',         type: 'uint128' },
          { name: 'noPool',          type: 'uint128' },
          { name: 'totalVolume',     type: 'uint128' },
          { name: 'winningOutcome',  type: 'uint8'   }, // 0=UNRESOLVED,1=YES,2=NO,3=VOIDED
        ],
      },
    ],
  },
  {
    name: 'getPosition',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'marketId', type: 'bytes32' },
      { name: 'user',     type: 'address' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'yesShares', type: 'uint128' },
          { name: 'noShares',  type: 'uint128' },
          { name: 'redeemed',  type: 'bool'    },
        ],
      },
    ],
  },
  {
    name: 'getYesPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'marketId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }], // scaled 1e18
  },
  {
    name: 'quoteBuy',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'marketId',   type: 'bytes32' },
      { name: 'outcome',    type: 'uint8'   },
      { name: 'usdcAmount', type: 'uint256' },
    ],
    outputs: [
      { name: 'sharesOut',      type: 'uint256' },
      { name: 'newYesPriceE18', type: 'uint256' },
      { name: 'fee',            type: 'uint256' },
    ],
  },
  {
    name: 'getMarketId',
    type: 'function',
    stateMutability: 'pure',
    inputs: [{ name: 'auctionId', type: 'string' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
] as const;

/** Minimal ERC20 ABI for USDC approval before buyShares */
export const ERC20_APPROVE_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount',  type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner',   type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;
