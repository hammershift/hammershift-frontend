'use client';

import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface MarketPreviewCardProps {
  auctionId: string;
  auctionTitle?: string;
  question: string;
  endDate: Date;
  validationErrors: string[];
  validationWarnings: string[];
  predictedPrice?: number;
  imageUrl?: string;
}

export function MarketPreviewCard({
  auctionId,
  auctionTitle = 'Loading auction...',
  question,
  endDate,
  validationErrors,
  validationWarnings,
  predictedPrice,
  imageUrl,
}: MarketPreviewCardProps) {
  const hasErrors = validationErrors.length > 0;
  const hasWarnings = validationWarnings.length > 0;
  const isValid = !hasErrors;

  // Format end date
  const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : 'Not set';

  return (
    <div className="rounded-lg border border-gray-700 bg-trading-bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Market Preview</h3>
          {isValid ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-trading-yes">
              <CheckCircle size={18} />
              Ready to Create
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-semibold text-red-500">
              <XCircle size={18} />
              Validation Failed
            </div>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-6">
        {/* Auction Image */}
        {imageUrl && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt={auctionTitle}
              className="h-48 w-full object-cover"
            />
          </div>
        )}

        {/* Auction Details */}
        <div className="mb-4 rounded-lg bg-gray-800/50 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Linked Auction
          </div>
          <div className="text-base font-semibold text-white">{auctionTitle}</div>
          {predictedPrice && (
            <div className="mt-1 text-sm text-gray-400">
              Predicted: <span className="font-mono text-white">${predictedPrice.toLocaleString()}</span>
            </div>
          )}
          <div className="mt-1 text-xs text-gray-500">
            Auction ID: {auctionId}
          </div>
        </div>

        {/* Market Question */}
        <div className="mb-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Market Question
          </div>
          {question ? (
            <div className="rounded-lg bg-gray-800/50 p-4">
              <p className="text-sm leading-relaxed text-white">{question}</p>
              <div className="mt-2 text-xs text-gray-500">
                {question.length}/200 characters
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-700 p-4 text-center text-sm text-gray-500">
              Question not set
            </div>
          )}
        </div>

        {/* Outcomes */}
        <div className="mb-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Outcomes
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border-2 border-trading-yes/30 bg-trading-yes/10 p-3 text-center">
              <div className="font-semibold text-trading-yes">YES</div>
              <div className="mt-1 text-xs text-gray-400">
                Hammer &gt; Predicted
              </div>
            </div>
            <div className="rounded-lg border-2 border-trading-no/30 bg-trading-no/10 p-3 text-center">
              <div className="font-semibold text-trading-no">NO</div>
              <div className="mt-1 text-xs text-gray-400">
                Hammer &lt; Predicted
              </div>
            </div>
          </div>
        </div>

        {/* End Date */}
        <div className="mb-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Market End Date
          </div>
          <div className="rounded-lg bg-gray-800/50 p-3">
            <div className="font-mono text-sm text-white">{formattedEndDate}</div>
          </div>
        </div>

        {/* Validation Errors */}
        {hasErrors && (
          <div className="mb-4 space-y-2">
            {validationErrors.map((error, index) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3"
              >
                <XCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ))}
          </div>
        )}

        {/* Validation Warnings */}
        {hasWarnings && (
          <div className="space-y-2">
            {validationWarnings.map((warning, index) => (
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
      </div>
    </div>
  );
}
