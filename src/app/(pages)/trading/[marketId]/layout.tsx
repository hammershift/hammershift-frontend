import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market — Velocity Markets',
  description: 'Make your prediction on this collector car auction market.',
  openGraph: {
    title: 'Market — Velocity Markets',
    description: 'Make your prediction on this collector car auction market.',
    siteName: 'Velocity Markets',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Market — Velocity Markets',
    description: 'Make your prediction on this collector car auction market.',
  },
};

export default function TradingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
