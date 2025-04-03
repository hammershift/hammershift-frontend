import { useState, useEffect } from "react";
import Image from "next/image";
import AvatarTwo from "../../../public/images/avatar-two.svg";

const WagerCycle: React.FC<any> = ({ words }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentWords, setCurrentWords] = useState<string[]>([]);

    useEffect(() => {
        if (words.length > 2) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [words]);

    useEffect(() => {
        if (words.length < 3) {
            setCurrentWords(words);
        } else {
            const currentWordsArray = [];
            for (let i = 0; i < 3; i++) {
                const index = (currentIndex + i) % words.length;
                currentWordsArray.push(words[index]);
            }
            setCurrentWords(currentWordsArray);
        }
    }, [currentIndex, words]);

    return (
        <div className="absolute z-50 bottom-[21px] left-[16px] text-sm font-light flex flex-col gap-[10px] justify-center bg-[#24242431] rounded p-2 w-[300px] backdrop-blur-[1px]">
            {currentWords.map((wager: any, index) => (
                <div
                    key={wager.user._id}
                    className="flex items-center gap-2 wager-cycle"
                >
                    <Image
                        src={wager.user.image ? wager.user.image : AvatarTwo}
                        alt="avatar one"
                        width={24}
                        height={24}
                        className="rounded-full"
                    />
                    <div>
                        @{wager.user.username} wagered $
                        {new Intl.NumberFormat().format(wager.priceGuessed)}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WagerCycle;
