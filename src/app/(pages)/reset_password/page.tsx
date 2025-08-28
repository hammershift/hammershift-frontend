"use client";
import React, { useEffect, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { BounceLoader } from "react-spinners";
import CancelIcon from "../../../../public/images/x-icon.svg";
import { Input } from "@/app/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useSearchParams } from "next/navigation";
const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [token] = useState(searchParams.get("token"));
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("reset password");
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      setSuccess("");
      return;
    }
    try {
      setIsLoading(true);
      const { data, error } = await authClient.resetPassword({
        token: token!,
        newPassword: password,
      });
      if (error) {
        setError(
          error.message!.charAt(0).toUpperCase() + error.message!.slice(1)
        );
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setSuccess("Password reset successfully");
      setError("");
      setTimeout(() => {
        router.push("/login_page");
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedPattern = /^[a-zA-Z0-9!@#$%^&*()_\-+=\[\]{}|;:',.<>?/\\]$/;
    if (
      e.currentTarget.name === "password" &&
      !allowedPattern.test(e.key) &&
      e.key.length === 1
    ) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, []);
  return (
    <div className="top-0 z-[-1] mt-16 flex w-screen items-center justify-center md:mt-0 md:h-screen">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <BounceLoader color="#696969" loading={isLoading} />
        </div>
      ) : (
        <div className="flex h-[505px] w-screen flex-col gap-8 px-6 pt-6 md:w-[640px]">
          <div className="flex justify-between md:justify-start">
            <div className="text-2xl font-bold md:text-4xl">Password Reset</div>
            <Image
              onClick={() => router.push("/")}
              src={CancelIcon}
              width={20}
              height={20}
              alt=""
              className="h-[20px] w-[20px] sm:hidden"
            ></Image>
          </div>
          <form method="POST" onSubmit={handleResetPassword}>
            <div className="flex flex-col gap-6 text-sm">
              <div className="flex flex-col gap-2">
                <label>New Password</label>
                <Input
                  className="border-[#1E2A36] bg-[#1E2A36] px-3 py-2.5"
                  type="password"
                  name="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e: { target: { value: string } }) => {
                    const allowedPattern =
                      /^[a-zA-Z0-9!@#$%^&*()_\-+=\[\]{}|;:',.<>?/\\]*$/;
                    if (!allowedPattern.test(e.target.value)) return;
                    setPassword(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  required
                />
                <label>Confirm Password</label>
                <Input
                  className="border-[#1E2A36] bg-[#1E2A36] px-3 py-2.5"
                  type="password"
                  name="password"
                  placeholder="Confirm Password"
                  value={passwordConfirm}
                  onChange={(e: { target: { value: string } }) => {
                    const allowedPattern =
                      /^[a-zA-Z0-9!@#$%^&*()_\-+=\[\]{}|;:',.<>?/\\]*$/;
                    if (!allowedPattern.test(e.target.value)) return;
                    setPasswordConfirm(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
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
                >
                  Reset Password
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
