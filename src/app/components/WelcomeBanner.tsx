"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "vm_welcome_dismissed";

export default function WelcomeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (SSR or privacy mode)
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-[#E94560]/20 to-[#FFB547]/20 border-b border-[#E94560]/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <p className="text-sm text-gray-200">
          <span className="font-bold text-white">New here?</span>{" "}
          Predict whether collector cars sell above their estimate. Real auctions. Real rewards.
        </p>
        <div className="flex items-center gap-4 shrink-0 ml-4">
          <Link
            href="/how_it_works"
            className="whitespace-nowrap text-sm font-medium text-[#E94560] hover:text-[#E94560]/80 transition-colors"
          >
            Learn How It Works &rarr;
          </Link>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss welcome banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
