"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BounceLoader } from "react-spinners";
import { useSession } from "@/lib/auth-client";

const Authenticated: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (session && showLoader) {
      const redirectTimer = setTimeout(() => {
        router.push("/");
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [session, showLoader, router]);

  return (
    <div className="flex flex-col items-center justify-start pb-16 pt-16">
      {showLoader ? (
        <div className="flex grow items-center justify-center">
          <BounceLoader color="gray" />
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold">You are already logged in</h1>
          <p className="mt-2 text-muted-foreground">
            Redirecting you to homepage...
          </p>
        </div>
      )}
    </div>
  );
};

export default Authenticated;
