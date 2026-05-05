import { SubscribeSmall } from "@/app/components/subscribe";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-container">
      {children}
      <SubscribeSmall />
    </div>
  );
}
