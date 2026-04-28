import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { ShareCard } from "@/models/shareCard.model";
import { resolveBaseUrl } from "@/lib/profile/baseUrl";
import CardsGalleryClient, {
  type GalleryCard,
} from "@/app/components/profile/CardsGalleryClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Share cards · Velocity Markets",
  robots: { index: false, follow: false },
};

interface UserGate {
  _id: unknown;
  isInvited?: boolean;
}

interface ShareCardLean {
  _id: Types.ObjectId;
  type: GalleryCard["type"];
  shortCode: string;
  createdAt: Date;
}

export default async function CardsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");

  await connectToDB();

  const user = await Users.findOne({ email: session.user.email })
    .select("_id isInvited")
    .lean<UserGate | null>();

  if (!user || user.isInvited !== true) redirect("/");

  const cardDocs = await ShareCard.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("type shortCode createdAt")
    .lean<ShareCardLean[]>();

  const baseUrl = await resolveBaseUrl();

  const cards: GalleryCard[] = cardDocs.map((c) => ({
    id: String(c._id),
    type: c.type,
    shortCode: c.shortCode,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10">
      <Link
        href="/profile"
        className="text-sm text-gray-400 transition hover:text-white"
      >
        &larr; Profile
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Your share cards</h1>
      <p className="mt-1 text-sm text-gray-400">
        Every card you&rsquo;ve earned. Copy a link to share.
      </p>

      <CardsGalleryClient cards={cards} baseUrl={baseUrl} />
    </main>
  );
}
