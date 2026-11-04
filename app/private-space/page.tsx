
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PrivateSpacePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  // Protect this page from unauthenticated visitors
  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white px-6 py-16">
      <div className="mx-auto max-w-5xl">

        <header className="mb-16 text-center">
          <p className="text-cyan-400 font-mono text-xs tracking-[0.4em]">
            RESTRICTED NETWORK // 8 MEMBERS
          </p>

          <h1 className="mt-5 text-4xl md:text-6xl font-bold">
            PRIVATE <span className="text-cyan-400">SPACE</span>
          </h1>

          <p className="mt-4 text-gray-400">
            Welcome to Our Private Universe
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">

          {/* Group Chat */}
          <Link
            href="/group-chat"
            className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-8 transition-all hover:border-cyan-400 hover:bg-cyan-900/30"
          >
            <div className="mb-6 text-5xl">🌌</div>

            <h2 className="text-2xl font-bold text-cyan-300">
              GROUP CHAT
            </h2>

            <p className="mt-4 text-gray-400">
              One room. All eight friends.
              Talk together and share moments.
            </p>

            <p className="mt-8 font-mono text-sm text-cyan-400">
              ENTER GROUP ROOM →
            </p>
          </Link>

          {/* Personal Chat */}
          <Link
            href="/personal-chat"
            className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-8 transition-all hover:border-purple-400 hover:bg-purple-900/30"
          >
            <div className="mb-6 text-5xl">💬</div>

            <h2 className="text-2xl font-bold text-purple-300">
              PERSONAL CHAT
            </h2>

            <p className="mt-4 text-gray-400">
              Choose any of your seven friends
              for a private conversation.
            </p>

            <p className="mt-8 font-mono text-sm text-purple-400">
              FIND YOUR FRIEND →
            </p>
          </Link>

        </div>

        <div className="mt-12 text-center">
          <Link
            href="/home"
            className="text-sm text-gray-500 hover:text-cyan-400"
          >
            ← BACK TO HOME
          </Link>
        </div>

      </div>
    </main>
  );
}
