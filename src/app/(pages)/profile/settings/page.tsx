import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import ProfileSettingsClient, {
  type SettingsUser,
} from "@/app/components/profile/ProfileSettingsClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Settings · Velocity Markets",
  robots: { index: false, follow: false },
};

interface UserSettingsLean {
  fullName?: string;
  about?: string;
  username?: string;
  email?: string;
  isInvited?: boolean;
  email_preferences?: {
    weekly_digest?: boolean;
    auction_reminders?: boolean;
    result_notifications?: boolean;
    marketing?: boolean;
  };
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");

  await connectToDB();
  const user = await Users.findOne({ email: session.user.email })
    .select("fullName about username email isInvited email_preferences")
    .lean<UserSettingsLean | null>();
  if (!user || user.isInvited !== true) redirect("/");

  const settingsUser: SettingsUser = {
    fullName: user.fullName ?? "",
    about: user.about ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    email_preferences: {
      weekly_digest: user.email_preferences?.weekly_digest ?? true,
      auction_reminders: user.email_preferences?.auction_reminders ?? true,
      result_notifications: user.email_preferences?.result_notifications ?? true,
      marketing: user.email_preferences?.marketing ?? false,
    },
  };

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-10">
      <Link
        href="/profile"
        className="text-sm text-gray-400 transition hover:text-white"
      >
        &larr; Profile
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Settings</h1>
      <p className="mt-1 text-sm text-gray-400">
        Manage your profile, preferences, and account.
      </p>

      <ProfileSettingsClient user={settingsUser} />
    </main>
  );
}
