"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

export default function ProductImageGallery({
  title,
  imageCover,
  images = [],
  hasDiscount,
  savePercent,
}: {
  title: string;
  imageCover: string;
  images?: string[];
  hasDiscount: boolean;
  savePercent: number;
}) {
  const gallery = useMemo(
    () => Array.from(new Set([imageCover, ...images].filter(Boolean))),
    [imageCover, images]
  );
  const [active, setActive] = useState(gallery[0] ?? imageCover);

  return (
    <div className="lg:sticky lg:top-6 lg:self-start">
      <div className="bento p-3">
        <div className="well relative aspect-square">
          {hasDiscount && (
            <span className="label absolute top-4 left-4 z-10 rounded-full bg-gold px-3.5 py-1.5 text-[9px] text-white">
              −{savePercent}%
            </span>
          )}
          <Image
            key={active}
            src={active}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 46vw"
            priority
            className="object-contain p-[8%]"
          />
        </div>

        {gallery.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {gallery.map((img, i) => {
              const on = img === active;
              return (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setActive(img)}
                  aria-label={`Show image ${i + 1} of ${gallery.length}`}
                  aria-pressed={on}
                  className={`well relative aspect-square border transition-colors duration-500 ${
                    on ? "border-gold" : "border-transparent hover:border-line"
                  }`}
                >
                  <Image src={img} alt="" fill sizes="120px" className="object-contain p-[12%]" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
