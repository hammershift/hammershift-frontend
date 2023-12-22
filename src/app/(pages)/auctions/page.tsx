'use client';
import { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { getCars, getCarsWithFilter } from '@/lib/data';
import FiltersAndSort from '@/app/components/filter_and_sort';
import { TimerProvider } from '@/app/_context/TimerContext';
import { GamesCard } from '@/app/components/card';
import { useParams } from 'next/navigation';
const AuctionsList = lazy(() => import('@/app/ui/auctions/AuctionsList'));
import { useRouter } from 'next/navigation';
import { MoonLoader } from 'react-spinners';
import { useSearchParams } from 'next/navigation'

const filtersInitialState = {
    make: ['All'],
    category: ['All'],
    era: ['All'],
    location: ['All'],
    sort: 'Newly Listed',
};

type Filter = {
    make?: string | string[];
    category?: string | string[];
    location?: string | string[];
    era?: string | string[];
    sort?: string;
    limit?: number;
};

export const dynamic = 'force-dynamic';

const AuctionListingPage = ({ searchParams }: { searchParams: { make: string } }) => {
    const [filters, setFilters] = useState<Filter>(filtersInitialState);
    const [loadMore, setLoadMore] = useState(21);
    const [listing, setListing] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalAuctions, setTotalAuctions] = useState(0);
    const router = useRouter();
    const renderCount = useRef(0);
    const searchParamsObj = useSearchParams()

    console.log("searchParamsObj", searchParamsObj.getAll('make'))

    // main fetch function
    const fetchData = async (filterObject: any) => {
        setLoading(true);
        try {
            const filterWithLimit: any = { ...filterObject, limit: loadMore };
            const res = await getCarsWithFilter(filterWithLimit);
            if (res) {
                setListing(res?.cars);
                setTotalAuctions(res?.total)
                setLoading(false);
                return
            }
            setLoading(false);
        } catch (error) {
            console.log(error)
            setLoading(false);
        }
    }


    // function to set seachParams to filters
    const createFilterObject = () => {
        const query: any = JSON.parse(JSON.stringify(filtersInitialState));

        const filtersFromSearchParams = (filter: any) => {
            Object.keys(searchParams).forEach((key) => {
                query[key] = Array.isArray(filter[key]) ? filter[key] : [filter[key]];
            });
            setFilters(query);
            console.log("query from cfo:", query)

        };

        let newQuery = {};
        if (searchParamsObj.getAll('make').length > 0) {
            newQuery = { ...newQuery, make: searchParamsObj.getAll('make') }
        }
        if (searchParamsObj.getAll('categories').length > 0) {
            newQuery = { ...newQuery, categories: searchParamsObj.getAll('categories') }
        }
        if (searchParamsObj.getAll('location').length > 0) {
            newQuery = { ...newQuery, location: searchParamsObj.getAll('location') }
        }
        if (searchParamsObj.getAll('era').length > 0) {
            newQuery = { ...newQuery, era: searchParamsObj.getAll('era') }
        }


        filtersFromSearchParams(newQuery);

    }

    // calls createFilterObject when searchParams are changed
    useEffect(() => {
        createFilterObject();
    }, [searchParamsObj]);


    // calls fetchData when filters are changed
    useEffect(() => {
        if (renderCount.current > 1) {
            fetchData(filters);
        }
        renderCount.current += 1;
    }, [filters, loadMore]);

    useEffect(() => {
        if (Object.keys(searchParams).length === 0) {
            fetchData(filters);
        }
    }, []);


    //console log to check filters
    useEffect(() => {
        console.log("filters:", filters);
        console.log("searchParams:", searchParams);
    }, [filters]);



    //if filters are changed, reset loadMore to 21
    useEffect(() => {
        setLoadMore(21);
    }, [filters]);

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
        <div className=' tw-relative tw-flex tw-flex-col tw-items-center'>
            <FiltersAndSort filters={filters} setFilters={setFilters} />
            {
                loading && listing.length === 0
                    ? <Loader />
                    : <>{listing.length != 0
                        ? <div className='tw-pb-16 '>
                            <section className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] tw-overflow-hidden'>
                                <div className=' tw-w-full 2xl:tw-w-[1312px] '>
                                    {
                                        listing
                                        && <AuctionsList listing={listing} />
                                    }
                                </div>
                            </section>
                        </div>
                        : <div className='tw-p-16'>
                            No Cars with those requirements...
                        </div>

                    }
                    </>

            }
            {
                loading && listing.length > 0
                && <Loader />
            }
            <div className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] tw-py-16 '>
                <div className={`tw-text-[18px] tw-opacity-50 tw-text-center tw-mb-4 ${loading && 'tw-hidden'}`}>{`Showing ${listing.length > 0 ? listing?.length : '0'} of ${totalAuctions || '0'} auctions`}</div>
                <button
                    className={`btn-transparent-white tw-w-full tw-text-[18px] ${(listing?.length >= totalAuctions || listing === null || loading) && 'tw-hidden'}`}
                    style={{ paddingTop: '16px', paddingBottom: '16px' }}
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
        <div className='tw-flex tw-justify-center tw-items-center tw-h-[500px]'>
            <MoonLoader color='#f2ca16' />
        </div>
    )
}

