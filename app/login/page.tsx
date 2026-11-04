
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] px-5 py-12 text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/home"
          className="mb-8 inline-block font-mono text-xs tracking-widest text-cyan-400 hover:text-white"
        >
          ← BACK TO UNIVERSE
        </Link>

        <div className="rounded-2xl border border-cyan-400/20 bg-white/[0.04] p-8 shadow-[0_0_60px_rgba(34,211,238,0.08)] backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-3xl text-cyan-300">
              ✦
            </div>

            <p className="font-mono text-xs tracking-[0.4em] text-cyan-400">
              ERROR 404 // PRIVATE NETWORK
            </p>

            <h1 className="mt-4 text-3xl font-bold tracking-widest">
              MEMBER LOGIN
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Eight members. One private universe.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block font-mono text-xs tracking-widest text-gray-400">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@example.com"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs tracking-widest text-gray-400">
                PASSWORD
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/60"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-cyan-400/50 bg-cyan-400/10 py-3 font-mono text-sm tracking-[0.25em] text-cyan-300 transition hover:bg-cyan-400/20 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "AUTHENTICATING..." : "ENTER PRIVATE SPACE →"}
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-5 text-center">
            <p className="font-mono text-[10px] tracking-widest text-gray-500">
              RESTRICTED ACCESS // 8 AUTHORIZED MEMBERS ONLY
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
