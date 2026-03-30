"use client";

import { useState } from "react";

interface ShareResultCardProps {
  predictionId: string;
  type: "guess" | "tournament" | "wager";
  carTitle: string;
  accuracy: number;
  predictedPrice: number;
  actualPrice: number;
  rank?: number | null;
}

export default function ShareResultCard({
  predictionId,
  type,
  carTitle,
  accuracy,
  predictedPrice,
  actualPrice,
}: ShareResultCardProps) {
  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://velocity-markets.com";
  const cardUrl = `${baseUrl}/api/share-card/${predictionId}?type=${type}`;
  const shareUrl = `${baseUrl}/results/${predictionId}?type=${type}`;

  const tweetText = encodeURIComponent(
    `I predicted $${predictedPrice.toLocaleString()} for this ${carTitle} — actual: $${actualPrice.toLocaleString()} — ${accuracy.toFixed(1)}% accuracy!\n\nThink you can do better? @VelocityMarkets`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`;

  const instagramCardUrl = `${cardUrl}&format=instagram`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Card preview */}
      <div className="overflow-hidden rounded-xl border border-[#2a2a2a]">
        <img
          src={cardUrl}
          alt={`Result card for ${carTitle}`}
          className="w-full"
          loading="lazy"
        />
      </div>

      {/* Share buttons */}
      <div className="flex gap-3">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-lg bg-[#1DA1F2] px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-[#1a8cd8]"
        >
          Share on X / Twitter
        </a>
        <button
          onClick={handleCopyLink}
          className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#222222]"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {/* Instagram download */}
      <a
        href={instagramCardUrl}
        download={`velocity-markets-${predictionId}.png`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-center text-sm text-gray-500 transition-colors hover:text-gray-400"
      >
        Download square card for Instagram &rarr;
      </a>
    </div>
  );
}
