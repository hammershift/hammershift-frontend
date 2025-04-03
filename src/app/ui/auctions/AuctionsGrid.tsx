import React, { Suspense } from "react";
import { TimerProvider } from "@/app/_context/TimerContext";
import dynamic from "next/dynamic";

const DynamicGamesCard = dynamic(() => import("../../components/games_card"), {
  ssr: false,
  loading: () => (
    <div className="flex mt-8 justify-evenly">
      <div className="flex flex-col m-2">
        <div className="w-96 mb-5 h-48 bg-gray-700 rounded-md"></div>
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

const AuctionsGrid = ({ listing }: { listing: any }) => {
  return (
    <div className=" grid grid-cols-1 md:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-16 mt-12 ">
      {listing.length != 0 &&
        listing.map((car: any, index: number) => {
          return (
            <div key={car._id ? car._id : index + "gamesCard"}>
              <Suspense>
                <TimerProvider deadline={new Date(car.deadline)}>
                  <DynamicGamesCard
                    auction_id={
                      car.auction_id ? car.auction_id : index + "auctionId"
                    }
                    object_id={car._id}
                    make={car.make ? car.make : ""}
                    year={car.year ? car.year : ""}
                    model={car.model ? car.model : ""}
                    description={car.description ? car.description : [""]}
                    image={car.image ? car.image : ""}
                    price={car.price ? car.price : 0}
                    deadline={car.deadline ? car.deadline : Date()}
                    imageList={car.images_list ? car.images_list : ""}
                  />
                </TimerProvider>
              </Suspense>
            </div>
          );
        })}
    </div>
  );
};

export default AuctionsGrid;
