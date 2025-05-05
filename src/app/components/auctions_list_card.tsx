import Image from "next/image";
import { useRouter } from "next/navigation";
import Dollar from "../../../public/images/dollar.svg";
import HourGlass from "../../../public/images/hour-glass.svg";
import { TimerProvider, useTimer } from "../context/TimerContext";
import "../styles/app.css";
import { CardWagersSection } from "./old_card";

const AuctionsListCard = (props: any) => {
  const router = useRouter();
  const timerValues = useTimer();

  const currencyString = new Intl.NumberFormat().format(props.price);

  return (
    <TimerProvider deadline={new Date()}>
      <div className="flex flex-row gap-4 sm:gap-8 w-full max-w-[944px] ">
        <div className="max-w-[156px] sm:max-w-[416px] w-full min-w-[156px] h-auto h-[147px] sm:h-[240px]">
          <img
            src={props.image}
            width={416}
            height={240}
            alt={props.make}
            className="max-w-[156px] sm:max-w-[416px] w-full min-w-[156px] h-auto  min-h-[147px] xl:h-[240px] rounded object-cover aspect-auto hover:cursor-pointer"
            onClick={() =>
              router.push(`/auctions/car_view_page/${props.auction_id}`)
            }
          />
        </div>
        <div className="flex flex-col w-auto flex-grow">
          <div
            className=" font-bold text-[18px] sm:text-[24px] hover:cursor-pointer "
            onClick={() =>
              router.push(`/auctions/car_view_page/${props.auction_id}`)
            }
          >
            {props.year} {props.make} {props.model}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-3 sm:mt-4">
            <div className="flex gap-2">
              <Image
                src={Dollar}
                width={20}
                height={20}
                alt="dollar"
                className="w-5 h-5"
              />
              {/* <div className="px-2 hidden sm:block">Current Bid:</div> */}
              <div className="text-[#49C742] font-bold">
                ${currencyString}
              </div>
            </div>
            <div className="flex gap-2">
              <Image
                src={HourGlass}
                width={20}
                height={20}
                alt="dollar"
                className="w-5 h-5"
              />
              {/* <div className="px-2 hidden sm:block">Time Left:</div> */}
              <div className="text-[#C2451E] font-bold">{`${timerValues.days}:${timerValues.hours}:${timerValues.minutes}:${timerValues.seconds}`}</div>
            </div>
          </div>
          {/* <p className="h-[60px] sm:h-[72px] w-full line-clamp-3 overflow-hidden text-[14px] sm:text-[16px]">
              {props.description[0]}
            </p> */}
          <div className="hidden lg:flex flex-col w-auto flex-grow ">
            <CardWagersSection objectID={props.object_id} />
          </div>
          {/* <div>
              <button
                className="btn-yellow-thin w-full mt-4 md:w-auto"
                onClick={() =>
                  router.push(`/auctions/car_view_page/${props.auction_id}`)
                }
              >
                Play Game
              </button>
            </div> */}
        </div>
      </div>
    </TimerProvider>
  );
};

export default AuctionsListCard;
