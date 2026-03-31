import SessionProvider from "@/providers/sessionProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getAuthSession } from "@/lib/auth";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import { PredictionProvider } from "./context/PredictionContext";
import { TournamentPredictionProvider } from "./context/TournamentPredictionContext";
import { TournamentProvider } from "./context/TournamentContext";
import PrivyProvider from "./components/PrivyProvider";
import "./styles/app.css";
import "./styles/globals.css";
import Analytics from "./components/analytics";
import BackToTop from "./components/BackToTop";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.velocity-markets.com"),
  title: {
    default: "Velocity Markets — Predict Car Auction Prices & Win Prizes",
    template: "%s | Velocity Markets",
  },
  description:
    "Predict hammer prices of collector car auctions on Bring a Trailer. Join tournaments, guess the price, and compete against car enthusiasts. Free and paid games available.",
  keywords: [
    "car auction predictions",
    "predict auction prices",
    "Bring a Trailer",
    "collector car market",
    "automotive prediction market",
    "car auction tournament",
    "guess the hammer price",
  ],
  authors: [{ name: "Velocity Markets" }],
  creator: "Velocity Markets",
  publisher: "Velocity Markets",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.velocity-markets.com",
    siteName: "Velocity Markets",
    title: "Velocity Markets — Predict Car Auction Prices & Win Prizes",
    description:
      "Predict hammer prices of collector car auctions. Join tournaments, guess the price, and win real prizes.",
    images: [
      {
        url: "/metadata.png",
        width: 1200,
        height: 630,
        alt: "Velocity Markets — Predict Car Auction Prices",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Velocity Markets — Predict Car Auction Prices",
    description:
      "Predict hammer prices of collector car auctions. Join tournaments and win real prizes.",
    images: ["/metadata.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.velocity-markets.com",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <PrivyProvider>
          <SessionProvider session={session}>
            <PredictionProvider>
              <TournamentPredictionProvider>
                <TournamentProvider>
                  <Analytics />
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[#00D4AA] focus:px-4 focus:py-2 focus:text-black focus:font-semibold"
                  >
                    Skip to main content
                  </a>
                  <header role="banner">
                    <Navbar />
                  </header>
                  <main id="main-content" role="main">
                    {children}
                  </main>
                  <BackToTop />
                  <Footer />
                </TournamentProvider>
              </TournamentPredictionProvider>
            </PredictionProvider>
          </SessionProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
