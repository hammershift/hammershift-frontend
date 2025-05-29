"use client";
import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPageUrl } from "@/app/components/utils";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Checkbox } from "@/app/components/ui/checkbox";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function CustomSignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    agreeToTerms: false,
    isOver18: false,
  });

  const { data: session } = authClient.useSession();

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

  const handleChange = (e: { target: any }) => {
    console.log("handled change");
    const { name, value, type, checked } = e.target;
    if (name === "password") {
      const allowedPattern = /^[a-zA-Z0-9!@#$%^&*()_\-+=\[\]{}|;:',.<>?/\\]*$/;
      if (!allowedPattern.test(value)) return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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


  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.agreeToTerms || !formData.isOver18) {
      setError(
        "You must agree to the terms and confirm you are over 18 to continue."
      );
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        name: formData.fullName,
        password: formData.password,
        username: formData.username,
      });

      if (error) {
        setError(error.message!.charAt(0).toUpperCase() + error.message!.slice(1));
        setIsLoading(false);
        return;
      }

      router.push("/create_account_complete");
      // const response = await fetch('/api/signup', {
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //         email: formData.email,
      //         username: formData.username,
      //         fullName: formData.fullName,
      //         provider: 'email',
      //     }),
      // });
      // if (!response.ok) {
      //     const data = await response.json();
      //     if (data.message === 'Username already used') {
      //         setError("Username is already in use. Try a different one.");
      //     }
      //     else if (data.message === 'Email already used') {
      //         setError("Email is already in use. Try a different one.");
      //     }
      //     else if (data.message === 'Invalid email') {
      //         setError("Invalid email. Try a different one.");
      //     }
      //     else {
      //         console.log(data);
      //         setError("Error. Please try again.");
      //     }
      //     setIsLoading(false);
      //     return;
      // }

      //   const signInResponse = await authClient.signIn.username({
      //     username: formData.username,
      //     password: formData.password,
      //   })

      //   if (signInResponse?.error) {
      //     setError("Sign-up successful but auto sign-in failed.");
      //     setTimeout(() => {
      //       router.push("/create_account_complete");
      //     }, 2000);
      //   } else {
      //     router.push("/create_account_complete");
      //   }
    } catch (error) {
      setError("Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#1E2A36] bg-[#13202D] p-6">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold">Create Your Account</h1>
          <p className="text-gray-400">
            Join Velocity Markets and start predicting
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Username</label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="border-[#1E2A36] bg-[#1E2A36]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
              className="border-[#1E2A36] bg-[#1E2A36]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Full Name</label>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="border-[#1E2A36] bg-[#1E2A36]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border-[#1E2A36] bg-[#1E2A36]"
            />
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOver18"
                name="isOver18"
                checked={formData.isOver18}
                onCheckedChange={(checked: any) =>
                  handleChange({
                    target: { name: "isOver18", type: "checkbox", checked },
                  })
                }
              />
              <label htmlFor="isOver18" className="text-sm leading-none">
                I confirm that I am at least 18 years old
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked: any) =>
                  handleChange({
                    target: { name: "agreeToTerms", type: "checkbox", checked },
                  })
                }
              />
              <label htmlFor="agreeToTerms" className="text-sm leading-none">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
          </div>

          <Button
            type="submit"
            className={`w-full bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90 ${isLoading ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-4">
          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link className="p-0 text-[#F2CA16]" href="/login_page">
              Log in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
