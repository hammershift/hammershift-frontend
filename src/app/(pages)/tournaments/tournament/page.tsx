"use client";

import React, { useState } from "react";
import Links from "../../../components/links";
import { useRouter } from "next/navigation";
import { TournamentsListCard } from "../../../components/card";
import Image from "next/image";
import { LatestNews } from "../../../components/how_hammeshift_works";
import { SubscribeSmall } from "../../../components/subscribe";
import { TournamentsCard } from "../../../components/card";
import Footer from "../../../components/footer";
import Link from "next/link";

import DollarIcon from "../../../../../public/images/dollar.svg";
import CalendarIcon from "../../../../../public/images/calendar-icon.svg";
import HashtagIcon from "../../../../../public/images/hash-02.svg";
import PlayersIcon from "../../../../../public/images/users-01.svg";
import HourGlassIcon from "../../../../../public/images/hour-glass.svg";
import PrizeIcon from "../../../../../public/images/monetization-browser-bag.svg";
import LiveGamesIcon from "../../../../public/images/currency-dollar-circle.svg";

import CameraPlus from "../../../../../public/images/camera-plus.svg";
import GifIcon from "../../../../../public/images/image-document-gif.svg";
import BellIcon from "../../../../../public/images/bell-02.svg";
import ThumbsUp from "../../../../../public/images/thumbs-up.svg";
import ThumbsDown from "../../../../../public/images/thumbs-down.svg";
import CornerDownRight from "../../../../../public/images/corner-down-right.svg";
import ThreeDots from "../../../../../public/images/dots-vertical.svg";
import OpenWebLogo from "../../../../../public/images/open-web-logo.svg";

import ArrowDown from "../../../../../public/images/arrow-down.svg";
import DiagonalLines from "../../../../../public/images/green-diagonal.svg";
import TransitionPattern from "../../../../../public/images/transition-pattern.svg";
import BringATrailerLogo from "../../../../../public/images/bring-a-trailer-logo.svg";
import ProfilePhoto from "../../../../../public/images/ellipse-415.svg";
import CarFaxLogo from "../../../../../public/images/show-me-carfax.svg";
import GiftIcon from "../../../../public/images/gift-02.svg";
import WatchListIcon from "../../../../../public/images/watchlist-icon.svg";
import ThropyIconBlue from "../../../../../public/images/thropy-blue-big.svg";
import CarsImage from "../../../../../public/images/cars-icon.svg";
import CarIcon from "../../../../../public/images/car-01.svg";

import PhotoOne from "../../../../../public/images/car-view-page/photoOne.svg";
import PhotoTwo from "../../../../../public/images/car-view-page/photoTwo.svg";
import PhotoThree from "../../../../../public/images/car-view-page/photoThree.svg";
import PhotoFour from "../../../../../public/images/car-view-page/photoFour.svg";
import PhotoFive from "../../../../../public/images/car-view-page/photoOne.svg";
import SedanPhotoOne from "../../../../public/images/tournament-wager/sedan-photo-one.svg";
import SedanPhotoTwo from "../../../../public/images/tournament-wager/sedan-photo-two.svg";
import SedanPhotoThree from "../../../../public/images/tournament-wager/sedan-photo-three.svg";
import SedanPhotoFour from "../../../../public/images/tournament-wager/sedan-photo-four.svg";
import SedanPhotoFive from "../../../../public/images/tournament-wager/sedan-photo-five.svg";

import AvatarOne from "../../../../../public/images/avatar-one.svg";
import AvatarTwo from "../../../../../public/images/avatar-two.svg";
import AvatarThree from "../../../../../public/images/avatar-three.svg";
import AvatarFour from "../../../../../public/images/avatar-four.svg";
import TournamentWagerModal from "@/app/components/tournament_wager_modal";
import { carDataThree } from "@/sample_data";

