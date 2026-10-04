"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import * as cartApi from "@/lib/cart";
import * as compareApi from "@/lib/compare";
import * as wishlistApi from "@/lib/wishlist";
import { EMPTY_CART, normalizeCart, recomputeCart, unitPrice, type Cart, type CartLine, type Product } from "./types";

type Status = "idle" | "loading" | "ready" | "error";

type Commerce = {
  signedIn: boolean;
  cart: Cart;
  cartStatus: Status;
  /** Product ids with a request in flight. */
  pending: ReadonlySet<string>;
  bagOpen: boolean;
  /** The product just added — the drawer highlights it. */
  lastAdded: string | null;
  openBag: () => void;
  closeBag: () => void;
  /** Resolves true once the API has the item. `quiet` skips opening the bag (e.g. Buy now). */
  addToBag: (product: Product, opts?: { count?: number; quiet?: boolean }) => Promise<boolean>;
  setQuantity: (productId: string, count: number) => Promise<void>;
  removeLine: (line: CartLine, opts?: { silent?: boolean }) => Promise<void>;
  clearBag: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  moveToWishlist: (line: CartLine) => Promise<void>;
  wishlist: ReadonlySet<string>;
  toggleWishlist: (productId: string) => Promise<void>;
  compare: readonly string[];
  toggleCompare: (productId: string) => compareApi.CompareToggleResult;
  refreshCart: () => Promise<void>;
};

const CommerceContext = createContext<Commerce | null>(null);

export function useCommerce() {
  const ctx = useContext(CommerceContext);
  if (!ctx) throw new Error("useCommerce must be used inside <CommerceProvider>");
  return ctx;
}

