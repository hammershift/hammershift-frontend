"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import EmbeddedCheckoutButton from "@/app/components/embedded_checkout_button";

interface ProductPrice {
  unit_amount: number;
  id: string;
}

const MyWalletPage = () => {
  const [prices, setPrices] = useState<ProductPrice[]>([]);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    const res = await fetch("/api/getProducts", { method: "GET" });
    if (!res.ok) {
      throw new Error("Unable to fetch prices");
    }
    const data = await res.json();
    setPrices(data);
    console.log(data);
  };

  //Trigger stripe hosted payment page
  const handleAddFundButtonClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
    priceId: string
  ) => {
    e.preventDefault();
    try {
      const response = await fetch("api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId: priceId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("add funds button clicked ", data);
      window.location.assign(data);
      return data;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="section-container tw-flex tw-justify-between">
      <div className="tw-w-1/3">
        <h1>ADD FUNDS TO YOUR WALLET </h1>
        <div className="tw-p-2 tw-border-red-500 tw-border-2 tw-flex tw-flex-col tw-gap-4">
          {prices.map((price) => (
            <div key={price.id}>
              <div className="tw-flex tw-justify-between">
                <p>Add ${price.unit_amount / 100}</p>
                <button
                  className="tw-border-amber-400 tw-border-2"
                  onClick={(e) => handleAddFundButtonClick(e, price.id)}
                >
                  Add Funds
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="tw-w-1/3">
        <h2>Wallet Details:</h2>
        <div className="tw-flex tw-justify-between">
          <p>Current balance:</p>
          <p>$10</p>
        </div>
        <EmbeddedCheckoutButton />
      </div>
    </div>
  );
};

export default MyWalletPage;
