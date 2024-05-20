"use client";

import React from "react";
import Image from "next/image";

import CancelIcon from "../../../public/images/x-icon.svg";

const WithdrawForm = () => {
  return (
    <div className="tw-bg-black/80 tw-w-screen tw-h-screen tw-flex tw-justify-center tw-items-start md:tw-items-center tw-absolute tw-top-0 tw-left-0">
      <div className="tw-relative tw-bg-[#0F1923] tw-w-[640px] tw-h-[720px] tw-p-6">
        <div className="tw-flex tw-justify-between tw-mb-12">
          <div className="tw-text-3xl tw-font-bold">Withdraw</div>
          <hr className="tw-border-white" />
          <div className="tw-w-[35px] tw-h-[35px] tw-flex tw-justify-center tw-items-center">
            <button>
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
        <hr className="tw-bg-slate-900" />
        <form className="tw-flex tw-flex-col tw-gap-5 tw-my-5">
          <div className="tw-flex tw-flex-col tw-gap-2">
            <label>Amount *</label>
            <input className="tw-rounded-sm"></input>
          </div>
          <hr className="tw-bg-white" />
          <div className="tw-flex tw-flex-col tw-gap-2">
            <label>Account Name *</label>
            <input className="tw-rounded-sm"></input>
          </div>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <label>Account Number *</label>
            <input className="tw-rounded-sm"></input>
          </div>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <label>Bank Name *</label>
            <input className="tw-rounded-sm"></input>
          </div>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <label>SWIFT Code / IBAN / ACH / Wire Routing Number *</label>
            <input className="tw-rounded-sm"></input>
          </div>
          <button className="btn-yellow">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawForm;
