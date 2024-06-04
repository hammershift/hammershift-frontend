import React from "react";
import Logo from "../../../public/images/hammershift-logo.svg";
import Image from "next/image";
import FacebookIcon from "../../../public/images/social-icons/facebook-icon.svg";
import LinkedinIcon from "../../../public/images/social-icons/linkedin-icon.svg";
import PinterestIcon from "../../../public/images/social-icons/pinterest-icon.svg";
import TwitterIcon from "../../../public/images/social-icons/twitter-icon.svg";
import Link from "next/link";

const companyList = [
  { title: "HOW IT WORKS", link: "/how_it_works" },
  { title: "ABOUT", link: "/about_page" },
  { title: "PRESS KIT", link: "/" },
  { title: "PRIVACY NOTICE", link: "/privacy_policy" },
  { title: "TERMS & CONDITIONS", link: "/tos" },
  { title: "CONTRACT", link: "/" },
];
const productList = [
  { title: "DISCOVER", link: "/discover" },
  { title: "AUCTIONS", link: "/auctions" },
  { title: "NEWLY LISTED", link: "/discover" },
  { title: "MOST EXPENSIVE", link: "/discover" },
  { title: "MOST BIDS", link: "/discover" },
  { title: "ENDING SOON", link: "/discover" },
  { title: "MOST WAGERS", link: "/discover" },
];
const vehiclesList = ["MAKE", "TYPE", "ERA", "LOCATION"];

const Footer = () => {
  return (
    <div className="section-container tw-pt-16 md:tw-pt-[120px] tw-pb-16 md:tw-pb-20">
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8 md:tw-gap-0 tw-mb-16">
        <div>
          <Image
            src={Logo}
            width={177}
            height={32}
            alt="hammershift logo"
            className="tw-w-[177px] tw-h-[32px]"
          />
        </div>
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-8 md:tw-gap-0">
          <div>
            <div className="tw-font-bold">COMPANY</div>
            {companyList.map((item) => {
              return (
                <div key={item.title} className="tw-mt-3">
                  <Link href={item.link}>{item.title}</Link>
                </div>
              );
            })}
          </div>
          <div>
            <div className="tw-font-bold">PRODUCT</div>
            {productList.map((item) => {
              return (
                <div key={item.title} className="tw-mt-3">
                  <Link href={item.link}>{item.title}</Link>
                </div>
              );
            })}
          </div>
          <div>
            <div className="tw-font-bold">VEHICLES</div>
            {vehiclesList.map((item) => {
              return (
                <div key={item} className="tw-mt-3">
                  {item}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <hr style={{ borderColor: "white", opacity: "10%" }} />
      <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-end">
        <div className="tw-my-8">
          <div className="tw-font-bold tw-text-xl">
            Shift Your Perspective, Hammer Down on Your Predictions
          </div>
          <div>Skill-based wagering for those in the know</div>
          <div className="tw-pt-6 tw-flex">
            <Image
              src={TwitterIcon}
              width={24}
              height={24}
              alt="twitter logo"
              className="tw-w-6 tw-h-6 tw-mr-6"
            />
            <Image
              src={LinkedinIcon}
              width={24}
              height={24}
              alt="twitter logo"
              className="tw-w-6 tw-h-6 tw-mr-6"
            />
            <Image
              src={FacebookIcon}
              width={24}
              height={24}
              alt="twitter logo"
              className="tw-w-6 tw-h-6 tw-mr-6"
            />
            <Image
              src={PinterestIcon}
              width={24}
              height={24}
              alt="twitter logo"
              className="tw-w-6 tw-h-6 tw-mr-6"
            />
          </div>
        </div>
        <div className="tw-flex tw-flex-col tw-items-end">
          <div className="tw-opacity-20">Designed by Toffeenut Design</div>
          <div>© 2023 HammerShift. All rights reserved.</div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
