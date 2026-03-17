"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";

import CancelIcon from "../../../public/images/x-icon.svg";
import AmexLogo from "../../../public/images/payments-logo/amex.svg";
import ApplePayLogo from "../../../public/images/payments-logo/apple-pay.svg";
import DiscoverLogo from "../../../public/images/payments-logo/discover.svg";
import GooglePayLogo from "../../../public/images/payments-logo/google-pay.svg";
import MasterCardLogo from "../../../public/images/payments-logo/mastercard.svg";
import PaypalLogo from "../../../public/images/payments-logo/paypal.svg";
import VisaLogo from "../../../public/images/payments-logo/visa.svg";
import Check from "../../../public/images/check.svg";
import EmbeddedCheckoutButton from "@/app/components/embedded_checkout_button";

const PaymentForm = (props: any) => {
  const { handleClosePaymentModal, prices, userId, userEmail } = props;

  const cardSaved = false;
  const [paymentChoice, setPaymentChoice] = useState<string | null>(null); //null, Credit Card, Paypal, Apple Pay, Google Pay
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  // const [errorValidating, setErrorValidating] = useState(false)
  const [priceId, setPriceId] = useState<string | null>(null);

  const errorValidating = false;

  return (
    <div className="fixed top-0">
      <div className="bg-black/80 w-screen h-screen flex justify-center items-center md:items-center absolute top-0 left-0">
        <div className="bg-[#0F1923] w-[640px] h-[720px] p-6">
          {/* title */}
          <div className="flex justify-between mb-12">
            <div className="text-3xl font-bold">Pay with</div>
            <hr className="border-white" />
            <div className="w-[35px] h-[35px] flex justify-center items-center">
              <button onClick={handleClosePaymentModal}>
                {" "}
                <Image
                  src={CancelIcon}
                  width={20}
                  height={20}
                  alt="x"
                  className="w-[20px] h-[20px]"
                />
              </button>
            </div>
          </div>
          {/* Content */}
          {paymentChoice === null && (
            <div className="grid gap-3 ">
              <button
                className="bg-[#172431] h-auto py-2 md:py-4 px-4 w-full flex flex-col sm:flex-row items-center sm:justify-between gap-2 rounded"
                onClick={() => setPaymentChoice((prev) => "Credit Card")}
              >
                <div>Credit or Debit Card</div>
                <div className="grid grid-cols-4 gap-2">
                  <Image
                    src={VisaLogo}
                    width={52}
                    height={36}
                    alt="x"
                    className="w-[52px] h-[36px]"
                  />
                  <Image
                    src={MasterCardLogo}
                    width={52}
                    height={36}
                    alt="x"
                    className="w-[52px] h-[36px]"
                  />
                  <Image
                    src={AmexLogo}
                    width={52}
                    height={36}
                    alt="x"
                    className="w-[52px] h-[36px]"
                  />
                  <Image
                    src={DiscoverLogo}
                    width={52}
                    height={36}
                    alt="x"
                    className="w-[52px] h-[36px]"
                  />
                </div>
              </button>
              <button
                className="bg-[#172431] h-auto py-2 md:py-4 px-4 w-full flex flex-col sm:flex-row items-center sm:justify-between gap-2 rounded"
                onClick={() => setPaymentChoice((prev) => "Paypal")}
              >
                <div className="">Pay with PayPal</div>
                <Image
                  src={PaypalLogo}
                  width={112}
                  height={30}
                  alt="x"
                  className="w-[112px] h-[30px]"
                />
              </button>
              <button
                className="bg-[#172431] h-auto py-2 md:py-4 px-4 w-full flex flex-col sm:flex-row items-center sm:justify-between gap-2 rounded"
                onClick={() => setPaymentChoice((prev) => "Apple Pay")}
              >
                <div className="">Apple Pay</div>
                <Image
                  src={ApplePayLogo}
                  width={73}
                  height={30}
                  alt="x"
                  className="w-[73px] h-[30px]"
                />
              </button>
              <button
                className="bg-[#172431] h-auto py-2 md:py-4 px-4 w-full flex flex-col sm:flex-row items-center sm:justify-between gap-2 rounded"
                onClick={() => setPaymentChoice((prev) => "Google Pay")}
              >
                <div className="">Google Pay</div>
                <Image
                  src={GooglePayLogo}
                  width={81}
                  height={30}
                  alt="x"
                  className="w-[81px] h-[30px]"
                />
              </button>
              {/* If card is saved */}
              {cardSaved && (
                <div className="mt-11">
                  <div className="font-bold">Add payment method</div>
                  <button className="bg-[#172431] h-auto py-2 px-4 w-full flex flex-col sm:flex-row items-center sm:justify-between gap-2 rounded mt-3">
                    <div className="">Credit or Debit Card</div>
                    <div className="grid grid-cols-4 gap-2">
                      <Image
                        src={VisaLogo}
                        width={52}
                        height={36}
                        alt="x"
                        className="w-[52px] h-[36px]"
                      />
                      <Image
                        src={MasterCardLogo}
                        width={52}
                        height={36}
                        alt="x"
                        className="w-[52px] h-[36px]"
                      />
                      <Image
                        src={AmexLogo}
                        width={52}
                        height={36}
                        alt="x"
                        className="w-[52px] h-[36px]"
                      />
                      <Image
                        src={DiscoverLogo}
                        width={52}
                        height={36}
                        alt="x"
                        className="w-[52px] h-[36px]"
                      />
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
          {paymentChoice === "Credit Card" && (
            <div>
              <div className="rounded flex flex-col gap-4">
                <div className="bg-[#172431] p-5 h-[60px] w-full flex items-center flex-col sm:flex-row sm:justify-between gap-2 rounded">
                  <div className="">Credit or Debit Card</div>
                  <div className="grid grid-cols-4 gap-2">
                    <Image
                      src={VisaLogo}
                      width={52}
                      height={36}
                      alt="x"
                      className="w-[52px] h-[36px]"
                    />
                    <Image
                      src={MasterCardLogo}
                      width={52}
                      height={36}
                      alt="x"
                      className="w-[52px] h-[36px]"
                    />
                    <Image
                      src={AmexLogo}
                      width={52}
                      height={36}
                      alt="x"
                      className="w-[52px] h-[36px]"
                    />
                    <Image
                      src={DiscoverLogo}
                      width={52}
                      height={36}
                      alt="x"
                      className="w-[52px] h-[36px]"
                    />
                  </div>
                </div>
                {errorValidating ? (
                  <div className="text-sm text-[#C2451E] pt-2">
                    There was an error in validating your payment. Please try
                    again
                  </div>
                ) : null}
                {/* inputs */}

                <div>
                  <div className="bg-[#172431] p-4 rounded flex flex-col gap-4">
                    {" "}
                    <p className="p-2">
                      How much do you want to load into your wallet?
                    </p>
                    <ul className="grid grid-cols-2 gap-2">
                      {prices.map((price: any) => (
                        <li
                          className={`p-[16px] rounded-md hover:cursor-pointer ${priceId === price.id
                              ? "bg-[#53944F]"
                              : "bg-white/5"
                            }`}
                          key={price.id}
                          onClick={() => {
                            setPriceId(price.id);
                            console.log(price.id);
                          }}
                        >
                          ${price.unit_amount / 100}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {errorValidating ? (
                    <div className="text-sm text-[#C2451E] pt-2">
                      Delete Payment Method
                    </div>
                  ) : null}
                  <div className="py-4 sm:flex justify-end ">
                    <EmbeddedCheckoutButton
                      priceId={priceId}
                      userId={userId}
                      userEmail={userEmail}
                    />
                  </div>
                </div>
                <div className="py-4 grid grid-cols-2 sm:hidden mt-6">
                  <button
                    className="btn-transparent-white"
                    onClick={() => setPaymentChoice((prev) => null)}
                  >
                    CANCEL
                  </button>
                  <button
                    className="btn-yellow ml-4"
                    onClick={() => setIsLoading((prev) => true)}
                  >
                    CONTINUE
                  </button>
                </div>
              </div>
            </div>
          )}

          {paymentChoice === "Paypal" && (
            <div>
              <div className="text-center py-8 text-white/60">
                PayPal payments coming soon.
              </div>
              <div className="py-4 flex justify-end">
                <button
                  className="btn-transparent-white"
                  onClick={() => setPaymentChoice((prev) => null)}
                >
                  BACK
                </button>
              </div>
            </div>
          )}
          {paymentChoice === "Apple Pay" && (
            <div>
              <div className="text-center py-8 text-white/60">
                Apple Pay payments coming soon.
              </div>
              <div className="py-4 flex justify-end">
                <button
                  className="btn-transparent-white"
                  onClick={() => setPaymentChoice((prev) => null)}
                >
                  BACK
                </button>
              </div>
            </div>
          )}
          {paymentChoice === "Google Pay" && (
            <div>
              <div className="text-center py-8 text-white/60">
                Google Pay payments coming soon.
              </div>
              <div className="py-4 flex justify-end">
                <button
                  className="btn-transparent-white"
                  onClick={() => setPaymentChoice((prev) => null)}
                >
                  BACK
                </button>
              </div>
            </div>
          )}
          {isLoading === true && <Loading />}
          {isPaymentSuccessful === true && <PaymentSuccessful />}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;

const Loading = () => {
  return (
    <div className="bg-[#0F1923] w-screen sm:w-full h-full sm:h-[720px] absolute top-0 left-0 flex flex-col items-center justify-center p-4">
      <div className="w-[60px]">
        <svg
          viewBox="0 0 90 90"
          xmlns="http://www.w3.org/2000/svg"
          className="loading-animation"
        >
          <circle
            id="c"
            fill="none"
            stroke-width="8"
            stroke-linecap="square"
            stroke="white"
            cx="45"
            cy="45"
            r="40"
          />
        </svg>
      </div>
      <div className="mt-4">Verifying payment. Please wait.</div>
      <div>Do not close this window</div>
    </div>
  );
};

const PaymentSuccessful = () => {
  return (
    <div className="bg-[#0F1923] w-screen sm:w-full h-full sm:h-[720px] absolute top-0 left-0 flex flex-col items-center justify-center">
      <div className="">
        <Image
          src={Check}
          width={80}
          height={80}
          alt="x"
          className="w-[80px] h-[80px] "
        />
      </div>
      <div className="mt-4 text-2xl font-bold">Payment Successful</div>
      <div className="text-sm sm:text-base">
        Quam temere in vitiis, legem sancimus haerentia
      </div>
      <Link href={"/my_wallet"} className="mt-4">
        <div className="btn-transparent-white">BACK TO HOME</div>
      </Link>
    </div>
  );
};
