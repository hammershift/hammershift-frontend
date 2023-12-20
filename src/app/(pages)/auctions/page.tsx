'use client';
import { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { getCars, getCarsWithFilter } from '@/lib/data';
import FiltersAndSort from '@/app/components/filter_and_sort';
import { TimerProvider } from '@/app/_context/TimerContext';
import { GamesCard } from '@/app/components/card';
import { useParams } from 'next/navigation';
const AuctionsList = lazy(() => import('@/app/ui/auctions/AuctionsList'));
import { useRouter } from 'next/navigation';

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

const AuctionListingPage = ({ searchParams }: { searchParams: { make: string } }) => {
    const [filters, setFilters] = useState<Filter>({});
    const [loadMore, setLoadMore] = useState(6); // return to 21
    const [listing, setListing] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalAuctions, setTotalAuctions] = useState(0);
    const router = useRouter();
    const countRef = useRef(0);

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

    const fetchData = async (filter: any) => {
        setLoading(true);
        let query = {}

        if (searchParams) {
            filter && Object.keys(filter).forEach((key) => {
                if (filter[key] !== 'All') {
                    query[key] = [filter[key]]
                }
            })
        }

        setFilters(query);
        console.log("filters", filters)
        try {
            const filterWithLimit: Filter = { ...query, limit: loadMore };
            console.log("filter with limit", filterWithLimit);
            const res = await getCarsWithFilter(filterWithLimit);
            if (res) {
                setLoading(false);
                setTotalAuctions(res.total);
                setListing(res.cars);
            } else {
                setLoading(false);
                console.log('cannot fetch car data');
            }
        } catch (e) {
            console.log({ error: e });
        }
    };

    useEffect(() => {
        if (searchParams) {
            fetchData(searchParams);
        } else {
            fetchData(filtersInitialState)
            setFilters(filtersInitialState);
        }
    }, [])




    //if filters are changed, reset loadMore to 21
    useEffect(() => {
        setLoadMore(21);
    }, [filters]);

    //if filters are changed, fetch new data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const filterWithLimit = { ...filters, limit: loadMore };
                console.log("filter with limit 2:", filterWithLimit);
                const res = await getCarsWithFilter(filterWithLimit);
                if (res) {
                    setTotalAuctions(res.total);
                    setListing(res.cars);
                }
            } catch (err) {
                console.error(err);
            }
        };
        if (countRef.current > 0) {
            fetchData();
        }
    }, [filters, loadMore]);

    return (
        <div className='tw-flex tw-flex-col tw-items-center'>
            <FiltersAndSort filters={filters} setFilters={setFilters} />
            <div className='tw-pb-16 '>
                <section className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] tw-overflow-hidden'>
                    <div className=' tw-w-full 2xl:tw-w-[1312px] '>
                        {
                            listing.length > 0
                            && <AuctionsList listing={listing} />
                        }
                    </div>
                </section>
                <div className='tw-w-screen tw-px-4 md:tw-px-16 2xl:tw-w-[1440px] '>
                    <div className='tw-text-[18px] tw-opacity-50 tw-text-center tw-mt-16 tw-mb-4'>{`Showing ${listing.length > 0 ? listing?.length : '0'} of ${totalAuctions || '0'
                        } auctions`}</div>
                    <button
                        className={`btn-transparent-white tw-w-full tw-text-[18px] ${(listing?.length >= totalAuctions || listing === null) && 'tw-hidden'}`}
                        style={{ paddingTop: '16px', paddingBottom: '16px' }}
                        onClick={clickHandler}
                    >
                        Load more
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuctionListingPage;

