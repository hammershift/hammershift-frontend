"use client";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateAccountComplete() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleSession = async () => {
      if (!session || !session.user) {
        return;
      } else {
        router.push("/authenticated");
      }
    };

    const checkSession = async () => {
      await handleSession();
    };

    checkSession();
  }, [session]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mt-6 flex items-center justify-center justify-between">
        <div className="flex w-full items-center justify-center">
          <div className="mb-1 text-2xl font-bold">
            Please verify your email to complete the sign-up process.
          </div>
        </div>
      </div>
    </div>
  );
}
