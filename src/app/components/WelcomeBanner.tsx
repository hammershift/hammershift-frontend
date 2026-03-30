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
    <div className="bg-gradient-to-r from-[#01696F]/20 to-[#FFB547]/20 border-b border-[#01696F]/30">
      <div className="mx-auto flex flex-col sm:flex-row max-w-7xl items-start sm:items-center justify-between gap-2 sm:gap-0 px-4 py-3">
        <p className="text-sm text-gray-200">
          <span className="font-bold text-white">New here?</span>{" "}
          Predict car auction prices and compete for real prizes. Three game modes to choose from.
        </p>
        <div className="flex items-center gap-4 shrink-0 sm:ml-4">
          <Link
            href="/how_it_works"
            className="whitespace-nowrap text-sm font-medium text-[#01696F] hover:text-[#01696F]/80 transition-colors"
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
