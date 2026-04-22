"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
};

export function PhotoGallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, prev, next]);

  const current = openIndex === null ? null : images[openIndex];
  const hasMany = images.length > 1;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenIndex(idx)}
            className="group relative block overflow-hidden rounded border border-slate-200 bg-slate-50"
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={400}
              height={300}
              unoptimized
              className="h-40 w-full object-cover transition group-hover:opacity-90"
            />
          </button>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            ✕
          </button>

          {hasMany && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Précédente"
                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Suivante"
                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
              >
                ›
              </button>
            </>
          )}

          <div
            className="relative flex max-h-full max-w-full flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.src}
              alt={current.alt}
              width={1600}
              height={1200}
              unoptimized
              className="max-h-[85vh] w-auto max-w-full rounded shadow-lg"
            />
            {hasMany && (
              <p className="mt-3 text-xs text-white/70">
                {(openIndex ?? 0) + 1} / {images.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
