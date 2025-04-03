"use client";

import { useState, useEffect, Suspense, lazy, useRef } from "react";
import { getCarsWithFilter } from "@/lib/data";
import FiltersAndSort from "@/app/components/filter_and_sort";
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
  const [noAuctionsFetched, setNoAuctionsFetched] = useState(false);
  const router = useRouter();
  const searchParamsObj = useSearchParams();

  // main fetch function
  const fetchData = async (filterObject: any) => {
    setLoading(true);
    try {
      const filterWithLimit: any = { ...filterObject, limit: loadMore };
      const res = await getCarsWithFilter(filterWithLimit);
      if (res) {
        if (res?.cars.length === 0) {
          setNoAuctionsFetched(true);
        } else {
          setNoAuctionsFetched(false);
        }
        setListing(res?.cars);
        setTotalAuctions(res?.total);
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
    <div className=" relative flex flex-col items-center">
      <FiltersAndSort
        filters={filters}
        isGridView={isGridView}
        setIsGridView={setIsGridView}
      />
      <>
        {!noAuctionsFetched ? (
          <div className="pb-8 sm:pb-16 ">
            <section className="w-screen px-4 md:px-16 2xl:w-[1440px] overflow-hidden">
              <div className=" w-full 2xl:w-[1312px] ">
                {isGridView ? (
                  <AuctionsGrid listing={listing} />
                ) : (
                  <AuctionsList listing={listing} />
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="p-16 text-center">Oops! No results found</div>
        )}
      </>
      <div className="w-screen px-4 md:px-16 2xl:w-[1440px] py-8 sm:py-16 ">
        <div
          className={`text-[18px] opacity-50 text-center mb-4 ${loading && "hidden"
            }`}
        >
          {filters != filtersInitialState &&
            `Showing ${listing.length > 0 ? listing?.length : "0"} of ${totalAuctions || "0"
            } auctions`}
        </div>
        <button
          className={`btn-transparent-white w-full text-[18px] ${(listing?.length >= totalAuctions || listing === null || loading) &&
            "hidden"
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
