"use client";

import { CommentsSection } from "@/app/components/CommentsSection";
import { TimerProvider } from "@/app/context/TimerContext";
import GuessThePriceInfoSection from "@/app/ui/car_view_page/GuessThePriceInfoSection";
import {
  addTournamentPot,
  createTournamentWager,
  getAllTournamentWagers,
  getAuctionsByTournamentId,
  getCarData,
  getOneTournamentWager,
  getOneUserWager,
  getTournamentById,
  getTournamentTransactions,
  getWagers,
} from "@/lib/data";
import { useSession } from "@/lib/auth-client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { auctionDataOne } from "../../../../../sample_data";
import {
  ArticleSection,
  DetailsSection,
  PhotosLayout,
  TitleSingleCarContainer,
  TournamentButtons,
  TournamentWagersSection,
  TournamentWinnersSection,
  TournamentsYouMightLike,
} from "../../../../ui/tournaments_car_view_page/TournamentsCarViewPage";

import TournamentWagerModal from "@/app/components/tournament_wager_modal";

import { Auction } from "../page";

export interface Tournaments {
  _id: string;
  title: string;
  pot: number;
  endTime: Date;
  tournamentEndTime: Date;
  cars: number;
  buyInFee: number;

  // Add other properties of the tournament here
}

const SingleViewPage = ({
  params,
}: {
  params: { auction_id: string; tournament_id: string };
}) => {
  const urlPath = useParams();
  const { data: session } = useSession();

  const [carData, setCarData] = useState<any>(null);
  const [wagersData, setWagersData] = useState<any>(null);
  const [playerNum, setPlayerNum] = useState(0);
  const [toggleWagerModal, setToggleWagerModal] = useState(false);
  const [alreadyWagered, setAlreadyWagered] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showCarImageModal, setShowCarImageModal] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [toggleTournamentWagerModal, setToggleTournamentWagerModal] =
    useState(false);
  const [buyInEnded, setBuyInEnded] = useState(false);
  const [tournamentEnded, setTournamentEnded] = useState(false);
  const [tournamentWagers, setTournamentWagers] = useState([]);
  const [tournamentData, setTournamentData] = useState<Tournaments>();
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [auctionData, setAuctionData] = useState<Auction[]>([]);
  const [tournamentImages, setTournamentImages] = useState([]);
  const [prize, setPrize] = useState(0);
  const [winners, setWinners] = useState([]);
  const [canceledTournament, setCanceledTournament] = useState<boolean>(false);

  // const router = useRouter();

  const ID = params.auction_id;
  const TournamentID = params.tournament_id;

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const data = await getAuctionsByTournamentId(TournamentID);
        console.log("auctions: ", data);
        setAuctionData(data);
        const images = await data.map((auction: any) => auction.image);
        setTournamentImages(images);
      } catch (error) {
        console.error("Failed to fetch auctions data:", error);
      }
    };
    fetchAuctionData();
  }, [TournamentID]);

  useEffect(() => {
    const fetchTournamentsData = async () => {
      try {
        const data = await getTournamentById(TournamentID);
        const transactions = await getTournamentTransactions(TournamentID);
        const currentDate = new Date();
        const buyInDeadline = new Date(data?.endTime);
        const tournamentDeadline = new Date(data?.tournamentEndTime);
        console.log("tournament: ", data);
        const totalPrize =
          0.88 *
          transactions
            .map((transaction: any) => transaction.amount)
            .reduce(
              (accumulator: any, currentValue: any) =>
                accumulator + currentValue,
              0
            );
        console.log(data?.winners);
        setTournamentData(data);
        setWinners(data?.winners);
        setBuyInEnded(buyInDeadline < currentDate);
        setTournamentEnded(tournamentDeadline < currentDate);
        setPrize(totalPrize);
      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
      }
    };
    fetchTournamentsData();
  }, [TournamentID, toggleTournamentWagerModal]);

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

  // TEST IMPLEMENTATION
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (session) {
        try {
          const res = await fetch("/api/wallet", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await res.json();
          if (res.ok) {
            setWalletBalance(data.balance);
          } else {
            console.error("Failed to fetch wallet balance:", data.message);
          }
        } catch (error) {
          console.error("Error fetching wallet balance:", error);
        }
      }
    };

    fetchWalletBalance();
  }, [session]);

  useEffect(() => {
    const fetchCarData = async () => {
      const data = await getCarData(ID);
      const currentDate = new Date();
      const auctionDeadline = new Date(data?.deadline);

      setCarData(data);
      console.log("car data: ", data);

      if (session) {
        const userWager = await getOneUserWager(data?._id, session?.user.id);
        !userWager.length ? setAlreadyWagered(false) : setAlreadyWagered(true);
      }

      setAuctionEnded(auctionDeadline < currentDate);

      const wagers = await getWagers(data?._id);
      setWagersData(wagers);
      setPlayerNum(wagers.length);
    };

    fetchCarData();
  }, [ID, toggleTournamentWagerModal, session]);

  const currencyString = new Intl.NumberFormat().format(carData?.price || 0);

  const date = new Date(carData?.deadline || "2023-12-01T03:27:01.087+00:00");
  const formattedDateString = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);

  useEffect(() => {
    if (toggleTournamentWagerModal) {
      document.body.classList.add("stop-scrolling");
    } else {
      document.body.classList.remove("stop-scrolling");
    }

    return () => {
      document.body.classList.remove("body-no-scroll");
    };
  }, [toggleTournamentWagerModal]);

  const toggleCarImageModal = () => {
    setShowCarImageModal((prev) => !prev);
  };

  const [wagers, setWagers] = useState<any>({});

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
    setIsButtonClicked(true);
    if (tournamentData) {
      const wagerArray = Object.values(wagers).map((item: any) => ({
        auctionID: item.auctionID,
        priceGuessed: item.priceGuessed,
      }));

      const tournamentWagerData = {
        tournamentID: tournamentData._id,
        wagers: wagerArray,
        buyInAmount: tournamentData.buyInFee,
        user: sessionData,
      };

      try {
        console.log(tournamentWagerData);
        const tournamentWager =
          await createTournamentWager(tournamentWagerData);
        await addTournamentPot(
          tournamentData.buyInFee * 0.88 + tournamentData.pot,
          tournamentData._id
        );
        setToggleTournamentWagerModal(false);
        document.body.classList.remove("stop-scrolling");
        console.log(tournamentWager);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const toggleModal = () => {
    setToggleTournamentWagerModal((prev) => !prev);
  };

  const closeModal = () => {
    setToggleTournamentWagerModal(false);
  };

  return (
    <div className="flex w-full flex-col items-center">
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
      {tournamentData && (
        <div className="section-container mt-4 flex items-center justify-between md:mt-8">
          <div className="flex h-[28px] w-auto items-center rounded-full bg-[#184C80] px-2.5 py-2 text-[14px] font-bold">
            TOURNAMENT
          </div>
          <div className="hidden sm:block">
            <TournamentButtons
              tournamentImages={tournamentImages}
              tournamentID={TournamentID}
              toggleTournamentWagerModal={toggleModal}
              buyInFee={tournamentData?.buyInFee}
              alreadyJoined={alreadyJoined}
              buyInEnded={buyInEnded}
              tournamentEnded={tournamentEnded}
              canceledTournament={canceledTournament}
            />
          </div>
        </div>
      )}
      <div className="section-container mt-8 flex w-full flex-col lg:flex-row">
        <div className="left-container-marker w-full basis-2/3 pl-0 lg:pr-8">
          {carData ? (
            <TimerProvider deadline={carData.deadline}>
              {" "}
              <TitleSingleCarContainer
                year={carData.year}
                make={carData.make}
                model={carData.model}
                pot={prize}
                comments={carData.comments}
                views={carData.views}
                watchers={carData.watchers}
                current_bid={currencyString}
                bids_num={carData.bids}
                ending_date={formattedDateString}
                deadline={carData.deadline}
                players_num={tournamentWagers.length}
                prize={auctionDataOne.prize}
              />
            </TimerProvider>
          ) : null}
          <div className="mt-8 block sm:hidden">
            <TournamentButtons
              tournamentImages={tournamentImages}
              tournamentID={TournamentID}
              toggleTournamentWagerModal={toggleModal}
              buyInFee={tournamentData?.buyInFee}
              alreadyJoined={alreadyJoined}
              buyInEnded={buyInEnded}
              tournamentEnded={tournamentEnded}
              canceledTournament={canceledTournament}
            />
          </div>
          {carData ? (
            <>
              <PhotosLayout
                img={carData.image}
                images_list={carData.images_list}
                showCarImageModal={showCarImageModal}
                toggleModal={toggleCarImageModal}
              />
              <ArticleSection
                images_list={carData.images_list}
                description={carData.description}
                toggleTournamentWagerModal={toggleModal}
                alreadyJoined={alreadyJoined}
                tournamentEnded={buyInEnded}
              />
            </>
          ) : null}
          <div className="mt-8 block sm:hidden">
            {winners.length !== 0 ? (
              <TournamentWinnersSection winners={winners} />
            ) : null}
          </div>
          <div className="mt-8 block sm:hidden">
            {wagersData ? (
              <TournamentWagersSection
                toggleTournamentWagerModal={toggleModal}
                tournamentWagers={tournamentWagers}
                alreadyJoined={alreadyJoined}
                tournamentEnded={buyInEnded}
              />
            ) : null}
          </div>
          {carData ? (
            <div className="mt-8 block sm:hidden">
              <DetailsSection />
            </div>
          ) : null}
          <GuessThePriceInfoSection />
          <CommentsSection pageID={ID} pageType="auction" />
        </div>
        <div className="right-container-marker hidden w-full basis-1/3 pl-0 lg:flex lg:flex-col lg:gap-8 lg:pl-8">
          {winners.length !== 0 ? (
            <TournamentWinnersSection winners={winners} />
          ) : null}
          {wagersData ? (
            <TournamentWagersSection
              toggleTournamentWagerModal={toggleModal}
              tournamentWagers={tournamentWagers}
              alreadyJoined={alreadyJoined}
              tournamentEnded={buyInEnded}
              auctionID={ID}
            />
          ) : null}
          {carData ? (
            <DetailsSection
              website={carData.website}
              make={carData.make}
              model={carData.model}
              seller={carData.seller}
              location={carData.location}
              listing_type={carData.listing_type}
              lot_num={carData.lot_num}
              listing_details={carData.listing_details}
            />
          ) : null}
        </div>
      </div>
      <TournamentsYouMightLike />
    </div>
  );
};

export default SingleViewPage;
