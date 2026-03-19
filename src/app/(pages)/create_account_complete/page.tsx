"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function CreateAccountComplete() {
  const { data: session } = useSession();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (session?.user) {
      router.push("/authenticated");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/login_page");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, router]);

  return (
    <div className="min-h-screen bg-[#0A0A1A] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00D4AA]/20">
          <CheckCircle2 className="h-8 w-8 text-[#00D4AA]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Account created successfully!
        </h1>
        <p className="text-gray-400 mb-1">
          Check your email for a welcome message.
        </p>
        <p className="text-gray-500 text-sm">
          Redirecting to sign in{countdown > 0 ? ` in ${countdown}s` : ""}...
        </p>
      </div>
    </div>
  );
}
