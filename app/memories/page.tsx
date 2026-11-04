
import Link from "next/link";
import { memories } from "@/data/memories";

export default function MemoriesPage() {
  return (
    <main className="min-h-screen bg-[#030712] px-6 py-12 text-white md:px-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/home"
          className="mb-10 inline-block font-mono text-sm tracking-widest text-cyan-400 transition hover:text-white"
        >
          ← BACK TO UNIVERSE
        </Link>

        <header className="mb-12">
          <p className="font-mono text-xs tracking-[0.4em] text-cyan-400">
            ERROR 404 // MEMORY DATABASE
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-wider md:text-6xl">
            MEMORY ARCHIVE
          </h1>

          <p className="mt-4 text-sm text-gray-400">
            Every moment has a story. Every story deserves to be remembered.
          </p>

          <p className="mt-6 font-mono text-xs tracking-widest text-purple-400">
            {String(memories.length).padStart(2, "0")} MEMORIES FOUND
          </p>
        </header>

        <div className="space-y-3">
          {memories.map((memory, index) => (
            <Link
              key={memory.id}
              href={`/memories/${memory.id}`}
              className="group flex items-center gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5 transition duration-300 hover:border-cyan-400/50 hover:bg-cyan-400/[0.06] hover:shadow-[0_0_25px_rgba(34,211,238,0.08)]"
            >
              <span className="font-mono text-sm text-cyan-500/60">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold tracking-wide transition group-hover:text-cyan-300 md:text-lg">
                  {memory.title}
                </h2>

                <p className="mt-1 font-mono text-xs text-gray-500">
                  {memory.date} · {memory.location}
                </p>
              </div>

              <span className="text-xl text-gray-600 transition group-hover:translate-x-1 group-hover:text-cyan-300">
                ↗
              </span>
            </Link>
          ))}
        </div>

        <footer className="mt-16 border-t border-white/10 pt-6 text-center font-mono text-xs tracking-widest text-gray-600">
          ERROR 404 © 2026 — MEMORIES NEVER FADE
        </footer>
      </div>
    </main>
  );
}
