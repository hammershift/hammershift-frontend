"use client";

import React, { useEffect, useState } from "react";
import Links from "../../../components/links";
import { useParams, useRouter } from "next/navigation";
import { TournamentsListCard } from "../../../components/card";
import Image from "next/image";
import { LatestNews } from "../../../components/how_hammeshift_works";
import { SubscribeSmall } from "../../../components/subscribe";
import { TournamentsCard } from "../../../components/card";
import Footer from "../../../components/footer";
import Link from "next/link";

import PhotoOne from "../../../../../public/images/car-view-page/photoOne.svg";
import PhotoTwo from "../../../../../public/images/car-view-page/photoTwo.svg";
import PhotoThree from "../../../../../public/images/car-view-page/photoThree.svg";
import PhotoFour from "../../../../../public/images/car-view-page/photoFour.svg";
import PhotoFive from "../../../../../public/images/car-view-page/photoOne.svg";

import TournamentWagerModal from "@/app/components/tournament_wager_modal";
import { carDataThree } from "@/sample_data";
import {
  CommentsSection,
  TitleTournamentsList,
  TournamentButtons,
  TournamentInfoSection,
  TournamentWagersSection,
  TournamentsList,
  TournamentsYouMightLike,
} from "@/app/ui/tournaments_car_view_page/TournamentsCarViewPage";
import {
  createTournamentWager,
  getAuctionsByTournamentId,
  getTournamentById,
} from "@/lib/data";
import { useSession } from "next-auth/react";
import { TimerProvider } from "@/app/_context/TimerContext";

interface Tournaments {
  _id: string;
  title: string;
  pot: number;
  endTime: Date;
  cars: number;

  // Add other properties of the tournament here
}
interface Auction {
  auction_id: string;
  description: string;
  image: string;
  deadline: string;
  tournamentID: string;
  attributes: any[];
}

const TournamentViewPage = ({
  params,
}: {
  params: { tournament_id: string };
}) => {
  const { data: session } = useSession();
  const [isWagerMenuOpen, setIsWagerMenuOpen] = useState(false);
  const [toggleTournamentWagerModal, setToggleTournamentWagerModal] =
    useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [wagers, setWagers] = useState<any>({});
  const [tournamentData, setTournamentData] = useState<Tournaments | undefined>(
    undefined
  );
  const [auctionData, setAuctionData] = useState<Auction[]>([]);

  const ID = params.tournament_id;

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const data = await getAuctionsByTournamentId(ID);
        console.log("auctions: ", data);
        setAuctionData(data);
      } catch (error) {
        console.error("Failed to fetch auctions data:", error);
      }
    };
    fetchAuctionData();
  }, [ID]);

  useEffect(() => {
    const fetchTournamentsData = async () => {
      try {
        const data = await getTournamentById(ID);
        console.log("tournament: ", data);
        setTournamentData(data);
      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
      }
    };
    fetchTournamentsData();
  }, [ID]);

  const handleInputs = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.name) {
      case "auction_1":
        setWagers({
          ...wagers,
          auction_1: {
            auctionID: e.target.id,
            priceGuessed: Number(e.target.value),
          },
        });
        break;
      case "auction_2":
        setWagers({
          ...wagers,
          auction_2: {
            auctionID: e.target.id,
            priceGuessed: Number(e.target.value),
          },
        });
        break;
      case "auction_3":
        setWagers({
          ...wagers,
          auction_3: {
            auctionID: e.target.id,
            priceGuessed: Number(e.target.value),
          },
        });
        break;
      case "auction_4":
        setWagers({
          ...wagers,
          auction_4: {
            auctionID: e.target.id,
            priceGuessed: Number(e.target.value),
          },
        });
        break;
      case "auction_5":
        setWagers({
          ...wagers,
          auction_5: {
            auctionID: e.target.id,
            priceGuessed: Number(e.target.value),
          },
        });
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    sessionData: any
  ) => {
    e.preventDefault();
    const wagerArray = Object.values(wagers).map((item: any) => ({
      auctionID: item.auctionID,
      priceGuessed: item.priceGuessed,
    }));

    const tournamentWagerData = {
      tournamentID: "6576f81032fad9708a3c3f8f",
      wagers: wagerArray,
      buyInAmount: 100,
      user: sessionData,
    };
    try {
      console.log(tournamentWagerData);

      const tournamentWager = await createTournamentWager(tournamentWagerData);
      setToggleTournamentWagerModal(false);
      console.log(tournamentWager);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleModal = () => {
    setToggleTournamentWagerModal((prev) => !prev);
  };

  return (
    <div className="page-container tw-relative">
      {toggleTournamentWagerModal ? (
        <TournamentWagerModal
          handleSubmit={handleSubmit}
          handleInputs={handleInputs}
          toggleTournamentWagerModal={toggleModal}
          isButtonClicked={isButtonClicked}
        />
      ) : null}
      <div className="section-container tw-flex tw-justify-between tw-items-center tw-mt-4 md:tw-mt-16">
        <div className="tw-w-auto tw-h-[28px] tw-flex tw-items-center tw-bg-[#184C80] tw-font-bold tw-rounded-full tw-px-2.5 tw-py-2 tw-text-[14px]">
          TOURNAMENT
        </div>
        <div className="tw-hidden sm:tw-block">
          <TournamentButtons toggleTournamentWagerModal={toggleModal} />
        </div>
      </div>

      <div className="section-container tw-w-full tw-mt-4 md:tw-mt-8 tw-flex tw-flex-col lg:tw-flex-row">
        <div className="left-container-marker tw-w-full tw-basis-2/3 tw-pl-0 lg:tw-pr-8">
          {tournamentData && (
            <TimerProvider deadline={tournamentData.endTime}>
              <TitleTournamentsList
                _id={tournamentData._id}
                title={tournamentData.title}
                cars={auctionData.length}
                pot={tournamentData.pot}
                endTime={tournamentData.endTime}
              />
            </TimerProvider>
          )}
          <div className="sm:tw-hidden tw-mt-4">
            <TournamentButtons toggleTournamentWagerModal={toggleModal} />
          </div>
          <TournamentsList
            toggleTournamentWagerModal={toggleModal}
            auctionData={auctionData}
          />
          <div className="sm:tw-hidden tw-my-8">
            <TournamentWagersSection toggleTournamentWagerModal={toggleModal} />
            <TournamentInfoSection />
          </div>
          <CommentsSection />
        </div>
        <div className="right-container-marker tw-w-full tw-basis-1/3 tw-pl-0 lg:tw-pl-8 tw-hidden lg:tw-block">
          <TournamentWagersSection toggleTournamentWagerModal={toggleModal} />
          <TournamentInfoSection />
        </div>
      </div>
      {/* TODO: Check if working*/}
      {/* <TournamentWagerPage /> */}
      {isWagerMenuOpen && (
        <div className="tw-bg-black tw-w-screen tw-h-full"></div>
      )}
      <TournamentsYouMightLike />
    </div>
  );
};

export default TournamentViewPage;