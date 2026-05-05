import { SubscribeSmall } from "@/app/components/subscribe";
import { requireGated } from "@/lib/requireGated";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireGated();
  return (
    <div className="page-container">
      {children}
      <SubscribeSmall />
    </div>
  );
}
