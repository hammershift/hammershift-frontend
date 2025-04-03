import React from "react";
import Link from "next/link";
import { createPageUrl } from "./utils";

const Footer = () => {
  const footerList = [
    {
      header: "Game Modes",
      content: [
        { title: "Free Play", urlString: "Free Play" },
        { title: "Tournaments", urlString: "Tournaments" },
        { title: "Guess the Hammer", urlString: "Price Is Right" },
      ]
    },
    {
      header: "Resources",
      content: [
        { title: "How It Works", urlString: "How It Works" },
        { title: "Rules", urlString: "Rules" },
        { title: "FAQ", urlString: "FAQ" },
      ]
    },
    {
      header: "Contact",
      content: [
        { title: "Contact Us", urlString: "Contact" },
        { title: "Support", urlString: "Contact" },
        { title: "Careers", urlString: "Coming Soon" },
      ]
    }];

  const bottomFooterList = [
    { title: "Terms of Service", urlString: "Terms of Service" },
    { title: "Privacy Policy", urlString: "Privacy Policy" },
  ]

  const logoUrl =
    "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/08c277_VelocityMarketsLogo-White.png";

  return (
    <div className="bg-[#13202D] border-t border-[#1E2A36]">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src={logoUrl} alt="Velocity Markets" className="h-10 mb-4 w-auto" />
            <p className="text-gray-300 mb-4">
              The ultimate platform for predicting classic car auction
              outcomes.
            </p>
          </div>
          {
            footerList.map((footerContent, fcIndex) => (

              <div key={fcIndex}>
                <h4 className="font-bold uppercase mb-4">{footerContent.header}</h4>
                <div className="flex flex-col space-y-2">
                  {
                    footerContent.content.map((data, index) => (
                      <Link key={index}
                        href={createPageUrl(data.urlString)}
                        className="hover:text-[#F2CA16]"
                      >
                        {data.title.toUpperCase()}
                      </Link>
                    ))
                  }
                </div>
              </div>
            ))
          }
        </div>
        <div className="border-t border-[#1E2A36] mt-8 pt-6 text-center text-sm text-gray-400">
          <p className="mb-4">
            <strong>Risk Warning:</strong> Velocity Markets is a price
            prediction platform for entertainment purposes. All predictions
            involve risk and uncertainty. No information presented constitutes
            financial advice. Users must be 18+ for free games and 21+ for
            paid games.
          </p>
          <p>© 2024 Velocity Markets. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            {
              bottomFooterList.map((data, index) => (
                <Link
                  key={index}
                  href={createPageUrl(data.urlString)}
                  className="hover:text-[#F2CA16]"
                >
                  {data.title}
                </Link>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
