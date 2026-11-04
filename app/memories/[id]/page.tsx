
import Link from "next/link";
import { notFound } from "next/navigation";
import { memories } from "@/data/memories";
import MemoryGallery from "@/components/memories/MemoryGallery";
export const instant = false;

interface MemoryDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function MemoryDetailsPage({
  params,
}: MemoryDetailsPageProps) {
  const { id } = await params;

  const memory = memories.find((item) => item.id === id);

  if (!memory) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#030712] px-6 py-12 text-white md:px-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/memories"
          className="mb-10 inline-block font-mono text-sm tracking-widest text-cyan-400 transition hover:text-white"
        >
          ← BACK TO MEMORIES
        </Link>

        <header className="mb-10">
          <p className="font-mono text-xs tracking-[0.35em] text-cyan-400">
            ERROR 404 // MEMORY FILE
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-wide md:text-6xl">
            {memory.title}
          </h1>

          <div className="mt-6 flex flex-wrap gap-3 font-mono text-xs text-gray-400">
            <span className="rounded-full border border-cyan-400/30 px-4 py-2">
              {memory.date}
            </span>
            <span className="rounded-full border border-purple-400/30 px-4 py-2">
              {memory.location}
            </span>
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <h2 className="mb-4 font-mono text-sm tracking-[0.25em] text-cyan-300">
            THE STORY
          </h2>
          <p className="leading-8 text-gray-300">{memory.description}</p>
        </section>

        {memory.places && memory.places.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-5 font-mono text-sm tracking-[0.25em] text-purple-300">
              PLACES EXPLORED
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {memory.places.map((place) => (
                <div
                  key={place}
                  className="rounded-xl border border-purple-400/20 bg-purple-400/[0.04] p-4 text-gray-300"
                >
                  ✦ {place}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-5 font-mono text-sm tracking-[0.25em] text-cyan-300">
            HIGHLIGHTS
          </h2>
          <div className="flex flex-wrap gap-3">
            {memory.highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-3 text-sm text-gray-300"
              >
                ✧ {highlight}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-white/15 p-8 text-center">
          <h2 className="font-mono text-sm tracking-[0.25em] text-purple-300">
            PHOTO ARCHIVE
          </h2>

          {memory.photos.length > 0 ? (
  <MemoryGallery photos={memory.photos} title={memory.title} />
) : (
            <p className="mt-4 text-sm text-gray-500">
              No photos added yet. Memories are waiting for their pictures.
            </p>
          )}
        </section>

        <footer className="mt-16 border-t border-white/10 pt-6 text-center font-mono text-xs tracking-widest text-gray-600">
          ERROR 404 © 2026 — EVERY MEMORY MATTERS
        </footer>
      </div>
    </main>
  );
}
