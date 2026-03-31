"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { BounceLoader } from "react-spinners";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { checkUsernameExistence } from "@/lib/data";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPrivyLoading, setIsPrivyLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { data: session } = useSession();
  const { ready, authenticated: privyAuthenticated, getAccessToken } = usePrivy();
  const { login: privyLogin } = useLogin({
    onComplete: async () => {
      // Bridge Privy session into NextAuth so server-side APIs work
      try {
        const token = await getAccessToken();
        if (token) {
          await signIn("privy-bridge", {
            privyToken: token,
            redirect: false,
          });
        }
      } catch (err) {
        console.error("Privy→NextAuth bridge failed:", err);
      }
      router.push(redirectTo);
    },
  });

  // Redirect if already authenticated via NextAuth
  useEffect(() => {
    if (session?.user) {
      router.push(redirectTo);
    }
  }, [session, router, redirectTo]);

  // Redirect if authenticated via Privy
  useEffect(() => {
    if (ready && privyAuthenticated) {
      router.push(redirectTo);
    }
  }, [ready, privyAuthenticated, router, redirectTo]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setIsLoading(true);
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        const data = await checkUsernameExistence(email.trim());
        if (data.exists && !data.hasPassword) {
          setError(
            "This account has no password set. Use 'Forgot Password' to create one."
          );
        } else {
          setError("Invalid username or password.");
        }
        return;
      }

      router.push(redirectTo);
    } catch (err) {
      console.error("Unexpected error during login:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivyLogin = async () => {
    setError("");
    // If Privy is properly initialised (env var present), use its modal.
    // Otherwise fall back to NextAuth Google OAuth.
    if (typeof privyLogin === "function") {
      try {
        setIsPrivyLoading(true);
        await privyLogin();
      } catch (err) {
        console.error("Privy login error:", err);
        // Fall back to NextAuth Google if Privy errors
        signIn("google", { callbackUrl: redirectTo });
      } finally {
        setIsPrivyLoading(false);
      }
    } else {
      // Privy not configured — use NextAuth Google directly
      signIn("google", { callbackUrl: redirectTo });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0A0A1A]">
        <BounceLoader color="#E94560" loading />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-[#0A0A1A] px-4 py-16 md:py-0">
      <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#16181f] p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Sign In</h1>
          <p className="mt-2 text-sm text-slate-400">
            {"Don't have an account? "}
            <Link
              href="/create_account"
              className="font-medium text-[#E94560] underline underline-offset-2 hover:text-[#ff6b82] transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>

        {/* Google / Privy OAuth button */}
        <button
          type="button"
          onClick={handlePrivyLogin}
          disabled={isPrivyLoading}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border border-white/[0.08] bg-[#1A2332] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#243040] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPrivyLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex-1 border-t border-white/10" />
          <span className="text-xs text-slate-500">or sign in with email</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        {/* Credentials form */}
        <form onSubmit={handleSignIn} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-sm font-medium text-slate-300"
            >
              Username or Email
            </label>
            <Input
              id="login-email"
              type="text"
              placeholder="Enter username or email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              name="email"
              autoComplete="username"
              required
              className="border-white/[0.08] bg-[#1E2A36] px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-[#E94560] focus:ring-[#E94560]/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <Link
                href="/forgot_password"
                className="text-xs text-[#E94560] hover:text-[#ff6b82] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const allowed = /^[a-zA-Z0-9!@#$%^&*()_\-+=[\]{}|;:',.<>?/\\]*$/;
                if (!allowed.test(e.target.value)) return;
                setPassword(e.target.value);
              }}
              name="password"
              autoComplete="current-password"
              required
              className="border-white/[0.08] bg-[#1E2A36] px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-[#E94560] focus:ring-[#E94560]/20"
            />
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="border-red-500/30 bg-red-500/10 text-red-400"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-[#E94560] py-3 text-sm font-bold text-white transition-colors hover:bg-[#d63652] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          By signing in, you agree to Velocity Market&apos;s{" "}
          <Link href="/privacy_policy" className="underline hover:text-slate-400 transition-colors">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms_of_service" className="underline hover:text-slate-400 transition-colors">
            Terms of Use
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
