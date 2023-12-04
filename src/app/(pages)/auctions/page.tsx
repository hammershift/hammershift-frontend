"use client";
import { useState, useEffect, Suspense } from "react";
import { getCars, getCarsWithFilter } from "@/lib/data"
import { carDataThree } from "@/sample_data";
import FiltersAndSort from "@/app/components/filter_and_sort";
import { TimerProvider } from "@/app/_context/TimerContext";
import { GamesCard } from "@/app/components/card";

export const filtersInitialState = {
    make: ["All"],
    category: ["All"],
    era: ["All"],
    location: ["All"],
    sort: "Newly Listed",
};

const AuctionListingPage = () => {
    const [filters, setFilters] = useState(filtersInitialState);
    const [loadMore, setLoadMore] = useState(21);
    const [listing, setListing] = useState(carDataThree);
    const [loading, setLoading] = useState(false);
    const [totalAuctions, setTotalAuctions] = useState(0);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getCars({ limit: 21 });
                if (res) {
                    const data = await res.json();
                    setTotalAuctions(data.total);
                    setListing(data.cars);
                } else {
                    console.log("cannot fetch car data");
                }
            } catch (e) {
                console.log({ error: e })
            }
        }
        fetchData();
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
        const fetchData = async () => {
            try {
                const filterWithLimit = { ...filters, limit: loadMore };
                const res = await getCarsWithFilter(filterWithLimit);
                setTotalAuctions(res.total);
                setListing(res.cars);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [filters, loadMore]);

    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <FiltersAndSort filters={filters} setFilters={setFilters} />
            <div className="tw-pb-16 ">
                <section className="tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] tw-overflow-hidden">
                    <div className=" tw-w-full 2xl:tw-w-[1312px] ">
                        <Suspense fallback={<div>Loading...</div>}>
                            <div className=" tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-x-4 md:tw-gap-x-6 tw-gap-y-8 md:tw-gap-y-16 tw-mt-12 ">
                                {listing.length > 1 &&
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
                    <div className="tw-text-[18px] tw-opacity-50 tw-text-center tw-mt-16 tw-mb-4">{`Showing ${listing ? listing.length : "0"
                        } of ${totalAuctions || "0"} auctions`}</div>
                    <button
                        className={`btn-transparent-white tw-w-full tw-text-[18px] ${listing?.length >= totalAuctions && "tw-hidden"
                            }`}
                        style={{ paddingTop: "16px", paddingBottom: "16px" }}
                        onClick={clickHandler}
                    >
                        Load more
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AuctionListingPage

