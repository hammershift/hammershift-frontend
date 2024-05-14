"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PaymentForm from "@/app/components/payment_form";

interface ProductPrice {
  unit_amount: number;
  id: string;
}

const MyWalletPage = () => {
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: session } = useSession();
  const userId = session?.user.id;
  const userEmail = session?.user.email;

  useEffect(() => {
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
    fetchPrices();
  }, []);

  useEffect(() => {
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
    fetchWalletBalance();
  }, [session]);

  const handleClosePaymentModal = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsPaymentModalOpen(false);
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
    <div className="section-container tw-flex tw-flex-col tw-justify-evenly">
      <div className="tw-flex tw-flex-col tw-justify-center tw-self-center tw-w-2/3 tw-rounded-md ">
        <h2 className="tw-p-4 tw-text-3xl tw-font-bold">My Wallet</h2>
        <div className="tw-p-4 tw-flex tw-flex-col tw-gap-1 tw-bg-[#49C74233] tw-rounded-md">
          <div className="tw-flex tw-justify-between tw-items-center tw-rounded-md">
            <div>
              {loading ? (
                <p className="tw-text-xl">Loading</p>
              ) : (
                <p className="tw-text-xl tw-font-bold">
                  {" "}
                  ${walletBalance.toFixed(2)}
                </p>
              )}
              <p>Balance</p>
            </div>
            <div>
              <button className="tw-p-1 tw-m-1 tw-border-2 tw-border-yellow-500">
                WITHDRAW
              </button>
              <button
                className="tw-p-1 tw-px-3 tw-m-1 tw-bg-[#F2CA16] tw-text-black tw-font-bold tw-rounded-md"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                + LOAD
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        {isPaymentModalOpen && (
          <PaymentForm
            handleClosePaymentModal={handleClosePaymentModal}
            prices={prices}
            userId={userId}
            userEmail={userEmail}
          />
        )}
      </div>
    </div>
  );
};

export default MyWalletPage;
