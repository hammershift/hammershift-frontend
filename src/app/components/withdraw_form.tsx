"use client";

import React, { useState } from "react";
import Image from "next/image";

import CancelIcon from "../../../public/images/x-icon.svg";
import { useSession } from "next-auth/react";

const WithdrawForm = (props: any) => {
  const {
    handleCloseWithdrawModal,
    setShowSuccessfulWithdrawNotification,
    setShowFailedWithdrawNotification,
  } = props;
  const { data: session } = useSession();
  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [wireRoutingNumber, setWireRoutingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          accountName,
          accountNumber,
          bankName,
          wireRoutingNumber,
          userId: session?.user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccessfulWithdrawNotification(true);
        handleCloseWithdrawModal(
          e as unknown as React.MouseEvent<HTMLButtonElement>
        );
      } else {
        setError(data.message || "An error occurred");
      }
    } catch (err) {
      setError("An error occurred");
      setShowFailedWithdrawNotification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tw-bg-black/80 tw-w-screen tw-h-screen tw-flex tw-justify-center tw-items-start md:tw-items-center tw-absolute tw-top-0 tw-left-0">
      <div className="tw-relative tw-bg-[#0F1923] tw-w-[640px] tw-h-[720px] tw-p-6">
        <div className="tw-flex tw-justify-between tw-mb-12">
          <div className="tw-text-3xl tw-font-bold">Withdraw</div>
          <div className="tw-w-[35px] tw-h-[35px] tw-flex tw-justify-center tw-items-center">
            <button onClick={handleCloseWithdrawModal}>
              {" "}
              <Image
                src={CancelIcon}
                width={20}
                height={20}
                alt="x"
                className="tw-w-[20px] tw-h-[20px]"
              />
            </button>
          </div>
        </div>
        <hr className="tw-border-white/5" />
        <form
          className="tw-flex tw-flex-col tw-gap-5 tw-my-5"
          onSubmit={handleWithdraw}
        >
          <div className="tw-flex tw-flex-col tw-gap-2">
            <label>Amount *</label>
            <div className="tw-flex">
              {" "}
              <span className="tw-rounded-sm tw-text-white/60 tw-bg-[#172431] tw-h-auto tw-py-2 md:tw-py-2 tw-px-2">
                $
              </span>{" "}
              <input
                type="number"
                className="tw-rounded-sm tw-bg-[#172431] tw-h-auto tw-py-2 md:tw-py-2 tw-px-2 tw-w-full"
                onChange={(e) => setAmount(e.target.value)}
              ></input>
            </div>
          </div>
          <hr className="tw-border-white/5" />
          <div className="tw-flex tw-flex-col tw-gap-2">
            <label>Account Name *</label>
            <input
              type="text"
              className="tw-rounded-sm tw-bg-[#172431] tw-h-auto tw-py-2 md:tw-py-2 tw-px-2 tw-w-full"
              onChange={(e) => setAccountName(e.target.value)}
            ></input>
          </div>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <label>Account Number *</label>
            <input
              type="number"
              className="tw-rounded-sm tw-bg-[#172431] tw-h-auto tw-py-2 md:tw-py-2 tw-px-2 tw-w-full"
              onChange={(e) => setAccountNumber(e.target.value)}
            ></input>
          </div>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <label>Bank Name *</label>
            <input
              type="text"
              className="tw-rounded-sm tw-bg-[#172431] tw-h-auto tw-py-2 md:tw-py-2 tw-px-2 tw-w-full"
              onChange={(e) => setBankName(e.target.value)}
            ></input>
          </div>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <label>SWIFT Code / IBAN / ACH / Wire Routing Number *</label>
            <input
              type="text"
              className="tw-rounded-sm tw-bg-[#172431] tw-h-auto tw-py-2 md:tw-py-2 tw-px-2 tw-w-full"
              onChange={(e) => setWireRoutingNumber(e.target.value)}
            ></input>
          </div>
          <button type="submit" disabled={loading} className="btn-yellow">
            Submit
          </button>
          {error && <p className="tw-text-red-500 tw-mt-4">{error}</p>}
          {success && <p className="tw-text-green-500 tw-mt-4">{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default WithdrawForm;
