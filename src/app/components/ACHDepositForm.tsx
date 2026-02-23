"use client";

import { useState } from "react";

interface ACHDepositFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ACHDepositForm({ onSuccess, onCancel }: ACHDepositFormProps) {
  const [amount, setAmount] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">("checking");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!amountCents || isNaN(amountCents) || amountCents < 100) {
      setError("Minimum deposit is $1.00");
      return;
    }
    if (!/^\d{9}$/.test(routingNumber)) {
      setError("Routing number must be exactly 9 digits");
      return;
    }
    if (accountNumber.length < 4) {
      setError("Please enter a valid account number");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/deposit/ach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountCents,
          routingNumber,
          accountNumber,
          accountType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Transfer failed. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => onSuccess?.(), 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <p className="text-[#00D4AA] font-semibold mb-1">Transfer initiated!</p>
        <p className="text-gray-400 text-sm">
          Funds will be available in 3-5 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <div>
        <label className="text-xs text-gray-400 block mb-1">Amount ($)</label>
        <input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-[#0A0A1A] border border-[#1E2A36] rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#E94560] outline-none"
          placeholder="100.00"
          required
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">Routing Number</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={9}
          value={routingNumber}
          onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ""))}
          className="w-full bg-[#0A0A1A] border border-[#1E2A36] rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#E94560] outline-none"
          placeholder="9-digit routing number"
          required
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">Account Number</label>
        <input
          type="text"
          inputMode="numeric"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
          className="w-full bg-[#0A0A1A] border border-[#1E2A36] rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-[#E94560] outline-none"
          placeholder="Account number"
          required
        />
      </div>
      <div>
        <label className="text-xs text-gray-400 block mb-1">Account Type</label>
        <select
          value={accountType}
          onChange={(e) => setAccountType(e.target.value as "checking" | "savings")}
          className="w-full bg-[#0A0A1A] border border-[#1E2A36] rounded-lg px-3 py-2 text-white text-sm focus:border-[#E94560] outline-none"
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
        </select>
      </div>
      {error && (
        <p className="text-[#E94560] text-sm">{error}</p>
      )}
      <p className="text-xs text-gray-500">
        Save 2-3% vs card. Funds available in 3-5 business days.
      </p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-[#E94560] text-white py-2 px-4 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#E94560]/90 transition-colors"
        >
          {submitting ? "Submitting..." : "Deposit via Bank Transfer"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-[#1E2A36] text-white py-2 px-4 rounded-lg text-sm hover:bg-[#2C3A4A] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
