import type { Metadata } from "next";
import { PageFrame } from "@/ds/ui/PageIntro";
import { WishlistView } from "./WishlistView";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <PageFrame>
      <WishlistView />
    </PageFrame>
  );
}
