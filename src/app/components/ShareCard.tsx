"use client";

import { useState } from "react";
import { useTrackEvent } from "@/hooks/useTrackEvent";

interface ShareCardProps {
  predictionId: string;
  auctionId: string;
  auctionTitle: string;
}

export function ShareCard({ predictionId, auctionId, auctionTitle }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const track = useTrackEvent();

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/auctions/car_view_page/${auctionId}?ref=share&predictionId=${predictionId}`
      : `/auctions/car_view_page/${auctionId}?ref=share&predictionId=${predictionId}`;
  const tweetText = encodeURIComponent(
    `I just made my prediction on ${auctionTitle} at Velocity Markets! ${shareUrl}`
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      track("share_card_shared", { platform: "copy" });
    } catch {
      // fallback: select text
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); track("share_card_opened", { auctionId, predictionId }); }}
        className="mt-3 w-full bg-[#1E2A36] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#2C3A4A] transition-colors border border-[#1E2A36] hover:border-[#E94560]/30"
      >
        Share My Pick
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#13202D] rounded-xl border border-[#1E2A36] p-6 w-full max-w-md">
            <h3 className="text-white font-bold text-lg mb-4">Share Your Pick</h3>
            <div className="rounded-lg overflow-hidden border border-[#1E2A36] mb-4 bg-[#0A0A1A] h-36 flex items-center justify-center">
              <p className="text-gray-500 text-sm">Preview loading&hellip;</p>
            </div>
            <div className="flex gap-3 mb-3">
              <button
                onClick={handleCopy}
                className="flex-1 bg-[#1E2A36] text-white py-2 px-4 rounded-lg text-sm hover:bg-[#2C3A4A] transition-colors"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${tweetText}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("share_card_shared", { platform: "twitter" })}
                className="flex-1 bg-black text-white py-2 px-4 rounded-lg text-sm text-center hover:bg-gray-900 transition-colors"
              >
                Post on &#120143;
              </a>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-full text-gray-400 text-sm hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
