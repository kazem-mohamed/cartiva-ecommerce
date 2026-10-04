"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "./types";

const API = "https://ecommerce.routemisr.com/api/v1";

export type Ref = { _id: string; name: string; slug?: string; image?: string };
export type Catalog = { products: Product[]; categories: Ref[]; brands: Ref[] };

async function getAll<T>(path: string): Promise<T[]> {
  const first = await fetch(`${API}/${path}?limit=100`).then((r) => {
    if (!r.ok) throw new Error(path);
    return r.json();
  });
  const pages: number = first?.metadata?.numberOfPages ?? 1;
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
      fetch(`${API}/${path}?limit=100&page=${i + 2}`).then((r) => r.json()),
    ),
  );
  return [first, ...rest].flatMap((p) => (p?.data ?? []) as T[]);
}

// One fetch per page-load, shared by every consumer (search, filters, swatches).
let cache: Promise<Catalog> | null = null;
function load(): Promise<Catalog> {
  cache ??= Promise.all([getAll<Product>("products"), getAll<Ref>("categories"), getAll<Ref>("brands")])
    .then(([products, categories, brands]) => ({ products, categories, brands }))
    .catch((e) => {
      cache = null; // let the next attempt retry
      throw e;
    });
  return cache;
}

/** The whole catalogue is 56 products — small enough to search and filter instantly on the client. */
export function useCatalog(enabled = true) {
  const [data, setData] = useState<Catalog | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    load()
      .then((d) => live && setData(d))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [enabled]);

  // Only ever called from a click, so resetting the error here is not an effect-driven render.
  const retry = useCallback(() => {
    setError(false);
    load()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  return { data, error, loading: enabled && !data && !error, retry };
}
