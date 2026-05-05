import { gateOrPass } from "@/lib/gateOrPass";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const gate = await gateOrPass();
  if (gate) return gate;
  return <>{children}</>;
}
