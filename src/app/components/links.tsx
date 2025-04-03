import React from "react";
import GiftIcon from "../../../public/images/gift-02.svg";
import Image from "next/image";
import Link from "next/link";

export const Links = (closeMenu: any) => {
  return (
    <main className="section-container ">
      <div className="w-full overflow-x-auto flex">
        <div className="flex justify-start md:justify-center py-2 w-full  min-w-[100px]">
          {/* <Link href="/homepage" className="flex">
            <Image
              src={GiftIcon}
              width={20}
              height={20}
              alt="gift icon"
              className="w-[20px] h-[20px] mr-2"
            />
            {`TODAY'S MINI GAME`}
          </Link> */}
          <Link href="/tournaments" className="ml-4 md:ml-9 text-sm">
            TOURNAMENTS
          </Link>
          {/* <Link href="/homepage" className="ml-4 md:ml-9">
            HIGH-ROLLERS
          </Link> */}
          <Link href="/about_page" className="ml-4 md:ml-9 text-sm">
            ABOUT
          </Link>
          {/* <Link href="/" className="ml-4 md:ml-9">
            HOW IT WORKS
          </Link> */}
          <Link href="/leaderboard" className="ml-4 md:ml-9 text-sm">
            LEADERBOARD
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Links;
