"use client";
import { useState, useEffect, Suspense, lazy, useRef } from "react";
import { getCars, getCarsWithFilter } from "@/lib/data";
import FiltersAndSort from "@/app/components/filter_and_sort";
import { TimerProvider } from "@/app/_context/TimerContext";
import { GamesCard } from "@/app/components/card";
import { useParams } from "next/navigation";
const AuctionsGrid = lazy(() => import("@/app/ui/auctions/AuctionsGrid"));
const AuctionsList = lazy(() => import("@/app/ui/auctions/AuctionsList"));
import { useRouter } from "next/navigation";
import { MoonLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";


const filtersInitialState = {
    make: ["All"],
    category: ["All"],
    era: ["All"],
    location: ["All"],
    sort: "Newly Listed",
};

type Filter = {
    make?: string | string[];
    category?: string | string[];
    location?: string | string[];
    era?: string | string[];
    sort?: string;
    limit?: number;
    ready?: boolean;
};

export const dynamic = "force-dynamic";

const AuctionListingPage = () => {
    const [filters, setFilters] = useState<Filter | null>(filtersInitialState);
    const [loadMore, setLoadMore] = useState(21);
    const [listing, setListing] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isGridView, setIsGridView] = useState(true);
    const [totalAuctions, setTotalAuctions] = useState(0);
    const router = useRouter();
    const searchParamsObj = useSearchParams();

    // main fetch function
    const fetchData = async (filterObject: any) => {
        setLoading(true);
        try {
            const filterWithLimit: any = { ...filterObject, limit: loadMore };
            const res = await getCarsWithFilter(filterWithLimit);
            if (res) {
                setListing(res?.cars);
                setTotalAuctions(res?.total);
                setLoading(false);
                return;
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    // function to set seachParams to filters
    const createFilterObject = () => {
        setLoading(true);
        const query: any = JSON.parse(JSON.stringify(filtersInitialState));

        const filtersFromSearchParams = (filter: any) => {
            Object.keys(filter).forEach((key) => {
                if (key == "sort") {
                    query[key] = filter[key];
                } else {
                    query[key] = Array.isArray(filter[key]) ? filter[key] : [filter[key]];
                }
            });
            setFilters({ ...query, ready: true });
            setLoading(false);
        };

        const getSearchParams = () => {
            let newQuery = {};
            if (searchParamsObj.getAll("make").length > 0) {
                newQuery = {
                    ...newQuery,
                    make: searchParamsObj.getAll("make"),
                };
            }
            if (searchParamsObj.getAll("category").length > 0) {
                newQuery = {
                    ...newQuery,
                    category: searchParamsObj.getAll("category"),
                };
            }
            if (searchParamsObj.getAll("location").length > 0) {
                newQuery = {
                    ...newQuery,
                    location: searchParamsObj.getAll("location"),
                };
            }
            if (searchParamsObj.getAll("era").length > 0) {
                newQuery = { ...newQuery, era: searchParamsObj.getAll("era") };
            }
            if (searchParamsObj.getAll("sort").length > 0) {
                newQuery = { ...newQuery, sort: searchParamsObj.get("sort") };
            }

            filtersFromSearchParams(newQuery);
        };

        getSearchParams();
    };

    // calls createFilterObject when searchParams are changed
    useEffect(() => {
        createFilterObject();
    }, [searchParamsObj]);




    // calls fetchData when filters are changed
    useEffect(() => {
        if (filters !== null) {
            if (filters.ready) {
                const { ready, ...currentFilters } = filters;
                fetchData(currentFilters);
            }
        }
    }, [filters, loadMore, isGridView]);

    // fetch data for default filter
    useEffect(() => {
        if (
            !searchParamsObj.getAll("location") &&
            !searchParamsObj.getAll("make") &&
            !searchParamsObj.getAll("category") &&
            !searchParamsObj.getAll("era") &&
            !searchParamsObj.getAll("sort")
        ) {
            fetchData(filters);
        }
    }, []);

    //console log to check filters
    // useEffect(() => {
    //     console.log("filters:", filters);
    // }, [filters]);

    //if filters are changed, reset loadMore to 21
    useEffect(() => {
        setLoadMore(21);
    }, [filters, isGridView]);

    //adds 21 to loadMore when button is clicked
    const clickHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        if (listing.length > totalAuctions - 21) {
            setLoadMore(() => totalAuctions);
        } else {
            setLoadMore((prev: number) => prev + 21);
        }
    };

    return (
        <div className=" tw-relative tw-flex tw-flex-col tw-items-center">
            <FiltersAndSort filters={filters} isGridView={isGridView} setIsGridView={setIsGridView} />
            {loading && listing.length === 0 ? (
                <Loader />
            ) : (
                <>
                    {/* TODO: changing the view*/}
                    {listing.length != 0 && filters != filtersInitialState ? (
                        <div className="tw-pb-8 sm:tw-pb-16 ">
                            <section className="tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] tw-overflow-hidden">
                                <div className=" tw-w-full 2xl:tw-w-[1312px] ">
                                    {isGridView ? <AuctionsGrid listing={listing} /> : <AuctionsList listing={listing} />}
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="tw-p-16 tw-text-center">{filters != filtersInitialState && "No Cars with those requirements..."}</div>
                    )}
                </>
            )}
            {loading && listing.length > 0 && <Loader />}
            <div className="tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] tw-py-8 sm:tw-py-16 ">
                <div className={`tw-text-[18px] tw-opacity-50 tw-text-center tw-mb-4 ${loading && "tw-hidden"}`}>
                    {filters != filtersInitialState && `Showing ${listing.length > 0 ? listing?.length : "0"} of ${totalAuctions || "0"} auctions`}
                </div>
                <button
                    className={`btn-transparent-white tw-w-full tw-text-[18px] ${(listing?.length >= totalAuctions || listing === null || loading) &&
                        "tw-hidden"
                        }`}

                    onClick={clickHandler}
                >
                    Load more
                </button>
            </div>
        </div>
    );
};

export default AuctionListingPage;

const Loader = () => {
    return (
        <div className="tw-flex tw-justify-center tw-items-center tw-h-[500px]">
            <MoonLoader color="#f2ca16" />
        </div>
    );
};
