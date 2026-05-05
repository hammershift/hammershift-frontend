// src/lib/requireGated.ts
//
// Server-only auth guard for gated pages. Call at the top of any server
// component that should only render for invited / privileged users.
//
// Defense-in-depth on top of middleware.ts: if `LAUNCH_GATE_ENABLED` ever
// gets unset in the deploy env (or middleware is otherwise bypassed), each
// gated page also redirects unauthorized callers to "/" on its own.
//
//   import { requireGated } from "@/lib/requireGated";
//
//   export default async function Page() {
//     await requireGated();
//     // ...gated content...
//   }
//
// Skips the check when the gate is disabled (LAUNCH_GATE_ENABLED is falsy)
// so dev / staging / pre-launch environments behave as before.

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/mongoose";
import Users from "@/models/user.model";
import { isRoleBypass } from "@/lib/gate";

interface UserGateFields {
  isInvited?: boolean;
  role?: string;
}

export async function requireGated(): Promise<void> {
  const enabled = /^(1|true|on|yes)$/i.test(process.env.LAUNCH_GATE_ENABLED ?? "");
  if (!enabled) return;

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) redirect("/");

  await connectToDB();
  const user = await Users.findOne({ email })
    .select("isInvited role")
    .lean<UserGateFields | null>();

  if (!user) redirect("/");
  if (user.isInvited === true) return;
  if (isRoleBypass(user.role)) return;
  redirect("/");
}
