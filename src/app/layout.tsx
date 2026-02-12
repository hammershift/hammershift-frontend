import SessionProvider from "@/providers/sessionProvider";
import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import { PredictionProvider } from "./context/PredictionContext";
import { TournamentPredictionProvider } from "./context/TournamentPredictionContext";
import { TournamentProvider } from "./context/TournamentContext";
import "./styles/app.css";
import "./styles/globals.css";
import Analytics from "./components/analytics";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Predict Classic Car Auctions – Velocity Markets",
  description:
    "Compete to predict hammer prices of collectible car auctions. Join free or paid games, track the market, and turn your car knowledge into real rewards.",
  openGraph: {
    images: [
      {
        url: `${process.env.NEXTAUTH_URL}/metadata.png`,
        width: 1200,
        height: 630,
        alt: "Velocity Markets",
      },
    ],
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
      {/*<body className={inter.className} */}
      <body>
        <SessionProvider session={session}>
          <PredictionProvider>
            <TournamentPredictionProvider>
              <TournamentProvider>
                <Analytics />
                <Navbar />
                {/* <BetaTesting /> */}
                {children}
                {/* <LoadWallet /> */}
                <Footer />
              </TournamentProvider>
            </TournamentPredictionProvider>
          </PredictionProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