const CarViewData = {
  name: "13k-Mile 2011 Mercedes Benz SLS AMG",
  currentBid: "$64,000",
  endingDate: "Jul 5, 2023, 7:00 PM",
  bids: 48,
  players: 4,
  timeLeft: "02:16:00",
  prize: "$1,000",
  images: [PhotoOne, PhotoTwo, PhotoThree, PhotoFour, PhotoFive],
  description:
    "This 2011 Mercedes-Benz SLS AMG was initially sold by Ray Catena Mercedes Benz Union in New Jersey, and remained registered in the state prior to being acquired by the selling dealer in 2023 and now has 13k miles. It is powered by a 6.2-liter V8 linked with a seven-speed dual-clutch automatic transaxle and a limited-slip differential. Finished in Iridium Silver Metallic over Charcoal Exclusive leather upholstery, the car is equipped with 19″ and 20″ seven-spoke alloy wheels, gullwing doors, a speed-activated aerofoil, bi-xenon headlights, Parktronic, heated power-adjustable seats, Keyless-Go, a rearview camera, COMAND infotainment, navigation, a radar detector, a Bang & Olufsen sound system, carbon-fiber interior trim, and dual-zone automatic climate control. This SLS AMG is now offered in Texas by the selling dealer at no reserve with a clean Carfax report and a clean New Jersey title.",
};

const TournamentViewPage = () => {
  // Change to true for tournament single car page
  const [isWagerMenuOpen, setIsWagerMenuOpen] = useState(false);
  const [toggleTournamentWagerModal, setToggleTournamentWagerModal] =
    useState(false);

  const toggleModal = () => {
    setToggleTournamentWagerModal((prev) => !prev);
  };

  return (
    <div className="page-container tw-relative">
      {toggleTournamentWagerModal ? (
        <TournamentWagerModal toggleTournamentWagerModal={toggleModal} />
      ) : null}
      <Links />
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
          <TitleTournamentsList />
          <div className="sm:tw-hidden tw-mt-4">
            <TournamentButtons toggleTournamentWagerModal={toggleModal} />
          </div>
          <TournamentsList toggleTournamentWagerModal={toggleModal} />
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

      <TournamentsYouMightLike />
      <LatestNews />
      <SubscribeSmall />
      <Footer />
      {/* TODO: Check if working*/}
      {/* <TournamentWagerPage /> */}
      {isWagerMenuOpen && (
        <div className="tw-bg-black tw-w-screen tw-h-full"></div>
      )}
    </div>
  );
};

export default TournamentViewPage;

interface TournamentButtonsI {
  toggleTournamentWagerModal: () => void;
}

export const TournamentButtons: React.FC<TournamentButtonsI> = ({
  toggleTournamentWagerModal,
}) => {
  const router = useRouter();
  return (
    <div className="tw-flex">
      <button className="btn-transparent-white tw-flex ">
        <Image
          src={WatchListIcon}
          width={20}
          height={20}
          alt="dollar"
          className="tw-w-5 tw-h-5  tw-mr-2"
        />
        WATCH
      </button>
      <button
        className="btn-yellow tw-ml-2"
        onClick={() => {
          document.body.classList.add("stop-scrolling");
          toggleTournamentWagerModal();
        }}
      >
        BUY-IN FOR $50
      </button>
    </div>
  );
};

