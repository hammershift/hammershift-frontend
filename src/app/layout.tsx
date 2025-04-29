import SessionProvider from "@/providers/sessionProvider";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import "./styles/app.css";
import "./styles/globals.css";
// import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Footer from "./components/footer";
import Navbar from "./components/navbar";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Predict Classic Car Auctions – Velocity Markets',
  description: 'Compete to predict hammer prices of collectible car auctions. Join free or paid games, track the market, and turn your car knowledge into real rewards.',
  openGraph: {
    images: [
      {
        url: `${process.env.NEXTAUTH_URL}/metadata.png`,
        width: 1200,
        height: 630,
        alt: 'Velocity Markets'
      }
    ]
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en">
      {/*<body className={inter.className} */}
      <SessionProvider session={session}>
        <body>
          <Analytics />
          <Navbar />
          {/* <BetaTesting /> */}
          {children}
          {/* <LoadWallet /> */}
          <Footer />
        </body>
      </SessionProvider>
    </html>
  );
}
