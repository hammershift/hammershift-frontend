"use client";

import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { Suspense } from "react";
import { getCars } from "@/lib/data";
import { GamesCard } from "../../_components/card";
import MagnifyingGlass from "../../../../public/images/magnifying-glass.svg";
import { getCarsWithFilter } from "@/lib/data";
import FiltersAndSort from "@/app/_components/filter_and_sort";
import { carDataThree } from "@/sample_data";
import { TimerProvider } from "@/app/_context/TimerContext";

const filtersInitialState = {
  make: ["All"],
  category: ["All"],
  era: ["All"],
  location: ["All"],
  sort: "Newly Listed",
};

export const AuctionListing = ({
  defaultListing = [],
  carsCount = 0,
}: {
  defaultListing: any;
  carsCount: number;
}) => {
  const [filters, setFilters] = useState(filtersInitialState);
  const [loadMore, setLoadMore] = useState(21);
  const [listing, setListing] = useState(carDataThree);
  const [loading, setLoading] = useState(false);
  const [totalAuctions, setTotalAuctions] = useState(0);

  //set initial listing and total auctions
  useEffect(() => {
    if (defaultListing) setListing(defaultListing);
    if (carsCount) setTotalAuctions(carsCount);
  }, []);

  //adds 21 to loadMore when button is clicked
  const clickHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!loading) {
      if (listing.length > totalAuctions - 21) {
        setLoadMore((prev) => totalAuctions);
      } else {
        setLoadMore((prev) => prev + 21);
      }
    }
  };

  //if filters are changed, reset loadMore to 21
  useEffect(() => {
    setLoadMore(21);
  }, [filters]);

  //if filters are changed, fetch new data
  useEffect(() => {
    const filterWithLimit = { ...filters, limit: loadMore };
    getCarsWithFilter(filterWithLimit).then((res) => {
      setTotalAuctions(res.total);
      setListing(res.cars);
    });
  }, [filters, loadMore]);

  return (
    <>
      <FiltersAndSort filters={filters} setFilters={setFilters} />
      <div className="tw-pb-16 ">
        <section className="tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] tw-overflow-hidden">
          <div className=" tw-w-full 2xl:tw-w-[1312px] ">
            <Suspense fallback={<div>Loading...</div>}>
              <div className=" tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 ">
                {listing.length > 0 &&
                  listing.map((car: any, index) => {
                    let year, make, model, price, auction_id, deadline: any;
                    if (car.attributes) {
                      car.attributes.map(
                        (property: {
                          key: string;
                          value: number | string | Date;
                        }) => {
                          switch (property.key) {
                            case "year":
                              year = property.value;
                              break;
                            case "make":
                              make = property.value;
                              break;
                            case "model":
                              model = property.value;
                              break;
                            case "price":
                              price = property.value;
                              break;
                            case "auction_id":
                              auction_id = property.value;
                              break;
                            case "deadline":
                              deadline = property.value;
                              break;
                            default:
                              break;
                          }
                        }
                      );
                    }

                    return (
                      <div key={car._id ? car._id : index + "gamesCard"}>
                        <TimerProvider deadline={new Date(deadline)}>
                          <GamesCard
                            auction_id={
                              car.auction_id
                                ? car.auction_id
                                : index + "auctionId"
                            }
                            make={make ? make : ""}
                            year={year ? year : ""}
                            model={model ? model : ""}
                            description={
                              car.description ? car.description : [""]
                            }
                            image={car.image ? car.image : ""}
                            price={price ? price : 0}
                            deadline={deadline ? deadline : Date()}
                          />
                        </TimerProvider>
                      </div>
                    );
                  })}
              </div>
            </Suspense>
          </div>
        </section>
        <div className="tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] ">
          <div className="tw-text-[18px] tw-opacity-50 tw-text-center tw-mt-16 tw-mb-4">{`Showing ${
            listing ? listing.length : "0"
          } of ${totalAuctions || "0"} auctions`}</div>
          <button
            className={`btn-transparent-white tw-w-full tw-text-[18px] ${
              listing?.length >= totalAuctions && "tw-hidden"
            }`}
            style={{ paddingTop: "16px", paddingBottom: "16px" }}
            onClick={clickHandler}
          >
            Load more
          </button>
        </div>
      </div>
    </>
  );
};

export const FilterDropdownMenu = () => {
  return (
    <div className="slide-in-top tw-absolute tw-flex tw-flex-col tw-text-white tw-bg-[#0F1923] tw-p-4 tw-w-full tw-h-full tw-z-50">
      <div className="tw-bg-shade-100 tw-flex tw-p-2 tw-rounded tw-mt-8">
        <Image
          src={MagnifyingGlass}
          width={15}
          height={15}
          alt="magnifying glass"
          className="tw-w-auto tw-h-auto"
        />
        <input
          className="tw-ml-2 tw-bg-shade-100 "
          placeholder="Search make, model, year..."
        ></input>
      </div>
    </div>
  );
};
