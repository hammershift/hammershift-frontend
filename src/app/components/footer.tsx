import React from "react";
import Link from "next/link";
import { createPageUrl } from "./utils";

const Footer = () => {
  const footerList = [
    {
      header: "Game Modes",
      content: [
        { title: "Free Play", urlString: "FreePlay" },
        { title: "Tournaments", urlString: "Tournaments" },
        { title: "Guess the Hammer", urlString: "PriceIsRight" },
      ]
    },
    {
      header: "Resources",
      content: [
        { title: "How It Works", urlString: "HowItWorks" },
        { title: "Rules", urlString: "Rules" },
        { title: "FAQ", urlString: "FAQ" },
      ]
    },
    {
      header: "Contact",
      content: [
        { title: "Contact Us", urlString: "Contact" },
        { title: "Support", urlString: "Contact" },
        { title: "Careers", urlString: "ComingSoon" },
      ]
    }];
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
                        className="hover:text-[#F2CA16] uppercase"
                      >
                        {data.title}
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
            <Link
              href={createPageUrl("TermsOfService")}
              className="hover:text-[#F2CA16]"
            >
              Terms of Service
            </Link>
            <Link
              href={createPageUrl("PrivacyPolicy")}
              className="hover:text-[#F2CA16]"
            >
              Privacy Policy
            </Link>
            <Link
              href={createPageUrl("DeveloperDocs")}
              className="hover:text-[#F2CA16]"
            >
              Dev Guide
            </Link>
            <Link
              href={createPageUrl("Admin")}
              className="text-gray-500 hover:text-[#F2CA16]"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
    // <div className="section-container pt-16 md:pt-[120px] pb-16 md:pb-20">
    //   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 mb-16">
    //     <div>
    //       <Image
    //         src={Logo}
    //         width={177}
    //         height={32}
    //         alt="hammershift logo"
    //         className="w-[177px] h-[32px]"
    //       />
    //     </div>
    //     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
    //       <div>
    //         <div className="font-bold">COMPANY</div>
    //         {companyList.map((item) => {
    //           return (
    //             <div key={item.title} className="mt-3">
    //               <Link href={item.link}>{item.title}</Link>
    //             </div>
    //           );
    //         })}
    //       </div>
    //       <div>
    //         <div className="font-bold">PRODUCT</div>
    //         {productList.map((item) => {
    //           return (
    //             <div key={item.title} className="mt-3">
    //               <Link href={item.link}>{item.title}</Link>
    //             </div>
    //           );
    //         })}
    //       </div>
    //       <div>
    //         <div className="font-bold">VEHICLES</div>
    //         {vehiclesList.map((item) => {
    //           return (
    //             <div key={item} className="mt-3">
    //               {item}
    //             </div>
    //           );
    //         })}
    //       </div>
    //     </div>
    //   </div>
    //   <hr style={{ borderColor: "white", opacity: "10%" }} />
    //   <div className="flex flex-col md:flex-row justify-between items-end">
    //     <div className="my-8">
    //       <div className="font-bold text-xl">
    //         Shift Your Perspective, Hammer Down on Your Predictions
    //       </div>
    //       <div>Skill-based wagering for those in the know</div>
    //       <div className="pt-6 flex">
    //         <Image
    //           src={TwitterIcon}
    //           width={24}
    //           height={24}
    //           alt="twitter logo"
    //           className="w-6 h-6 mr-6"
    //         />
    //         <Image
    //           src={LinkedinIcon}
    //           width={24}
    //           height={24}
    //           alt="twitter logo"
    //           className="w-6 h-6 mr-6"
    //         />
    //         <Image
    //           src={FacebookIcon}
    //           width={24}
    //           height={24}
    //           alt="twitter logo"
    //           className="w-6 h-6 mr-6"
    //         />
    //         <Image
    //           src={PinterestIcon}
    //           width={24}
    //           height={24}
    //           alt="twitter logo"
    //           className="w-6 h-6 mr-6"
    //         />
    //       </div>
    //     </div>
    //     <div className="flex flex-col items-end">
    //       <div className="opacity-20">Designed by Toffeenut Design</div>
    //       <div>© 2023 HammerShift. All rights reserved.</div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default Footer;
