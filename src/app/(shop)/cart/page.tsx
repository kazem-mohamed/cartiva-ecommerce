import type { Metadata } from "next";
import { getProducts } from "@/ds/data/catalog";
import { PageFrame } from "@/ds/ui/PageIntro";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Your bag" };

export default async function CartPage() {
  const products = await getProducts();
  // Best sellers, one per title — the view drops whatever is already in the bag.
  const seen = new Set<string>();
  const suggestions = [...products]
    .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
    .filter((p) => {
      const key = p.title.trim().toLowerCase();
      if (seen.has(key) || p.quantity === 0) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);

  return (
    <PageFrame>
      <CartView suggestions={suggestions} />
    </PageFrame>
  );
}
