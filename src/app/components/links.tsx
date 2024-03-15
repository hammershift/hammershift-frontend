import React from "react";
import GiftIcon from "../../../public/images/gift-02.svg";
import Image from "next/image";
import Link from "next/link";

export const Links = (closeMenu: any) => {
  return (
    <main className="section-container ">
      <div className="tw-w-full tw-overflow-x-auto tw-flex">
        <div className="tw-flex tw-justify-start md:tw-justify-center tw-py-2 tw-w-full  tw-min-w-[100px]">
          {/* <Link href="/homepage" className="tw-flex">
            <Image
              src={GiftIcon}
              width={20}
              height={20}
              alt="gift icon"
              className="tw-w-[20px] tw-h-[20px] tw-mr-2"
            />
            {`TODAY'S MINI GAME`}
          </Link> */}
          <Link href="/tournaments" className="tw-ml-4 md:tw-ml-9 tw-text-sm">
            TOURNAMENTS
          </Link>
          {/* <Link href="/homepage" className="tw-ml-4 md:tw-ml-9">
            HIGH-ROLLERS
          </Link> */}
          <Link href="/about_page" className="tw-ml-4 md:tw-ml-9 tw-text-sm">
            ABOUT
          </Link>
          {/* <Link href="/" className="tw-ml-4 md:tw-ml-9">
            HOW IT WORKS
          </Link> */}
          <Link href="/leaderboard" className="tw-ml-4 md:tw-ml-9 tw-text-sm">
            LEADERBOARD
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Links;
