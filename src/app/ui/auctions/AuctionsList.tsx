import React, { Suspense } from "react";
import { TimerProvider } from "@/app/_context/TimerContext";
import { AuctionsListCard, GamesCard } from "@/app/components/card";

const AuctionsList = ({ listing }: { listing: any }) => {
  return (
    <div className="tw-flex tw-flex-col tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 ">
      {listing.length != 0 &&
        listing.map((car: any, index: number) => (
          <div key={car._id ? car._id : index + "gamesCard"}>
            <Suspense>
              <TimerProvider deadline={new Date(car.deadline)}>
                <AuctionsListCard
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