/** A response is only trusted as the whole cart if its products are populated objects. */
function isPopulated(data: unknown) {
  const products = (data as { products?: Array<{ product?: unknown }> } | null)?.products;
  return Array.isArray(products) && products.every((p) => typeof p.product === "object" && p.product !== null);
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const token = session?.accessToken ?? null;
  const router = useRouter();

  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [cartStatus, setCartStatus] = useState<Status>("idle");
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  const [bagOpen, setBagOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());
  const [compare, setCompare] = useState<readonly string[]>([]);

  // Latest-wins: a slow reply to an older mutation must not overwrite a newer optimistic state.
  const seq = useRef(0);
  // Our own legacy-event broadcasts must not trigger our own refetch.
  const selfEvents = useRef({ cart: 0, wishlist: 0 });

  // Snapshot for rollbacks. Synced after every commit, so the next click always reads the latest cart.
  const cartRef = useRef(cart);
  useLayoutEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const mark = useCallback((id: string, on: boolean) => {
    setPending((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const broadcastCart = useCallback(() => {
    selfEvents.current.cart++;
    cartApi.notifyCartUpdate();
  }, []);
  const broadcastWishlist = useCallback(() => {
    selfEvents.current.wishlist++;
    wishlistApi.notifyWishlistUpdate();
  }, []);

  const refreshCart = useCallback(async () => {
    if (!token) return;
    const mine = ++seq.current;
    try {
      const data = await cartApi.getCart(token);
      if (mine === seq.current) setCart(normalizeCart(data));
      setCartStatus("ready");
    } catch {
      setCartStatus("error");
    }
  }, [token]);

  const refreshWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const items = await wishlistApi.getWishlist(token);
      setWishlist(new Set(items.map((i) => i._id)));
    } catch {
      /* the heart simply shows unsaved — never block the page on this */
    }
  }, [token]);

  // Load once per session.
  useEffect(() => {
    if (status === "loading") return;
    if (!token) {
      setCart(EMPTY_CART);
      setWishlist(new Set());
      setCartStatus("ready");
      return;
    }
    setCartStatus("loading");
    void refreshCart();
    void refreshWishlist();
  }, [status, token, refreshCart, refreshWishlist]);

  // Stay in sync with v1 components that still mutate through lib/* and broadcast.
  useEffect(() => {
    const onCart = () => {
      if (selfEvents.current.cart > 0) selfEvents.current.cart--;
      else void refreshCart();
    };
    const onWishlist = () => {
      if (selfEvents.current.wishlist > 0) selfEvents.current.wishlist--;
      else void refreshWishlist();
    };
    const onCompare = () => setCompare(compareApi.getCompareIds());
    onCompare();
    window.addEventListener("cartUpdated", onCart);
    window.addEventListener("wishlistUpdated", onWishlist);
    window.addEventListener("compareUpdated", onCompare);
    return () => {
      window.removeEventListener("cartUpdated", onCart);
      window.removeEventListener("wishlistUpdated", onWishlist);
      window.removeEventListener("compareUpdated", onCompare);
    };
  }, [refreshCart, refreshWishlist]);

  const askToSignIn = useCallback(
    (message: string) =>
      toast(message, { action: { label: "Sign in", onClick: () => router.push("/login") } }),
    [router],
  );

  /** Apply a server reply if it is still the newest, otherwise refetch the truth. */
  const settle = useCallback(
    async (mine: number, data: unknown) => {
      if (mine !== seq.current) return;
      if (isPopulated(data)) setCart(normalizeCart(data as Parameters<typeof normalizeCart>[0]));
      else await refreshCart();
    },
    [refreshCart],
  );

  const addToBag = useCallback(
    async (product: Product, opts?: { count?: number; quiet?: boolean }) => {
      if (!token) {
        askToSignIn("Sign in to add to your bag.");
        return false;
      }
      const count = Math.max(1, opts?.count ?? 1);
      const before = cartRef.current;
      const existing = before.lines.find((l) => l.productId === product._id);
      const lines = existing
        ? before.lines.map((l) => (l.productId === product._id ? { ...l, count: l.count + count } : l))
        : [
            ...before.lines,
            {
              lineId: null,
              productId: product._id,
              title: product.title,
              image: product.imageCover,
              brand: product.brand?.name,
              category: product.category?.name,
              price: unitPrice(product),
              count,
            },
          ];
      setCart(recomputeCart(before, lines));
      if (!opts?.quiet) {
        setLastAdded(product._id);
        setBagOpen(true);
      }
      mark(product._id, true);
      const mine = ++seq.current;
      try {
        let data = await cartApi.addToCart(product._id, token);
        // The API adds one unit per call; a larger quantity is set afterwards, on top of what was already there.
        if (count > 1) {
          const now = normalizeCart(data).lines.find((l) => l.productId === product._id)?.count ?? (existing?.count ?? 0) + 1;
          data = await cartApi.updateCartQuantity(product._id, now + count - 1, token);
        }
        await settle(mine, data);
        broadcastCart();
        return true;
      } catch {
        if (mine === seq.current) setCart(before);
        toast.error("Couldn't add that to your bag. Try again.");
        return false;
      } finally {
        mark(product._id, false);
      }
    },
    [token, askToSignIn, mark, settle, broadcastCart],
  );

  const removeLine = useCallback(
    async (line: CartLine, opts?: { silent?: boolean }) => {
      if (!token) return;
      const before = cartRef.current;
      setCart(recomputeCart(before, before.lines.filter((l) => l.productId !== line.productId)));
      mark(line.productId, true);
      const mine = ++seq.current;
      try {
        let data = await cartApi.removeFromCart(line.productId, token, line.lineId);
        // Same fallback the v1 bag relies on: this API sometimes deletes by line id only.
        const still = normalizeCart(data).lines.some((l) => l.productId === line.productId);
        if (still && line.lineId && line.lineId !== line.productId) {
          data = await cartApi.deleteCartItem(line.productId, token, { productId: line.productId, cartItemId: line.lineId });
        }
        await settle(mine, data);
        broadcastCart();
        if (!opts?.silent) {
          toast("Removed from your bag.", {
            action: {
              label: "Undo",
              onClick: async () => {
                try {
                  await cartApi.addToCart(line.productId, token);
                  if (line.count > 1) await cartApi.updateCartQuantity(line.productId, line.count, token);
                  await refreshCart();
                  broadcastCart();
                } catch {
                  toast.error("Couldn't put it back. Add it again from the product page.");
                }
              },
            },
          });
        }
      } catch {
        if (mine === seq.current) setCart(before);
        toast.error("Couldn't remove that. Try again.");
      } finally {
        mark(line.productId, false);
      }
    },
    [token, mark, settle, broadcastCart, refreshCart],
  );

  const setQuantity = useCallback(
    async (productId: string, count: number) => {
      if (!token) return;
      const before = cartRef.current;
      const line = before.lines.find((l) => l.productId === productId);
      if (!line) return;
      if (count < 1) return removeLine(line);
      setCart(recomputeCart(before, before.lines.map((l) => (l.productId === productId ? { ...l, count } : l))));
      mark(productId, true);
      const mine = ++seq.current;
      try {
        const data = await cartApi.updateCartQuantity(productId, count, token);
        await settle(mine, data);
        broadcastCart();
      } catch {
        if (mine === seq.current) setCart(before);
        toast.error("Couldn't update the quantity. Try again.");
      } finally {
        mark(productId, false);
      }
    },
    [token, mark, settle, broadcastCart, removeLine],
  );

  const clearBag = useCallback(async () => {
    if (!token) return;
    const before = cartRef.current;
    setCart(EMPTY_CART);
    const mine = ++seq.current;
    try {
      await cartApi.clearCart(token);
      broadcastCart();
    } catch {
      if (mine === seq.current) setCart(before);
      toast.error("Couldn't empty your bag. Try again.");
    }
  }, [token, broadcastCart]);

  const applyCoupon = useCallback(
    async (code: string): Promise<{ ok: true } | { ok: false; message: string }> => {
      if (!token) return { ok: false, message: "Sign in to use a coupon." };
      const clean = code.trim();
      if (!clean) return { ok: false, message: "Enter a code first." };
      try {
        const data = await cartApi.applyCoupon(clean, token);
        const mine = ++seq.current;
        await settle(mine, data);
        broadcastCart();
        return { ok: true };
      } catch {
        return { ok: false, message: "That code didn't work. Check it and try again." };
      }
    },
    [token, settle, broadcastCart],
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!token) {
        askToSignIn("Sign in to save to your wishlist.");
        return;
      }
      const saved = wishlist.has(productId);
      const flip = (on: boolean) =>
        setWishlist((prev) => {
          const next = new Set(prev);
          if (on) next.add(productId);
          else next.delete(productId);
          return next;
        });
      flip(!saved);
      mark(`wish:${productId}`, true);
      try {
        if (saved) await wishlistApi.removeFromWishlist(productId, token);
        else await wishlistApi.addToWishlist(productId, token);
        broadcastWishlist();
        if (!saved) toast("Saved to your wishlist.", { action: { label: "View", onClick: () => router.push("/wishlist") } });
      } catch {
        flip(saved);
        toast.error("Couldn't update your wishlist. Try again.");
      } finally {
        mark(`wish:${productId}`, false);
      }
    },
    [token, wishlist, askToSignIn, mark, broadcastWishlist, router],
  );

  const moveToWishlist = useCallback(
    async (line: CartLine) => {
      if (!token) return;
      try {
        if (!wishlist.has(line.productId)) {
          await wishlistApi.addToWishlist(line.productId, token);
          setWishlist((prev) => new Set(prev).add(line.productId));
          broadcastWishlist();
        }
        await removeLine(line, { silent: true });
        toast("Moved to your wishlist.", { action: { label: "View", onClick: () => router.push("/wishlist") } });
      } catch {
        toast.error("Couldn't move that. Try again.");
      }
    },
    [token, wishlist, removeLine, broadcastWishlist, router],
  );

  const toggleCompare = useCallback((productId: string) => {
    const result = compareApi.toggleCompare(productId);
    if (result === "max-reached") toast(`You can compare up to ${compareApi.MAX_COMPARE_ITEMS} products at once.`);
    setCompare(compareApi.getCompareIds());
    return result;
  }, []);

  const openBag = useCallback(() => setBagOpen(true), []);
  const closeBag = useCallback(() => {
    setBagOpen(false);
    setLastAdded(null);
  }, []);

  const value = useMemo<Commerce>(
    () => ({
      signedIn: Boolean(token),
      cart,
      cartStatus,
      pending,
      bagOpen,
      lastAdded,
      openBag,
      closeBag,
      addToBag,
      setQuantity,
      removeLine,
      clearBag,
      applyCoupon,
      moveToWishlist,
      wishlist,
      toggleWishlist,
      compare,
      toggleCompare,
      refreshCart,
    }),
    [token, cart, cartStatus, pending, bagOpen, lastAdded, openBag, closeBag, addToBag, setQuantity, removeLine, clearBag, applyCoupon, moveToWishlist, wishlist, toggleWishlist, compare, toggleCompare, refreshCart],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}
