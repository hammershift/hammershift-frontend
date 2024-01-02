"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { sortByNewGames } from "@/lib/data";
import { TimerProvider } from "../_context/TimerContext";

import GamesByMakeIcon from "../../../public/images/green-diagonal.svg";
import { MoonLoader } from "react-spinners";

const NewGames = () => {
  const [newlyListed, setNewlyListed] = useState([]);

  const DynamicCards = dynamic(() => import("./card"), {
    ssr: false,
    loading: () => <MoonLoader color="#ffe500" />,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newGamesData = await sortByNewGames();
        setNewlyListed(newGamesData.cars);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="section-container tw-py-8 sm:tw-py-12">
      <header className="tw-max-w-[1312px]">
        <div className="tw-flex tw-justify-between">
          <div className="tw-flex tw-items-center">
            <Image
              src={GamesByMakeIcon}
              width={40}
              height={40}
              alt="dollar"
              className="tw-w-10 tw-h-10"
            />
            <div className="tw-font-bold tw-text-2xl sm:tw-text-3xl tw-ml-4">
              New Games
            </div>
          </div>
          <div className="tw-text-[#49C742]">See All</div>
        </div>
      </header>

      <section className="tw-overflow-x-auto tw-w-full">
        <div className=" tw-w-[632px] sm:tw-w-[1312px] ">
          <div className=" tw-grid tw-grid-cols-3 tw-gap-4 sm:tw-gap-8 tw-mt-12 ">
            {newlyListed.map((auctions, index) => {
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
              } = auctions;
              return (
                <TimerProvider key={index} deadline={deadline}>
                  <div className="tw-w-[300px] sm:tw-w-[416px]">
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
                    />
                  </div>
                </TimerProvider>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewGames;