export const TitleSingleCarContainer = () => {
  return (
    <div className=" tw-flex tw-flex-col tw-flex-grow tw-w-auto">
      <div className="title-section-marker tw-flex tw-text-3xl md:tw-text-5xl tw-font-bold">
        {CarViewData.name}
      </div>
      <div className="info-section-marker tw-flex tw-flex-col md:tw-flex-row tw-mt-4">
        <div className="info-left-marker tw-w-[300px]">
          <div className="tw-flex">
            <div>
              <Image
                src={DollarIcon}
                width={20}
                height={20}
                alt="dollar"
                className="tw-w-5 tw-h-5  tw-mr-2"
              />
            </div>
            <div className="tw-opacity-80 tw-flex">
              Current Bid:
              <span className="tw-text-[#49C742] tw-font-bold tw-ml-2">
                {CarViewData.currentBid}
              </span>
              <span className="tw-block md:tw-hidden tw-ml-2">{`(${CarViewData.bids} bids)`}</span>
            </div>
          </div>
          <div className="tw-flex tw-mt-0 md:tw-mt-1">
            <div>
              <Image
                src={CalendarIcon}
                width={20}
                height={20}
                alt="calendar"
                className="tw-w-5 tw-h-5  tw-mr-2"
              />
            </div>
            <span className="tw-opacity-80">
              Ending:{" "}
              <span className="tw-font-bold">{CarViewData.endingDate}</span>
            </span>
          </div>
        </div>
        <div className="right-section-marker">
          <div className="top-section-marker tw-flex tw-flex-col md:tw-flex-row tw-justify-between">
            <div className="tw-w-[160px] tw-hidden md:tw-flex">
              <div>
                <Image
                  src={HashtagIcon}
                  width={20}
                  height={20}
                  alt="calendar"
                  className="tw-w-5 tw-h-5  tw-mr-2"
                />
              </div>
              <span className="tw-opacity-80">
                Bids: <span className="tw-font-bold">{CarViewData.bids}</span>
              </span>
            </div>
            <div className="tw-flex">
              <div>
                <Image
                  src={HourGlassIcon}
                  width={20}
                  height={20}
                  alt="calendar"
                  className="tw-w-5 tw-h-5  tw-mr-2"
                />
              </div>
              <span className="tw-opacity-80">
                Time Left:{" "}
                <span className="tw-font-bold tw-text-[#C2451E]">
                  {CarViewData.timeLeft}
                </span>
              </span>
            </div>
          </div>
          <div className="bottom-section-marker tw-flex-col md:tw-flex-row tw-mt-0 md:tw-mt-1 tw-flex">
            <div className="tw-flex  tw-w-[160px]">
              <div>
                <Image
                  src={PlayersIcon}
                  width={20}
                  height={20}
                  alt="calendar"
                  className="tw-w-5 tw-h-5  tw-mr-2"
                />
              </div>
              <span className="tw-opacity-80">
                Time Left:{" "}
                <span className="tw-font-bold ">{CarViewData.players}</span>
              </span>
            </div>
            <div className="tw-flex">
              <div>
                <Image
                  src={PrizeIcon}
                  width={20}
                  height={20}
                  alt="calendar"
                  className="tw-w-5 tw-h-5 tw-mr-2"
                />
              </div>
              <span className="tw-opacity-80">
                Time Left:{" "}
                <span className="tw-font-bold ">{CarViewData.prize}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TitleTournamentsList = () => {
  const TournamentsListData = {
    title: "Sedan Champions Tournament",
    cars: 5,
    buy_in_ends: "02:16:00",
    tournament_ends: "Jul 5, 2023, 7:00 pm",
    prize: "$1,000",
    list: [{ img: "", name: "", description: "", time: "" }],
  };
  return (
    <div className=" tw-flex tw-flex-col tw-flex-grow tw-w-auto">
      <Image
        src={CarsImage}
        width={144}
        height={32}
        alt="cars image"
        className="tw-w-36 tw-h-auto"
      />
      <div className="title-section-marker tw-flex tw-text-3xl md:tw-text-5xl tw-font-bold">
        {TournamentsListData.title}
      </div>
      <div className=" tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-mt-6">
        <div className="tw-flex">
          <div>
            <Image
              src={CarIcon}
              width={20}
              height={20}
              alt="calendar"
              className="tw-w-5 tw-h-5  tw-mr-2"
            />
          </div>
          <span className="tw-opacity-80">
            Cars:{" "}
            <span className="tw-font-bold">
              {TournamentsListData.cars}
              {" cars"}
            </span>
          </span>
        </div>
        <div className="tw-flex">
          <div>
            <Image
              src={HourGlassIcon}
              width={20}
              height={20}
              alt="calendar"
              className="tw-w-5 tw-h-5  tw-mr-2"
            />
          </div>
          <span className="tw-opacity-80">
            Buy-in Ends:{" "}
            <span className="tw-font-bold tw-text-[#C2451E]">
              {TournamentsListData.buy_in_ends}
            </span>
          </span>
        </div>
        <div className="tw-flex tw-mt-0 md:tw-mt-1">
          <div>
            <Image
              src={CalendarIcon}
              width={20}
              height={20}
              alt="calendar"
              className="tw-w-5 tw-h-5  tw-mr-2"
            />
          </div>
          <span className="tw-opacity-80">
            Tournament Ends:{" "}
            <span className="tw-font-bold">
              {TournamentsListData.tournament_ends}
            </span>
          </span>
        </div>
        <div className="tw-flex">
          <div>
            <Image
              src={PrizeIcon}
              width={20}
              height={20}
              alt="calendar"
              className="tw-w-5 tw-h-5 tw-mr-2"
            />
          </div>
          <span className="tw-opacity-80">
            Prize:{" "}
            <span className="tw-font-bold ">{TournamentsListData.prize}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

interface TournamentListI {
  toggleTournamentWagerModal: () => void;
}

const TournamentsList: React.FC<TournamentListI> = ({
  toggleTournamentWagerModal,
}) => {
  const router = useRouter();

  return (
    <div className="tw-mt-8 md:tw-mt-16">
      <div className="tw-text-3xl tw-font-bold">Cars in Tournament</div>
      <div className="tw-flex tw-flex-col">
        {carDataThree.map((item, index) => (
          <div
            key={index}
            className="hover:tw-cursor-pointer"
            onClick={() =>
              router.push(`/tournament_page/tournaments/${item.auction_id}`)
            }
          >
            <TournamentsListCard
              index={index}
              auction_id={item.auction_id}
              img={item.image}
              year={item.attributes[1].value}
              make={item.attributes[2].value}
              model={item.attributes[3].value}
              description={item.description}
              deadline={item.attributes[12].value}
            />
          </div>
        ))}
      </div>
      <button
        className="btn-yellow tw-w-full tw-mt-8"
        onClick={() => {
          document.body.classList.add("stop-scrolling");
          toggleTournamentWagerModal();
        }}
      >
        BUY-IN FOR $100
      </button>
    </div>
  );
};

export const PhotosLayout = () => {
  return (
    <div className=" tw-my-8">
      <Image
        src={PhotoOne}
        width={832}
        height={520}
        alt="car"
        className="tw-w-full tw-max-h-[520px] tw-object-cover tw-rounded tw-aspect-auto"
      />
      <div className="tw-grid tw-grid-cols-4 tw-gap-2 tw-mt-2 tw-w-full tw-h-auto">
        <Image
          src={PhotoTwo}
          width={202}
          height={120}
          alt="car"
          className="tw-w-full tw-max-h-[120px] tw-object-cover tw-rounded tw-aspect-auto"
        />
        <Image
          src={PhotoThree}
          width={202}
          height={120}
          alt="car"
          className="tw-w-full tw-max-h-[120px] tw-object-cover tw-rounded tw-aspect-auto"
        />
        <Image
          src={PhotoFour}
          width={202}
          height={120}
          alt="car"
          className="tw-w-full tw-max-h-[120px] tw-object-cover tw-rounded tw-aspect-auto"
        />
        <div className="tw-relative">
          <Image
            src={PhotoFive}
            width={202}
            height={120}
            alt="car"
            className="tw-w-full tw-max-h-[120px] tw-object-cover tw-opacity-40 tw-rounded tw-aspect-auto"
          />
          <div className="tw-absolute tw-flex tw-z-50 tw-left-1/2 tw-translate-x-[-50%] tw-top-[50%] tw-translate-y-[-50%]">
            88 <span className="tw-hidden md:tw-block tw-ml-1">photos</span>
            <span className="tw-block md:tw-hidden">+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ArticleSection: React.FC<TournamentButtonsI> = ({
  toggleTournamentWagerModal,
}) => {
  return (
    <div className="tw-flex tw-flex-col tw-mt-8 md:tw-mt-16 tw-w-full">
      <div className="tw-w-full tw-h-[120px] md:tw-h-auto tw-ellipsis tw-overflow-hidden">
        {CarViewData.description}
      </div>
      <button className="btn-transparent-white tw-mt-16">
        <span className="tw-w-full tw-flex tw-items-center tw-justify-center">
          VIEW MORE DETAILS
          <Image
            src={ArrowDown}
            width={20}
            height={20}
            alt="car"
            className="tw-w-[20px] tw-h-[20px] tw-ml-2"
          />
        </span>
      </button>
      <button
        className="btn-yellow tw-mt-3"
        onClick={toggleTournamentWagerModal}
      >
        PLACE MY WAGER
      </button>
    </div>
  );
};

const TournamentInfoSection = () => {
  return (
    <div>
      <div className="tw-mt-8 lg:tw-mt-16 tw-p-6 tw-bg-[#172431]">
        <Image
          src={ThropyIconBlue}
          width={68}
          height={68}
          alt="car"
          className="tw-w-[68px] tw-h-[68px]"
        />
        <div className="tw-text-2xl tw-font-bold tw-mt-6">
          What is a Tournament?
        </div>
        <div className="tw-my-4">
          Get more points the closer you are to the hammer price of a curated
          set of car auctions. Duis anim adipisicing minim nisi elit quis.
          Cillum ullamco qui dolore non incididunt incididunt non. Aute
          adipisicing et esse exercitation sunt irure proident enim eu esse
          nulla. Est excepteur est non. Adipisicing occaecat minim ex duis
          excepteur.
        </div>
        <div className="tw-text-[#42A0FF]">View Tournaments</div>
      </div>
    </div>
  );
};

const CommentsSection = () => {
  return (
    <div className="tw-mt-16 tw-max-w-[832px] tw-mb-8 md:tw-mb-16 sm:tw-mb-0">
      <div className="tw-flex tw-justify-between">
        <div className="tw-text-xl md:tw-text-3xl">
          <span className="tw-font-bold">Comments</span>
          {`(16)`}
        </div>
        <div className="tw-flex tw-items-center tw-text-sm sm:tw-text-base">
          <Image
            src={BellIcon}
            width={16}
            height={16}
            alt="Bell"
            className="tw-w-4 tw-h-4"
          />
          <div className="tw-text-[14px] tw-opacity-50 tw-ml-4">Log in</div>
          <div className="tw-text-[14px] tw-opacity-50 tw-ml-4">Sign Up</div>
        </div>
      </div>
      <div className="tw-flex tw-my-3">
        <div className="tw-flex tw-w-full tw-items-center tw-bg-[#172431] tw-py-2.5 tw-px-3 tw-rounded">
          <input
            placeholder="Add a comment"
            className="tw-bg-[#172431] tw-w-full"
          />
          <Image
            src={CameraPlus}
            width={20}
            height={20}
            alt="camera plus"
            className="tw-w-5 tw-h-5"
          />
          <Image
            src={GifIcon}
            width={20}
            height={20}
            alt="gif"
            className="tw-w-5 tw-h-5 tw-ml-2"
          />
        </div>
        <button className="btn-white tw-ml-2">Comment</button>
      </div>
      <div className="tw-mt-2 tw-flex tw-items-center tw-text-sm sm:tw-text-base">
        Sort by
        <span className="tw-font-bold tw-ml-2">Best</span>
        <Image
          src={ArrowDown}
          width={14}
          height={14}
          alt="arrow down"
          className="tw-w-[14px] tw-h-[14px] tw-ml-2"
        />
      </div>
      <section>
        <div>
          {/* To be replaced by map */}
          <CommentsCard />
          <CommentsCard />
          <CommentsCard />
        </div>
        <button className="btn-transparent-white tw-w-full tw-mt-8 tw-text-sm">
          Load 12 more comments
        </button>
        <div className="tw-flex tw-items-center tw-mt-8">
          <span>Powered by</span>
          <Image
            src={OpenWebLogo}
            width={97}
            height={28}
            alt="camera plus"
            className="tw-w-[97px] tw-h-[28px] tw-ml-2"
          />
        </div>
      </section>
    </div>
  );
};

export const CommentsCard = () => {
  const commentsData = [
    {
      id: "com1",
      username: "@johnadams",
      text: " Nihil hic munitissimus habendi senatus locus, nihil horum? Qui ipsorum lingua Celtae, nostra Galli appellantur. Ambitioni dedisse scripsisse iudicaretur. Paullum deliquit, ponderibus modulisque suis ratio utitur.Nihil hic munitissimus habendi senatus locus, nihil horum? Praeterea iter est quasdam res quas ex communi.Cum sociis natoque penatibus et magnis dis parturient.Contra legem facit qui id facit quod lex prohibet.Ambitioni dedisse scripsisse iudicaretur.Quid securi etiam tamquam eu fugiat nulla pariatur.Quam diu etiam furor iste tuus nos eludet? Tu quoque, Brute, fili mi, nihil timor populi, nihil! Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae.Unam incolunt Belgae, aliam Aquitani, tertiam.Excepteur sint obcaecat cupiditat non proident culpa.Petierunt uti sibi concilium totius Galliae in diem certam indicere.Phasellus laoreet lorem vel dolor tempus vehicula.Quis aute iure reprehenderit in voluptate velit esse.Quo usque tandem abutere, Catilina, patientia nostra? Prima luce, cum quibus mons aliud consensu ab eo.",
    },
  ];
  return (
    <div className="tw-flex tw-mt-8 tw-text-[14px]">
      <Image
        src={AvatarOne}
        width={40}
        height={40}
        alt="camera plus"
        className="tw-w-10 tw-h-10 tw-ml-2"
      />
      <div className="tw-ml-4">
        <div className="tw-flex tw-justify-between">
          <div>
            <span className="tw-font-bold">Jane Doe</span>
            <span className="tw-text-[#F2CA16] tw-ml-2">Seller</span>
            <span className="tw-opacity-50 tw-ml-2">14 hours ago</span>
          </div>
          <Image
            src={ThreeDots}
            width={16}
            height={16}
            alt="thumbs up"
            className="tw-w-4 tw-h-4 tw-ml-4"
          />
        </div>
        <div className=" tw-my-3 tw-h-[100px] md:tw-h-auto tw-ellipsis tw-overflow-hidden">
          <span className="tw-text-[#42A0FF]">{commentsData[0].username}</span>
          {commentsData[0].text}
        </div>
        <div className="tw-flex tw-opacity-50">
          Reply
          <span className="tw-ml-4">·</span>
          <Image
            src={ThumbsUp}
            width={16}
            height={16}
            alt="thumbs up"
            className="tw-w-4 tw-h-4 tw-ml-4"
          />
          <Image
            src={ThumbsDown}
            width={16}
            height={16}
            alt="thumbs down"
            className="tw-w-4 tw-h-4 tw-ml-4"
          />
        </div>

        <div className="tw-text-[#42A0FF] tw-mt-3 tw-flex">
          <Image
            src={CornerDownRight}
            width={16}
            height={16}
            alt="camera plus"
            className="tw-w-4 tw-h-4 tw-mr-2 "
          />
          1 Replay
        </div>
      </div>
    </div>
  );
};

interface TournamentWagerSectionI {
  toggleTournamentWagerModal: () => void;
}

export const TournamentWagersSection: React.FC<TournamentWagerSectionI> = ({
  toggleTournamentWagerModal,
}) => {
  const teamPlayers = [
    {
      id: "wager1",
      username: "Username",
      avatar: AvatarOne,
      time: "2 hours ago",
    },
    {
      id: "wager2",
      username: "Username",
      avatar: AvatarTwo,
      time: "3 hours ago",
    },
    {
      id: "wager3",
      username: "Username",
      avatar: AvatarThree,
      time: "2 days ago",
    },
    {
      id: "wager4",
      username: "Username",
      avatar: AvatarFour,
      time: "2 days ago",
    },
    {
      id: "wager5",
      username: "Username",
      avatar: AvatarFour,
      time: "2 days ago",
    },
    {
      id: "wager6",
      username: "Username",
      avatar: AvatarFour,
      time: "2 days ago",
    },
    {
      id: "wager7",
      username: "Username",
      avatar: AvatarFour,
      time: "2 days ago",
    },
    {
      id: "wager8",
      username: "Username",
      avatar: AvatarFour,
      time: "2 days ago",
    },
    {
      id: "wager9",
      username: "Username",
      avatar: AvatarFour,
      time: "2 days ago",
    },
    {
      id: "wager10",
      username: "Username",
      avatar: AvatarFour,
      time: "2 days ago",
    },
  ];
  return (
    <div>
      <div className="tw-relative tw-pb-8 sm:tw-pb-0">
        <div className="tw-px-5 tw-w-full tw-h-auto tw-pt-8 tw-pb-6">
          <div className="tw-flex tw-justify-between">
            <div className="tw-font-bold tw-text-[18px]">PLAYERS</div>
            <Image
              src={ArrowDown}
              width={20}
              height={20}
              alt="arrow down"
              className="tw-w-5 tw-h-5"
            />
          </div>
          <div className="tw-text-[14px]">18 Players</div>
          <div className="tw-relative tw-mt-4">
            {teamPlayers.map((player) => {
              return (
                <div key={player.id} className="tw-my-5 tw-flex">
                  <div className="tw-flex">
                    <Image
                      src={player.avatar}
                      width={40}
                      height={40}
                      alt="dollar"
                      className="tw-w-[40px] tw-h-[40px] tw-mr-4"
                    />
                    <div className="tw-text-sm ">
                      <div className="tw-font-bold">{player.username}</div>
                      <div className="tw-opacity-50">{`Joined ${player.time}`}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn-transparent-white tw-w-full tw-mt-2">
            More Players...
          </button>
          <button
            onClick={() => {
              document.body.classList.add("stop-scrolling");
              toggleTournamentWagerModal();
            }}
            className="btn-yellow tw-w-full tw-mt-2"
          >
            JOIN TOURNAMENT
          </button>
        </div>
        {/* Background and button*/}
        <div className="tw-absolute tw-top-0 tw-h-full tw-z-[-1] tw-w-full">
          <Image
            src={TransitionPattern}
            width={288}
            height={356}
            alt="pattern"
            className="tw-w-full tw-h-[288px]  tw-rounded-lg tw-mr-1 tw-object-cover"
          />
          <div className="tw-w-full tw-h-full tw-rounded-lg tw-absolute tw-top-0 tw-bg-[#156CC333]"></div>
        </div>
      </div>
    </div>
  );
};

export const DetailsSection = () => {
  const DetailsData = {
    auction: { name: "Bring a Trailer", logo: BringATrailerLogo },
    make: "Mercedes Benz",
    model: "E55 AMG",
    seller: { name: "John Adams", image: ProfilePhoto },
    location: "San Diego, CA, 92121",
    mileage: "55,400",
    listing_type: "Private Property",
    lot_num: "112459",
    listing_details: [
      "Chassis: WDDRJ7HA0BA000819",
      "13k Miles",
      "6.2 - Liter V8",
      "Seven - Speed Dual - Clutch Automatic Transaxle",
      "Limited - Slip Differential",
      "Iridium Silver Metallic Paint",
      "Charcoal Exclusive Leather Upholstery",
      '19" & 20" Seven - Spoke Alloy Wheels',
      "Gullwing Doors",
      "Speed - Activated Aerofoil",
      "Bi - Xenon Headlights",
      "Parktronic",
      "Heated Power - Adjustable Seats",
      "Keyless - Go",
      "COMAND Infortainment",
      "Carbon - Fiber Interior Trim",
      "Radar Detector",
      "Bang & Olufsen Sound System",
      "Dual - Zone Automatic Climate Control",
      "Clean Carfax Report",
    ],
  };
  return (
    <div className="tw-mt-8 tw-bg-[#172431] tw-p-6">
      <div className="tw-flex tw-justify-between tw-py-2">
        <div className="tw-font-bold tw-text-[18px]">DETAILS</div>
        <Image
          src={ArrowDown}
          width={20}
          height={20}
          alt="arrow down"
          className="tw-w-[20px] tw-h-[20px]"
        />
      </div>
      <div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Auction</div>
          <div className="tw-flex tw-items-center ">
            {DetailsData.auction.name}
            <Image
              src={DetailsData.auction.logo}
              width={32}
              height={32}
              alt="bring a trailer logo"
              className="tw-w-[32px] tw-h-[32px] tw-ml-2"
            />
          </div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Make</div>
          <div className="tw-underline tw-underline-offset-4">
            {DetailsData.make}
          </div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Model</div>
          <div>{DetailsData.model}</div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Seller</div>
          <div className="tw-flex tw-items-center">
            {DetailsData.seller.name}
            <Image
              src={DetailsData.seller.image}
              width={32}
              height={32}
              alt="bring a trailer logo"
              className="tw-w-[32px] tw-h-[32px] tw-ml-2"
            />
          </div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Location</div>
          <div>{DetailsData.location}</div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Mileage</div>
          <div>{DetailsData.mileage}</div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Listing Type</div>
          <div>{DetailsData.listing_type}</div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Lot #</div>
          <div>{DetailsData.lot_num}</div>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-py-2">
          <div className="tw-opacity-50">Listing Details</div>
          <ul className="tw-list-disc tw-list-inside tw-my-2 tw-pl-2">
            {DetailsData.listing_details.map((item: string) => {
              return <li key={item}>{item}</li>;
            })}
          </ul>
        </div>
        <hr className="tw-border-white tw-opacity-5" />
        <div className="tw-flex tw-justify-between tw-py-2">
          <div className="tw-opacity-50">Photos</div>
          <Link href={"/"}>
            <span className="tw-underline tw-underline-offset-4">
              88 photos
            </span>
          </Link>
        </div>
        <Image
          src={CarFaxLogo}
          width={130}
          height={44}
          alt="bring a trailer logo"
          className="tw-w-[130px] tw-h-[44px] tw-my-4"
        />
      </div>
    </div>
  );
};

export const TournamentsYouMightLike = () => {
  return (
    <div className="section-container tw-py-8 sm:tw-py-12 tw-mb-8  tw-mt-8 ">
      <header className="tw-max-w-[1312px]">
        <div className="tw-flex tw-justify-between tw-items-end">
          <div className="tw-flex tw-items-center">
            <Image
              src={DiagonalLines}
              width={40}
              height={40}
              alt="dollar"
              className="tw-w-10 tw-h-10"
            />
            <div className="tw-font-bold tw-text-2xl tw-w-[200px] sm:tw-w-auto sm:tw-text-3xl tw-ml-4">
              Tournaments You Might Like
            </div>
          </div>
          <div className="tw-text-[#49C742]">See All</div>
        </div>
      </header>

      <section className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8 tw-mt-8">
        {/* to be replaced by array.map */}
        <TournamentsCard />
        <TournamentsCard />
        <TournamentsCard />
      </section>
    </div>
  );
};
