import { TournamentsCard } from "@/app/components/card";
import React from "react";

const TournamentsList = () => {
  const sampleTournamentData = [
    {
      auctionID: "123456",
      players: [{}],
      buyInFee: 100,
      finalPrize: 250000,
      isActive: true,
      startTime: new Date("2024-02-05T01:45:19.114+00:00"),
      endTime: new Date("2024-12-12T01:45:19.114+00:00"),
      totalWagers: 5,
    },
    {
      auctionID: "1234567",
      players: [{}],
      buyInFee: 100,
      finalPrize: 250000,
      isActive: true,
      startTime: new Date("2024-02-05T01:45:19.114+00:00"),
      endTime: new Date("2024-12-12T01:45:19.114+00:00"),
      totalWagers: 5,
    },
    {
      auctionID: "12345678",
      players: [{}],
      buyInFee: 100,
      finalPrize: 250000,
      isActive: true,
      startTime: new Date("2024-02-05T01:45:19.114+00:00"),
      endTime: new Date("2024-12-12T01:45:19.114+00:00"),
      totalWagers: 5,
    },
  ];

  return (
    <div>
      <div className="tw-mt-5">
        <span className="tw-bg-[#156CC3] tw-rounded-full tw-px-2.5 tw-py-2 tw-font-bold">
          ACTIVE TOURNAMENTS
        </span>
      </div>
      <div className="tw-flex tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 ">
        {/* to be replaced with map */}
        <TournamentsCard />
        <TournamentsCard />
        <TournamentsCard />
      </div>
    </div>
  );
};

export default TournamentsList;
