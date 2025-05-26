"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BounceLoader } from "react-spinners";
import CancelIcon from "../../../../public/images/x-icon.svg";
import { Input } from "@/app/components/ui/input";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/app/components/ui/button";
const ForgotPassword = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data, error } = await authClient.forgetPassword({
        email: email,
        redirectTo: "/reset_password",
      });

      if (error) {
        setError(error.message!);
        setIsLoading(false);
        return;
      } else {
        setIsLoading(false);
        setSuccess("Please check your email for password reset link.");
      }
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="top-0 z-[-1] mt-16 flex w-screen items-center justify-center md:mt-0 md:h-screen">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <BounceLoader color="#696969" loading={isLoading} />
        </div>
      ) : (
        <div className="flex h-[505px] w-screen flex-col gap-8 px-6 pt-6 md:w-[640px]">
          <div>
            <div className="flex justify-between md:justify-start">
              <div className="text-2xl font-bold md:text-4xl">
                Forgot Password
              </div>
              <Image
                onClick={() => router.push("/")}
                src={CancelIcon}
                width={20}
                height={20}
                alt=""
                className="h-[20px] w-[20px] sm:hidden"
              ></Image>
            </div>
            <div className="mt-1 text-sm sm:text-base">
              <p>
                Enter your email address and we will send you a link to reset
                your password
              </p>
            </div>
          </div>

          <form method="POST">
            <div className="flex flex-col gap-6 text-sm">
              <div className="flex flex-col gap-2">
                <label>Email</label>
                <Input
                  className="border-[#1E2A36] bg-[#1E2A36] px-3 py-2.5"
                  type="email"
                  placeholder="Enter email here"
                  value={email}
                  onChange={(e: { target: { value: string } }) =>
                    setEmail(e.target.value.toLowerCase())
                  }
                  name="email"
                  autoComplete="email"
                  required
                />
                {error && (
                  <Alert variant="destructive" className="mt-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mt-2 text-green-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                <Button
                  variant="default"
                  type="submit"
                  className="mt-2 w-full bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90 sm:w-auto"
                  onClick={handleForgotPassword}
                >
                  Send Reset Password Email
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default ForgotPassword;
