"use client";

import React, { useEffect, useState } from "react";
import TournamentWagerModal from "@/app/components/tournament_wager_modal";
import {
  TitleTournamentsList,
  TournamentButtons,
  TournamentDescriptionSection,
  TournamentInfoSection,
  TournamentLeaderboard,
  TournamentWagersSection,
  TournamentWinnersSection,
  TournamentsList,
  TournamentsYouMightLike,
} from "@/app/ui/tournaments_car_view_page/TournamentsCarViewPage";
import {
  addTournamentPot,
  createTournamentWager,
  getAllTournamentWagers,
  getAuctionsByTournamentId,
  getOneTournamentWager,
  getTournamentById,
  getTournamentPointsByTournamentId,
  getTournamentTransactions,
} from "@/lib/data";
import { useSession } from "next-auth/react";
import { TimerProvider, useTimer } from "@/app/_context/TimerContext";
import { CommentsSection } from "@/app/components/CommentsSection";

export interface Tournaments {
  _id: string;
  title: string;
  description?: string;
  pot: number;
  endTime: Date;
  tournamentEndTime: Date;
  cars: number;
  buyInFee: number;
}
export interface Auction {
  _id: string;
  auction_id: string;
  description: string;
  image: string;
  deadline: string;
  tournamentID: string;
  attributes: any[];
  sort: any;
}

interface AuctionScore {
  auctionID: string;
  score: number;
}

interface TournamentPoints {
  player: string;
  points: number;
  auctionScores: AuctionScore[];
}

