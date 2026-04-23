"use client";

import { useState } from "react";

interface SignalCaptureProps {
  variant: "talent" | "investor";
}

export function SignalCapture({ variant }: SignalCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "investor-cta" }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (variant === "talent") {
    return (
      <div className="border border-black mt-12 p-6">
        <p className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-2">
          Founders &amp; Builders
        </p>
        <p className="font-semibold text-base leading-snug mb-4">
          Building a team to exploit this architecture? DMs are open.
        </p>
        <div className="flex gap-4 text-sm">
          <a
            href="https://x.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-60 font-mono"
          >
            → X / Twitter
          </a>
          <a
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-60 font-mono"
          >
            → LinkedIn
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-black mt-12 p-6">
      <p className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-2">
        Investors &amp; Dealflow
      </p>
      <p className="font-semibold text-base leading-snug mb-4">
        I invest in founders solving this constraint. Drop your GitHub.
      </p>
      {status === "success" ? (
        <p className="text-sm font-mono text-green-700">Received. I&apos;ll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-black px-3 py-2 text-sm font-mono flex-1 focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="border border-black px-4 py-2 text-sm font-mono bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {status === "loading" ? "..." : "Submit"}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="text-xs font-mono text-red-600 mt-2">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
