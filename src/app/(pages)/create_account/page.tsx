"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Checkbox } from "@/app/components/ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { usePrivy } from "@privy-io/react-auth";

export default function CustomSignupPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { ready, authenticated, login } = usePrivy();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPrivyLoading, setIsPrivyLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    agreeToTerms: false,
    isOver18: false,
  });

  // Redirect if already authenticated via NextAuth
  useEffect(() => {
    if (session?.user) {
      router.push("/authenticated");
    }
  }, [session, router]);

  // Redirect if already authenticated via Privy
  useEffect(() => {
    if (ready && authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const handleGoogleSignup = async () => {
    setError("");
    if (typeof login === "function") {
      try {
        setIsPrivyLoading(true);
        await login();
      } catch (err) {
        console.error("Privy login error:", err);
        signIn("google", { callbackUrl: "/" });
      } finally {
        setIsPrivyLoading(false);
      }
    } else {
      signIn("google", { callbackUrl: "/" });
    }
  };

  const handleChange = (e: { target: { name: string; value: string; type: string; checked: boolean } }) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          fullName: formData.fullName,
          password: formData.password,
          provider: "email",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.message === "Username already used") {
          setError("Username is already in use. Try a different one.");
        } else if (data.message === "Email already used") {
          setError("Email is already in use. Try a different one.");
        } else if (data.message === "Invalid email") {
          setError("Invalid email. Try a different one.");
        } else {
          setError("Error. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      router.push("/create_account_complete");
    } catch {
      setError("Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A1A] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#16181f] border border-white/[0.08] rounded-2xl p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-[#E94560] text-sm font-semibold tracking-widest uppercase mb-3">
            Velocity Markets
          </p>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-400 text-sm">
            Start predicting collector car auctions
          </p>
        </div>

        {/* Google OAuth button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isPrivyLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
          aria-label="Continue with Google"
        >
          {isPrivyLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-gray-900" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.593C4.672 4.466 6.656 3.58 9 3.58z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#1E2A36]" />
          <span className="text-xs text-gray-500 uppercase tracking-widest">or sign up with email</span>
          <div className="flex-1 h-px bg-[#1E2A36]" />
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-5 flex items-start gap-3 bg-[#E94560]/10 border border-[#E94560]/30 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-[#E94560] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-sm text-[#E94560]">{error}</p>
          </div>
        )}

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm text-gray-400">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
              className="bg-[#0A0A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:border-[#E94560] focus:outline-none w-full text-sm placeholder-gray-600 transition-colors"
              placeholder="Choose a username"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="fullName" className="text-sm text-gray-400">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              required
              autoComplete="name"
              className="bg-[#0A0A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:border-[#E94560] focus:outline-none w-full text-sm placeholder-gray-600 transition-colors"
              placeholder="Your full name"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="bg-[#0A0A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:border-[#E94560] focus:outline-none w-full text-sm placeholder-gray-600 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
              autoComplete="new-password"
              className="bg-[#0A0A1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:border-[#E94560] focus:outline-none w-full text-sm placeholder-gray-600 transition-colors"
              placeholder="Create a password"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <Checkbox
                id="isOver18"
                name="isOver18"
                checked={formData.isOver18}
                onCheckedChange={(checked: CheckedState) =>
                  handleChange({
                    target: { name: "isOver18", type: "checkbox", checked: checked === true, value: "" },
                  })
                }
                className="border-white/[0.08] data-[state=checked]:bg-[#E94560] data-[state=checked]:border-[#E94560]"
              />
              <label htmlFor="isOver18" className="text-sm text-gray-400 leading-none cursor-pointer select-none">
                I confirm that I am at least 18 years old
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked: CheckedState) =>
                  handleChange({
                    target: { name: "agreeToTerms", type: "checkbox", checked: checked === true, value: "" },
                  })
                }
                className="border-white/[0.08] data-[state=checked]:bg-[#E94560] data-[state=checked]:border-[#E94560] mt-0.5"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-400 leading-snug cursor-pointer select-none">
                I agree to the{" "}
                <Link href="/terms" className="text-[#E94560] hover:text-[#E94560]/80 transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#E94560] hover:text-[#E94560]/80 transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E94560] hover:bg-[#E94560]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-2"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login_page" className="text-[#E94560] hover:text-[#E94560]/80 transition-colors font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
