'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Link2, Check } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
  className?: string;
}

export default function ShareButton({
  url,
  title,
  className = '',
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  const shareOptions = [
    {
      label: 'Copy Link',
      icon: copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Link2 className="h-4 w-4" />
      ),
      action: copyLink,
    },
    {
      label: 'Twitter / X',
      icon: <span className="text-sm font-bold">X</span>,
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          '_blank'
        ),
    },
    {
      label: 'Facebook',
      icon: <span className="text-sm font-bold">f</span>,
      action: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        ),
    },
    {
      label: 'Reddit',
      icon: <span className="text-sm font-bold">r/</span>,
      action: () =>
        window.open(
          `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
          '_blank'
        ),
    },
  ];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg bg-white/[0.08] border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/[0.12] transition-colors"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-white/10 bg-[#16181f] py-1 shadow-xl">
          {shareOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                opt.action();
                if (opt.label !== 'Copy Link') setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {opt.icon}
              {opt.label === 'Copy Link' && copied ? 'Copied!' : opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
