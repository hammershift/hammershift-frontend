'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useWallets } from '@privy-io/react-auth';
import { useVelocityAuth } from '@/hooks/useVelocityAuth';
import { usePolygonUSDCBalance } from '@/hooks/usePolygonUSDCBalance';
import {
  createPublicClient,
  http,
  encodeFunctionData,
  parseUnits,
  isAddress,
  getAddress,
} from 'viem';
import { polygon, polygonAmoy } from 'viem/chains';
import { ArrowLeft, Plus, Trash2, Shield, ExternalLink, AlertTriangle, CheckCircle, Loader2, Copy, Send } from 'lucide-react';
import Link from 'next/link';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface SavedAddress {
  _id: string;
  address: string;
  label: string;
  verifiedAt: string;
  lastUsedAt: string | null;
}

interface LimitsData {
  dailyUsed: number;
  dailyLimit: number;
  dailyRemaining: number;
  transfersToday: number;
  maxTransfersPerDay: number;
  cooldownRemaining: number;
  isTrusted: boolean;
}

type Step = 'form' | 'otp' | 'confirm' | 'signing' | 'receipt';

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

const USDC_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

const chainId = Number(process.env.NEXT_PUBLIC_VELOCITY_MARKETS_CHAIN_ID ?? 80002);
const chain = chainId === 137 ? polygon : polygonAmoy;
const usdcAddress = process.env.NEXT_PUBLIC_VELOCITY_MARKETS_USDC as `0x${string}` | undefined;

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export default function TransferPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { embeddedWalletAddress } = useVelocityAuth();
  const { balance: onChainBalance, loading: balanceLoading, refetch: refetchBalance } = usePolygonUSDCBalance(embeddedWalletAddress);
  const { wallets } = useWallets();

  // --- State ---
  const [step, setStep] = useState<Step>('form');
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [limits, setLimits] = useState<LimitsData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // New address flow
  const [newAddress, setNewAddress] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpPendingAddress, setOtpPendingAddress] = useState('');
  const [otpPendingLabel, setOtpPendingLabel] = useState('');

  // Address validation
  const [addressWarning, setAddressWarning] = useState('');
  const [validatingAddress, setValidatingAddress] = useState(false);

  // Receipt
  const [txHash, setTxHash] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferAddress, setTransferAddress] = useState('');

  // --- Auth redirect ---
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);

  // --- Load addresses and limits ---
  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/transfer/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses ?? []);
      }
    } catch {}
  }, []);

  const fetchLimits = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/transfer/check-limits');
      if (res.ok) {
        const data = await res.json();
        setLimits(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (session?.user?._id) {
      fetchAddresses();
      fetchLimits();
    }
  }, [session, fetchAddresses, fetchLimits]);

  // --- Address validation (check on-chain activity) ---
  const validateAddressOnChain = useCallback(async (addr: string) => {
    if (!isAddress(addr)) return;
    setValidatingAddress(true);
    setAddressWarning('');
    try {
      const client = createPublicClient({ chain, transport: http() });
      const txCount = await client.getTransactionCount({ address: addr as `0x${string}` });
      const code = await client.getCode({ address: addr as `0x${string}` });
      if (code && code !== '0x') {
        setAddressWarning('This appears to be a smart contract address. Proceed with caution.');
      } else if (txCount === 0) {
        setAddressWarning('This address has no transaction history on Polygon. Double-check before sending.');
      }
    } catch {
      // Non-critical — skip warning
    } finally {
      setValidatingAddress(false);
    }
  }, []);

  // --- Handlers ---

  const handleSendOtp = async () => {
    if (!isAddress(newAddress)) {
      setError('Invalid Polygon address');
      return;
    }
    if (!newLabel.trim()) {
      setError('Label is required (e.g. "My Coinbase")');
      return;
    }
    setError('');
    setOtpSending(true);
    try {
      const res = await fetch('/api/wallet/transfer/verify-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: newAddress, label: newLabel.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Failed to send verification code');
        return;
      }
      if (data.addressId) {
        // Already verified
        await fetchAddresses();
        setSelectedAddress(data.addressId);
        setShowAddForm(false);
        setNewAddress('');
        setNewLabel('');
        return;
      }
      setOtpPendingAddress(newAddress);
      setOtpPendingLabel(newLabel.trim());
      setStep('otp');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleConfirmOtp = async () => {
    if (otpCode.length !== 6) {
      setError('Enter the 6-digit code from your email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/transfer/confirm-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: otpPendingAddress,
          code: otpCode,
          label: otpPendingLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Verification failed');
        return;
      }
      await fetchAddresses();
      setSelectedAddress(data.addressId);
      setShowAddForm(false);
      setNewAddress('');
      setNewLabel('');
      setOtpCode('');
      setStep('form');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await fetch(`/api/wallet/transfer/addresses/${id}`, { method: 'DELETE' });
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      if (selectedAddress === id) setSelectedAddress(null);
    } catch {}
  };

  const handleReviewTransfer = async () => {
    setError('');

    if (!selectedAddress) {
      setError('Select a destination address');
      return;
    }

    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Enter a valid amount');
      return;
    }

    if (amt > onChainBalance) {
      setError(`Insufficient USDC balance. You have ${onChainBalance.toFixed(2)} USDC.`);
      return;
    }

    if (limits) {
      if (limits.cooldownRemaining > 0) {
        setError(`Please wait ${limits.cooldownRemaining} seconds before the next transfer.`);
        return;
      }
      if (limits.transfersToday >= limits.maxTransfersPerDay) {
        setError(`You have reached the ${limits.maxTransfersPerDay} transfer per day limit.`);
        return;
      }
      if (amt > limits.dailyRemaining) {
        setError(`Daily limit: $${limits.dailyRemaining.toFixed(2)} remaining.`);
        return;
      }
    }

    const addr = addresses.find((a) => a._id === selectedAddress);
    if (!addr) return;

    setTransferAddress(addr.address);
    setTransferAmount(amt);
    await validateAddressOnChain(addr.address);
    setStep('confirm');
  };

  const handleExecuteTransfer = async () => {
    setStep('signing');
    setError('');

    try {
      const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
      if (!embeddedWallet) {
        setError('Privy wallet not found. Please try logging in again.');
        setStep('confirm');
        return;
      }

      if (!usdcAddress) {
        setError('USDC contract not configured');
        setStep('confirm');
        return;
      }

      // Switch to Polygon
      await embeddedWallet.switchChain(chainId);
      const provider = await embeddedWallet.getEthereumProvider();

      // Encode ERC-20 transfer(to, amount) — USDC uses 6 decimals
      const data = encodeFunctionData({
        abi: USDC_TRANSFER_ABI,
        functionName: 'transfer',
        args: [getAddress(transferAddress), parseUnits(transferAmount.toString(), 6)],
      });

      // Send via Privy embedded wallet (user sees popup to approve)
      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: embeddedWalletAddress,
            to: usdcAddress,
            data,
          },
        ],
      });

      setTxHash(hash as string);

      // Record the transfer
      await fetch('/api/wallet/transfer/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAddress: transferAddress,
          amount: transferAmount,
          txHash: hash,
          status: 'BROADCAST',
        }),
      });

      refetchBalance();
      fetchLimits();
      setStep('receipt');
    } catch (err: any) {
      // User rejected or tx failed
      const reason = err?.message?.includes('User rejected')
        ? 'Transfer cancelled'
        : err?.message ?? 'Transfer failed';

      setError(reason);

      // Log failed transfer
      await fetch('/api/wallet/transfer/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAddress: transferAddress,
          amount: transferAmount,
          txHash: null,
          status: 'FAILED',
          failReason: reason,
        }),
      }).catch(() => {});

      setStep('confirm');
    }
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const explorerUrl = chainId === 137
    ? 'https://polygonscan.com'
    : 'https://amoy.polygonscan.com';

  // --- Auth loading ---
  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E94560] animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0A0A1A] pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/my_wallet"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Wallet
          </Link>
          <h1 className="text-2xl font-bold text-white">Transfer USDC</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-gray-400 text-sm">On-chain balance:</span>
            <span className="font-mono text-lg text-white">
              {balanceLoading ? '...' : `${onChainBalance.toFixed(2)} USDC`}
            </span>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* STEP: FORM                                                       */}
        {/* ---------------------------------------------------------------- */}
        {step === 'form' && (
          <div className="space-y-6">
            {/* Address book */}
            <div className="bg-[#13202D] border border-[#1E2A36] rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-400 mb-3">Destination</h2>

              {addresses.length > 0 && (
                <div className="space-y-2 mb-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                        selectedAddress === addr._id
                          ? 'border-[#E94560] bg-[#E94560]/10'
                          : 'border-[#1E2A36] hover:border-[#2A3A4A]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr._id}
                        onChange={() => setSelectedAddress(addr._id)}
                        className="accent-[#E94560]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{addr.label}</p>
                        <p className="text-xs text-gray-500 font-mono truncate">{addr.address}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteAddress(addr._id);
                        }}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                        title="Remove address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </label>
                  ))}
                </div>
              )}

              {/* Add new address */}
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 text-sm text-[#00D4AA] hover:text-[#00E4BA] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Address
                </button>
              ) : (
                <div className="space-y-3 p-3 bg-[#0A0A1A] rounded-lg border border-[#1E2A36]">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Polygon Address</label>
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-[#13202D] border border-[#1E2A36] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-[#E94560]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Label</label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g. My Coinbase"
                      maxLength={50}
                      className="w-full bg-[#13202D] border border-[#1E2A36] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#E94560]"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    A verification code will be sent to your email
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewAddress('');
                        setNewLabel('');
                        setError('');
                      }}
                      className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendOtp}
                      disabled={otpSending}
                      className="flex-1 px-3 py-2 bg-[#E94560] text-white text-sm font-medium rounded-lg hover:bg-[#D63D56] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {otpSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Verify Address'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="bg-[#13202D] border border-[#1E2A36] rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-400 mb-3">Amount</h2>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">USDC</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full bg-[#0A0A1A] border border-[#1E2A36] rounded-lg pl-16 pr-4 py-3 text-lg text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-[#E94560] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setAmount(onChainBalance.toFixed(2))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#00D4AA] hover:text-[#00E4BA] font-medium"
                >
                  MAX
                </button>
              </div>
              {limits && (
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>Daily limit: ${limits.dailyUsed.toFixed(2)} / ${limits.dailyLimit.toFixed(2)} used</span>
                  <span>{limits.transfersToday}/{limits.maxTransfersPerDay} transfers</span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleReviewTransfer}
              disabled={!selectedAddress || !amount}
              className="w-full py-3 bg-[#E94560] text-white font-semibold rounded-xl hover:bg-[#D63D56] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Review Transfer
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* STEP: OTP VERIFICATION                                           */}
        {/* ---------------------------------------------------------------- */}
        {step === 'otp' && (
          <div className="bg-[#13202D] border border-[#1E2A36] rounded-xl p-6 space-y-4">
            <div className="text-center">
              <Shield className="w-10 h-10 text-[#00D4AA] mx-auto mb-3" />
              <h2 className="text-lg font-bold text-white">Verify Address</h2>
              <p className="text-sm text-gray-400 mt-1">
                Enter the 6-digit code sent to <span className="text-white">{session.user.email}</span>
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Verifying</p>
              <p className="font-mono text-sm text-gray-300">{otpPendingAddress}</p>
              <p className="text-xs text-gray-500 mt-1">{otpPendingLabel}</p>
            </div>

            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full bg-[#0A0A1A] border border-[#1E2A36] rounded-lg px-4 py-3 text-center text-2xl text-white font-mono tracking-[0.5em] placeholder:text-gray-600 focus:outline-none focus:border-[#00D4AA]"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep('form');
                  setOtpCode('');
                  setError('');
                }}
                className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOtp}
                disabled={otpCode.length !== 6 || loading}
                className="flex-1 py-2.5 bg-[#00D4AA] text-black font-semibold rounded-lg hover:bg-[#00E4BA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* STEP: CONFIRMATION                                               */}
        {/* ---------------------------------------------------------------- */}
        {step === 'confirm' && (
          <div className="bg-[#13202D] border border-[#1E2A36] rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white text-center">Confirm Transfer</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Sending</span>
                <span className="font-mono text-white font-semibold">{transferAmount.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-400">To</span>
                <div className="text-right">
                  <p className="font-mono text-sm text-white">{truncateAddress(transferAddress)}</p>
                  <p className="text-xs text-gray-500">
                    {addresses.find((a) => a.address === transferAddress)?.label}
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Network</span>
                <span className="text-sm text-white">Polygon</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Gas estimate</span>
                <span className="text-sm text-gray-300">~$0.01</span>
              </div>
            </div>

            {/* Address warnings */}
            {validatingAddress && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Validating address...
              </div>
            )}
            {addressWarning && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FFB547] mt-0.5 shrink-0" />
                <p className="text-sm text-[#FFB547]">{addressWarning}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setStep('form');
                  setError('');
                  setAddressWarning('');
                }}
                className="px-4 py-3 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteTransfer}
                className="flex-1 py-3 bg-[#E94560] text-white font-semibold rounded-xl hover:bg-[#D63D56] transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Confirm & Sign
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* STEP: SIGNING (waiting for Privy popup)                          */}
        {/* ---------------------------------------------------------------- */}
        {step === 'signing' && (
          <div className="bg-[#13202D] border border-[#1E2A36] rounded-xl p-8 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#E94560] animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-white">Waiting for Signature</h2>
            <p className="text-sm text-gray-400">
              Approve the transaction in your Privy wallet popup
            </p>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* STEP: RECEIPT                                                     */}
        {/* ---------------------------------------------------------------- */}
        {step === 'receipt' && (
          <div className="bg-[#13202D] border border-[#1E2A36] rounded-xl p-6 space-y-5">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-[#00D4AA] mx-auto mb-3" />
              <h2 className="text-lg font-bold text-white">Transfer Sent</h2>
              <p className="text-sm text-gray-400 mt-1">Your USDC is on its way</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Amount</span>
                <span className="font-mono text-white">{transferAmount.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-400">To</span>
                <span className="font-mono text-sm text-white">{truncateAddress(transferAddress)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Transaction</span>
                <a
                  href={`${explorerUrl}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-[#00D4AA] hover:text-[#00E4BA] font-mono"
                >
                  {truncateAddress(txHash)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setStep('form');
                  setAmount('');
                  setSelectedAddress(null);
                  setTxHash('');
                  setError('');
                  setAddressWarning('');
                }}
                className="flex-1 py-3 bg-[#1E2A36] text-white font-medium rounded-xl hover:bg-[#2A3A4A] transition-colors"
              >
                New Transfer
              </button>
              <Link
                href="/my_wallet"
                className="flex-1 py-3 bg-[#E94560] text-white font-medium rounded-xl hover:bg-[#D63D56] transition-colors text-center"
              >
                Back to Wallet
              </Link>
            </div>
          </div>
        )}

        {/* Security footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600">
          <Shield className="w-3 h-3" />
          Transfers are signed by your Privy embedded wallet. Velocity Markets never has access to your private keys.
        </div>
      </div>
    </div>
  );
}
