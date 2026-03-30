"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("You're in! We'll send weekly tournament alerts.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-white
                   placeholder:text-gray-500 rounded-lg px-4 py-3 text-sm
                   focus:outline-none focus:border-[#01696F]"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-[#01696F] hover:bg-[#0C4E54] text-white font-semibold
                   rounded-lg px-6 py-3 text-sm transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
      {message && (
        <p className={`text-sm mt-2 w-full ${status === "success" ? "text-[#00d68f]" : "text-[#e84560]"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
