import Image from "next/image";
import LiveGamesIcon from "../../../../public/images/currency-dollar-circle.svg";
import Link from "next/link";

export default function GuessThePriceInfoSection() {
    return (
        <div>
            <div className="mt-8 lg:mt-16 p-6 bg-[#172431]">
                <Image
                    src={LiveGamesIcon}
                    width={68}
                    height={68}
                    alt="car"
                    className="w-[68px] h-[68px]"
                />
                <div className="text-2xl font-bold mt-6">
                    What is Guess the Price
                </div>
                <div className="my-4">
                    Dive into the heart of the auction with Hammershift&apos;s
                    &quot;Guess the Price&quot; – a game of precision and
                    foresight that&apos;s all about the highest bid. Just like
                    the classic &apos;Price is Right&apos;, you have the chance
                    to wager on the final hammer price of coveted cars.
                    It&apos;s simple: study the car, place your wager, and if
                    your guess ranks among the top three closest to the final
                    sale price, you win a share of the prize pool. With your
                    automotive knowledge on the line, can you outbid the
                    competition and guess your way to victory?
                </div>
                <Link href="/auctions" className="text-[#42A0FF]">
                    View Auctions
                </Link>
            </div>
        </div>
    );
}
