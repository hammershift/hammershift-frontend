"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { sortByMostExpensive } from "@/lib/data";
import { TimerProvider } from "../_context/TimerContext";

import GamesByMakeIcon from "../../../public/images/green-diagonal.svg";
import Link from "next/link";

const MostExpensiveCars = () => {
  const [mostExpensive, setMostExpensive] = useState([]);
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
        const mostExpensiveData = await sortByMostExpensive();
        setIsLoading(true);

        if (mostExpensiveData && "cars" in mostExpensiveData) {
          setMostExpensive(mostExpensiveData.cars);
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
            <div className="font-bold text-2xl sm:text-3xl ml-4">
              Most Expensive Cars
            </div>
          </div>
          <Link
            href="/auctions?sort=Most+Expensive"
            className="cursor-pointer"
          >
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
              {mostExpensive.map((auctions, index) => {
                const {
                  image,
                  year,
                  make,
                  model,
                  description,
                  deadline,
                  auction_id,
                  price,
                  _id,
                  images_list
                } = auctions;
                return (
                  <TimerProvider key={index} deadline={deadline}>
                    <div className="w-[200px] sm:w-[416px]">
                      <DynamicCards
                        object_id={_id}
                        image={image}
                        year={year}
                        make={make}
                        model={model}
                        description={description}
                        deadline={deadline}
                        auction_id={auction_id}
                        price={price}
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

export default MostExpensiveCars;
