"use client";
import { useState, useEffect, Suspense, lazy } from "react";
import { getCars, getCarsWithFilter } from "@/lib/data"
import FiltersAndSort from "@/app/components/filter_and_sort";
import { TimerProvider } from "@/app/_context/TimerContext";
import { GamesCard } from "@/app/components/card";
const AuctionsList = lazy(() => import('@/app/ui/auctions/AuctionsList'));



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
    const [listing, setListing] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalAuctions, setTotalAuctions] = useState(0);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getCars({ limit: 21 });
                if (res) {
                    const data = await res.json();
                    setLoading(false);
                    setTotalAuctions(data.total);
                    setListing(data.cars);
                } else {
                    setLoading(false);
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
                if(res) {
                    setTotalAuctions(res.total);
                    setListing(res.cars);
                }
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
                        {loading 
                            ? <AuctionsList listing={listing} />
                            : <div className="tw-text-center">Loading... </div>}
                        
                    </div>
                </section>
                <div className="tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] ">
                    <div className="tw-text-[18px] tw-opacity-50 tw-text-center tw-mt-16 tw-mb-4">{`Showing ${listing.length > 0 ? listing?.length : "0"
                        } of ${totalAuctions || "0"} auctions`}</div>
                    <button
                        className={`btn-transparent-white tw-w-full tw-text-[18px] ${(listing?.length >= totalAuctions || listing === null) && "tw-hidden"
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

