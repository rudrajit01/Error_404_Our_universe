
"use client";

import { useEffect, useRef, useState } from "react";

interface MemoryGalleryProps {
  photos: string[];
  title: string;
}

export default function MemoryGallery({ photos, title }: MemoryGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const closePreview = () => setSelectedIndex(null);

  const showPrevious = () => {
    setSelectedIndex((current) =>
      current === null
        ? null
        : (current - 1 + photos.length) % photos.length
    );
  };

  const showNext = () => {
    setSelectedIndex((current) =>
      current === null ? null : (current + 1) % photos.length
    );
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLImageElement>) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLImageElement>) => {
    if (touchStartX.current === null) return;

    const difference =
      event.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(difference) > 50) {
      if (difference > 0) {
        showPrevious();
      } else {
        showNext();
      }
    }

    touchStartX.current = null;
  };

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {photos.map((photo, index) => (
          <button
            key={photo}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="group cursor-zoom-in overflow-hidden rounded-xl text-left"
            aria-label={`View photo ${index + 1}`}
          >
            <img
              src={photo}
              alt={`${title} memory`}
              className="h-56 w-full rounded-xl border border-white/10 object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-110"
            />
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
          onClick={closePreview}
        >
          <button
            type="button"
            onClick={closePreview}
            className="absolute right-5 top-5 z-10 text-3xl text-white hover:text-red-400"
            aria-label="Close preview"
          >
            &times;
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                className="absolute left-3 z-10 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20"
                aria-label="Previous photo"
              >
                &#10094;
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                className="absolute right-3 z-10 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-white/20"
                aria-label="Next photo"
              >
                &#10095;
              </button>
            </>
          )}

          <img
            src={photos[selectedIndex]}
            alt={`${title} memory ${selectedIndex + 1}`}
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          />

          <p className="absolute bottom-5 text-sm text-white/70">
            {selectedIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}
