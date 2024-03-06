import React, { Suspense } from "react";
import { TimerProvider } from "@/app/_context/TimerContext";
import AuctionsListCard from "@/app/components/auctions_list_card";
import dynamic from "next/dynamic";

const DynamicAuctionsListCard = dynamic(
  () => import("../../components/auctions_list_card"),
  {
    ssr: false,
    loading: () => (
<div className="tw-flex tw-flex-row tw-gap-4">
  <div className="tw-mb-5 tw-bg-gray-700 tw-max-w-[156px] sm:tw-max-w-[416px] tw-w-full tw-min-w-[156px] tw-h-auto  tw-min-h-[147px] xl:tw-h-[240px] tw-rounded tw-object-cover tw-aspect-auto hover:tw-cursor-pointer"></div>
  <div className="tw-flex tw-flex-col tw-w-auto tw-flex-grow tw-gap-2">
    <div className="tw-w-2/3 tw-mb-2 tw-h-8 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
    <div className="tw-w-2/3 tw-mb-2 tw-h-6 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
    <div className="tw-w-2/3 tw-mb-2 tw-h-10 tw-bg-gray-700 tw-rounded-lg tw-animate-pulse"></div>
  </div>
</div>
    ),
  }
);

const AuctionsList = ({ listing }: { listing: any }) => {
  return (
    <div className="tw-flex tw-flex-col tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 ">
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
