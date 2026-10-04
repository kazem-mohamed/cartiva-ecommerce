"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as wishlistApi from "@/lib/wishlist";
import { useCommerce } from "@/ds/commerce/CommerceProvider";
import { EmptyState } from "@/ds/commerce/EmptyState";
import { ProductCard, ProductCardSkeleton } from "@/ds/commerce/ProductCard";
import type { Product } from "@/ds/commerce/types";
import { Button, ButtonLink } from "@/ds/ui/Button";
import { PageIntro } from "@/ds/ui/PageIntro";

const crumbs = [{ href: "/", label: "Home" }];

export function WishlistView() {
  const { data: session, status } = useSession();
  const token = session?.accessToken ?? null;
  const { wishlist, addToBag, openBag } = useCommerce();
  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState<null | "bag" | "clear">(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!token) return;
    let live = true;
    wishlistApi
      .getWishlist(token)
      .then((list) => live && setItems(list as Product[]))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [token, attempt]);

  // A heart toggled on a card updates the shared wishlist; the page follows it — but only once that
  // shared list has loaded, or the page would briefly look empty.
  const [synced, setSynced] = useState(false);
  if (!synced && items?.some((p) => wishlist.has(p._id))) setSynced(true);
  const shown = items ? (synced ? items.filter((p) => wishlist.has(p._id)) : items) : null;

  async function addAll() {
    if (!shown?.length) return;
    setBusy("bag");
    let added = 0;
    for (const p of shown.filter((p) => p.quantity !== 0)) {
      if (await addToBag(p, { quiet: true })) added++;
      else break;
    }
    setBusy(null);
    if (added) {
      toast(added === shown.length ? "Everything is in your bag." : `${added} of ${shown.length} added to your bag.`);
      openBag();
    }
  }

  async function clearAll() {
    if (!token || !shown?.length) return;
    setBusy("clear");
    const results = await Promise.allSettled(shown.map((p) => wishlistApi.removeFromWishlist(p._id, token)));
    const failed = results.filter((r) => r.status === "rejected").length;
    wishlistApi.notifyWishlistUpdate(); // the shared wishlist refetches too
    if (!failed) setItems([]);
    setBusy(null);
    setConfirming(false);
    if (failed) toast.error(`${failed} item${failed === 1 ? "" : "s"} couldn't be removed. Try again.`);
  }

  if (status === "unauthenticated") {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Wishlist" />
        <EmptyState
          className="py-10"
          title="Sign in to see your wishlist."
          body="Saved items live in your account, on every device."
          action={<ButtonLink href="/login?callbackUrl=/wishlist">Sign in</ButtonLink>}
        />
      </>
    );
  }

  if (error && !items) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Wishlist" />
        <EmptyState
          className="py-10"
          title="Your wishlist didn't load."
          body="Try again in a moment."
          action={
            <Button
              onClick={() => {
                setError(false);
                setAttempt((n) => n + 1);
              }}
            >
              Try again
            </Button>
          }
        />
      </>
    );
  }

  if (!shown) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Wishlist" />
        <div role="status" aria-label="Loading your wishlist" className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-5">
          {[0, 1, 2, 3].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  if (!shown.length) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Wishlist" />
        <EmptyState
          className="py-10"
          title="Nothing saved yet."
          body="Tap the heart on anything you like, and it waits for you here."
          action={<ButtonLink href="/products">Browse products</ButtonLink>}
        />
      </>
    );
  }

  return (
    <>
      <PageIntro crumbs={crumbs} title="Wishlist">
        <span className="t-num">
          {shown.length} saved {shown.length === 1 ? "item" : "items"}
        </span>
      </PageIntro>
      <div className="mb-10 flex flex-wrap items-center gap-3">
        <Button onClick={addAll} loading={busy === "bag"} loadingLabel="Adding to bag" disabled={!!busy}>
          Add all to bag
        </Button>
        {confirming ? (
          <div role="group" aria-label="Confirm clearing your wishlist" className="enter flex flex-wrap items-center gap-3">
            <span className="t-label text-fg-2">Remove all {shown.length}?</span>
            <Button variant="danger" onClick={clearAll} loading={busy === "clear"} loadingLabel="Clearing">
              Clear wishlist
            </Button>
            <Button variant="text" onClick={() => setConfirming(false)} autoFocus>
              Keep
            </Button>
          </div>
        ) : (
          <Button variant="text" onClick={() => setConfirming(true)} disabled={!!busy}>
            Clear all
          </Button>
        )}
      </div>
      <ul className="enter grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-5">
        {shown.map((p) => (
          <li key={p._id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </>
  );
}
