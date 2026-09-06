"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SUGGESTED = ["Laptops", "Watches", "Perfume", "Sneakers"];

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function go(term: string) {
    const t = term.trim();
    router.push(t ? `/search?q=${encodeURIComponent(t)}` : "/search");
  }

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
      >
        <label htmlFor="hero-search" className="sr-only">
          Search Cartiva
        </label>
        <div className="flex items-center gap-2 rounded-full border border-line bg-sunk pl-6 pr-2 py-2 transition-colors duration-500 focus-within:border-gold">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-[18px] w-[18px] shrink-0 text-ink-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="hero-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search 40,000 products"
            className="h-11 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-muted"
          />
          <button
            type="submit"
            aria-label="Search"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-vault text-white transition-transform duration-400 hover:scale-105"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="label mr-1 text-ink-muted">Try</span>
        {SUGGESTED.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => go(s)}
            className="rounded-full border border-line px-3.5 py-1.5 text-[12px] text-ink-muted transition-colors duration-400 hover:border-gold hover:text-gold"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
