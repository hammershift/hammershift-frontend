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
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center w-full z-30">
      <div className="w-800 flex flex-col">
        <button
          className="text-white text-xl place-self-end rounded-full border-2 w-8 hover:bg-yellow-400"
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
