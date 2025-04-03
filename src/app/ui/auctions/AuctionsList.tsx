import React, { Suspense } from "react";
import { TimerProvider } from "@/app/_context/TimerContext";
import AuctionsListCard from "@/app/components/auctions_list_card";
import dynamic from "next/dynamic";

const DynamicAuctionsListCard = dynamic(
  () => import("../../components/auctions_list_card"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-row gap-4">
        <div className="mb-5 bg-gray-700 max-w-[156px] sm:max-w-[416px] w-full min-w-[156px] h-auto  min-h-[147px] xl:h-[240px] rounded object-cover aspect-auto hover:cursor-pointer"></div>
        <div className="flex flex-col w-auto flex-grow gap-2">
          <div className="w-2/3 mb-2 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-2/3 mb-2 h-6 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="w-2/3 mb-2 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
    ),
  }
);

const AuctionsList = ({ listing }: { listing: any }) => {
  return (
    <div className="flex flex-col gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-16 mt-12 ">
      {listing.length != 0 &&
        listing.map((car: any, index: number) => (
          <div key={car._id ? car._id : index + "gamesCard"}>
            <Suspense>
              <TimerProvider deadline={new Date(car.deadline)}>
                <DynamicAuctionsListCard
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
                />
              </TimerProvider>
            </Suspense>
          </div>
        ))}
    </div>
  );
};

export default AuctionsList;
