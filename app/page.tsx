"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f1ea] text-black flex items-center justify-center px-6 overflow-hidden">
      <section className="text-center">

        <p className="font-mono text-xs md:text-sm tracking-[0.5em] uppercase mb-8 text-gray-500">
          Welcome to
        </p>

        <div className="relative inline-block">
          <h1 className="text-7xl md:text-[10rem] font-black tracking-[-0.08em] leading-none">
            ERROR 404
          </h1>

          <h1 className="absolute top-0 left-0 text-7xl md:text-[10rem] font-black tracking-[-0.08em] leading-none text-red-500 opacity-10 -translate-x-1">
            ERROR 404
          </h1>
        </div>

        <p className="mt-8 text-xl md:text-2xl font-mono">
          friendship not found.
        </p>

        <p className="mt-3 text-gray-500">
          ...just kidding. You found us.
        </p>

        <button
          onClick={() => {
            window.location.href = "/home";
          }}
          className="mt-10 border border-black px-8 py-3 font-mono text-sm tracking-wider hover:bg-black hover:text-white transition-all duration-300"
        >
          ENTER ↗
        </button>

        <p className="mt-16 text-xs font-mono text-gray-400">
          8 friends · ∞ memories · 404 chaos
        </p>

      </section>
    </main>
  );
}