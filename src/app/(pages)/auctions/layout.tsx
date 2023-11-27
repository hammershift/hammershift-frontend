import Links from "@/app/_components/links";
import { SubscribeSmall } from '@/app/_components/subscribe'
import Footer from '@/app/_components/footer'
import { LatestNews } from '@/app/_components/how_hammeshift_works'

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