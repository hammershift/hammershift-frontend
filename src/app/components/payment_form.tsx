"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CountryOptions from "./country_option";

import CancelIcon from "../../../public/images/x-icon.svg";
import AmexLogo from "../../../public/images/payments-logo/amex.svg";
import ApplePayLogo from "../../../public/images/payments-logo/apple-pay.svg";
import DiscoverLogo from "../../../public/images/payments-logo/discover.svg";
import GooglePayLogo from "../../../public/images/payments-logo/google-pay.svg";
import MasterCardLogo from "../../../public/images/payments-logo/mastercard.svg";
import PaypalLogo from "../../../public/images/payments-logo/paypal.svg";
import VisaLogo from "../../../public/images/payments-logo/visa.svg";
import CardIcon from "../../../public/images/payments-logo/card.svg";
import HelpIcon from "../../../public/images/payments-logo/help-icon.svg";
import Check from "../../../public/images/check.svg";
import EmbeddedCheckoutButton from "@/app/components/embedded_checkout_button";

const PaymentForm = (props: any) => {
  const { handleClosePaymentModal, prices, userId, userEmail } = props;

  const cardSaved = true;
  const [paymentChoice, setPaymentChoice] = useState<string | null>(null); //null, Credit Card, Paypal, Apple Pay, Google Pay
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  // const [errorValidating, setErrorValidating] = useState(false)
  const [priceId, setPriceId] = useState<string | null>(null);

  const errorValidating = false;
  // To test loading
  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        setIsLoading(false);
        setIsPaymentSuccessful(true);
      }, 5000);
    }
  }, [isLoading]);

  return (
    <div className="tw-bg-black/80 tw-w-screen tw-h-screen tw-flex tw-justify-center tw-items-start md:tw-items-center tw-absolute tw-top-0 tw-left-0">
      <div className="tw-relative tw-bg-[#0F1923] tw-w-[640px] tw-h-[720px] tw-p-6">
        {/* title */}
        <div className="tw-flex tw-justify-between tw-mb-12">
          <div className="tw-text-3xl tw-font-bold">Pay with</div>
          <hr className="tw-border-white" />
          <div className="tw-w-[35px] tw-h-[35px] tw-flex tw-justify-center tw-items-center">
            <button onClick={handleClosePaymentModal}>
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
        {/* Content */}
        {paymentChoice === null && (
          <div className="tw-grid tw-gap-3 ">
            <button
              className="tw-bg-[#172431] tw-h-auto tw-py-2 md:tw-py-4 tw-px-4 tw-w-full tw-flex tw-flex-col sm:tw-flex-row tw-items-center sm:tw-justify-between tw-gap-2 tw-rounded"
              onClick={() => setPaymentChoice((prev) => "Credit Card")}
            >
              <div>Credit or Debit Card</div>
              <div className="tw-grid tw-grid-cols-4 tw-gap-2">
                <Image
                  src={VisaLogo}
                  width={52}
                  height={36}
                  alt="x"
                  className="tw-w-[52px] tw-h-[36px]"
                />
                <Image
                  src={MasterCardLogo}
                  width={52}
                  height={36}
                  alt="x"
                  className="tw-w-[52px] tw-h-[36px]"
                />
                <Image
                  src={AmexLogo}
                  width={52}
                  height={36}
                  alt="x"
                  className="tw-w-[52px] tw-h-[36px]"
                />
                <Image
                  src={DiscoverLogo}
                  width={52}
                  height={36}
                  alt="x"
                  className="tw-w-[52px] tw-h-[36px]"
                />
              </div>
            </button>
            <button
              className="tw-bg-[#172431] tw-h-auto tw-py-2 md:tw-py-4 tw-px-4 tw-w-full tw-flex tw-flex-col sm:tw-flex-row tw-items-center sm:tw-justify-between tw-gap-2 tw-rounded"
              onClick={() => setPaymentChoice((prev) => "Paypal")}
            >
              <div className="">Pay with PayPal</div>
              <Image
                src={PaypalLogo}
                width={112}
                height={30}
                alt="x"
                className="tw-w-[112px] tw-h-[30px]"
              />
            </button>
            <button
              className="tw-bg-[#172431] tw-h-auto tw-py-2 md:tw-py-4 tw-px-4 tw-w-full tw-flex tw-flex-col sm:tw-flex-row tw-items-center sm:tw-justify-between tw-gap-2 tw-rounded"
              onClick={() => setPaymentChoice((prev) => "Apple Pay")}
            >
              <div className="">Apple Pay</div>
              <Image
                src={ApplePayLogo}
                width={73}
                height={30}
                alt="x"
                className="tw-w-[73px] tw-h-[30px]"
              />
            </button>
            <button
              className="tw-bg-[#172431] tw-h-auto tw-py-2 md:tw-py-4 tw-px-4 tw-w-full tw-flex tw-flex-col sm:tw-flex-row tw-items-center sm:tw-justify-between tw-gap-2 tw-rounded"
              onClick={() => setPaymentChoice((prev) => "Google Pay")}
            >
              <div className="">Google Pay</div>
              <Image
                src={GooglePayLogo}
                width={81}
                height={30}
                alt="x"
                className="tw-w-[81px] tw-h-[30px]"
              />
            </button>
            {/* If card is saved */}
            {cardSaved && (
              <div className="tw-mt-11">
                <div className="tw-font-bold">Add payment method</div>
                <button className="tw-bg-[#172431] tw-h-auto tw-py-2 tw-px-4 tw-w-full tw-flex tw-flex-col sm:tw-flex-row tw-items-center sm:tw-justify-between tw-gap-2 tw-rounded tw-mt-3">
                  <div className="">Credit or Debit Card</div>
                  <div className="tw-grid tw-grid-cols-4 tw-gap-2">
                    <Image
                      src={VisaLogo}
                      width={52}
                      height={36}
                      alt="x"
                      className="tw-w-[52px] tw-h-[36px]"
                    />
                    <Image
                      src={MasterCardLogo}
                      width={52}
                      height={36}
                      alt="x"
                      className="tw-w-[52px] tw-h-[36px]"
                    />
                    <Image
                      src={AmexLogo}
                      width={52}
                      height={36}
                      alt="x"
                      className="tw-w-[52px] tw-h-[36px]"
                    />
                    <Image
                      src={DiscoverLogo}
                      width={52}
                      height={36}
                      alt="x"
                      className="tw-w-[52px] tw-h-[36px]"
                    />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
        {paymentChoice === "Credit Card" && (
          <div>
            <div className="tw-rounded tw-flex tw-flex-col tw-gap-4">
              <div className="tw-bg-[#172431] tw-p-5 tw-h-[60px] tw-w-full tw-flex tw-items-center tw-flex-col sm:tw-flex-row sm:tw-justify-between tw-gap-2 tw-rounded">
                <div className="">Credit or Debit Card</div>
                <div className="tw-grid tw-grid-cols-4 tw-gap-2">
                  <Image
                    src={VisaLogo}
                    width={52}
                    height={36}
                    alt="x"
                    className="tw-w-[52px] tw-h-[36px]"
                  />
                  <Image
                    src={MasterCardLogo}
                    width={52}
                    height={36}
                    alt="x"
                    className="tw-w-[52px] tw-h-[36px]"
                  />
                  <Image
                    src={AmexLogo}
                    width={52}
                    height={36}
                    alt="x"
                    className="tw-w-[52px] tw-h-[36px]"
                  />
                  <Image
                    src={DiscoverLogo}
                    width={52}
                    height={36}
                    alt="x"
                    className="tw-w-[52px] tw-h-[36px]"
                  />
                </div>
              </div>
              {errorValidating ? (
                <div className="tw-text-sm tw-text-[#C2451E] tw-pt-2">
                  There was an error in validating your payment. Please try
                  again
                </div>
              ) : null}
              {/* inputs */}

              <div>
                {/* <label>Card Number</label>
                <div className="tw-bg-white/5 tw-flex tw-h-11 tw-py-2.5 tw-px-3 tw-mt-2">
                  <Image
                    src={CardIcon}
                    width={35}
                    height={24}
                    alt="x"
                    className="tw-w-[35px] tw-h-[24px]"
                  />
                  <input
                    className="tw-bg-transparent tw-ml-2 tw-w-full"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
              </div>
              <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                <div>
                  <label>Expiration</label>
                  <div className="tw-relative tw-bg-white/5 tw-flex tw-items-center tw-h-11 tw-py-2.5 tw-px-3 tw-mt-2">
                    <input
                      className="tw-bg-transparent tw-ml-2"
                      placeholder="MM/YY"
                    />
                    <Image
                      src={HelpIcon}
                      width={20}
                      height={20}
                      alt="x"
                      className="tw-w-[20px] tw-h-[20px] tw-absolute tw-right-3"
                    />
                  </div>
                </div>
                <div>
                  <label>CVV</label>
                  <div className="tw-relative tw-bg-white/5 tw-flex tw-items-center tw-h-11 tw-py-2.5 tw-px-3 tw-mt-2">
                    <input
                      className="tw-bg-transparent tw-ml-2"
                      placeholder="123"
                    />
                    <Image
                      src={HelpIcon}
                      width={20}
                      height={20}
                      alt="x"
                      className="tw-w-[20px] tw-h-[20px] tw-absolute tw-right-3"
                    />
                  </div>
                </div>
              </div>
              <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4 tw-bg-[#1018280D]">
                <div>
                  <label>Country</label>
                  <div className="tw-bg-white/5 tw-flex tw-items-center tw-h-11 tw-py-2.5 tw-px-3 tw-mt-2">
                    <CountryOptions />
                  </div>
                </div>
                <div>
                  <label>Zip Code</label>
                  <div className="tw-bg-white/5 tw-flex tw-items-center tw-h-11 tw-py-2.5 tw-px-3 tw-mt-2">
                    <input className="tw-bg-transparent tw-ml-2 tw-w-full" />
                  </div>
                </div> */}
                <div className="tw-bg-[#172431] tw-p-4 tw-rounded tw-flex tw-flex-col tw-gap-4">
                  {" "}
                  <p className="tw-p-2">
                    How much do you want to load into your wallet?
                  </p>
                  <ul className="tw-grid tw-grid-cols-2 tw-gap-2">
                    {prices.map((price: any) => (
                      <li
                        className={`tw-p-[16px] tw-rounded-md hover:tw-cursor-pointer ${
                          priceId === price.id
                            ? "tw-bg-[#53944F]"
                            : "tw-bg-white/5"
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
                  <div className="tw-text-sm tw-text-[#C2451E] tw-pt-2">
                    Delete Payment Method
                  </div>
                ) : null}
                <div className="tw-py-4 sm:tw-flex tw-justify-end ">
                  <EmbeddedCheckoutButton
                    priceId={priceId}
                    userId={userId}
                    userEmail={userEmail}
                  />
                </div>
              </div>
              <div className="tw-py-4 tw-grid tw-grid-cols-2 sm:tw-hidden tw-mt-6">
                <button
                  className="btn-transparent-white"
                  onClick={() => setPaymentChoice((prev) => null)}
                >
                  CANCEL
                </button>
                <button
                  className="btn-yellow tw-ml-4"
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
            <div>Paypal Payment</div>
            <div className="tw-py-4 tw-flex tw-justify-end">
              <button
                className="btn-transparent-white"
                onClick={() => setPaymentChoice((prev) => null)}
              >
                CANCEL
              </button>
              <button
                className="btn-yellow tw-ml-4"
                onClick={() => setIsLoading((prev) => true)}
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}
        {paymentChoice === "Apple Pay" && (
          <div>
            <div>Apple Pay</div>
            <div className="tw-py-4 tw-flex tw-justify-end">
              <button
                className="btn-transparent-white"
                onClick={() => setPaymentChoice((prev) => null)}
              >
                CANCEL
              </button>
              <button
                className="btn-yellow tw-ml-4"
                onClick={() => setIsLoading((prev) => true)}
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}
        {paymentChoice === "Google Pay" && (
          <div>
            <div>Google Pay</div>
            <div className="tw-py-4 tw-flex tw-justify-end">
              <button
                className="btn-transparent-white"
                onClick={() => setPaymentChoice((prev) => null)}
              >
                CANCEL
              </button>
              <button
                className="btn-yellow tw-ml-4"
                onClick={() => setIsLoading((prev) => true)}
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}
        {isLoading === true && <Loading />}
        {isPaymentSuccessful === true && <PaymentSuccessful />}
      </div>
    </div>
  );
};

export default PaymentForm;

const Loading = () => {
  return (
    <div className="tw-bg-[#0F1923] tw-w-screen sm:tw-w-full tw-h-full sm:tw-h-[720px] tw-absolute tw-top-0 tw-left-0 tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-4">
      <div className="tw-w-[60px]">
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
      <div className="tw-mt-4">Verifying payment. Please wait.</div>
      <div>Do not close this window</div>
    </div>
  );
};

const PaymentSuccessful = () => {
  return (
    <div className="tw-bg-[#0F1923] tw-w-screen sm:tw-w-full tw-h-full sm:tw-h-[720px] tw-absolute tw-top-0 tw-left-0 tw-flex tw-flex-col tw-items-center tw-justify-center">
      <div className="">
        <Image
          src={Check}
          width={80}
          height={80}
          alt="x"
          className="tw-w-[80px] tw-h-[80px] "
        />
      </div>
      <div className="tw-mt-4 tw-text-2xl tw-font-bold">Payment Successful</div>
      <div className="tw-text-sm sm:tw-text-base">
        Quam temere in vitiis, legem sancimus haerentia
      </div>
      {/* TODO: replace href */}
      <Link href={"/"} className="tw-mt-4">
        <div className="btn-transparent-white">BACK TO HOME</div>
      </Link>
    </div>
  );
};
