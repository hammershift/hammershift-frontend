"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import EmbeddedCheckoutButton from "@/app/components/embedded_checkout_button";
import { useSession } from "next-auth/react";

interface ProductPrice {
  unit_amount: number;
  id: string;
}

const MyWalletPage = () => {
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const customerEmail = session?.user.email;

  useEffect(() => {
    fetchPrices();
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    setLoading(true);
    if (session) {
      try {
        const res = await fetch("/api/wallet", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (res.ok) {
          setWalletBalance(data.balance);
          setLoading(false);
        } else {
          console.error("Failed to fetch wallet balance:", data.message);
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    }
  };

  const fetchPrices = async () => {
    const res = await fetch("/api/getProducts", { method: "GET" });
    if (!res.ok) {
      throw new Error("Unable to fetch prices");
    }
    const data = await res.json();
    const sortedData = data.sort(
      (a: { unit_amount: any }, b: { unit_amount: any }) =>
        a.unit_amount - b.unit_amount
    );
    setPrices(sortedData);
    console.log(data);
  };

  //Trigger stripe hosted payment page
  //   const handleAddFundButtonClick = async (
  //     e: React.MouseEvent<HTMLButtonElement>,
  //     priceId: string
  //   ) => {
  //     e.preventDefault();
  //     try {
  //       const response = await fetch("api/payment", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ priceId: priceId }),
  //       });

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       console.log("add funds button clicked ", data);
  //       window.location.assign(data);
  //       return data;
  //     } catch (error) {
  //       console.error("Error:", error);
  //     }
  //   };

  return (
    <div className="section-container tw-flex tw-justify-between">
      <div className="tw-w-1/3">
        <h1 className="tw-text-2xl tw-p-3">ADD FUNDS TO YOUR WALLET </h1>
        <div className="tw-p-2 tw-flex tw-flex-col tw-gap-1">
          {prices.map((price) => (
            <div key={price.id}>
              <div className="tw-flex tw-px-3 tw-justify-between tw-items-center tw-bg-sky-950 tw-rounded-md">
                <p>Add ${price.unit_amount / 100}</p>
                {/* <button
                  className="tw-border-amber-400 tw-border-2"
                  onClick={(e) => handleAddFundButtonClick(e, price.id)}
                >
                  Add Funds
                </button> */}
                <EmbeddedCheckoutButton
                  priceId={price.id}
                  customerEmail={customerEmail}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="tw-w-1/3">
        <h2>Wallet Details:</h2>
        <div className="tw-flex tw-justify-between">
          <p>Current balance:</p>
          {loading ? <p>Loading</p> : <p> ${walletBalance.toFixed(2)}</p>}
        </div>
      </div>
    </div>
  );
};

export default MyWalletPage;
