"use client";

import Image from "next/image";

import { usePathname, useRouter } from "next/navigation";
import TournamentsIcon from "../../../public/images/award-trophy-star-1.svg";
import LiveGamesIcon from "../../../public/images/currency-dollar-circle.svg";
import TeamBattlesIcon from "../../../public/images/team-battles-icon.svg";

const NewEraWagering = () => {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <div className="w-full bg-[#DCE0D9] text-[#0F1923] pb-[120px] flex flex-col relative sm:mt-0 -mt-3">
            <div className="design-container">
                <div className="h-[6px]"></div>
                <div className="bg-[#0F1923] h-[40px]"></div>
                <div className="bg-[#0F1923] h-[24px] mt-3.5"></div>
                <div className="bg-[#0F1923] h-[8px] mt-8"></div>
                <div className="bg-[#0F1923] h-[4px] mt-12"></div>
            </div>
            {/* <Image
                src={TransitionPattern2}
                width={288}
                height={356}
                alt="pattern"
                className="w-full h-[200px] object-cover object-center"
            /> */}
            <div className="section-container grid grid-cols-1 lg:grid-cols-2 pt-16 sm:pt-[120px]  self-center">
                <div className="relative">
                    <div className=" font-bold text-[48px] md:text-[56px] lg:text-[60px] lg:text-[80px] leading-tight">
                        A New Era <br />
                        of Wagering
                    </div>
                    <div className=" font-bold text-[48px] md:text-[60px] lg:text-[80px]"></div>
                </div>
                <div>
                    <p className="mt-8 lg:mt-0">
                        Step into the future of automotive enthusiasm with
                        Hammershift, where the thrill of car auctions is
                        transformed into the excitement of auction prediction.
                        Here, you don&apos;t need to own the cars to be part of
                        the action. Dive into a world where your insight into
                        car values and market trends can lead to victory, as you
                        wager on the outcomes of live auctions inspired by the
                        likes of Bringatrailer. It&apos;s a game of skill and
                        strategy, where your knowledge can earn you more than
                        just bragging rights.
                        <br />
                        <br />
                        Hammershift revolutionizes the traditional car auction
                        experience, offering a platform for enthusiasts to
                        engage with the market dynamically. By shifting the
                        focus from purchasing to predicting, we open the doors
                        for more people to participate in the auction process
                        without the financial commitment of buying. It&apos;s
                        not just about the cars—it&apos;s about the community
                        and competition, where every bid placed on an auction
                        site is a chance to engage the community on Hammershift
                        all while putting your own skill to the test.
                        <br />
                        <br />
                        Embrace the new era where your passion for cars and the
                        auction scene can yield real rewards. With Hammershift,
                        you&apos;re not just watching the auction—you&apos;re a
                        part of it. Place your wagers, follow the hammer, and
                        may the best prediction win. Welcome to the
                        driver&apos;s seat of auction waging.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row justify-start">
                        <button
                            className="btn-dark"
                            onClick={(e) => router.push("/create_account")}
                        >
                            Sign up to win
                        </button>
                        <button className="btn-transparent mt-4 sm:mt-0 sm:ml-4"
                            onClick={(e) => router.push('/about_page')}>
                            About HammerShift
                        </button>
                    </div>
                </div>
            </div>

            {pathname === "/live" ? (
                <div className="options grid cols-1 lg:grid-cols-2 gap-6 md:gap-[64px] px-4 md:px-16 pt-16 sm:pt-[120px] w-screen 2xl:w-[1440px] self-center">
                    <div className=" bg-white rounded-lg text-center py-[80px] px-[56px]">
                        <Image
                            src={LiveGamesIcon}
                            width={180}
                            height={180}
                            alt="dollar"
                            className="block mx-auto shadow-2xl rounded-[42px] "
                        />
                        <h1 className="font-bold text-[36px] mt-11">
                            Guess the Price
                        </h1>
                        <p>
                            Wager on the car auction and guess the final hammer
                            price. Closest player wins the prize.
                        </p>
                        <button
                            className="mt-6 py-3 px-4 font-bold bg-[#f2ca16] rounded"
                            onClick={(e) => router.push("/auctions")}
                        >
                            View games
                        </button>
                    </div>
                    <div className="bg-white rounded-lg text-center py-[80px] px-[56px]">
                        <Image
                            src={TournamentsIcon}
                            width={180}
                            height={180}
                            alt="dollar"
                            className="block mx-auto shadow-2xl rounded-[42px]"
                        />
                        <h1 className="font-bold text-[36px] mt-11">
                            Tournaments
                        </h1>
                        <p>
                            Get more points the closer you are to the hammer
                            price of a curated set of car auctions.
                        </p>
                        <button
                            className="mt-6 py-3 px-4 font-bold bg-[#f2ca16] rounded"
                            onClick={(e) => router.push("/tournaments")}
                        >
                            View tournaments
                        </button>
                    </div>
                </div>
            ) : (
                <div className="options grid cols-1 lg:grid-cols-3 gap-6 px-4 md:px-16 pt-16 sm:pt-[120px] w-screen 2xl:w-[1440px] self-center">
                    <div className=" bg-white rounded-lg text-center py-[32px] px-[24px]">
                        <Image
                            src={LiveGamesIcon}
                            width={68}
                            height={68}
                            alt="dollar"
                            className="block mx-auto w-[68px] h-[68px] shadow-lg rounded-[16px] "
                        />
                        <h1 className="font-bold text-[24px] mt-3">
                            Guess the Price
                        </h1>
                        <p>
                            Wager on the car auction and guess the final hammer
                            price. Closest player wins the prize.
                        </p>
                        <button
                            className="btn-yellow mt-4"
                            onClick={(e) => router.push("/auctions")}
                        >
                            View games
                        </button>
                    </div>
                    <div className="bg-white rounded-lg text-center py-[32px] px-[24px]">
                        <Image
                            src={TeamBattlesIcon}
                            width={68}
                            height={68}
                            alt="dollar"
                            className="block mx-auto w-[68px] h-[68px] shadow-lg rounded-[16px]"
                        />
                        <h1 className="font-bold text-[24px] mt-3">
                            Team Battles
                        </h1>
                        <p>
                            Pick between teams betting on the same car. Player
                            in the team with the closest wager wins the prize.
                        </p>
                        <button
                            className="bg-gray-300 mt-4 font-bold rounded-md p-2"
                            disabled
                        >
                            Coming soon!
                        </button>
                    </div>
                    <div className="bg-white rounded-lg text-center py-[32px] px-[24px]">
                        <Image
                            src={TournamentsIcon}
                            width={68}
                            height={68}
                            alt="dollar"
                            className="block mx-auto w-[68px] h-[68px] shadow-lg rounded-[16px]"
                        />
                        <h1 className="font-bold text-[24px] mt-3">
                            Tournaments
                        </h1>
                        <p>
                            Get more points the closer you are to the hammer
                            price of a curated set of car auctions.
                        </p>
                        <button
                            className="bg-gray-300 mt-4 font-bold rounded-md p-2"
                            disabled
                        >
                            Coming soon!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewEraWagering;
