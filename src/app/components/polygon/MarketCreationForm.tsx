'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface Auction {
  _id: string;
  title: string;
  predictedPrice: number;
  auctionEndDate: Date;
  imageUrl?: string;
}

interface MarketCreationFormProps {
  auctions: Auction[];
  onSubmit: (data: MarketCreationData) => Promise<void>;
  loading?: boolean;
}

export interface MarketCreationData {
  auctionId: string;
  question: string;
  endDate: Date;
}

const MAX_QUESTION_LENGTH = 200;

export function MarketCreationForm({
  auctions,
  onSubmit,
  loading = false,
}: MarketCreationFormProps) {
  const [auctionId, setAuctionId] = useState('');
  const [question, setQuestion] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get selected auction
  const selectedAuction = useMemo(() => {
    return auctions.find((a) => a._id === auctionId);
  }, [auctionId, auctions]);

  // Validation
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Auction validation
    if (!auctionId) {
      errors.push('Please select an auction');
    }

    // Question validation
    if (!question.trim()) {
      errors.push('Market question is required');
    } else if (question.length > MAX_QUESTION_LENGTH) {
      errors.push(`Question must be ${MAX_QUESTION_LENGTH} characters or less`);
    }

    // End date validation
    if (!endDate) {
      errors.push('Market end date is required');
    } else {
      const endDateTime = new Date(endDate);
      const now = new Date();

      if (endDateTime <= now) {
        errors.push('Market end date must be in the future');
      }

      if (selectedAuction) {
        const auctionEndDate = new Date(selectedAuction.auctionEndDate);
        if (endDateTime >= auctionEndDate) {
          errors.push('Market must end before the auction ends');
        }

        // Warning if market ends very close to auction
        const hoursBefore = (auctionEndDate.getTime() - endDateTime.getTime()) / (1000 * 60 * 60);
        if (hoursBefore < 24) {
          warnings.push('Consider ending the market at least 24 hours before the auction');
        }
      }
    }

    return { errors, warnings, isValid: errors.length === 0 };
  }, [auctionId, question, endDate, selectedAuction]);

  // Auto-generate question when auction is selected
  useEffect(() => {
    if (selectedAuction && !question) {
      const generatedQuestion = `Will the hammer price of ${selectedAuction.title} exceed $${selectedAuction.predictedPrice.toLocaleString()}?`;
      setQuestion(generatedQuestion);
    }
  }, [selectedAuction, question]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.isValid || submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await onSubmit({
        auctionId,
        question: question.trim(),
        endDate: new Date(endDate),
      });

      setSuccessMessage('Market created successfully!');

      // Reset form
      setTimeout(() => {
        setAuctionId('');
        setQuestion('');
        setEndDate('');
        setSuccessMessage('');
      }, 2000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to create market');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-trading-bg-card">
      {/* Header */}
      <div className="border-b border-gray-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">Create New Market</h3>
        <p className="mt-1 text-sm text-gray-400">
          Link a prediction market to an auction
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Auction Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Select Auction <span className="text-red-500">*</span>
          </label>
          <select
            value={auctionId}
            onChange={(e) => setAuctionId(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-trading-bg-secondary px-4 py-2.5 text-white focus:border-trading-yes focus:outline-none focus:ring-2 focus:ring-trading-yes/20"
            disabled={loading || submitting}
          >
            <option value="">Choose an auction...</option>
            {auctions.map((auction) => (
              <option key={auction._id} value={auction._id}>
                {auction.title} - ${auction.predictedPrice.toLocaleString()}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Select an active auction to create a prediction market for
          </p>
        </div>

        {/* Market Question */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Market Question <span className="text-red-500">*</span>
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-trading-bg-secondary px-4 py-2.5 text-white focus:border-trading-yes focus:outline-none focus:ring-2 focus:ring-trading-yes/20"
            rows={3}
            maxLength={MAX_QUESTION_LENGTH}
            placeholder="Will the hammer price exceed the predicted price?"
            disabled={loading || submitting}
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <p className="text-gray-500">
              This question will be displayed to traders
            </p>
            <span
              className={`font-mono ${
                question.length > MAX_QUESTION_LENGTH ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {question.length}/{MAX_QUESTION_LENGTH}
            </span>
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Market End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-trading-bg-secondary px-4 py-2.5 font-mono text-white focus:border-trading-yes focus:outline-none focus:ring-2 focus:ring-trading-yes/20"
            disabled={loading || submitting}
          />
          <p className="mt-1 text-xs text-gray-500">
            Market must end before the auction ends
            {selectedAuction && (
              <span className="ml-1">
                (Auction ends:{' '}
                {new Date(selectedAuction.auctionEndDate).toLocaleString()})
              </span>
            )}
          </p>
        </div>

        {/* Validation Messages */}
        {validation.errors.length > 0 && (
          <div className="space-y-2">
            {validation.errors.map((error, index) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3"
              >
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ))}
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className="space-y-2">
            {validation.warnings.map((warning, index) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3"
              >
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                <p className="text-sm text-amber-400">{warning}</p>
              </div>
            ))}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-trading-yes/30 bg-trading-yes/10 p-3">
            <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-trading-yes" />
            <p className="text-sm text-trading-yes">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-400">{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!validation.isValid || submitting || loading}
          className="w-full rounded-lg bg-trading-yes py-3 font-semibold text-white transition-all hover:bg-trading-yes/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Creating Market...' : 'Create Market'}
        </button>
      </form>
    </div>
  );
}
