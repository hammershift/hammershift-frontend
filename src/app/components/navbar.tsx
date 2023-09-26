import React from "react";
import Logo from "../../../public/images/hammershift-logo.svg";
import Image from "next/image";

const Navbar = () => {
    return (
        <div className="tw-flex tw-py-2 tw-px-8 md:tw-mx-32 tw-w-full">
            <div className="tw-flex tw-items-center tw-justify-between">
                <div className="tw-mx-4">
                    <Image src={Logo} width={177} height={32} alt="logo" />
                </div>
                <div className="tw-mx-4">DISCOVER</div>
                <div className="tw-mx-4">AUCTIONS</div>
            </div>
            <div className="tw-m-4 tw-flex tw-flex-initial tw-items-center tw-justify-center">
                <div>

                    <input
                        style={{ backgroundColor: "#172431", padding: "0.5rem" }}
                        className="tw-mx-10"
                        placeholder="Search make, model, year..."
                    ></input>
                </div>
            </div>
            <div className="tw-flex tw-items-center">
                <button className="btn-white">CREATE ACCOUNT</button>
            </div>
        </div>
    );
};

export default Navbar;
