import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isRoleBypass } from "@/lib/gate";
import InviteForm from "./InviteForm";

export const dynamic = "force-dynamic";

export default async function AdminInvitePage() {
  const session = (await getServerSession(authOptions)) as
    | { user?: { role?: string } }
    | null;
  if (!isRoleBypass(session?.user?.role)) redirect("/");

  return (
    <main className="min-h-screen bg-[#0A0A1A] text-white px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Invite a user past the gate</h1>
        <p className="text-sm text-gray-400 mb-6">
          Sets <code>isInvited: true</code> on the user with the given email.
          The user must already have signed up (we lookup by email).
        </p>
        <InviteForm />
      </div>
    </main>
  );
}
