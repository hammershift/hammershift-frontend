import { SubscribeSmall } from "@/app/components/subscribe";
import Footer from "@/app/components/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-container">
      {children}
      <SubscribeSmall />
      <Footer />
    </div>
  );
}
