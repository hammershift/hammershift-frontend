import Links from "@/app/components/links";
import { SubscribeSmall } from '@/app/components/subscribe'
import Footer from '@/app/components/footer'
import { LatestNews } from '@/app/components/how_hammeshift_works'


export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="page-container">
            <Links />
            {children}
            <LatestNews />
            <SubscribeSmall />
            <Footer />
        </div>
    );
}