const TournamentViewPage = ({
  params,
}: {
  params: { tournament_id: string };
}) => {
  const { data: session } = useSession();
  const [isWagerMenuOpen, setIsWagerMenuOpen] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [toggleTournamentWagerModal, setToggleTournamentWagerModal] =
    useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [wagers, setWagers] = useState<any>({});
  const [tournamentData, setTournamentData] = useState<Tournaments | undefined>(
    undefined
  );
  const [auctionData, setAuctionData] = useState<Auction[]>([]);
  const [tournamentWagers, setTournamentWagers] = useState([]);
  const [buyInEnded, setBuyInEnded] = useState(false);
  const [tournamentEnded, setTournamentEnded] = useState(false);
  const [tournamentImages, setTournamentImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prize, setPrize] = useState(0);
  const [winners, setWinners] = useState([]);
  const [tournamentPointsData, setTournamentPointsData] = useState<
    TournamentPoints[]
  >([]);
  const [playerLimit, setPlayerLimit] = useState(10);
  const [canceledTournament, setCanceledTournament] = useState<boolean>(false);

  const ID = params.tournament_id;

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const data = await getAuctionsByTournamentId(ID);
        console.log("auctions: ", data);
        setAuctionData(data);
        const images = await data.map((auction: any) => auction.image);
        setTournamentImages(images);
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
        const transactions = await getTournamentTransactions(ID);
        const tournamentPoints = await getTournamentPointsByTournamentId(
          ID,
          playerLimit
        );
        const currentDate = new Date();
        const buyInDeadline = new Date(data?.endTime);
        const tournamentDeadline = new Date(data?.tournamentEndTime);
        const totalPrize =
          0.88 *
          transactions
            .map((transaction: any) => transaction.amount)
            .reduce(
              (accumulator: any, currentValue: any) =>
                accumulator + currentValue,
              0
            );

        setTournamentData(data);
        setWinners(data?.winners);
        setBuyInEnded(buyInDeadline < currentDate);
        setTournamentEnded(tournamentDeadline < currentDate);
        setCanceledTournament(data?.status === 3);
        setPrize(totalPrize);
        setTournamentPointsData(tournamentPoints);
      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
      }
    };
    fetchTournamentsData();
  }, [ID, playerLimit, toggleTournamentWagerModal]);

  useEffect(() => {
    const checkIfAlreadyWagered = async () => {
      if (session && tournamentData) {
        const tournamentWager = await getOneTournamentWager(
          tournamentData._id,
          session.user.id
        );

        !tournamentWager ? setAlreadyJoined(false) : setAlreadyJoined(true);
      }
    };

    const fetchTournamentWagers = async () => {
      if (tournamentData) {
        const wagers = await getAllTournamentWagers(tournamentData._id);
        setTournamentWagers(wagers);
      }
    };

    checkIfAlreadyWagered();
    fetchTournamentWagers();
  }, [toggleTournamentWagerModal, session, tournamentData]);

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
    if (isSubmitting) {
      console.log("race condition");

      return;
    }
    setIsSubmitting(true);
    setIsButtonClicked(true);
    const data = await getTournamentById(ID);

    const wagerArray = Object.values(wagers).map((item: any) => ({
      auctionID: item.auctionID,
      priceGuessed: item.priceGuessed,
    }));

    const tournamentWagerData = {
      tournamentID: data._id,
      wagers: wagerArray,
      buyInAmount: data.buyInFee,
      user: sessionData,
    };
    console.log(tournamentWagerData);

    try {
      const tournamentWager = await createTournamentWager(tournamentWagerData);
      await addTournamentPot(data.buyInFee * 0.88 + data.pot, data._id);
      setToggleTournamentWagerModal(false);
      setIsSubmitting(false);
      document.body.classList.remove("stop-scrolling");
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const toggleModal = () => {
    setToggleTournamentWagerModal((prev) => !prev);
  };

  const closeModal = () => {
    setToggleTournamentWagerModal(false);
  };

  return (
    <div className="page-container tw-relative">
      {toggleTournamentWagerModal ? (
        <TournamentWagerModal
          pot={prize}
          tournamentData={tournamentData}
          auctionData={auctionData}
          handleSubmit={handleSubmit}
          handleInputs={handleInputs}
          toggleTournamentWagerModal={toggleModal}
          isButtonClicked={isButtonClicked}
          closeModal={closeModal}
        />
      ) : null}
      <div className="section-container tw-flex tw-justify-between tw-items-center tw-mt-4 md:tw-mt-8">
        <div className="tw-w-auto tw-h-[28px] tw-flex tw-items-center tw-bg-[#184C80] tw-font-bold tw-rounded-full tw-px-2.5 tw-py-2 tw-text-[14px]">
          TOURNAMENT
        </div>
        <div className="tw-hidden sm:tw-block">
          {tournamentData && (
            <TournamentButtons
              tournamentImages={tournamentImages}
              toggleTournamentWagerModal={toggleModal}
              buyInFee={tournamentData.buyInFee}
              alreadyJoined={alreadyJoined}
              buyInEnded={buyInEnded}
              tournamentID={ID}
              tournamentEnded={tournamentEnded}
              canceledTournament={canceledTournament}
            />
          )}
        </div>
      </div>
      <div className="section-container tw-w-full tw-mt-4 md:tw-mt-8 tw-flex tw-flex-col lg:tw-flex-row">
        <div className="left-container-marker tw-w-full tw-basis-2/3 tw-pl-0 lg:tw-pr-8">
          {tournamentData && (
            <TimerProvider deadline={tournamentData.endTime}>
              <TitleTournamentsList
                _id={tournamentData._id}
                description={tournamentData.description ?? ""}
                title={tournamentData.title}
                cars={auctionData.length}
                pot={prize}
                endTime={tournamentData.endTime}
                tournamentEndTime={tournamentData.tournamentEndTime}
              />
            </TimerProvider>
          )}
          <div className="sm:tw-hidden tw-mt-4">
            {tournamentData && (
              <TournamentButtons
                tournamentImages={tournamentImages}
                tournamentID={ID}
                toggleTournamentWagerModal={toggleModal}
                buyInFee={tournamentData.buyInFee}
                alreadyJoined={alreadyJoined}
                buyInEnded={buyInEnded}
                tournamentEnded={tournamentEnded}
                canceledTournament={canceledTournament}
              />
            )}
          </div>
          <TournamentDescriptionSection
            description={tournamentData?.description ?? ""}
          />
          <TournamentsList
            buyInFee={tournamentData?.buyInFee}
            toggleTournamentWagerModal={toggleModal}
            auctionData={auctionData}
            alreadyJoined={alreadyJoined}
            tournamentEnded={buyInEnded}
            tournamentID={ID}
          />
          <div className="tw-block sm:tw-hidden tw-mt-8">
            {winners.length !== 0 ? (
              <TournamentWinnersSection winners={winners} />
            ) : null}
          </div>
          <div className="sm:tw-hidden tw-my-8">
            <TournamentWagersSection
              tournamentWagers={tournamentWagers}
              toggleTournamentWagerModal={toggleModal}
              alreadyJoined={alreadyJoined}
              tournamentEnded={buyInEnded}
            />
            <TournamentInfoSection />
          </div>
          <CommentsSection pageID={ID} pageType="tournament" />
        </div>
        <div className="right-container-marker tw-w-full tw-basis-1/3 tw-pl-0 lg:tw-pl-8 tw-hidden lg:tw-flex lg:tw-flex-col lg:tw-gap-8">
          {tournamentEnded && winners.length !== 0 ? (
            <TournamentWinnersSection winners={winners} />
          ) : null}
          {buyInEnded === true && tournamentPointsData.length !== 0 ? (
            <TournamentLeaderboard
              tournamentPointsData={tournamentPointsData}
            />
          ) : null}
          <TournamentWagersSection
            tournamentWagers={tournamentWagers}
            toggleTournamentWagerModal={toggleModal}
            alreadyJoined={alreadyJoined}
            tournamentEnded={buyInEnded}
          />
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
