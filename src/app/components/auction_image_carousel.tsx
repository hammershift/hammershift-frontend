"use state";

import { useState } from "react";
import Image from "next/image";

import ArrowRight from "../../../public/images/arrow-right.svg";
import ArrowLeft from "../../../public/images/arrow-left.svg";

interface AuctionImageCarouselProps {
    images: string[];
}

function AuctionImageCarousel({ images }: AuctionImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrevClick = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const handleNextClick = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <div className="flex items-center justify-evenly relative">
            <button
                className="lg:static absolute left-0"
                onClick={handlePrevClick}
            >
                <Image src={ArrowLeft} width={60} height={60} alt="arrow" />
            </button>
            <img
                src={images[currentIndex]}
                width={800}
                height={800}
                alt="Auction Image"
            />
            <button
                className="lg:static absolute right-0"
                onClick={handleNextClick}
            >
                <Image src={ArrowRight} width={60} height={60} alt="arrow" />
            </button>
        </div>
    );
}

export default AuctionImageCarousel;
