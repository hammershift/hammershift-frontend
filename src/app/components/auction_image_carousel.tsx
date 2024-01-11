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
    <div className="tw-flex tw-items-center tw-justify-evenly">
      <button onClick={handlePrevClick}>
        <Image src={ArrowLeft} width={60} height={60} alt="arrow" />
      </button>
      <Image
        src={images[currentIndex]}
        width={800}
        height={800}
        alt="Auction Image"
      />
      <button onClick={handleNextClick}>
        <Image src={ArrowRight} width={60} height={60} alt="arrow" />
      </button>
    </div>
  );
}

export default AuctionImageCarousel;
