'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MarketDetailsSectionProps {
  auction: {
    title: string | null;
    image: string | null;
    deadline: string | null;
    attributes?: Array<{ key: string; value: any }>;
  } | null;
  question: string;
  predictedPrice: number;
}

export function MarketDetailsSection({ auction, question, predictedPrice }: MarketDetailsSectionProps) {
  const [rulesOpen, setRulesOpen] = useState(false);

  // Extract details from auction attributes if available
  const attrs = auction?.attributes ?? [];
  const getAttr = (key: string) => attrs.find(a => a.key?.toLowerCase() === key.toLowerCase())?.value;

  return (
    <div className="rounded-lg border border-gray-700 bg-trading-bg-card p-4 space-y-4">
      <h3 className="text-lg font-semibold text-white">Market Details</h3>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {auction?.title && (
          <div className="col-span-2">
            <span className="text-gray-500">Vehicle</span>
            <p className="text-white font-medium">{auction.title}</p>
          </div>
        )}
        {getAttr('Make') && (
          <div>
            <span className="text-gray-500">Make</span>
            <p className="text-white">{getAttr('Make')}</p>
          </div>
        )}
        {getAttr('Model') && (
          <div>
            <span className="text-gray-500">Model</span>
            <p className="text-white">{getAttr('Model')}</p>
          </div>
        )}
        {getAttr('Year') && (
          <div>
            <span className="text-gray-500">Year</span>
            <p className="text-white">{getAttr('Year')}</p>
          </div>
        )}
        {getAttr('Mileage') && (
          <div>
            <span className="text-gray-500">Mileage</span>
            <p className="text-white">{getAttr('Mileage')}</p>
          </div>
        )}
        {predictedPrice > 0 && (
          <div>
            <span className="text-gray-500">Predicted Price</span>
            <p className="text-white font-mono">${predictedPrice.toLocaleString()}</p>
          </div>
        )}
        {auction?.deadline && (
          <div>
            <span className="text-gray-500">Auction Ends</span>
            <p className="text-white">{new Date(auction.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
          </div>
        )}
      </div>

      {/* Resolution Rules Accordion */}
      <button
        onClick={() => setRulesOpen(!rulesOpen)}
        className="flex items-center justify-between w-full pt-3 border-t border-gray-700 text-sm text-gray-400 hover:text-gray-300 transition-colors"
      >
        <span>How will this market resolve?</span>
        {rulesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {rulesOpen && (
        <div className="text-xs text-gray-500 space-y-2 pb-2">
          <p>This market resolves based on the final hammer price of the auction.</p>
          <p><strong className="text-gray-400">YES:</strong> Resolves YES if the final sale price meets or exceeds the predicted price threshold.</p>
          <p><strong className="text-gray-400">NO:</strong> Resolves NO if the final sale price is below the predicted price threshold.</p>
          <p><strong className="text-gray-400">Void:</strong> If the auction is cancelled or the lot is withdrawn, all positions are refunded.</p>
        </div>
      )}
    </div>
  );
}
