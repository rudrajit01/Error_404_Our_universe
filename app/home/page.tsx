
import Link from "next/link";
import SolarSystem from "@/components/SolarSystem";
import SecretLoginTrigger from "@/components/SecretLoginTrigger";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  const isLoggedIn = Boolean(data?.claims?.sub);

  return (
    <main className="relative min-h-screen bg-[#030712]">
      <SolarSystem />

      {/* Navigation */}
      <div className="fixed top-10 left-6 z-50 flex flex-wrap items-center gap-3">

        {/* Memories - Public */}
        <Link href="/memories" className="group">
          <div className="border border-cyan-400/40 bg-black/50 backdrop-blur-xl px-6 py-3 rounded-lg text-cyan-300 font-mono text-sm tracking-[0.25em] transition-all duration-300 hover:bg-cyan-400/10 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.35)]">
            <span className="mr-2">✦</span>
            MEMORIES
            <span className="ml-2 text-cyan-500">↗</span>
          </div>
        </Link>

        {/* Chat - Logged-in Members Only */}
        {isLoggedIn && (
          <Link href="/private-space" className="group">
            <div className="border border-purple-400/40 bg-black/50 backdrop-blur-xl px-6 py-3 rounded-lg text-purple-300 font-mono text-sm tracking-[0.25em] transition-all duration-300 hover:bg-purple-400/10 hover:border-purple-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.35)]">
              <span className="mr-2">✦</span>
              CHAT
              <span className="ml-2 text-purple-400">↗</span>
            </div>
          </Link>
        )}

        {/* Task Manager - Logged-in Approved Members */}
        {isLoggedIn && (
          <Link href="/task-manager" className="group">
            <div className="border border-emerald-400/40 bg-black/50 backdrop-blur-xl px-6 py-3 rounded-lg text-emerald-300 font-mono text-sm tracking-[0.25em] transition-all duration-300 hover:bg-emerald-400/10 hover:border-emerald-300 hover:shadow-[0_0_25px_rgba(52,211,153,0.35)]">
              <span className="mr-2">✦</span>
              TASK MANAGER
              <span className="ml-2 text-emerald-400">↗</span>
            </div>
          </Link>
        )}

      </div>

      {/* Secret Login Trigger */}
      <footer className="relative z-50 mt-4 py-8 text-center font-mono text-xs tracking-widest text-gray-500">
        <SecretLoginTrigger />
      </footer>
    </main>
  );
}
