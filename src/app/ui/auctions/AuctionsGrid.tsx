import React, { Suspense } from "react";
import { TimerProvider } from "@/app/_context/TimerContext";
import dynamic from "next/dynamic";

const DynamicGamesCard = dynamic(() => import("../../components/games_card"), {
  ssr: false,
  loading: () => (
    <div className="tw-flex tw-mt-8 tw-justify-evenly">
      <div className="tw-flex tw-flex-col tw-m-2">
        <div className="tw-w-96 tw-mb-5 tw-h-48 tw-bg-gray-700 tw-rounded-md"></div>
        <div className="tw-w-4/5 tw-h-10 tw-mb-5 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        <div className="tw-w-full tw-mb-5 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        <div className="tw-w-full tw-mb-2 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        <div className="tw-w-full tw-mb-10 tw-h-3 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
        <div className="tw-w-1/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
      </div>
    </div>
  ),
});

const AuctionsGrid = ({ listing }: { listing: any }) => {
  return (
    <div className=" tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 ">
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
