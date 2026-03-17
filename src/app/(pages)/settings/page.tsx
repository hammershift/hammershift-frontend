"use client";
import { AlertCircle, CheckCircle2, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";

export default function Settings() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useSession();
  const router = useRouter();

  const getUserInfo = async (email: string) => {
    const res = await fetch(`/api/userInfo?email=${email}`, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error("Unable to fetch user transactions");
    }
    const result = await res.json();
    setAbout(result.user.about);
    setLoading(false);
  };

  useEffect(() => {
    console.log(data);
    if (data) {
      setName(data?.user.name);
      setUsername(data?.user.username!);
      getUserInfo(data?.user.email);
    } else {
      router.push("/login_page");
    }
  }, [data]);

  const handleProfileUpdate = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsLoading(true);
    try {
      const response = await fetch("/api/userInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          about: about,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        if (data.message === "Username already used") {
          setMessage({
            type: "error",
            text: "Username is already in use. Try a different one.",
          });
        }
        setIsLoading(false);
        return;
      }
      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      setIsLoading(false);
      setTimeout(() => {
        router.push("profile");
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A1A] px-4 py-8 text-white">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-transparent border-t-[#E94560]"></div>
            <p className="text-gray-400">Loading account settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A1A] px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>
          <p className="mt-1 text-gray-400">Manage your profile information</p>
        </div>

        {/* Tab Bar */}
        <div className="mb-6 flex border-b border-[#1E2A36]">
          <button
            className="flex items-center gap-2 border-b-2 border-[#E94560] pb-3 pr-6 text-sm font-semibold text-white"
          >
            <UserRound className="h-4 w-4" />
            Profile
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-[#0F172A] border border-[#1E2A36] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
              <input
                value={data ? data.user.email : ""}
                disabled
                className="bg-[#0A0A1A] border border-[#1E2A36] rounded-xl px-4 py-3 text-gray-500 w-full cursor-not-allowed opacity-60"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Your email address cannot be changed.
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
              <input
                value={name}
                disabled
                className="bg-[#0A0A1A] border border-[#1E2A36] rounded-xl px-4 py-3 text-gray-500 w-full cursor-not-allowed opacity-60"
              />
            </div>

            {/* Username */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Username</label>
              <input
                value={username}
                disabled
                className="bg-[#0A0A1A] border border-[#1E2A36] rounded-xl px-4 py-3 text-gray-500 w-full cursor-not-allowed opacity-60"
              />
              <p className="mt-1.5 text-xs text-gray-500">Username cannot be changed.</p>
            </div>

            {/* About */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">About</label>
              <textarea
                value={about}
                onChange={(e: { target: { value: SetStateAction<string> } }) =>
                  setAbout(e.target.value)
                }
                placeholder="Tell others about yourself"
                rows={3}
                className="bg-[#0A0A1A] border border-[#1E2A36] rounded-xl px-4 py-3 text-white focus:border-[#E94560] focus:outline-none w-full resize-none placeholder:text-gray-600 transition-colors"
              />
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-[#E94560] hover:bg-[#E94560]/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors ${
                  isLoading ? "pointer-events-none opacity-50" : ""
                }`}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Feedback Message */}
        {message.text && (
          <div
            className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
              message.type === "error"
                ? "border-[#E94560]/40 bg-[#E94560]/10 text-[#E94560]"
                : "border-[#00D4AA]/40 bg-[#00D4AA]/10 text-[#00D4AA]"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
