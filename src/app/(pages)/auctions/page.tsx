'use client';
import { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { getCars, getCarsWithFilter } from '@/lib/data';
import FiltersAndSort from '@/app/components/filter_and_sort';
import { TimerProvider } from '@/app/_context/TimerContext';
import { GamesCard } from '@/app/components/card';
import { useParams } from 'next/navigation';
const AuctionsList = lazy(() => import('@/app/ui/auctions/AuctionsList'));
import { useRouter } from 'next/navigation';
import AuctionsListing from '@/app/ui/auctions/AuctionsListing';
import { MoonLoader } from 'react-spinners';

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
        console.log("query:", query)
        setFilters(query);
    };

    useEffect(() => {
        fetchData(searchParams);
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



    return (
        <div className=' tw-relative tw-flex tw-flex-col tw-items-center'>
            <FiltersAndSort filters={filters} setFilters={setFilters} />
            <Suspense fallback={<Loader />}>
                <AuctionsListing filters={filters} setFilters={setFilters} loadMore={loadMore} />
            </Suspense>
            <div className='section-container'>
                <button
                    className={`btn-transparent-white tw-w-full tw-text-[18px] `}
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
        <div className='tw-flex tw-justify-center tw-items-center tw-h-[800px]'>
            <MoonLoader color='#f2ca16' />
        </div>
    )
}

