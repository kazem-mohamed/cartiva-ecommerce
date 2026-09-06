"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ProductCard, { type CardProduct } from "./ProductCard";
import Reveal from "@/component/ui/Reveal";

/**
 * The client boundary for a product grid. Products arrive already fetched
 * from a Server Component — only the per-user wishlist needs the client.
 */
export default function ProductShelf({
  products,
  className = "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  priorityCount = 4,
  onWishlistChange,
}: {
  products: CardProduct[];
  className?: string;
  priorityCount?: number;
  /** Lets a page react when a card's heart is toggled — the saved-items
   *  page uses it to drop the card out of the list immediately. */
  onWishlistChange?: (id: string, next: boolean) => void;
}) {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token) {
      setWishlistIds(new Set());
      return;
    }
    let alive = true;
    import("@/lib/wishlist")
      .then(({ getWishlist }) => getWishlist(token))
      .then((items) => alive && setWishlistIds(new Set(items.map((i) => i._id))))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [token]);

  const handleWishlistChange = useCallback(
    (id: string, next: boolean) => {
      setWishlistIds((prev) => {
        const copy = new Set(prev);
        if (next) copy.add(id);
        else copy.delete(id);
        return copy;
      });
      onWishlistChange?.(id, next);
    },
    [onWishlistChange]
  );

  return (
    <Reveal stagger={80} className={`grid gap-5 ${className}`}>
      {products.map((product, i) => (
        <div key={product._id} className="reveal h-full">
          <ProductCard
            product={product}
            inWishlist={wishlistIds.has(product._id)}
            onWishlistChange={handleWishlistChange}
            priority={i < priorityCount}
          />
        </div>
      ))}
    </Reveal>
  );
}
