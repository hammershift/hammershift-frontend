import { sortByTrending } from "@/lib/data";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

import Link from "next/link";
import GamesByMakeIcon from "../../../public/images/green-diagonal.svg";
import { TimerProvider } from "../context/TimerContext";

const WhatsTrending = () => {
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const DynamicCards = dynamic(() => import("@/app/components/old_card"), {
    ssr: false,
    loading: () => (
      <div className="flex mt-8 justify-evenly">
        <div className="flex flex-col m-2">
          <div className="w-96 mb-5 h-48 bg-gray-700"></div>
          <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    ),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trendingCarsData = await sortByTrending();
        setIsLoading(true);
        if (trendingCarsData && "cars" in trendingCarsData) {
          setTrending(trendingCarsData.cars);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="section-container py-8 sm:py-12">
      <header className="max-w-[1312px]">
        <div className="flex justify-between">
          <div className="flex items-center">
            <Image
              src={GamesByMakeIcon}
              width={40}
              height={40}
              alt="dollar"
              className="w-10 h-10"
            />
            <div className="font-bold text-2xl sm:text-3xl ml-4">{`What\'s Trending`}</div>
          </div>
          <Link href="/auctions?sort=Most+Bids" className="cursor-pointer">
            <div className="text-[#49C742]">See All</div>
          </Link>
        </div>
      </header>
      {isLoading ? (
        <div className="flex mt-8 justify-evenly">
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex flex-col m-2">
            <div className="w-96 mb-5 h-48 bg-gray-700"></div>
            <div className="w-4/5 h-10 mb-5 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-5 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-2 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-full mb-10 h-3 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-1/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      ) : (
        <section className="overflow-x-auto w-full">
          <div className=" w-[632px] sm:w-[1312px] ">
            <div className=" grid grid-cols-3 gap-4 sm:gap-8 mt-12 ">
              {trending.map((auctions, index) => {
                const {
                  _id,
                  image,
                  year,
                  make,
                  model,
                  description,
                  deadline,
                  auction_id,
                  price,
                  images_list
                } = auctions;
                return (
                  <TimerProvider key={index} deadline={deadline}>
                    <div className="w-[200px] sm:w-[416px]">
                      <DynamicCards
                        image={image}
                        year={year}
                        make={make}
                        model={model}
                        description={description}
                        deadline={deadline}
                        auction_id={auction_id}
                        price={price}
                        object_id={_id}
                        images_list={images_list}
                      />
                    </div>
                  </TimerProvider>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default WhatsTrending;
