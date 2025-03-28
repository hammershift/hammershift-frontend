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
        <div className="tw-w-full tw-bg-[#DCE0D9] tw-text-[#0F1923] tw-pb-[120px] tw-flex tw-flex-col tw-relative sm:tw-mt-0 -tw-mt-3">
            <div className="design-container">
                <div className="tw-h-[6px]"></div>
                <div className="tw-bg-[#0F1923] tw-h-[40px]"></div>
                <div className="tw-bg-[#0F1923] tw-h-[24px] tw-mt-3.5"></div>
                <div className="tw-bg-[#0F1923] tw-h-[8px] tw-mt-8"></div>
                <div className="tw-bg-[#0F1923] tw-h-[4px] tw-mt-12"></div>
            </div>
            {/* <Image
                src={TransitionPattern2}
                width={288}
                height={356}
                alt="pattern"
                className="tw-w-full tw-h-[200px] tw-object-cover tw-object-center"
            /> */}
            <div className="section-container tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-pt-16 sm:tw-pt-[120px]  tw-self-center">
                <div className="tw-relative">
                    <div className=" tw-font-bold tw-text-[48px] md:tw-text-[56px] lg:tw-text-[60px] lg:tw-text-[80px] tw-leading-tight">
                        A New Era <br />
                        of Wagering
                    </div>
                    <div className=" tw-font-bold tw-text-[48px] md:tw-text-[60px] lg:tw-text-[80px]"></div>
                </div>
                <div>
                    <p className="tw-mt-8 lg:tw-mt-0">
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
                    <div className="tw-mt-6 tw-flex tw-flex-col sm:tw-flex-row tw-justify-start">
                        <button
                            className="btn-dark"
                            onClick={(e) => router.push("/create_account")}
                        >
                            Sign up to win
                        </button>
                        <button className="btn-transparent tw-mt-4 sm:tw-mt-0 sm:tw-ml-4"
                            onClick={(e) => router.push('/about_page')}>
                            About HammerShift
                        </button>
                    </div>
                </div>
            </div>

            {pathname === "/live" ? (
                <div className="options tw-grid tw-cols-1 lg:tw-grid-cols-2 tw-gap-6 md:tw-gap-[64px] tw-px-4 md:tw-px-16 tw-pt-16 sm:tw-pt-[120px] tw-w-screen 2xl:tw-w-[1440px] tw-self-center">
                    <div className=" tw-bg-white tw-rounded-lg tw-text-center tw-py-[80px] tw-px-[56px]">
                        <Image
                            src={LiveGamesIcon}
                            width={180}
                            height={180}
                            alt="dollar"
                            className="tw-block tw-mx-auto tw-shadow-2xl tw-rounded-[42px] "
                        />
                        <h1 className="tw-font-bold tw-text-[36px] tw-mt-11">
                            Guess the Price
                        </h1>
                        <p>
                            Wager on the car auction and guess the final hammer
                            price. Closest player wins the prize.
                        </p>
                        <button
                            className="tw-mt-6 tw-py-3 tw-px-4 tw-font-bold tw-bg-[#f2ca16] tw-rounded"
                            onClick={(e) => router.push("/auctions")}
                        >
                            View games
                        </button>
                    </div>
                    <div className="tw-bg-white tw-rounded-lg tw-text-center tw-py-[80px] tw-px-[56px]">
                        <Image
                            src={TournamentsIcon}
                            width={180}
                            height={180}
                            alt="dollar"
                            className="tw-block tw-mx-auto tw-shadow-2xl tw-rounded-[42px]"
                        />
                        <h1 className="tw-font-bold tw-text-[36px] tw-mt-11">
                            Tournaments
                        </h1>
                        <p>
                            Get more points the closer you are to the hammer
                            price of a curated set of car auctions.
                        </p>
                        <button
                            className="tw-mt-6 tw-py-3 tw-px-4 tw-font-bold tw-bg-[#f2ca16] tw-rounded"
                            onClick={(e) => router.push("/tournaments")}
                        >
                            View tournaments
                        </button>
                    </div>
                </div>
            ) : (
                <div className="options tw-grid tw-cols-1 lg:tw-grid-cols-3 tw-gap-6 tw-px-4 md:tw-px-16 tw-pt-16 sm:tw-pt-[120px] tw-w-screen 2xl:tw-w-[1440px] tw-self-center">
                    <div className=" tw-bg-white tw-rounded-lg tw-text-center tw-py-[32px] tw-px-[24px]">
                        <Image
                            src={LiveGamesIcon}
                            width={68}
                            height={68}
                            alt="dollar"
                            className="tw-block tw-mx-auto tw-w-[68px] tw-h-[68px] tw-shadow-lg tw-rounded-[16px] "
                        />
                        <h1 className="tw-font-bold tw-text-[24px] tw-mt-3">
                            Guess the Price
                        </h1>
                        <p>
                            Wager on the car auction and guess the final hammer
                            price. Closest player wins the prize.
                        </p>
                        <button
                            className="btn-yellow tw-mt-4"
                            onClick={(e) => router.push("/auctions")}
                        >
                            View games
                        </button>
                    </div>
                    <div className="tw-bg-white tw-rounded-lg tw-text-center tw-py-[32px] tw-px-[24px]">
                        <Image
                            src={TeamBattlesIcon}
                            width={68}
                            height={68}
                            alt="dollar"
                            className="tw-block tw-mx-auto tw-w-[68px] tw-h-[68px] tw-shadow-lg tw-rounded-[16px]"
                        />
                        <h1 className="tw-font-bold tw-text-[24px] tw-mt-3">
                            Team Battles
                        </h1>
                        <p>
                            Pick between teams betting on the same car. Player
                            in the team with the closest wager wins the prize.
                        </p>
                        <button
                            className="tw-bg-gray-300 tw-mt-4 tw-font-bold tw-rounded-md tw-p-2"
                            disabled
                        >
                            Coming soon!
                        </button>
                    </div>
                    <div className="tw-bg-white tw-rounded-lg tw-text-center tw-py-[32px] tw-px-[24px]">
                        <Image
                            src={TournamentsIcon}
                            width={68}
                            height={68}
                            alt="dollar"
                            className="tw-block tw-mx-auto tw-w-[68px] tw-h-[68px] tw-shadow-lg tw-rounded-[16px]"
                        />
                        <h1 className="tw-font-bold tw-text-[24px] tw-mt-3">
                            Tournaments
                        </h1>
                        <p>
                            Get more points the closer you are to the hammer
                            price of a curated set of car auctions.
                        </p>
                        <button
                            className="tw-bg-gray-300 tw-mt-4 tw-font-bold tw-rounded-md tw-p-2"
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
