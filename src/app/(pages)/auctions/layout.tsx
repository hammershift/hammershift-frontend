import Links from "@/app/components/links";
import { SubscribeSmall } from '@/app/components/subscribe'
import Footer from '@/app/components/footer'
import { LatestNews } from '@/app/components/how_hammeshift_works'
import { BeatLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="page-container">
            <Links />
            <Suspense fallback={<Loader />}>
                {children}
            </Suspense>
            <LatestNews />
            <SubscribeSmall />
            <Footer />
        </div>
    );
}

const Loader = () => {
    return (
        <div className='tw-flex tw-justify-center tw-items-center tw-h-[500px]'>
            <BeatLoader color='#f2ca16' />
        </div>
    )
}