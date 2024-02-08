"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import AuctionImageCarousel from "./auction_image_carousel";

interface CarImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: { placing: number; src: string }[];
}

const CarImageModal: React.FC<CarImageModalProps> = ({
  isOpen,
  onClose,
  image,
}) => {
  if (!isOpen) {
    return null;
  }
  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-25 tw-backdrop-blur-sm tw-flex tw-justify-center tw-items-center tw-w-full tw-z-30">
      <div className="tw-w-800 tw-flex tw-flex-col">
        <button
          className="tw-text-white tw-text-xl tw-place-self-end tw-rounded-full tw-border-2 tw-w-8 hover:tw-bg-yellow-400"
          onClick={() => onClose()}
        >
          ✕
        </button>
        <ShowModal images={image} />
      </div>
    </div>
  );
};

export default CarImageModal;

interface ShowModalProps {
  images: { placing: number; src: string }[];
}

const ShowModal = ({ images }: ShowModalProps) => {
  const imageSources = images.map((image) => image.src);
  return (
    <div>
      <AuctionImageCarousel images={imageSources} />
    </div>
  );
};
